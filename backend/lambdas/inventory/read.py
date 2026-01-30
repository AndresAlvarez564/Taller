"""
Lambda: Inventory Read
Obtiene uno o todos los items de inventario
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
        table_name = os.environ.get('INVENTARIO_TABLE', 'TallerDemo-dev-InventarioItems')
        table = dynamodb.Table(table_name)
        
        # Obtener inventarioItemId de path parameters
        path_params = event.get('pathParameters') or {}
        item_id = path_params.get('inventarioItemId')
        
        if item_id:
            # Obtener un item específico
            response = table.get_item(Key={'inventarioItemId': item_id})
            item = response.get('Item')
            
            if not item or not item.get('activo', False):
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'mensaje': 'Item no encontrado'
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
                    'data': item
                }, default=str)
            }
        else:
            # Listar todos los items
            response = table.scan()
            items = response.get('Items', [])
            items = [i for i in items if i.get('activo', False)]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'data': items
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
