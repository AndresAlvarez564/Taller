"""
Lambda: Customer Update
Actualiza un cliente existente
"""
import json
import os
import sys
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import get_item, update_item, TABLES
from response_utils import success, validation_error, not_found, server_error


def lambda_handler(event, context):
    """
    Handler principal del lambda
    
    PUT /customers/{clienteId}
    
    Body:
    {
        "nombre": "Juan Pérez",
        "telefono": "809-555-1234",
        "email": "juan@example.com",
        "cedula": "001-1234567-8",
        "direccion": "Calle Principal #123"
    }
    """
    try:
        # Obtener clienteId de path parameters
        path_params = event.get('pathParameters') or {}
        cliente_id = path_params.get('clienteId')
        
        if not cliente_id:
            return validation_error('clienteId es requerido')
        
        # Verificar que el cliente existe
        existing_customer = get_item(TABLES['CLIENTES'], {'clienteId': cliente_id})
        
        if not existing_customer:
            return not_found('Cliente')
        
        # Verificar que no esté eliminado (soft delete)
        if existing_customer.get('eliminadoEn'):
            return not_found('Cliente')
        
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        
        nombre = body.get('nombre')
        telefono = body.get('telefono')
        email = body.get('email', '')
        cedula = body.get('cedula', '')
        direccion = body.get('direccion', '')
        
        # Validaciones
        errors = validate([
            validate_required(nombre, 'nombre'),
            validate_required(telefono, 'telefono'),
            validate_phone(telefono),
            validate_email(email) if email else None,
        ])
        
        if errors:
            return validation_error(', '.join(errors))
        
        # Preparar actualizaciones
        now = datetime.utcnow().isoformat() + 'Z'
        updated_by = 'system'
        if event.get('requestContext', {}).get('authorizer'):
            updated_by = event['requestContext']['authorizer'].get('claims', {}).get('sub', 'system')
        
        updates = {
            'nombre': nombre,
            'telefono': telefono,
            'email': email,
            'cedula': cedula,
            'direccion': direccion,
            'actualizadoEn': now,
            'actualizadoPor': updated_by,
        }
        
        # Actualizar en DynamoDB
        updated_customer = update_item(
            TABLES['CLIENTES'],
            {'clienteId': cliente_id},
            updates
        )
        
        return success(updated_customer)
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido en el body')
    except Exception as e:
        print(f'Error updating customer: {str(e)}')
        return server_error('Error al actualizar cliente', str(e))
