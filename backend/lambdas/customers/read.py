"""
Lambda: Customer Read
Obtiene uno o todos los clientes
"""
import json
import os
import boto3

# Cliente DynamoDB
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

def lambda_handler(event, context):
    """
    Handler principal del lambda
    """
    try:
        # Obtener nombre de tabla
        table_name = os.environ.get('CLIENTES_TABLE', 'TallerDemo-dev-Clientes')
        table = dynamodb.Table(table_name)
        
        # Obtener clienteId de path parameters
        path_params = event.get('pathParameters') or {}
        cliente_id = path_params.get('clienteId')
        
        if cliente_id:
            # Obtener un cliente específico
            response = table.get_item(Key={'clienteId': cliente_id})
            customer = response.get('Item')
            
            if not customer:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'mensaje': 'Cliente no encontrado'
                    })
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'data': customer
                }, default=str)
            }
        else:
            # Listar todos los clientes
            response = table.scan()
            customers = response.get('Items', [])
            
            # Filtrar solo activos
            customers = [c for c in customers if c.get('activo', False)]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'data': customers
                }, default=str)
            }
        
    except Exception as e:
        print(f'Error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'mensaje': f'Error interno: {str(e)}'
            })
        }
