"""
Lambda: Work Order Add Item
Agrega un item (servicio o repuesto) a una orden de trabajo
Actualiza totales y descuenta inventario si es repuesto
"""
import json
import os
import sys
import uuid
from datetime import datetime
from decimal import Decimal

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import get_item, put_item, update_item, query_items, transact_write, TABLES
from response_utils import success, not_found, validation_error, server_error, conflict
from validation_utils import validate_positive_number

def lambda_handler(event, context):
    try:
        # Extraer workOrderId del path
        path_params = event.get('pathParameters') or {}
        ot_id = path_params.get('workOrderId')
        
        if not ot_id:
            return validation_error('workOrderId es requerido')
        
        body = json.loads(event.get('body', '{}'))
        
        # Validar campos requeridos
        required = ['tipo', 'descripcion', 'cantidad', 'precioUnitario']
        for field in required:
            if field not in body:
                return validation_error(f'{field} es requerido')
        
        tipo = body['tipo']  # servicio, repuesto
        cantidad = int(body['cantidad'])
        precio = Decimal(str(body['precioUnitario']))
        
        # Validar tipo
        if tipo not in ['servicio', 'repuesto']:
            return validation_error('Tipo debe ser: servicio o repuesto')
        
        if not validate_positive_number(cantidad):
            return validation_error('Cantidad debe ser positiva')
        
        if not validate_positive_number(float(precio)):
            return validation_error('Precio unitario debe ser positivo')
        
        # Verificar que la OT existe y no está facturada
        orden = get_item(TABLES['ORDENES_TRABAJO'], {'workOrderId': ot_id})
        if not orden:
            return not_found('Orden de trabajo')
        
        if orden.get('estado') == 'facturado':
            return validation_error('No se pueden agregar items a una orden facturada')
        
        # Generar ID del item
        item_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat() + 'Z'
        subtotal_item = Decimal(str(cantidad)) * precio
        
        # Construir item usando patrón PK/SK para tabla Detalles
        item = {
            'PK': f'WO#{ot_id}',
            'SK': f'ITEM#{now}#{item_id}',
            'itemId': item_id,
            'workOrderId': ot_id,
            'tipo': tipo,
            'descripcion': body['descripcion'].strip(),
            'cantidad': cantidad,
            'precioUnitario': precio,
            'subtotal': subtotal_item,
            'activo': True,
            'creadoEn': now
        }
        
        # Preparar transacciones
        transacciones = []
        
        # Si es repuesto con inventarioItemId, validar stock y preparar descuento
        if tipo == 'repuesto' and 'inventarioItemId' in body:
            inv_id = body['inventarioItemId']
            item['inventarioItemId'] = inv_id
            
            # Obtener item de inventario
            inv_item = get_item(TABLES['INVENTARIO'], {'inventarioItemId': inv_id})
            if not inv_item or not inv_item.get('activo', False):
                return not_found('Item de inventario')
            
            stock_actual = inv_item.get('stock', 0)
            version_actual = inv_item.get('version', 1)
            
            # Validar stock suficiente
            if stock_actual < cantidad:
                return conflict(f'Stock insuficiente para {inv_item.get("nombre")}. Disponible: {stock_actual}, Solicitado: {cantidad}')
            
            nuevo_stock = stock_actual - cantidad
            
            # Transacción: Actualizar stock
            transacciones.append({
                'Update': {
                    'TableName': TABLES['INVENTARIO'],
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
            
            # Transacción: Crear movimiento de salida en inventario
            mov_id = str(uuid.uuid4())
            movimiento = {
                'PK': f'INV#{inv_id}',
                'SK': f'MOV#{now}#{mov_id}',
                'movimientoId': mov_id,
                'tipo': 'salida',
                'cantidad': cantidad,
                'stockAntes': stock_actual,
                'stockDespues': nuevo_stock,
                'motivo': f'Orden de trabajo {orden.get("numeroOrden", ot_id)}',
                'referenciaId': ot_id,
                'creadoEn': now
            }
            
            transacciones.append({
                'Put': {
                    'TableName': TABLES['DETALLES'],
                    'Item': movimiento
                }
            })
        
        # Transacción: Crear item de OT en tabla Detalles
        transacciones.append({
            'Put': {
                'TableName': TABLES['DETALLES'],
                'Item': item
            }
        })
        
        # Calcular nuevos totales de la orden
        # Obtener todos los items actuales
        items_actuales = query_items(
            TABLES['DETALLES'],
            'PK = :pk AND begins_with(SK, :sk_prefix)',
            {':pk': f'WO#{ot_id}', ':sk_prefix': 'ITEM#'}
        )
        
        # Sumar subtotales (items actuales + nuevo item)
        nuevo_subtotal = subtotal_item
        for it in items_actuales:
            if it.get('activo', True):
                nuevo_subtotal += Decimal(str(it.get('subtotal', 0)))
        
        # Calcular impuesto (13% en Bolivia)
        nuevo_impuesto = nuevo_subtotal * Decimal('0.13')
        nuevo_total = nuevo_subtotal + nuevo_impuesto
        
        # Transacción: Actualizar totales en la orden de trabajo
        transacciones.append({
            'Update': {
                'TableName': TABLES['ORDENES_TRABAJO'],
                'Key': {'workOrderId': ot_id},
                'UpdateExpression': 'SET subtotal = :subtotal, impuesto = :impuesto, total = :total, actualizadoEn = :now',
                'ExpressionAttributeValues': {
                    ':subtotal': nuevo_subtotal,
                    ':impuesto': nuevo_impuesto,
                    ':total': nuevo_total,
                    ':now': now
                }
            }
        })
        
        # Ejecutar todas las transacciones atómicamente
        if transacciones:
            transact_write(transacciones)
        
        # Convertir Decimal a float para respuesta
        response_item = {
            **item,
            'precioUnitario': float(item['precioUnitario']),
            'subtotal': float(item['subtotal'])
        }
        
        return success({
            'item': response_item,
            'totales': {
                'subtotal': float(nuevo_subtotal),
                'impuesto': float(nuevo_impuesto),
                'total': float(nuevo_total)
            }
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        # Si falla la condición de versión, es un conflicto de concurrencia
        if 'ConditionalCheckFailed' in str(e):
            return conflict('El stock fue modificado por otra operación. Intente nuevamente.')
        print(f'Error adding item to work order: {str(e)}')
        return server_error('Error al agregar item a orden de trabajo', str(e))

