import json
import os
from datetime import datetime
from shared.db_utils import get_item, update_item
from shared.response_utils import success, error, not_found, validation_error
from shared.validators import validate_positive_number

INVENTARIO_TABLE = os.environ['INVENTARIO_ITEMS_TABLE']

def lambda_handler(event, context):
    try:
        # Extraer itemId del path
        item_id = event.get('pathParameters', {}).get('id')
        if not item_id:
            return validation_error('inventarioItemId es requerido')
        
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        
        # Verificar que el item existe
        existing = get_item(INVENTARIO_TABLE, {'inventarioItemId': item_id})
        if not existing:
            return not_found('Item de inventario no encontrado')
        
        # Construir update expression
        update_expr = 'SET actualizadoEn = :now'
        expr_values = {':now': datetime.utcnow().isoformat()}
        
        # Campos actualizables (NO incluye stock, que se maneja con movimientos)
        if 'sku' in body:
            update_expr += ', sku = :sku'
            expr_values[':sku'] = body['sku'].strip().upper()
        
        if 'nombre' in body:
            update_expr += ', nombre = :nombre'
            expr_values[':nombre'] = body['nombre'].strip()
        
        if 'descripcion' in body:
            update_expr += ', descripcion = :desc'
            expr_values[':desc'] = body['descripcion'].strip()
        
        if 'costo' in body:
            if not validate_positive_number(body['costo']):
                return validation_error('Costo debe ser un número positivo')
            update_expr += ', costo = :costo'
            expr_values[':costo'] = float(body['costo'])
        
        if 'precio' in body:
            if not validate_positive_number(body['precio']):
                return validation_error('Precio debe ser un número positivo')
            update_expr += ', precio = :precio'
            expr_values[':precio'] = float(body['precio'])
        
        if 'stockMinimo' in body:
            update_expr += ', stockMinimo = :min'
            expr_values[':min'] = int(body['stockMinimo'])
        
        if 'unidad' in body:
            update_expr += ', unidad = :unidad'
            expr_values[':unidad'] = body['unidad'].strip()
        
        if 'categoria' in body:
            update_expr += ', categoria = :cat'
            expr_values[':cat'] = body['categoria'].strip()
        
        # Actualizar
        updated = update_item(
            INVENTARIO_TABLE,
            {'inventarioItemId': item_id},
            update_expr,
            expr_values
        )
        
        return success({
            'mensaje': 'Item de inventario actualizado exitosamente',
            'item': updated
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        return error(str(e))
