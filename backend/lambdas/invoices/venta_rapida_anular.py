import json
import os
import uuid
from datetime import datetime
from shared.db_utils import get_item, transact_write
from shared.response_utils import success, error, not_found, validation_error, conflict

FACTURAS_TABLE = os.environ['FACTURAS_TABLE']
INVENTARIO_TABLE = os.environ['INVENTARIO_ITEMS_TABLE']
DETALLES_TABLE = os.environ['DETALLES_TABLE']

def lambda_handler(event, context):
    try:
        # Extraer facturaId del path
        factura_id = event.get('pathParameters', {}).get('id')
        if not factura_id:
            return validation_error('facturaId es requerido')
        
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        motivo = body.get('motivo', '').strip()
        revertir_inventario = body.get('revertirInventario', True)
        
        if not motivo:
            return validation_error('motivo es requerido')
        
        # Verificar que la factura existe
        factura = get_item(FACTURAS_TABLE, {'facturaId': factura_id})
        if not factura:
            return not_found('Factura no encontrada')
        
        # Verificar que es venta rápida
        if factura.get('tipoFactura') != 'venta_rapida':
            return validation_error('Esta operación solo aplica a ventas rápidas')
        
        # No permitir anular si ya está anulada
        if factura.get('estado') == 'anulada':
            return conflict('La factura ya está anulada')
        
        # Preparar transacciones
        transacciones = []
        now = datetime.utcnow().isoformat()
        
        # Si se debe revertir inventario
        if revertir_inventario:
            items = factura.get('items', [])
            
            for item in items:
                # Solo revertir repuestos con inventarioItemId
                if item.get('tipo') == 'repuesto' and 'inventarioItemId' in item:
                    inv_id = item['inventarioItemId']
                    cantidad = item.get('cantidad', 0)
                    
                    # Obtener item de inventario
                    inv_item = get_item(INVENTARIO_TABLE, {'inventarioItemId': inv_id})
                    if inv_item and inv_item.get('activo', False):
                        stock_actual = inv_item.get('stock', 0)
                        version_actual = inv_item.get('version', 1)
                        nuevo_stock = stock_actual + cantidad
                        
                        # Transacción: Devolver stock
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
                        
                        # Transacción: Crear movimiento de entrada
                        mov_id = str(uuid.uuid4())
                        movimiento = {
                            'PK': f'INV#{inv_id}',
                            'SK': f'MOV#{now}#{mov_id}',
                            'movimientoId': mov_id,
                            'tipo': 'entrada',
                            'cantidad': cantidad,
                            'stockAntes': stock_actual,
                            'stockDespues': nuevo_stock,
                            'motivo': f'Anulación venta rápida: {motivo}',
                            'referenciaId': factura_id,
                            'creadoEn': now
                        }
                        transacciones.append({
                            'Put': {
                                'TableName': DETALLES_TABLE,
                                'Item': movimiento
                            }
                        })
        
        # Transacción: Anular factura
        transacciones.append({
            'Update': {
                'TableName': FACTURAS_TABLE,
                'Key': {'facturaId': factura_id},
                'UpdateExpression': 'SET estado = :anulada, anuladoEn = :now, motivoAnulacion = :motivo, actualizadoEn = :now',
                'ExpressionAttributeValues': {
                    ':anulada': 'anulada',
                    ':now': now,
                    ':motivo': motivo
                }
            }
        })
        
        # Ejecutar transacciones
        transact_write(transacciones)
        
        return success({
            'mensaje': 'Venta rápida anulada exitosamente',
            'facturaId': factura_id,
            'inventarioRevertido': revertir_inventario
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        if 'ConditionalCheckFailed' in str(e):
            return conflict('El stock fue modificado por otra operación. Intente nuevamente.')
        return error(str(e))
