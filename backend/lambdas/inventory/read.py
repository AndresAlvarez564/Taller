import json
import os
from shared.db_utils import get_item, scan_items, query_items
from shared.response_utils import success, error, not_found

INVENTARIO_TABLE = os.environ['INVENTARIO_ITEMS_TABLE']

def lambda_handler(event, context):
    try:
        # GET /inventory/{id}
        item_id = event.get('pathParameters', {}).get('id')
        if item_id:
            item = get_item(INVENTARIO_TABLE, {'inventarioItemId': item_id})
            if not item:
                return not_found('Item de inventario no encontrado')
            return success({'item': item})
        
        # GET /inventory?search=xxx&stockBajo=true
        params = event.get('queryStringParameters') or {}
        search = params.get('search', '').lower()
        stock_bajo = params.get('stockBajo') == 'true'
        include_inactive = params.get('includeInactive') == 'true'
        
        # Escanear items
        items = scan_items(INVENTARIO_TABLE)
        
        # Filtrar activos
        if not include_inactive:
            items = [i for i in items if i.get('activo', False)]
        
        # Filtrar por búsqueda (nombre, SKU, descripción)
        if search:
            items = [
                i for i in items
                if search in i.get('nombre', '').lower()
                or search in i.get('sku', '').lower()
                or search in i.get('descripcion', '').lower()
            ]
        
        # Filtrar por stock bajo
        if stock_bajo:
            items = [
                i for i in items
                if i.get('stock', 0) <= i.get('stockMinimo', 0)
            ]
        
        # Ordenar por nombre
        items.sort(key=lambda x: x.get('nombre', ''))
        
        return success({
            'items': items,
            'total': len(items)
        })
        
    except Exception as e:
        return error(str(e))
