import json
import os
import uuid
from datetime import datetime
from shared.db_utils import get_item, query_items, transact_write
from shared.response_utils import success, error, not_found, validation_error, conflict
from shared.validators import validate_positive_number

ORDENES_TABLE = os.environ['ORDENES_TRABAJO_TABLE']
DETALLES_TABLE = os.environ['DETALLES_TABLE']
INVENTARIO_TABLE = os.environ['INVENTARIO_ITEMS_TABLE']

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Validar campos requeridos
        required = ['workOrderId', 'tipo', 'descripcion', 'cantidad', 'precioUnitario']
        for field in required:
            if field not in body:
                return validation_error(f'{field} es requerido')
        
        ot_id = body['workOrderId']
        tipo = body['tipo']  # servicio, repuesto
        cantidad = int(body['cantidad'])
        precio = float(body['precioUnitario'])
        
        # Validar tipo
        if tipo not in ['servicio', 'repuesto']:
            return validation_error('Tipo debe ser: servicio o repuesto')
        
        if not validate_positive_number(cantidad):
            return validation_error('Cantidad debe ser positiva')
        
        if not validate_positive_number(precio):
            return validation_error('Precio unitario debe ser positivo')
        
        # Verificar que la OT existe y no está bloqueada
        orden = get_item(ORDENES_TABLE, {'workOrderId': ot_id})
        if not orden:
            return not_found('Orden de trabajo no encontrada')
        
        if orden.get('bloquearItems', False):
            return conflict('No se pueden agregar items a una orden facturada')
        
        # Generar ID del item
        item_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Construir item
        item = {
            'PK': f'OT#{ot_id}',
            'SK': f'ITEM#{now}#{item_id}',
            'itemId': item_id,
            'tipo': tipo,
            'descripcion': body['descripcion'].strip(),
            'cantidad': cantidad,
            'precioUnitario': precio,
            'subtotal': cantidad * precio,
            'activo': True,
            'creadoEn': now
        }
        
        # Preparar transacciones
        transacciones = []
        
        # Si es repuesto con inventarioItemId, manejar stock
        if tipo == 'repuesto' and 'inventarioItemId' in body:
            inv_id = body['inventarioItemId']
            item['inventarioItemId'] = inv_id
            
            # Obtener item de inventario
            inv_item = get_item(INVENTARIO_TABLE, {'inventarioItemId': inv_id})
            if not inv_item or not inv_item.get('activo', False):
                return not_found('Item de inventario no encontrado')
            
            stock_actual = inv_item.get('stock', 0)
            version_actual = inv_item.get('version', 1)
            
            # Validar stock suficiente
            if stock_actual < cantidad:
                return conflict(f'Stock insuficiente. Disponible: {stock_actual}, Solicitado: {cantidad}')
            
            nuevo_stock = stock_actual - cantidad
            
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
            
            # Transacción 2: Crear movimiento de salida
            mov_id = str(uuid.uuid4())
            movimiento = {
                'PK': f'INV#{inv_id}',
                'SK': f'MOV#{now}#{mov_id}',
                'movimientoId': mov_id,
                'tipo': 'salida',
                'cantidad': cantidad,
                'stockAntes': stock_actual,
                'stockDespues': nuevo_stock,
                'motivo': f'Orden de trabajo #{ot_id}',
                'referenciaId': ot_id,
                'creadoEn': now
            }
            transacciones.append({
                'Put': {
                    'TableName': DETALLES_TABLE,
                    'Item': movimiento
                }
            })
        
        # Transacción 3: Crear item de OT
        transacciones.append({
            'Put': {
                'TableName': DETALLES_TABLE,
                'Item': item
            }
        })
        
        # Ejecutar transacción atómica
        transact_write(transacciones)
        
        return success({
            'mensaje': 'Item agregado exitosamente',
            'itemId': item_id,
            'item': item
        }, status_code=201)
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        if 'ConditionalCheckFailed' in str(e):
            return conflict('El stock fue modificado por otra operación. Intente nuevamente.')
        return error(str(e))
