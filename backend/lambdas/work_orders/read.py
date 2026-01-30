import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import get_item, scan_items, query_items, TABLES
from response_utils import success, server_error, not_found

def lambda_handler(event, context):
    try:
        # GET /work-orders/{workOrderId}
        path_params = event.get('pathParameters') or {}
        ot_id = path_params.get('workOrderId')
        
        if ot_id:
            orden = get_item(TABLES['ORDENES_TRABAJO'], {'workOrderId': ot_id})
            if not orden:
                return not_found('Orden de trabajo')
            
            # Si se solicita incluir items
            params = event.get('queryStringParameters') or {}
            if params.get('includeItems') == 'true':
                items = query_items(
                    TABLES['DETALLES'],
                    'PK = :pk AND begins_with(SK, :sk_prefix)',
                    {':pk': f'WO#{ot_id}', ':sk_prefix': 'ITEM#'}
                )
                # Filtrar solo items activos
                items = [i for i in items if i.get('activo', True)]
                orden['items'] = items
            
            return success(orden)
        
        # GET /work-orders?estado=xxx&customerId=xxx
        params = event.get('queryStringParameters') or {}
        estado = params.get('estado')
        customer_id = params.get('customerId')
        search = params.get('search', '').lower()
        
        # Si hay customerId, usar GSI
        if customer_id:
            ordenes = query_items(
                TABLES['ORDENES_TRABAJO'],
                'customerId = :cid',
                {':cid': customer_id},
                index_name='customerId-index'
            )
        # Si hay estado, usar GSI
        elif estado:
            ordenes = query_items(
                TABLES['ORDENES_TRABAJO'],
                'estado = :estado',
                {':estado': estado},
                index_name='estado-creadoEn-index',
                scan_forward=False
            )
        else:
            # Scan general
            ordenes = scan_items(TABLES['ORDENES_TRABAJO'])
        
        # Filtrar por búsqueda (placa, cliente)
        if search:
            ordenes = [
                o for o in ordenes
                if search in o.get('vehiculoPlaca', '').lower()
                or search in o.get('clienteNombre', '').lower()
            ]
        
        # Ordenar por fecha de creación (más recientes primero)
        ordenes.sort(key=lambda x: x.get('creadoEn', ''), reverse=True)
        
        return success(ordenes)
        
    except Exception as e:
        print(f'Error reading work orders: {str(e)}')
        return server_error('Error al leer órdenes de trabajo', str(e))
