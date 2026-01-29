import json
import os
from shared.db_utils import get_item, scan_items, query_items
from shared.response_utils import success, error, not_found

ORDENES_TABLE = os.environ['ORDENES_TRABAJO_TABLE']
DETALLES_TABLE = os.environ['DETALLES_TABLE']

def lambda_handler(event, context):
    try:
        # GET /work-orders/{id}
        ot_id = event.get('pathParameters', {}).get('id')
        if ot_id:
            orden = get_item(ORDENES_TABLE, {'workOrderId': ot_id})
            if not orden:
                return not_found('Orden de trabajo no encontrada')
            
            # Si se solicita incluir items
            params = event.get('queryStringParameters') or {}
            if params.get('includeItems') == 'true':
                items = query_items(
                    DETALLES_TABLE,
                    key_condition='PK = :pk AND begins_with(SK, :sk_prefix)',
                    expr_values={
                        ':pk': f'OT#{ot_id}',
                        ':sk_prefix': 'ITEM#'
                    }
                )
                # Filtrar solo items activos
                items = [i for i in items if i.get('activo', True)]
                orden['items'] = items
            
            return success({'orden': orden})
        
        # GET /work-orders?estado=xxx&customerId=xxx
        params = event.get('queryStringParameters') or {}
        estado = params.get('estado')
        customer_id = params.get('customerId')
        search = params.get('search', '').lower()
        
        # Si hay customerId, usar GSI
        if customer_id:
            ordenes = query_items(
                ORDENES_TABLE,
                index_name='customerId-index',
                key_condition='customerId = :cid',
                expr_values={':cid': customer_id}
            )
        # Si hay estado, usar GSI
        elif estado:
            ordenes = query_items(
                ORDENES_TABLE,
                index_name='estado-creadoEn-index',
                key_condition='estado = :estado',
                expr_values={':estado': estado},
                scan_forward=False  # Más recientes primero
            )
        else:
            # Scan general
            ordenes = scan_items(ORDENES_TABLE)
        
        # Filtrar por búsqueda (placa, cliente)
        if search:
            ordenes = [
                o for o in ordenes
                if search in o.get('vehiculoPlaca', '').lower()
                or search in o.get('clienteNombre', '').lower()
            ]
        
        # Ordenar por fecha de creación (más recientes primero)
        ordenes.sort(key=lambda x: x.get('creadoEn', ''), reverse=True)
        
        return success({
            'ordenes': ordenes,
            'total': len(ordenes)
        })
        
    except Exception as e:
        return error(str(e))
