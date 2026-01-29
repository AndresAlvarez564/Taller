import json
import os
from datetime import datetime
from shared.db_utils import get_item, update_item, query_items
from shared.response_utils import success, error, not_found, validation_error, conflict
from shared.validators import validate_workorder_state

ORDENES_TABLE = os.environ['ORDENES_TRABAJO_TABLE']
DETALLES_TABLE = os.environ['DETALLES_TABLE']

# Flujo válido de estados
FLUJO_ESTADOS = {
    'en_revision': ['en_cotizacion', 'cancelado'],
    'en_cotizacion': ['en_aprobacion', 'en_revision', 'cancelado'],
    'en_aprobacion': ['aprobado', 'en_cotizacion', 'cancelado'],
    'aprobado': ['en_proceso', 'cancelado'],
    'en_proceso': ['terminado', 'cancelado'],
    'terminado': ['facturado'],
    'facturado': [],  # Estado final
    'cancelado': []   # Estado final
}

def lambda_handler(event, context):
    try:
        # Extraer workOrderId del path
        ot_id = event.get('pathParameters', {}).get('id')
        if not ot_id:
            return validation_error('workOrderId es requerido')
        
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        nuevo_estado = body.get('estado')
        
        if not nuevo_estado:
            return validation_error('estado es requerido')
        
        if not validate_workorder_state(nuevo_estado):
            return validation_error(f'Estado inválido: {nuevo_estado}')
        
        # Obtener OT actual
        orden = get_item(ORDENES_TABLE, {'workOrderId': ot_id})
        if not orden:
            return not_found('Orden de trabajo no encontrada')
        
        estado_actual = orden.get('estado')
        
        # Validar transición de estado
        estados_permitidos = FLUJO_ESTADOS.get(estado_actual, [])
        if nuevo_estado not in estados_permitidos:
            return conflict(
                f'No se puede cambiar de "{estado_actual}" a "{nuevo_estado}". '
                f'Estados permitidos: {", ".join(estados_permitidos) if estados_permitidos else "ninguno"}'
            )
        
        # Validaciones especiales
        if nuevo_estado == 'aprobado':
            # Verificar que tenga items activos
            items = query_items(
                DETALLES_TABLE,
                key_condition='PK = :pk AND begins_with(SK, :sk_prefix)',
                expr_values={
                    ':pk': f'OT#{ot_id}',
                    ':sk_prefix': 'ITEM#'
                }
            )
            items_activos = [i for i in items if i.get('activo', True)]
            if not items_activos:
                return conflict('No se puede aprobar una orden sin items')
        
        # Actualizar estado
        updated = update_item(
            ORDENES_TABLE,
            {'workOrderId': ot_id},
            'SET estado = :estado, actualizadoEn = :now',
            {
                ':estado': nuevo_estado,
                ':now': datetime.utcnow().isoformat()
            }
        )
        
        return success({
            'mensaje': f'Estado actualizado de "{estado_actual}" a "{nuevo_estado}"',
            'orden': updated
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        return error(str(e))
