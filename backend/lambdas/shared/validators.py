"""
Validadores comunes para datos de entrada
"""
import re


def validate_email(email: str) -> bool:
    """Validar formato de email"""
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return bool(re.match(email_regex, email))


def validate_phone(phone: str) -> bool:
    """Validar formato de teléfono dominicano: 809-555-1234"""
    phone_regex = r'^\d{3}-\d{3}-\d{4}$'
    return bool(re.match(phone_regex, phone))


def validate_cedula(cedula: str) -> bool:
    """Validar formato de cédula dominicana: 001-1234567-8"""
    cedula_regex = r'^\d{3}-\d{7}-\d$'
    return bool(re.match(cedula_regex, cedula))


def validate_placa(placa: str) -> bool:
    """Validar formato de placa: A123456"""
    placa_regex = r'^[A-Z]\d{6}$'
    return bool(re.match(placa_regex, placa))


def validate_positive_number(value) -> bool:
    """Validar que un número sea positivo"""
    try:
        num = float(value)
        return num > 0
    except (ValueError, TypeError):
        return False


def validate_year(year) -> bool:
    """Validar año de vehículo"""
    from datetime import datetime
    current_year = datetime.now().year
    
    try:
        year_int = int(year)
        return 1900 <= year_int <= current_year + 1
    except (ValueError, TypeError):
        return False


def validate_workorder_state(estado: str) -> bool:
    """Validar estado de orden de trabajo"""
    valid_estados = [
        'en_revision',
        'en_cotizacion',
        'en_aprobacion',
        'aprobado',
        'en_proceso',
        'terminado',
        'facturado',
        'cancelado'
    ]
    return estado in valid_estados


def validate_invoice_state(estado: str) -> bool:
    """Validar estado de factura"""
    valid_estados = ['borrador', 'emitida', 'aprobada', 'pagada', 'parcial', 'vencida', 'anulada']
    return estado in valid_estados
