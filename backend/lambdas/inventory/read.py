import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import get_item, get_table, TABLES
from response_utils import success, not_found, server_error

def lambda_handler(event, context):
    try:
        # GET /inventory/{inventarioItemId}
        path_params = event.get('pathParameters') or {}
        item_id = path_params.get('inventarioItemId')
        
        if item_id:
            item = get_item(TABLES['INVENTARIO'], {'inventarioItemId': item_id})
            if not item or not item.get('activo', False):
                return not_found('Item de inventario')
            return success(item)
        
        # GET /inventory?search=xxx&stockBajo=true
        params = event.get('queryStringParameters') or {}
        search = params.get('search', '').lower()
        stock_bajo = params.get('stockBajo') == 'true'
        include_inactive = params.get('includeInactive') == 'true'
        
        # Escanear items
        table = get_table(TABLES['INVENTARIO'])
        response = table.scan()
        items = response.get('Items', [])
        
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
        
        return success(items)
        
    except Exception as e:
        print(f'Error reading inventory: {str(e)}')
        return server_error('Error al obtener inventario', str(e))
