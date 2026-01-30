"""
Lambda: Work Order Update State
Cambia el estado de una orden de trabajo
"""
import json
import os
import sys
from datetime import datetime
from decimal import Decimal

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import get_item, update_item, TABLES
from response_utils import success, validation_error, not_found, server_error
from validation_utils import validate_workorder_state

# Flujo válido de estados
FLUJO_ESTADOS = {
    'en_revision': ['en_cotizacion', 'cancelado'],
    'en_cotizacion': ['en_aprobacion', 'cancelado'],
    'en_aprobacion': ['aprobado', 'cancelado'],
    'aprobado': ['en_proceso', 'cancelado'],
    'en_proceso': ['terminado', 'cancelado'],
    'terminado': ['facturado'],
    'facturado': [],  # Estado final
    'cancelado': []   # Estado final
}

def lambda_handler(event, context):
    try:
        # Extraer workOrderId del path
        path_params = event.get('pathParameters') or {}
        ot_id = path_params.get('workOrderId')
        
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
        orden = get_item(TABLES['ORDENES_TRABAJO'], {'workOrderId': ot_id})
        if not orden:
            return not_found('Orden de trabajo')
        
        estado_actual = orden.get('estado')
        
        # Validar transición de estado
        estados_permitidos = FLUJO_ESTADOS.get(estado_actual, [])
        if nuevo_estado not in estados_permitidos:
            return validation_error(
                f'No se puede cambiar de "{estado_actual}" a "{nuevo_estado}". '
                f'Estados permitidos: {", ".join(estados_permitidos) if estados_permitidos else "ninguno"}'
            )
        
        # Preparar actualizaciones básicas
        now = datetime.utcnow().isoformat() + 'Z'
        updates = {
            'estado': nuevo_estado,
            'actualizadoEn': now
        }
        
        # Agregar información adicional según el estado de origen
        if estado_actual == 'en_revision' and 'diagnostico' in body:
            updates['diagnostico'] = body['diagnostico'].strip()
            if 'observacionesRevision' in body:
                updates['observacionesRevision'] = body['observacionesRevision'].strip()
        
        if estado_actual == 'en_aprobacion' and 'notasAprobacion' in body:
            updates['notasAprobacion'] = body['notasAprobacion'].strip()
        
        if estado_actual == 'terminado':
            if 'metodoPago' in body:
                updates['metodoPago'] = body['metodoPago']
            if 'montoPagado' in body:
                updates['montoPagado'] = Decimal(str(body['montoPagado']))
        
        # Actualizar
        updated = update_item(
            TABLES['ORDENES_TRABAJO'],
            {'workOrderId': ot_id},
            updates
        )
        
        return success(updated)
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        print(f'Error updating work order state: {str(e)}')
        return server_error('Error al actualizar estado de orden de trabajo', str(e))
