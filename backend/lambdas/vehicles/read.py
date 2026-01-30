"""
Lambda: Vehicle Read
Obtiene uno o todos los vehículos
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
        table_name = os.environ.get('VEHICULOS_TABLE', 'TallerDemo-dev-Vehiculos')
        table = dynamodb.Table(table_name)
        
        # Obtener vehiculoId de path parameters
        path_params = event.get('pathParameters') or {}
        vehiculo_id = path_params.get('vehiculoId')
        
        # Obtener query parameters
        query_params = event.get('queryStringParameters') or {}
        customer_id = query_params.get('customerId')
        
        if vehiculo_id:
            # Obtener un vehículo específico
            response = table.get_item(Key={'vehiculoId': vehiculo_id})
            vehicle = response.get('Item')
            
            if not vehicle:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'mensaje': 'Vehículo no encontrado'
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
                    'data': vehicle
                }, default=str)
            }
            
        elif customer_id:
            # Listar vehículos de un cliente usando GSI
            response = table.query(
                IndexName='customerId-index',
                KeyConditionExpression='customerId = :cid',
                ExpressionAttributeValues={':cid': customer_id}
            )
            vehicles = response.get('Items', [])
            vehicles = [v for v in vehicles if v.get('activo', True)]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'data': vehicles
                }, default=str)
            }
            
        else:
            # Listar todos los vehículos
            response = table.scan()
            vehicles = response.get('Items', [])
            vehicles = [v for v in vehicles if v.get('activo', True)]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'data': vehicles
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
