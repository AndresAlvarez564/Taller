import os
from shared.db_utils import get_item, scan_items, query_items
from shared.response_utils import success, error, not_found

FACTURAS_TABLE = os.environ['FACTURAS_TABLE']

def lambda_handler(event, context):
    try:
        # GET /invoices/{id}
        factura_id = event.get('pathParameters', {}).get('id')
        if factura_id:
            factura = get_item(FACTURAS_TABLE, {'facturaId': factura_id})
            if not factura:
                return not_found('Factura no encontrada')
            return success({'factura': factura})
        
        # GET /invoices?estado=xxx&tipo=xxx&numeroFactura=xxx
        params = event.get('queryStringParameters') or {}
        estado = params.get('estado')
        tipo = params.get('tipo')
        numero = params.get('numeroFactura')
        search = params.get('search', '').lower()
        
        # Si hay número de factura, usar GSI
        if numero:
            facturas = query_items(
                FACTURAS_TABLE,
                index_name='numeroFactura-index',
                key_condition='numeroFactura = :num',
                expr_values={':num': numero}
            )
        # Si hay estado, usar GSI
        elif estado:
            facturas = query_items(
                FACTURAS_TABLE,
                index_name='estado-creadoEn-index',
                key_condition='estado = :estado',
                expr_values={':estado': estado},
                scan_forward=False  # Más recientes primero
            )
        else:
            # Scan general
            facturas = scan_items(FACTURAS_TABLE)
        
        # Filtrar por tipo
        if tipo:
            facturas = [f for f in facturas if f.get('tipoFactura') == tipo]
        
        # Filtrar por búsqueda (cliente, placa, número)
        if search:
            facturas = [
                f for f in facturas
                if search in f.get('clienteNombre', '').lower()
                or search in f.get('vehiculoPlaca', '').lower()
                or search in f.get('numeroFactura', '').lower()
            ]
        
        # Ordenar por fecha de creación (más recientes primero)
        facturas.sort(key=lambda x: x.get('creadoEn', ''), reverse=True)
        
        return success({
            'facturas': facturas,
            'total': len(facturas)
        })
        
    except Exception as e:
        return error(str(e))
