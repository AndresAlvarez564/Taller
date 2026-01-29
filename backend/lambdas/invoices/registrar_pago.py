import json
import os
from datetime import datetime
from shared.db_utils import get_item, update_item
from shared.response_utils import success, error, not_found, validation_error, conflict
from shared.validators import validate_positive_number

FACTURAS_TABLE = os.environ['FACTURAS_TABLE']

def lambda_handler(event, context):
    try:
        # Extraer facturaId del path
        factura_id = event.get('pathParameters', {}).get('id')
        if not factura_id:
            return validation_error('facturaId es requerido')
        
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        
        # Validar campos requeridos
        required = ['montoPagado', 'metodoPago']
        for field in required:
            if field not in body:
                return validation_error(f'{field} es requerido')
        
        monto_pagado = float(body['montoPagado'])
        metodo_pago = body['metodoPago'].strip()
        
        if not validate_positive_number(monto_pagado):
            return validation_error('Monto pagado debe ser positivo')
        
        # Verificar que la factura existe
        factura = get_item(FACTURAS_TABLE, {'facturaId': factura_id})
        if not factura:
            return not_found('Factura no encontrada')
        
        # No permitir pagar si está anulada
        if factura.get('estado') == 'anulada':
            return conflict('No se puede registrar pago en una factura anulada')
        
        # Calcular estado según monto
        total_factura = factura.get('total', 0)
        monto_previo = factura.get('montoPagado', 0)
        monto_total_pagado = monto_previo + monto_pagado
        
        if monto_total_pagado >= total_factura:
            nuevo_estado = 'pagada'
        else:
            nuevo_estado = 'parcial'
        
        # Registrar pago
        now = datetime.utcnow().isoformat()
        
        # Construir historial de pagos
        pagos = factura.get('pagos', [])
        pagos.append({
            'monto': monto_pagado,
            'metodoPago': metodo_pago,
            'fecha': now,
            'referencia': body.get('referencia', '')
        })
        
        updated = update_item(
            FACTURAS_TABLE,
            {'facturaId': factura_id},
            'SET estado = :estado, montoPagado = :monto, pagos = :pagos, actualizadoEn = :now',
            {
                ':estado': nuevo_estado,
                ':monto': monto_total_pagado,
                ':pagos': pagos,
                ':now': now
            }
        )
        
        return success({
            'mensaje': 'Pago registrado exitosamente',
            'facturaId': factura_id,
            'montoTotalPagado': monto_total_pagado,
            'saldo': total_factura - monto_total_pagado,
            'estado': nuevo_estado,
            'factura': updated
        })
        
    except json.JSONDecodeError:
        return validation_error('JSON inválido')
    except Exception as e:
        return error(str(e))
