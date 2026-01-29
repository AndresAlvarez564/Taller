import json
import os
from datetime import datetime
from shared.db_utils import get_item, update_item
from shared.response_utils import success, error, not_found, validation_error, conflict

FACTURAS_TABLE = os.environ['FACTURAS_TABLE']

def lambda_handler(event, context):
    try:
        # Extraer facturaId del path
        factura_id = event.get('pathParameters', {}).get('id')
        if not factura_id:
            return validation_error('facturaId es requerido')
        
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        motivo = body.get('motivo', '').strip()
        
        if not motivo:
            return validation_error('motivo es requerido')
        
        # Verificar que la factura existe
        factura = get_item(FACTURAS_TABLE, {'facturaId': factura_id})
        if not factura:
            return not_found('Factura no encontrada')
        
        # No permitir anular si ya está anulada
        if factura.get('estado') == 'anulada':
            return conflict('La factura ya está anulada')
        
        # No permitir anular si está pagada (requiere autorización especial)
        if factura.get('estado') == 'pagada':
            return conflict('No se puede anular una factura pagada sin autorización especial')
        
        # Anular factura
        now = datetime.utcnow().isoformat()
        updated = update_item(
            FACTURAS_TABLE,
            {'facturaId': factura_id},
            'SET estado = :anulada, anuladoEn = :now, motivoAnulacion = :motivo, actualizadoEn = :now',
            {
                ':anulada': 'anulada',
                ':now': now,
                ':motivo': motivo
            }
        )
        
        return success({
            'mensaje': 'Factura anulada exitosamente',
            'facturaId': factura_id,
            'factura': updated
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        return error(str(e))
