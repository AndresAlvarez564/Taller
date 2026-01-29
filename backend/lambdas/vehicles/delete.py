import os
from datetime import datetime
from shared.db_utils import get_item, update_item, query_items
from shared.response_utils import success, error, not_found, validation_error, conflict

VEHICULOS_TABLE = os.environ['VEHICULOS_TABLE']
ORDENES_TABLE = os.environ['ORDENES_TRABAJO_TABLE']

def lambda_handler(event, context):
    try:
        # Extraer vehicleId del path
        vehicle_id = event.get('pathParameters', {}).get('id')
        if not vehicle_id:
            return validation_error('vehicleId es requerido')
        
        # Verificar que el vehículo existe
        vehicle = get_item(VEHICULOS_TABLE, {'vehiculoId': vehicle_id})
        if not vehicle or not vehicle.get('activo', False):
            return not_found('Vehículo no encontrado')
        
        # Verificar que no tenga órdenes de trabajo activas
        # Estados que consideramos "activos": en_revision, en_cotizacion, en_aprobacion, aprobado, en_proceso, terminado
        estados_activos = ['en_revision', 'en_cotizacion', 'en_aprobacion', 'aprobado', 'en_proceso', 'terminado']
        
        # Query órdenes por vehículo (asumiendo que existe un GSI vehiculoId-index)
        ordenes = query_items(
            ORDENES_TABLE,
            index_name='vehiculoId-index',
            key_condition='vehiculoId = :vid',
            expr_values={':vid': vehicle_id}
        )
        
        # Verificar si hay órdenes activas
        ordenes_activas = [o for o in ordenes if o.get('estado') in estados_activos]
        if ordenes_activas:
            return conflict(
                f'No se puede eliminar el vehículo porque tiene {len(ordenes_activas)} orden(es) de trabajo activa(s)'
            )
        
        # Soft delete
        updated = update_item(
            VEHICULOS_TABLE,
            {'vehiculoId': vehicle_id},
            'SET activo = :false, eliminadoEn = :now',
            {
                ':false': False,
                ':now': datetime.utcnow().isoformat()
            }
        )
        
        return success({
            'mensaje': 'Vehículo eliminado exitosamente',
            'vehiculoId': vehicle_id
        })
        
    except Exception as e:
        return error(str(e))
