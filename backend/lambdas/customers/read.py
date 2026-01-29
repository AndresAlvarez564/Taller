"""
Lambda: Customer Read
Obtiene uno o todos los clientes
"""
import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import get_item, scan_items, TABLES
from response_utils import success, not_found, server_error


def lambda_handler(event, context):
    """
    Handler principal del lambda
    
    GET /customers/{clienteId} - Obtener un cliente específico
    GET /customers - Listar todos los clientes
    """
    try:
        # Obtener clienteId de path parameters
        path_params = event.get('pathParameters') or {}
        cliente_id = path_params.get('clienteId')
        
        if cliente_id:
            # Obtener un cliente específico
            customer = get_item(TABLES['CLIENTES'], {'clienteId': cliente_id})
            
            if not customer:
                return not_found('Cliente')
            
            # Filtrar clientes eliminados (soft delete)
            if customer.get('eliminadoEn'):
                return not_found('Cliente')
            
            return success(customer)
        else:
            # Listar todos los clientes activos
            customers = scan_items(
                TABLES['CLIENTES'],
                filter_expression='activo = :activo',
                expression_values={':activo': True}
            )
            
            return success(customers)
        
    except Exception as e:
        print(f'Error reading customer: {str(e)}')
        return server_error('Error al obtener cliente(s)', str(e))
