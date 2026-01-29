import json
import os
import uuid
from datetime import datetime
from shared.db_utils import get_item, transact_write
from shared.response_utils import success, error, not_found, validation_error, conflict

INVENTARIO_TABLE = os.environ['INVENTARIO_ITEMS_TABLE']
DETALLES_TABLE = os.environ['DETALLES_TABLE']

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Validar campos requeridos
        required = ['inventarioItemId', 'tipo', 'cantidad']
        for field in required:
            if field not in body:
                return validation_error(f'{field} es requerido')
        
        item_id = body['inventarioItemId']
        tipo = body['tipo']  # entrada, salida, ajuste
        cantidad = int(body['cantidad'])
        motivo = body.get('motivo', '').strip()
        referencia_id = body.get('referenciaId')  # OT o venta
        
        # Validar tipo
        if tipo not in ['entrada', 'salida', 'ajuste']:
            return validation_error('Tipo debe ser: entrada, salida o ajuste')
        
        if cantidad <= 0 and tipo != 'ajuste':
            return validation_error('Cantidad debe ser positiva')
        
        # Obtener item actual
        item = get_item(INVENTARIO_TABLE, {'inventarioItemId': item_id})
        if not item or not item.get('activo', False):
            return not_found('Item de inventario no encontrado')
        
        stock_actual = item.get('stock', 0)
        version_actual = item.get('version', 1)
        
        # Calcular nuevo stock
        if tipo == 'entrada':
            nuevo_stock = stock_actual + cantidad
        elif tipo == 'salida':
            if stock_actual < cantidad:
                return conflict(f'Stock insuficiente. Disponible: {stock_actual}, Solicitado: {cantidad}')
            nuevo_stock = stock_actual - cantidad
        else:  # ajuste
            nuevo_stock = cantidad  # ajuste establece el stock exacto
        
        # Crear movimiento
        now = datetime.utcnow().isoformat()
        mov_id = str(uuid.uuid4())
        movimiento = {
            'PK': f'INV#{item_id}',
            'SK': f'MOV#{now}#{mov_id}',
            'movimientoId': mov_id,
            'tipo': tipo,
            'cantidad': cantidad,
            'stockAntes': stock_actual,
            'stockDespues': nuevo_stock,
            'motivo': motivo,
            'referenciaId': referencia_id,
            'creadoEn': now
        }
        
        # Transacción: actualizar stock + crear movimiento
        # Usar conditional write para evitar race conditions
        transact_write([
            {
                'Update': {
                    'TableName': INVENTARIO_TABLE,
                    'Key': {'inventarioItemId': item_id},
                    'UpdateExpression': 'SET stock = :nuevo, version = :nueva_version, actualizadoEn = :now',
                    'ConditionExpression': 'version = :version_actual',
                    'ExpressionAttributeValues': {
                        ':nuevo': nuevo_stock,
                        ':nueva_version': version_actual + 1,
                        ':version_actual': version_actual,
                        ':now': now
                    }
                }
            },
            {
                'Put': {
                    'TableName': DETALLES_TABLE,
                    'Item': movimiento
                }
            }
        ])
        
        return success({
            'mensaje': 'Movimiento registrado exitosamente',
            'movimientoId': mov_id,
            'stockAnterior': stock_actual,
            'stockNuevo': nuevo_stock
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        # Si falla la condición de versión, es un conflicto de concurrencia
        if 'ConditionalCheckFailed' in str(e):
            return conflict('El stock fue modificado por otra operación. Intente nuevamente.')
        return error(str(e))
