import json
import os
import uuid
from datetime import datetime
from shared.db_utils import put_item, transact_write
from shared.response_utils import success, error, validation_error
from shared.validators import validate_positive_number

INVENTARIO_TABLE = os.environ['INVENTARIO_ITEMS_TABLE']
DETALLES_TABLE = os.environ['DETALLES_TABLE']

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Validar campos requeridos
        required = ['nombre', 'costo', 'precio']
        for field in required:
            if field not in body:
                return validation_error(f'{field} es requerido')
        
        # Validar números
        if not validate_positive_number(body['costo']):
            return validation_error('Costo debe ser un número positivo')
        if not validate_positive_number(body['precio']):
            return validation_error('Precio debe ser un número positivo')
        
        # Generar ID
        item_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Construir item
        item = {
            'inventarioItemId': item_id,
            'sku': body.get('sku', '').strip().upper(),
            'nombre': body['nombre'].strip(),
            'descripcion': body.get('descripcion', '').strip(),
            'costo': float(body['costo']),
            'precio': float(body['precio']),
            'stock': 0,
            'stockMinimo': int(body.get('stockMinimo', 0)),
            'unidad': body.get('unidad', 'unidad').strip(),
            'categoria': body.get('categoria', '').strip(),
            'activo': True,
            'version': 1,
            'creadoEn': now,
            'actualizadoEn': now
        }
        
        # Si viene stock inicial, crear movimiento
        stock_inicial = int(body.get('stockInicial', 0))
        
        if stock_inicial > 0:
            item['stock'] = stock_inicial
            
            # Crear movimiento de entrada inicial
            mov_id = str(uuid.uuid4())
            movimiento = {
                'PK': f'INV#{item_id}',
                'SK': f'MOV#{now}#{mov_id}',
                'movimientoId': mov_id,
                'tipo': 'entrada_inicial',
                'cantidad': stock_inicial,
                'stockAntes': 0,
                'stockDespues': stock_inicial,
                'motivo': 'Stock inicial',
                'creadoEn': now
            }
            
            # Usar transacción para crear item + movimiento
            transact_write([
                {
                    'Put': {
                        'TableName': INVENTARIO_TABLE,
                        'Item': item
                    }
                },
                {
                    'Put': {
                        'TableName': DETALLES_TABLE,
                        'Item': movimiento
                    }
                }
            ])
        else:
            # Solo crear item sin movimiento
            put_item(INVENTARIO_TABLE, item)
        
        return success({
            'mensaje': 'Item de inventario creado exitosamente',
            'inventarioItemId': item_id,
            'item': item
        }, status_code=201)
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        return error(str(e))
