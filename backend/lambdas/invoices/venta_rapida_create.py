import json
import os
import uuid
from datetime import datetime
from shared.db_utils import get_item, transact_write, increment_counter
from shared.response_utils import success, error, not_found, validation_error, conflict
from shared.validators import validate_positive_number

FACTURAS_TABLE = os.environ['FACTURAS_TABLE']
INVENTARIO_TABLE = os.environ['INVENTARIO_ITEMS_TABLE']
DETALLES_TABLE = os.environ['DETALLES_TABLE']
CONFIG_TABLE = os.environ['CONFIGURACION_TALLER_TABLE']

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Validar campos requeridos
        required = ['items']
        for field in required:
            if field not in body:
                return validation_error(f'{field} es requerido')
        
        items_input = body['items']
        if not items_input or len(items_input) == 0:
            return validation_error('Debe incluir al menos un item')
        
        # Validar y procesar items
        items_procesados = []
        transacciones = []
        now = datetime.utcnow().isoformat()
        
        for item in items_input:
            if 'descripcion' not in item or 'cantidad' not in item or 'precioUnitario' not in item:
                return validation_error('Cada item debe tener: descripcion, cantidad, precioUnitario')
            
            cantidad = int(item['cantidad'])
            precio = float(item['precioUnitario'])
            
            if not validate_positive_number(cantidad):
                return validation_error('Cantidad debe ser positiva')
            if not validate_positive_number(precio):
                return validation_error('Precio unitario debe ser positivo')
            
            item_procesado = {
                'tipo': item.get('tipo', 'servicio'),
                'descripcion': item['descripcion'].strip(),
                'cantidad': cantidad,
                'precioUnitario': precio,
                'subtotal': cantidad * precio
            }
            
            # Si es repuesto con inventarioItemId, manejar stock
            if item.get('tipo') == 'repuesto' and 'inventarioItemId' in item:
                inv_id = item['inventarioItemId']
                item_procesado['inventarioItemId'] = inv_id
                
                # Obtener item de inventario
                inv_item = get_item(INVENTARIO_TABLE, {'inventarioItemId': inv_id})
                if not inv_item or not inv_item.get('activo', False):
                    return not_found(f'Item de inventario {inv_id} no encontrado')
                
                stock_actual = inv_item.get('stock', 0)
                version_actual = inv_item.get('version', 1)
                
                # Validar stock suficiente
                if stock_actual < cantidad:
                    return conflict(f'Stock insuficiente para {inv_item.get("nombre")}. Disponible: {stock_actual}')
                
                nuevo_stock = stock_actual - cantidad
                
                # Transacción: Actualizar stock
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
                
                # Transacción: Crear movimiento de salida
                mov_id = str(uuid.uuid4())
                movimiento = {
                    'PK': f'INV#{inv_id}',
                    'SK': f'MOV#{now}#{mov_id}',
                    'movimientoId': mov_id,
                    'tipo': 'salida',
                    'cantidad': cantidad,
                    'stockAntes': stock_actual,
                    'stockDespues': nuevo_stock,
                    'motivo': 'Venta rápida',
                    'creadoEn': now
                }
                transacciones.append({
                    'Put': {
                        'TableName': DETALLES_TABLE,
                        'Item': movimiento
                    }
                })
            
            items_procesados.append(item_procesado)
        
        # Calcular totales
        subtotal = sum(i['subtotal'] for i in items_procesados)
        
        # Obtener configuración para impuestos
        config = get_item(CONFIG_TABLE, {'PK': 'config'})
        tasa_impuesto = config.get('tasaImpuesto', 0.18) if config else 0.18
        
        impuesto = subtotal * tasa_impuesto
        total = subtotal + impuesto
        
        # Generar número de factura secuencial
        numero_factura = increment_counter(CONFIG_TABLE, {'PK': 'config'}, 'contadorFacturas')
        
        # Crear factura
        factura_id = str(uuid.uuid4())
        
        factura = {
            'facturaId': factura_id,
            'numeroFactura': f'F-{numero_factura:06d}',
            'tipoFactura': 'venta_rapida',
            # Datos opcionales del cliente
            'clienteNombre': body.get('clienteNombre', 'Cliente General'),
            'clienteTelefono': body.get('clienteTelefono', ''),
            # Items y totales
            'items': items_procesados,
            'subtotal': subtotal,
            'impuesto': impuesto,
            'tasaImpuesto': tasa_impuesto,
            'total': total,
            'estado': 'emitida',
            'creadoEn': now,
            'actualizadoEn': now
        }
        
        # Transacción: Crear factura
        transacciones.append({
            'Put': {
                'TableName': FACTURAS_TABLE,
                'Item': factura
            }
        })
        
        # Ejecutar todas las transacciones
        transact_write(transacciones)
        
        return success({
            'mensaje': 'Venta rápida creada exitosamente',
            'facturaId': factura_id,
            'numeroFactura': factura['numeroFactura'],
            'factura': factura
        }, status_code=201)
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        if 'ConditionalCheckFailed' in str(e):
            return conflict('El stock fue modificado por otra operación. Intente nuevamente.')
        return error(str(e))
