"""
Lambda: Customer Create
Crea un nuevo cliente en el sistema
"""
import json
import os
import sys
from datetime import datetime
from uuid import uuid4

# Agregar shared al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import put_item, TABLES
from response_utils import success, validation_error, server_error


def lambda_handler(event, context):
    """
    Handler principal del lambda
    
    Body esperado:
    {
        "nombre": "Juan Pérez",
        "telefono": "809-555-1234",
        "email": "juan@example.com",
        "cedula": "001-1234567-8",
        "direccion": "Calle Principal #123"
    }
    """
    try:
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        
        nombre = body.get('nombre')
        telefono = body.get('telefono')
        email = body.get('email', '')
        cedula = body.get('cedula', '')
        direccion = body.get('direccion', '')
        
        # Validaciones básicas
        if not nombre or not nombre.strip():
            return validation_error('El nombre es requerido')
        
        if not telefono or not telefono.strip():
            return validation_error('El teléfono es requerido')
        
        # Crear cliente
        cliente_id = str(uuid4())
        now = datetime.utcnow().isoformat() + 'Z'
        
        # Obtener usuario que crea (desde Cognito authorizer)
        created_by = 'system'
        if event.get('requestContext', {}).get('authorizer'):
            created_by = event['requestContext']['authorizer'].get('claims', {}).get('sub', 'system')
        
        customer = {
            'clienteId': cliente_id,
            'nombre': nombre,
            'telefono': telefono,
            'email': email,
            'cedula': cedula,
            'direccion': direccion,
            'activo': True,
            'creadoEn': now,
            'creadoPor': created_by,
        }
        
        # Guardar en DynamoDB
        put_item(TABLES['CLIENTES'], customer)
        
        return success(customer, 201)
        
    except json.JSONDecodeError as e:
        return validation_error('JSON inválido en el body')
    except Exception as e:
        print(f'Error creating customer: {str(e)}')
        return server_error('Error al crear cliente', str(e))
