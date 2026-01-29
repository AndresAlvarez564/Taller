import json
import os
import uuid
from datetime import datetime
from shared.db_utils import get_item, query_items, transact_write
from shared.response_utils import success, error, not_found, validation_error, conflict

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
            return conflict('No se pueden eliminar items de una orden facturada')
        
        # Buscar el item actual
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
        
        # Si es repuesto, devolver stock
        if item_actual.get('tipo') == 'repuesto' and 'inventarioItemId' in item_actual:
            inv_id = item_actual['inventarioItemId']
            cantidad = item_actual.get('cantidad', 0)
            
            # Obtener item de inventario
            inv_item = get_item(INVENTARIO_TABLE, {'inventarioItemId': inv_id})
            if inv_item:  # Solo si aún existe
                stock_actual = inv_item.get('stock', 0)
                version_actual = inv_item.get('version', 1)
                nuevo_stock = stock_actual + cantidad
                
                # Transacción 1: Devolver stock
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
                
                # Transacción 2: Crear movimiento de entrada
                mov_id = str(uuid.uuid4())
                movimiento = {
                    'PK': f'INV#{inv_id}',
                    'SK': f'MOV#{now}#{mov_id}',
                    'movimientoId': mov_id,
                    'tipo': 'entrada',
                    'cantidad': cantidad,
                    'stockAntes': stock_actual,
                    'stockDespues': nuevo_stock,
                    'motivo': f'Eliminación item OT #{ot_id}',
                    'referenciaId': ot_id,
                    'creadoEn': now
                }
                transacciones.append({
                    'Put': {
                        'TableName': DETALLES_TABLE,
                        'Item': movimiento
                    }
                })
        
        # Transacción 3: Marcar item como inactivo (soft delete)
        item_eliminado = {**item_actual}
        item_eliminado['activo'] = False
        item_eliminado['eliminadoEn'] = now
        
        transacciones.append({
            'Put': {
                'TableName': DETALLES_TABLE,
                'Item': item_eliminado
            }
        })
        
        # Ejecutar transacción atómica
        transact_write(transacciones)
        
        return success({
            'mensaje': 'Item eliminado exitosamente',
            'itemId': item_id
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        if 'ConditionalCheckFailed' in str(e):
            return conflict('El stock fue modificado por otra operación. Intente nuevamente.')
        return error(str(e))
