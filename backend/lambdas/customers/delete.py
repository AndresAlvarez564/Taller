"""
Lambda: Customer Delete
Elimina un cliente (soft delete)
"""
import json
import os
import sys
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import get_item, update_item, query_items, TABLES
from response_utils import success, validation_error, not_found, server_error, error


def lambda_handler(event, context):
    """
    Handler principal del lambda
    
    DELETE /customers/{clienteId}
    
    Realiza soft delete (marca como eliminado, no borra físicamente)
    Valida que no tenga órdenes de trabajo activas
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
        
        # Verificar que no esté ya eliminado
        if existing_customer.get('eliminadoEn'):
            return not_found('Cliente')
        
        # VALIDACIÓN DE NEGOCIO: Verificar que no tenga órdenes de trabajo activas
        # Buscar órdenes de trabajo del cliente
        work_orders = query_items(
            TABLES['ORDENES_TRABAJO'],
            'customerId = :customerId',
            {':customerId': cliente_id},
            index_name='customerId-index'
        )
        
        # Filtrar órdenes activas (no canceladas ni facturadas)
        active_orders = [
            wo for wo in work_orders 
            if wo.get('estado') not in ['cancelado', 'facturado']
        ]
        
        if active_orders:
            return error(
                f'No se puede eliminar el cliente. Tiene {len(active_orders)} orden(es) de trabajo activa(s)',
                400
            )
        
        # Realizar soft delete
        now = datetime.utcnow().isoformat() + 'Z'
        deleted_by = 'system'
        if event.get('requestContext', {}).get('authorizer'):
            deleted_by = event['requestContext']['authorizer'].get('claims', {}).get('sub', 'system')
        
        updates = {
            'activo': False,
            'eliminadoEn': now,
            'eliminadoPor': deleted_by,
        }
        
        # Actualizar en DynamoDB
        updated_customer = update_item(
            TABLES['CLIENTES'],
            {'clienteId': cliente_id},
            updates
        )
        
        return success({
            'message': 'Cliente eliminado exitosamente',
            'clienteId': cliente_id
        })
        
    except Exception as e:
        print(f'Error deleting customer: {str(e)}')
        return server_error('Error al eliminar cliente', str(e))
