import os
from shared.db_utils import query_items
from shared.response_utils import success, error, validation_error

DETALLES_TABLE = os.environ['DETALLES_TABLE']

def lambda_handler(event, context):
    try:
        # Obtener inventarioItemId del query string
        params = event.get('queryStringParameters') or {}
        item_id = params.get('inventarioItemId')
        
        if not item_id:
            return validation_error('inventarioItemId es requerido')
        
        # Query movimientos por item
        movimientos = query_items(
            DETALLES_TABLE,
            key_condition='PK = :pk AND begins_with(SK, :sk_prefix)',
            expr_values={
                ':pk': f'INV#{item_id}',
                ':sk_prefix': 'MOV#'
            },
            scan_forward=False  # Más recientes primero
        )
        
        return success({
            'movimientos': movimientos,
            'total': len(movimientos)
        })
        
    except Exception as e:
        return error(str(e))
