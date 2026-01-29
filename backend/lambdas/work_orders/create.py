import json
import os
import uuid
from datetime import datetime
from shared.db_utils import get_item, put_item
from shared.response_utils import success, error, not_found, validation_error

ORDENES_TABLE = os.environ['ORDENES_TRABAJO_TABLE']
CLIENTES_TABLE = os.environ['CLIENTES_TABLE']
VEHICULOS_TABLE = os.environ['VEHICULOS_TABLE']

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Validar campos requeridos
        required = ['customerId', 'vehicleId', 'descripcionProblema']
        for field in required:
            if field not in body:
                return validation_error(f'{field} es requerido')
        
        customer_id = body['customerId']
        vehicle_id = body['vehicleId']
        
        # Validar que el cliente existe
        cliente = get_item(CLIENTES_TABLE, {'clienteId': customer_id})
        if not cliente or not cliente.get('activo', False):
            return not_found('Cliente no encontrado')
        
        # Validar que el vehículo existe y pertenece al cliente
        vehiculo = get_item(VEHICULOS_TABLE, {'vehiculoId': vehicle_id})
        if not vehiculo or not vehiculo.get('activo', False):
            return not_found('Vehículo no encontrado')
        
        if vehiculo.get('customerId') != customer_id:
            return validation_error('El vehículo no pertenece al cliente especificado')
        
        # Generar ID y crear OT
        ot_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        orden = {
            'workOrderId': ot_id,
            'customerId': customer_id,
            'vehicleId': vehicle_id,
            # Snapshot de datos para historial inmutable
            'clienteNombre': cliente.get('nombre'),
            'clienteTelefono': cliente.get('telefono'),
            'vehiculoPlaca': vehiculo.get('placa'),
            'vehiculoMarca': vehiculo.get('marca'),
            'vehiculoModelo': vehiculo.get('modelo'),
            'vehiculoAnio': vehiculo.get('anio'),
            # Datos de la OT
            'descripcionProblema': body['descripcionProblema'].strip(),
            'kilometraje': int(body.get('kilometraje', 0)),
            'observaciones': body.get('observaciones', '').strip(),
            'estado': 'en_revision',
            'bloquearItems': False,
            'version': 1,
            'creadoEn': now,
            'actualizadoEn': now
        }
        
        put_item(ORDENES_TABLE, orden)
        
        return success({
            'mensaje': 'Orden de trabajo creada exitosamente',
            'workOrderId': ot_id,
            'orden': orden
        }, status_code=201)
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        return error(str(e))
