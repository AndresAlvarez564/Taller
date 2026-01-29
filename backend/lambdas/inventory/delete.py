import os
from datetime import datetime
from shared.db_utils import get_item, update_item
from shared.response_utils import success, error, not_found, validation_error

INVENTARIO_TABLE = os.environ['INVENTARIO_ITEMS_TABLE']

def lambda_handler(event, context):
    try:
        # Extraer itemId del path
        item_id = event.get('pathParameters', {}).get('id')
        if not item_id:
            return validation_error('inventarioItemId es requerido')
        
        # Verificar que el item existe
        item = get_item(INVENTARIO_TABLE, {'inventarioItemId': item_id})
        if not item or not item.get('activo', False):
            return not_found('Item de inventario no encontrado')
        
        # Soft delete
        updated = update_item(
            INVENTARIO_TABLE,
            {'inventarioItemId': item_id},
            'SET activo = :false, eliminadoEn = :now',
            {
                ':false': False,
                ':now': datetime.utcnow().isoformat()
            }
        )
        
        return success({
            'mensaje': 'Item de inventario eliminado exitosamente',
            'inventarioItemId': item_id
        })
        
    except Exception as e:
        return error(str(e))
