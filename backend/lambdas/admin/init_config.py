"""
Lambda: Init Config
Inicializa la configuración del taller (ejecutar una sola vez después del deployment)
"""
import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import put_item, get_item, TABLES
from response_utils import success, server_error


def lambda_handler(event, context):
    """
    Inicializa la configuración del taller con valores por defecto
    """
    try:
        # Verificar si ya existe configuración
        existing_config = get_item(TABLES['CONFIGURACION'], {'config': 'config'})
        
        if existing_config:
            return success({
                'message': 'Configuración ya existe',
                'config': existing_config
            })
        
        # Crear configuración inicial
        config = {
            'config': 'config',  # PK (singleton)
            'moneda': 'DOP',
            'simboloMoneda': 'RD$',
            'tasaImpuesto': 0.18,  # 18% ITBIS
            'contadorFacturas': 0,
            'nombreNegocio': 'Taller Automotriz',
            'telefono': '809-000-0000',
            'direccion': 'Santo Domingo, República Dominicana',
            'email': 'info@taller.com',
            'rnc': '000-00000-0',
            'configuracionEmail': {
                'smtp': '',
                'port': 587,
                'user': '',
                'enabled': False
            }
        }
        
        # Guardar en DynamoDB
        put_item(TABLES['CONFIGURACION'], config)
        
        return success({
            'message': 'Configuración inicializada exitosamente',
            'config': config
        }, 201)
        
    except Exception as e:
        print(f'Error initializing config: {str(e)}')
        return server_error('Error al inicializar configuración', str(e))
