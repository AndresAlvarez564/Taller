import json
import os
from datetime import datetime
from shared.db_utils import get_item, update_item
from shared.response_utils import success, error, not_found, validation_error, conflict

ORDENES_TABLE = os.environ['ORDENES_TRABAJO_TABLE']

def lambda_handler(event, context):
    try:
        # Extraer workOrderId del path
        ot_id = event.get('pathParameters', {}).get('id')
        if not ot_id:
            return validation_error('workOrderId es requerido')
        
        # Verificar que la OT existe
        orden = get_item(ORDENES_TABLE, {'workOrderId': ot_id})
        if not orden:
            return not_found('Orden de trabajo no encontrada')
        
        # No permitir cancelar si ya está facturada
        if orden.get('estado') == 'facturado':
            return conflict('No se puede cancelar una orden facturada')
        
        # Cambiar estado a cancelado
        updated = update_item(
            ORDENES_TABLE,
            {'workOrderId': ot_id},
            'SET estado = :cancelado, actualizadoEn = :now',
            {
                ':cancelado': 'cancelado',
                ':now': datetime.utcnow().isoformat()
            }
        )
        
        return success({
            'mensaje': 'Orden de trabajo cancelada exitosamente',
            'workOrderId': ot_id
        })
        
    except Exception as e:
        return error(str(e))
