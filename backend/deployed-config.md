# 🚀 Configuración del Backend Desplegado

**Stack:** TallerDemo-dev  
**Región:** us-east-1  
**Fecha de Deploy:** 29 de Enero, 2025

## 📋 Outputs de CloudFormation

```
ApiUrl: https://x4rtbi7bo4.execute-api.us-east-1.amazonaws.com/api
UserPoolId: (pendiente)
UserPoolClientId: (pendiente)
DocumentsBucketName: (pendiente)
```

## 🔗 Endpoints Disponibles

### Customers (Clientes)
- `POST   {ApiUrl}/customers` - Crear cliente
- `GET    {ApiUrl}/customers` - Listar clientes
- `GET    {ApiUrl}/customers/{id}` - Obtener cliente
- `PUT    {ApiUrl}/customers/{id}` - Actualizar cliente
- `DELETE {ApiUrl}/customers/{id}` - Eliminar cliente

### Vehicles (Vehículos)
- `POST   {ApiUrl}/vehicles` - Crear vehículo
- `GET    {ApiUrl}/vehicles` - Listar vehículos
- `GET    {ApiUrl}/vehicles?customerId={id}` - Vehículos de un cliente
- `GET    {ApiUrl}/vehicles/{id}` - Obtener vehículo

## 🧪 Ejemplos de Prueba

### Crear Cliente
```bash
curl -X POST {ApiUrl}/customers \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "telefono": "809-555-1234",
    "email": "juan@test.com",
    "cedula": "001-1234567-8",
    "direccion": "Santo Domingo"
  }'
```

### Listar Clientes
```bash
curl {ApiUrl}/customers
```

### Crear Vehículo
```bash
curl -X POST {ApiUrl}/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid-del-cliente",
    "placa": "A123456",
    "marca": "Toyota",
    "modelo": "Corolla",
    "año": 2020,
    "color": "Blanco",
    "vin": "1HGBH41JXMN109186"
  }'
```

## 📊 Recursos Creados en AWS

- ✅ 9 Tablas DynamoDB
- ✅ 1 S3 Bucket
- ✅ 1 Cognito User Pool
- ✅ 1 API Gateway
- ✅ 1 Lambda Layer
- ✅ 6 Lambda Functions
- ✅ Roles y Policies IAM

## 🔧 Comandos Útiles

### Ver logs de una lambda
```bash
aws logs tail /aws/lambda/TallerDemo-dev-CustomerCreateFunction --follow
```

### Actualizar solo código de lambdas (rápido)
```bash
cd backend/cdk
cdk deploy --hotswap
```

### Ver stack en AWS Console
```bash
start https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks
```

### Destruir stack (CUIDADO!)
```bash
cd backend/cdk
cdk destroy
```

---

**Última actualización:** 29 de Enero, 2025
