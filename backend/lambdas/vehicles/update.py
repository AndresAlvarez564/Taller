import json
import os
from datetime import datetime
from shared.db_utils import get_item, update_item
from shared.response_utils import success, error, not_found, validation_error
from shared.validators import validate_year, validate_placa

VEHICULOS_TABLE = os.environ['VEHICULOS_TABLE']

def lambda_handler(event, context):
    try:
        # Extraer vehicleId del path
        vehicle_id = event.get('pathParameters', {}).get('id')
        if not vehicle_id:
            return validation_error('vehicleId es requerido')
        
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        
        # Verificar que el vehículo existe
        existing = get_item(VEHICULOS_TABLE, {'vehiculoId': vehicle_id})
        if not existing or not existing.get('activo', False):
            return not_found('Vehículo no encontrado')
        
        # Construir update expression
        update_expr = 'SET actualizadoEn = :now'
        expr_values = {':now': datetime.utcnow().isoformat()}
        
        # Campos actualizables
        if 'placa' in body:
            placa = body['placa'].strip().upper()
            if not validate_placa(placa):
                return validation_error('Formato de placa inválido')
            update_expr += ', placa = :placa'
            expr_values[':placa'] = placa
        
        if 'marca' in body:
            update_expr += ', marca = :marca'
            expr_values[':marca'] = body['marca'].strip()
        
        if 'modelo' in body:
            update_expr += ', modelo = :modelo'
            expr_values[':modelo'] = body['modelo'].strip()
        
        if 'anio' in body:
            if not validate_year(body['anio']):
                return validation_error('Año inválido')
            update_expr += ', anio = :anio'
            expr_values[':anio'] = body['anio']
        
        if 'chasis' in body:
            chasis = body['chasis'].strip().upper()
            update_expr += ', chasis = :chasis'
            expr_values[':chasis'] = chasis
        
        if 'color' in body:
            update_expr += ', color = :color'
            expr_values[':color'] = body['color'].strip()
        
        # Actualizar
        updated = update_item(
            VEHICULOS_TABLE,
            {'vehiculoId': vehicle_id},
            update_expr,
            expr_values
        )
        
        return success({
            'mensaje': 'Vehículo actualizado exitosamente',
            'vehiculo': updated
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        return error(str(e))
