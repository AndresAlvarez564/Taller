"""
Lambda: Work Order Add Item
Agrega un item (servicio o repuesto) a una orden de trabajo
"""
import json
import os
import sys
import uuid
from datetime import datetime
from decimal import Decimal

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import get_item, put_item, TABLES
from response_utils import success, not_found, validation_error, server_error
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
            'subtotal': Decimal(str(cantidad)) * precio,
            'activo': True,
            'creadoEn': now
        }
        
        # Si es repuesto con inventarioItemId, validar que existe
        if tipo == 'repuesto' and 'inventarioItemId' in body:
            inv_id = body['inventarioItemId']
            item['inventarioItemId'] = inv_id
            
            # Obtener item de inventario (usar INVENTARIO, no INVENTARIO_ITEMS)
            inv_item = get_item(TABLES['INVENTARIO'], {'inventarioItemId': inv_id})
            if not inv_item or not inv_item.get('activo', False):
                return not_found('Item de inventario')
        
        # Crear item de OT en tabla Detalles
        put_item(TABLES['DETALLES'], item)
        
        # Convertir Decimal a float para respuesta
        response_item = {
            **item,
            'precioUnitario': float(item['precioUnitario']),
            'subtotal': float(item['subtotal'])
        }
        
        return success(response_item)
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        print(f'Error adding item to work order: {str(e)}')
        return server_error('Error al agregar item a orden de trabajo', str(e))

