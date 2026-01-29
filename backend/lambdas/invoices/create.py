import json
import os
import uuid
from datetime import datetime
from shared.db_utils import get_item, query_items, transact_write, increment_counter
from shared.response_utils import success, error, not_found, validation_error, conflict

ORDENES_TABLE = os.environ['ORDENES_TRABAJO_TABLE']
DETALLES_TABLE = os.environ['DETALLES_TABLE']
FACTURAS_TABLE = os.environ['FACTURAS_TABLE']
CONFIG_TABLE = os.environ['CONFIGURACION_TALLER_TABLE']

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Validar campo requerido
        if 'workOrderId' not in body:
            return validation_error('workOrderId es requerido')
        
        ot_id = body['workOrderId']
        
        # Verificar que la OT existe
        orden = get_item(ORDENES_TABLE, {'workOrderId': ot_id})
        if not orden:
            return not_found('Orden de trabajo no encontrada')
        
        # Validar que la OT esté en estado "terminado"
        if orden.get('estado') != 'terminado':
            return conflict('Solo se pueden facturar órdenes en estado "terminado"')
        
        # Verificar que no tenga factura ya
        if orden.get('facturaId'):
            return conflict('Esta orden ya tiene una factura asociada')
        
        # Obtener items de la OT
        items = query_items(
            DETALLES_TABLE,
            key_condition='PK = :pk AND begins_with(SK, :sk_prefix)',
            expr_values={
                ':pk': f'OT#{ot_id}',
                ':sk_prefix': 'ITEM#'
            }
        )
        
        # Filtrar solo items activos
        items_activos = [i for i in items if i.get('activo', True)]
        
        if not items_activos:
            return conflict('No se puede facturar una orden sin items')
        
        # Calcular totales
        subtotal = sum(i.get('subtotal', 0) for i in items_activos)
        
        # Obtener configuración para impuestos
        config = get_item(CONFIG_TABLE, {'PK': 'config'})
        tasa_impuesto = config.get('tasaImpuesto', 0.18) if config else 0.18
        
        impuesto = subtotal * tasa_impuesto
        total = subtotal + impuesto
        
        # Generar número de factura secuencial
        numero_factura = increment_counter(CONFIG_TABLE, {'PK': 'config'}, 'contadorFacturas')
        
        # Crear factura
        factura_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Snapshot de items (copia inmutable)
        items_snapshot = []
        for item in items_activos:
            items_snapshot.append({
                'itemId': item.get('itemId'),
                'tipo': item.get('tipo'),
                'descripcion': item.get('descripcion'),
                'cantidad': item.get('cantidad'),
                'precioUnitario': item.get('precioUnitario'),
                'subtotal': item.get('subtotal')
            })
        
        factura = {
            'facturaId': factura_id,
            'numeroFactura': f'F-{numero_factura:06d}',
            'tipoFactura': 'taller',
            'workOrderId': ot_id,
            # Snapshot de datos del cliente y vehículo
            'customerId': orden.get('customerId'),
            'clienteNombre': orden.get('clienteNombre'),
            'clienteTelefono': orden.get('clienteTelefono'),
            'vehiculoPlaca': orden.get('vehiculoPlaca'),
            'vehiculoMarca': orden.get('vehiculoMarca'),
            'vehiculoModelo': orden.get('vehiculoModelo'),
            # Items y totales
            'items': items_snapshot,
            'subtotal': subtotal,
            'impuesto': impuesto,
            'tasaImpuesto': tasa_impuesto,
            'total': total,
            'estado': 'emitida',
            'creadoEn': now,
            'actualizadoEn': now
        }
        
        # Transacción: crear factura + actualizar OT
        transact_write([
            {
                'Put': {
                    'TableName': FACTURAS_TABLE,
                    'Item': factura
                }
            },
            {
                'Update': {
                    'TableName': ORDENES_TABLE,
                    'Key': {'workOrderId': ot_id},
                    'UpdateExpression': 'SET estado = :facturado, facturaId = :fid, bloquearItems = :true, actualizadoEn = :now',
                    'ExpressionAttributeValues': {
                        ':facturado': 'facturado',
                        ':fid': factura_id,
                        ':true': True,
                        ':now': now
                    }
                }
            }
        ])
        
        return success({
            'mensaje': 'Factura creada exitosamente',
            'facturaId': factura_id,
            'numeroFactura': factura['numeroFactura'],
            'factura': factura
        }, status_code=201)
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        return error(str(e))
