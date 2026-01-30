import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import get_item, scan_items, query_items, TABLES
from response_utils import success, error, not_found, server_error

FACTURAS_TABLE = TABLES['FACTURAS']

def lambda_handler(event, context):
    try:
        # GET /invoices/{id}
        path_params = event.get('pathParameters') or {}
        factura_id = path_params.get('facturaId')
        
        if factura_id:
            factura = get_item(FACTURAS_TABLE, {'facturaId': factura_id})
            if not factura:
                return not_found('Factura no encontrada')
            return success(factura)
        
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
                'numeroFactura = :num',
                {':num': numero},
                index_name='numeroFactura-index'
            )
        # Si hay estado, usar GSI
        elif estado:
            facturas = query_items(
                FACTURAS_TABLE,
                'estado = :estado',
                {':estado': estado},
                index_name='estado-creadoEn-index'
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
        
        return success(facturas)
        
    except Exception as e:
        print(f'Error reading invoices: {str(e)}')
        return server_error('Error al obtener facturas', str(e))
