"""
Lambda: Vehicle Read
Obtiene uno o todos los vehículos
"""
import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import get_item, get_table, TABLES
from response_utils import success, not_found, server_error


def lambda_handler(event, context):
    """
    Handler principal del lambda
    
    GET /vehicles/{vehiculoId} - Obtener un vehículo específico
    GET /vehicles?customerId=xxx - Listar vehículos de un cliente
    GET /vehicles - Listar todos los vehículos
    """
    try:
        # Obtener vehiculoId de path parameters
        path_params = event.get('pathParameters') or {}
        vehiculo_id = path_params.get('vehiculoId')
        
        # Obtener query parameters
        query_params = event.get('queryStringParameters') or {}
        customer_id = query_params.get('customerId')
        
        if vehiculo_id:
            # Obtener un vehículo específico
            vehicle = get_item(TABLES['VEHICULOS'], {'vehiculoId': vehiculo_id})
            
            if not vehicle:
                return not_found('Vehículo')
            
            # Filtrar vehículos eliminados (soft delete)
            if vehicle.get('eliminadoEn'):
                return not_found('Vehículo')
            
            return success(vehicle)
            
        elif customer_id:
            # Listar vehículos de un cliente específico usando GSI
            table = get_table(TABLES['VEHICULOS'])
            response = table.query(
                IndexName='customerId-index',
                KeyConditionExpression='customerId = :cid',
                ExpressionAttributeValues={':cid': customer_id}
            )
            vehicles = response.get('Items', [])
            
            # Filtrar solo activos
            active_vehicles = [v for v in vehicles if v.get('activo', True)]
            
            return success(active_vehicles)
            
        else:
            # Listar todos los vehículos activos
            table = get_table(TABLES['VEHICULOS'])
            response = table.scan()
            vehicles = response.get('Items', [])
            
            # Filtrar solo activos
            vehicles = [v for v in vehicles if v.get('activo', True)]
            
            return success(vehicles)
        
    except Exception as e:
        print(f'Error reading vehicle: {str(e)}')
        return server_error('Error al obtener vehículo(s)', str(e))
