"""
Utilidades para respuestas HTTP estandarizadas
"""
import json
from typing import Any, Dict, Optional
from decimal import Decimal


class DecimalEncoder(json.JSONEncoder):
    """Helper para serializar Decimal a JSON"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


# Headers CORS
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json',
}


def success(data: Any, status_code: int = 200) -> Dict[str, Any]:
    """Respuesta exitosa"""
    response = {
        'success': True,
        'data': data
    }
    
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps(response, cls=DecimalEncoder)
    }


def error(message: str, status_code: int = 400, error_details: Optional[Any] = None) -> Dict[str, Any]:
    """Respuesta de error"""
    response = {
        'success': False,
        'error': message
    }
    
    if error_details:
        print(f'Error details: {error_details}')
    
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps(response)
    }


def validation_error(message: str, details: Optional[Any] = None) -> Dict[str, Any]:
    """Respuesta de error de validación"""
    return error(message, 400, details)


def not_found(resource: str) -> Dict[str, Any]:
    """Respuesta de recurso no encontrado"""
    return error(f'{resource} no encontrado', 404)


def server_error(message: str = 'Error interno del servidor', details: Optional[Any] = None) -> Dict[str, Any]:
    """Respuesta de error del servidor"""
    return error(message, 500, details)


def unauthorized(message: str = 'No autorizado') -> Dict[str, Any]:
    """Respuesta de error de autorización"""
    return error(message, 401)


def forbidden(message: str = 'Acceso denegado') -> Dict[str, Any]:
    """Respuesta de error de permisos"""
    return error(message, 403)


def conflict(message: str) -> Dict[str, Any]:
    """Respuesta de conflicto (ej: versión desactualizada)"""
    return error(message, 409)
