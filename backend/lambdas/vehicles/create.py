"""
Lambda: Vehicle Create
Crea un nuevo vehículo asociado a un cliente
"""
import json
import os
import sys
from datetime import datetime
from uuid import uuid4

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import put_item, get_item, TABLES
from response_utils import success, validation_error, not_found, server_error
from validators import validate, validate_required, validate_placa, validate_year


def lambda_handler(event, context):
    """
    Handler principal del lambda
    
    Body esperado:
    {
        "customerId": "uuid-del-cliente",
        "placa": "A123456",
        "marca": "Toyota",
        "modelo": "Corolla",
        "año": 2020,
        "color": "Blanco",
        "vin": "1HGBH41JXMN109186"
    }
    """
    try:
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        
        customer_id = body.get('customerId')
        placa = body.get('placa')
        marca = body.get('marca')
        modelo = body.get('modelo')
        año = body.get('año')
        color = body.get('color', '')
        vin = body.get('vin', '')
        
        # Validaciones
        errors = validate([
            validate_required(customer_id, 'customerId'),
            validate_required(placa, 'placa'),
            validate_placa(placa),
            validate_required(marca, 'marca'),
            validate_required(modelo, 'modelo'),
            validate_required(año, 'año'),
            validate_year(año),
        ])
        
        if errors:
            return validation_error(', '.join(errors))
        
        # Verificar que el cliente existe
        customer = get_item(TABLES['CLIENTES'], {'clienteId': customer_id})
        if not customer or customer.get('eliminadoEn'):
            return not_found('Cliente')
        
        # Crear vehículo
        vehiculo_id = str(uuid4())
        now = datetime.utcnow().isoformat() + 'Z'
        
        created_by = 'system'
        if event.get('requestContext', {}).get('authorizer'):
            created_by = event['requestContext']['authorizer'].get('claims', {}).get('sub', 'system')
        
        vehicle = {
            'vehiculoId': vehiculo_id,
            'customerId': customer_id,
            'placa': placa.upper(),  # Normalizar a mayúsculas
            'marca': marca,
            'modelo': modelo,
            'año': int(año),
            'color': color,
            'vin': vin.upper(),
            'activo': True,
            'creadoEn': now,
            'creadoPor': created_by,
        }
        
        # Guardar en DynamoDB
        put_item(TABLES['VEHICULOS'], vehicle)
        
        return success(vehicle, 201)
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido en el body')
    except Exception as e:
        print(f'Error creating vehicle: {str(e)}')
        return server_error('Error al crear vehículo', str(e))
