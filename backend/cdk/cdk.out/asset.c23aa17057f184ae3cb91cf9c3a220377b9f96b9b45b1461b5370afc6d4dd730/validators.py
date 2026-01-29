"""
Validadores comunes para datos de entrada
"""
import re
from typing import Optional, List


def validate_required(value: any, field_name: str) -> Optional[str]:
    """Validar que un campo sea requerido"""
    if value is None or value == '':
        return f'{field_name} es requerido'
    return None


def validate_email(email: str) -> Optional[str]:
    """Validar formato de email"""
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, email):
        return 'Email inválido'
    return None


def validate_phone(phone: str) -> Optional[str]:
    """Validar formato de teléfono dominicano: 809-555-1234"""
    phone_regex = r'^\d{3}-\d{3}-\d{4}$'
    if not re.match(phone_regex, phone):
        return 'Teléfono inválido. Formato esperado: 809-555-1234'
    return None


def validate_cedula(cedula: str) -> Optional[str]:
    """Validar formato de cédula dominicana: 001-1234567-8"""
    cedula_regex = r'^\d{3}-\d{7}-\d$'
    if not re.match(cedula_regex, cedula):
        return 'Cédula inválida. Formato esperado: 001-1234567-8'
    return None


def validate_placa(placa: str) -> Optional[str]:
    """Validar formato de placa: A123456"""
    placa_regex = r'^[A-Z]\d{6}$'
    if not re.match(placa_regex, placa):
        return 'Placa inválida. Formato esperado: A123456'
    return None


def validate_positive_number(value: float, field_name: str) -> Optional[str]:
    """Validar que un número sea positivo"""
    try:
        num = float(value)
        if num < 0:
            return f'{field_name} debe ser un número positivo'
    except (ValueError, TypeError):
        return f'{field_name} debe ser un número válido'
    return None


def validate_year(year: int) -> Optional[str]:
    """Validar año de vehículo"""
    from datetime import datetime
    current_year = datetime.now().year
    
    try:
        year_int = int(year)
        if year_int < 1900 or year_int > current_year + 1:
            return f'Año inválido. Debe estar entre 1900 y {current_year + 1}'
    except (ValueError, TypeError):
        return 'Año debe ser un número válido'
    return None


def validate_work_order_estado(estado: str) -> Optional[str]:
    """Validar estado de orden de trabajo"""
    valid_estados = [
        'en_revision',
        'en_cotizacion',
        'en_aprobacion',
        'aprobado',
        'en_proceso',
        'terminado',
        'facturado'
    ]
    if estado not in valid_estados:
        return f'Estado inválido. Debe ser uno de: {", ".join(valid_estados)}'
    return None


def validate_invoice_estado(estado: str) -> Optional[str]:
    """Validar estado de factura"""
    valid_estados = ['borrador', 'emitida', 'aprobada', 'pagada', 'vencida', 'anulada']
    if estado not in valid_estados:
        return f'Estado inválido. Debe ser uno de: {", ".join(valid_estados)}'
    return None


def validate(validations: List[Optional[str]]) -> List[str]:
    """Ejecutar múltiples validaciones y retornar errores"""
    return [error for error in validations if error is not None]
