"""
Utilidades para interactuar con DynamoDB
"""
import os
import boto3
from typing import Dict, List, Any, Optional
from decimal import Decimal
import json

# Cliente DynamoDB
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Nombres de tablas desde variables de entorno
TABLES = {
    'CLIENTES': os.environ.get('CLIENTES_TABLE', 'Clientes'),
    'VEHICULOS': os.environ.get('VEHICULOS_TABLE', 'Vehiculos'),
    'ORDENES_TRABAJO': os.environ.get('ORDENES_TRABAJO_TABLE', 'OrdenesTrabajo'),
    'INVENTARIO': os.environ.get('INVENTARIO_TABLE', 'InventarioItems'),
    'FACTURAS': os.environ.get('FACTURAS_TABLE', 'Facturas'),
    'DETALLES': os.environ.get('DETALLES_TABLE', 'Detalles'),
    'USUARIOS': os.environ.get('USUARIOS_TABLE', 'Usuarios'),
    'CONFIGURACION': os.environ.get('CONFIGURACION_TABLE', 'ConfiguracionTaller'),
    'ROLES_PERMISOS': os.environ.get('ROLES_PERMISOS_TABLE', 'RolesPermisos'),
}


class DecimalEncoder(json.JSONEncoder):
    """Helper para serializar Decimal a JSON"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


def get_table(table_name: str):
    """Obtener referencia a una tabla de DynamoDB"""
    return dynamodb.Table(table_name)


def get_item(table_name: str, key: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Obtener un item de DynamoDB"""
    table = get_table(table_name)
    response = table.get_item(Key=key)
    return response.get('Item')


def put_item(table_name: str, item: Dict[str, Any]) -> Dict[str, Any]:
    """Crear o actualizar un item en DynamoDB"""
    table = get_table(table_name)
    table.put_item(Item=item)
    return item


def update_item(
    table_name: str,
    key: Dict[str, Any],
    updates: Dict[str, Any],
    condition: Optional[str] = None
) -> Dict[str, Any]:
    """Actualizar atributos específicos de un item"""
    table = get_table(table_name)
    
    # Construir UpdateExpression
    update_expression = []
    expression_attribute_names = {}
    expression_attribute_values = {}
    
    for i, (field, value) in enumerate(updates.items()):
        placeholder = f'#field{i}'
        value_placeholder = f':value{i}'
        update_expression.append(f'{placeholder} = {value_placeholder}')
        expression_attribute_names[placeholder] = field
        expression_attribute_values[value_placeholder] = value
    
    params = {
        'Key': key,
        'UpdateExpression': f"SET {', '.join(update_expression)}",
        'ExpressionAttributeNames': expression_attribute_names,
        'ExpressionAttributeValues': expression_attribute_values,
        'ReturnValues': 'ALL_NEW'
    }
    
    if condition:
        params['ConditionExpression'] = condition
    
    response = table.update_item(**params)
    return response.get('Attributes', {})


def delete_item(table_name: str, key: Dict[str, Any]) -> None:
    """Eliminar un item de DynamoDB"""
    table = get_table(table_name)
    table.delete_item(Key=key)


def query_items(
    table_name: str,
    key_condition: str,
    expression_values: Dict[str, Any],
    index_name: Optional[str] = None,
    filter_expression: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Query items en DynamoDB"""
    table = get_table(table_name)
    
    params = {
        'KeyConditionExpression': key_condition,
        'ExpressionAttributeValues': expression_values
    }
    
    if index_name:
        params['IndexName'] = index_name
    
    if filter_expression:
        params['FilterExpression'] = filter_expression
    
    response = table.query(**params)
    return response.get('Items', [])


def scan_items(
    table_name: str,
    filter_expression: Optional[str] = None,
    expression_values: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """Scan items en DynamoDB (usar con cuidado)"""
    table = get_table(table_name)
    
    params = {}
    if filter_expression:
        params['FilterExpression'] = filter_expression
        if expression_values:
            params['ExpressionAttributeValues'] = expression_values
    
    response = table.scan(**params)
    return response.get('Items', [])


def transact_write(items: List[Dict[str, Any]]) -> None:
    """Ejecutar transacción atómica en DynamoDB"""
    client = boto3.client('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
    client.transact_write_items(TransactItems=items)


def increment_counter(
    table_name: str,
    key: Dict[str, Any],
    field: str,
    increment: int = 1
) -> Dict[str, Any]:
    """Incrementar un contador atómicamente"""
    table = get_table(table_name)
    
    response = table.update_item(
        Key=key,
        UpdateExpression=f'ADD {field} :inc',
        ExpressionAttributeValues={':inc': increment},
        ReturnValues='ALL_NEW'
    )
    
    return response.get('Attributes', {})
