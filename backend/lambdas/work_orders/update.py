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
        
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        
        # Verificar que la OT existe
        orden = get_item(ORDENES_TABLE, {'workOrderId': ot_id})
        if not orden:
            return not_found('Orden de trabajo no encontrada')
        
        # No permitir editar si está facturada
        if orden.get('estado') == 'facturado':
            return conflict('No se puede editar una orden facturada')
        
        # Construir update expression
        update_expr = 'SET actualizadoEn = :now'
        expr_values = {':now': datetime.utcnow().isoformat()}
        
        # Campos actualizables (no financieros)
        if 'descripcionProblema' in body:
            update_expr += ', descripcionProblema = :desc'
            expr_values[':desc'] = body['descripcionProblema'].strip()
        
        if 'kilometraje' in body:
            update_expr += ', kilometraje = :km'
            expr_values[':km'] = int(body['kilometraje'])
        
        if 'observaciones' in body:
            update_expr += ', observaciones = :obs'
            expr_values[':obs'] = body['observaciones'].strip()
        
        # Actualizar
        updated = update_item(
            ORDENES_TABLE,
            {'workOrderId': ot_id},
            update_expr,
            expr_values
        )
        
        return success({
            'mensaje': 'Orden de trabajo actualizada exitosamente',
            'orden': updated
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        return error(str(e))
