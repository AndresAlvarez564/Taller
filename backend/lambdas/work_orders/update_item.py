import json
import os
import uuid
from datetime import datetime
from shared.db_utils import get_item, transact_write
from shared.response_utils import success, error, not_found, validation_error, conflict
from shared.validators import validate_positive_number

ORDENES_TABLE = os.environ['ORDENES_TRABAJO_TABLE']
DETALLES_TABLE = os.environ['DETALLES_TABLE']
INVENTARIO_TABLE = os.environ['INVENTARIO_ITEMS_TABLE']

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Validar campos requeridos
        required = ['workOrderId', 'itemId']
        for field in required:
            if field not in body:
                return validation_error(f'{field} es requerido')
        
        ot_id = body['workOrderId']
        item_id = body['itemId']
        
        # Verificar que la OT existe y no está bloqueada
        orden = get_item(ORDENES_TABLE, {'workOrderId': ot_id})
        if not orden:
            return not_found('Orden de trabajo no encontrada')
        
        if orden.get('bloquearItems', False):
            return conflict('No se pueden modificar items de una orden facturada')
        
        # Buscar el item actual
        # Necesitamos hacer query porque SK incluye timestamp
        from shared.db_utils import query_items
        items = query_items(
            DETALLES_TABLE,
            key_condition='PK = :pk AND begins_with(SK, :sk_prefix)',
            expr_values={
                ':pk': f'OT#{ot_id}',
                ':sk_prefix': 'ITEM#'
            }
        )
        
        item_actual = None
        for i in items:
            if i.get('itemId') == item_id:
                item_actual = i
                break
        
        if not item_actual or not item_actual.get('activo', True):
            return not_found('Item no encontrado')
        
        # Preparar transacciones
        transacciones = []
        now = datetime.utcnow().isoformat()
        
        # Calcular cambios
        cantidad_anterior = item_actual.get('cantidad', 0)
        cantidad_nueva = int(body.get('cantidad', cantidad_anterior))
        precio_nuevo = float(body.get('precioUnitario', item_actual.get('precioUnitario', 0)))
        
        if 'cantidad' in body and not validate_positive_number(cantidad_nueva):
            return validation_error('Cantidad debe ser positiva')
        
        if 'precioUnitario' in body and not validate_positive_number(precio_nuevo):
            return validation_error('Precio unitario debe ser positivo')
        
        # Si es repuesto y cambió la cantidad, ajustar inventario
        if item_actual.get('tipo') == 'repuesto' and 'inventarioItemId' in item_actual:
            inv_id = item_actual['inventarioItemId']
            diferencia = cantidad_nueva - cantidad_anterior
            
            if diferencia != 0:
                # Obtener item de inventario
                inv_item = get_item(INVENTARIO_TABLE, {'inventarioItemId': inv_id})
                if not inv_item:
                    return not_found('Item de inventario no encontrado')
                
                stock_actual = inv_item.get('stock', 0)
                version_actual = inv_item.get('version', 1)
                
                # Si aumentó cantidad, necesitamos más stock (salida)
                if diferencia > 0:
                    if stock_actual < diferencia:
                        return conflict(f'Stock insuficiente. Disponible: {stock_actual}, Necesario: {diferencia}')
                    nuevo_stock = stock_actual - diferencia
                    tipo_mov = 'salida'
                    cantidad_mov = diferencia
                else:
                    # Si disminuyó cantidad, devolvemos stock (entrada)
                    nuevo_stock = stock_actual + abs(diferencia)
                    tipo_mov = 'entrada'
                    cantidad_mov = abs(diferencia)
                
                # Transacción 1: Actualizar stock
                transacciones.append({
                    'Update': {
                        'TableName': INVENTARIO_TABLE,
                        'Key': {'inventarioItemId': inv_id},
                        'UpdateExpression': 'SET stock = :nuevo, version = :nueva_version, actualizadoEn = :now',
                        'ConditionExpression': 'version = :version_actual',
                        'ExpressionAttributeValues': {
                            ':nuevo': nuevo_stock,
                            ':nueva_version': version_actual + 1,
                            ':version_actual': version_actual,
                            ':now': now
                        }
                    }
                })
                
                # Transacción 2: Crear movimiento
                mov_id = str(uuid.uuid4())
                movimiento = {
                    'PK': f'INV#{inv_id}',
                    'SK': f'MOV#{now}#{mov_id}',
                    'movimientoId': mov_id,
                    'tipo': tipo_mov,
                    'cantidad': cantidad_mov,
                    'stockAntes': stock_actual,
                    'stockDespues': nuevo_stock,
                    'motivo': f'Ajuste item OT #{ot_id}',
                    'referenciaId': ot_id,
                    'creadoEn': now
                }
                transacciones.append({
                    'Put': {
                        'TableName': DETALLES_TABLE,
                        'Item': movimiento
                    }
                })
        
        # Transacción 3: Actualizar item
        item_actualizado = {**item_actual}
        if 'cantidad' in body:
            item_actualizado['cantidad'] = cantidad_nueva
        if 'precioUnitario' in body:
            item_actualizado['precioUnitario'] = precio_nuevo
        if 'descripcion' in body:
            item_actualizado['descripcion'] = body['descripcion'].strip()
        
        item_actualizado['subtotal'] = item_actualizado['cantidad'] * item_actualizado['precioUnitario']
        item_actualizado['actualizadoEn'] = now
        
        transacciones.append({
            'Put': {
                'TableName': DETALLES_TABLE,
                'Item': item_actualizado
            }
        })
        
        # Ejecutar transacción atómica
        transact_write(transacciones)
        
        return success({
            'mensaje': 'Item actualizado exitosamente',
            'item': item_actualizado
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        if 'ConditionalCheckFailed' in str(e):
            return conflict('El stock fue modificado por otra operación. Intente nuevamente.')
        return error(str(e))
