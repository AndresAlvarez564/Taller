# Guía de Testing - Backend

## 🚀 Despliegue

### 1. Instalar dependencias
```bash
cd backend/cdk
npm install
```

### 2. Configurar AWS CLI
```bash
aws configure
# Ingresar: Access Key, Secret Key, Region (ej: us-east-1)
```

### 3. Bootstrap CDK (solo primera vez)
```bash
npx cdk bootstrap
```

### 4. Desplegar stack
```bash
npx cdk deploy
```

Esto creará:
- 9 tablas DynamoDB
- 1 bucket S3
- 1 Cognito User Pool
- 1 API Gateway
- ~30 funciones Lambda
- Todos los permisos IAM necesarios

### 5. Guardar outputs
Al finalizar el deploy, guarda estos valores:
- `ApiUrl` - URL base de la API
- `UserPoolId` - ID del User Pool de Cognito
- `UserPoolClientId` - ID del cliente de Cognito

---

## 🔧 Inicialización

### 1. Crear configuración inicial
```bash
# Invocar lambda de inicialización
aws lambda invoke \
  --function-name {stack-name}-AdminInitConfigFunction \
  --payload '{}' \
  response.json

cat response.json
```

Esto crea:
- Configuración del taller
- Roles y permisos por defecto
- Contador de facturas en 0

---

## 🧪 Testing con cURL

### Variables de entorno
```bash
export API_URL="https://xxxxx.execute-api.us-east-1.amazonaws.com/api"
export TOKEN="eyJhbGc..." # JWT de Cognito (ver sección de autenticación)
```

### 1. Crear Cliente
```bash
curl -X POST $API_URL/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "telefono": "809-555-1234",
    "ciNit": "001-1234567-8",
    "direccion": "Calle Principal #123",
    "email": "juan@example.com"
  }'
```

Respuesta esperada:
```json
{
  "clienteId": "uuid-generado",
  "mensaje": "Cliente creado exitosamente"
}
```

### 2. Listar Clientes
```bash
curl -X GET "$API_URL/customers" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Crear Vehículo
```bash
export CLIENTE_ID="uuid-del-cliente"

curl -X POST $API_URL/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "'$CLIENTE_ID'",
    "placa": "A123456",
    "marca": "Toyota",
    "modelo": "Corolla",
    "anio": 2020,
    "chasis": "JT2BF18K8X0123456",
    "color": "Blanco"
  }'
```

### 4. Crear Item de Inventario
```bash
curl -X POST $API_URL/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "FIL-001",
    "nombre": "Filtro de Aceite",
    "descripcion": "Filtro de aceite para motor",
    "costo": 150.00,
    "precio": 250.00,
    "stockInicial": 50,
    "stockMinimo": 10,
    "unidad": "unidad",
    "categoria": "Filtros"
  }'
```

### 5. Crear Orden de Trabajo
```bash
export VEHICULO_ID="uuid-del-vehiculo"

curl -X POST $API_URL/work-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "'$CLIENTE_ID'",
    "vehicleId": "'$VEHICULO_ID'",
    "descripcionProblema": "Motor hace ruido extraño",
    "kilometraje": 85000,
    "observaciones": "Cliente reporta ruido al acelerar"
  }'
```

### 6. Agregar Item a Orden
```bash
export OT_ID="uuid-de-la-orden"
export INV_ID="uuid-del-item-inventario"

curl -X POST $API_URL/work-orders/$OT_ID/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workOrderId": "'$OT_ID'",
    "tipo": "repuesto",
    "descripcion": "Filtro de Aceite",
    "cantidad": 1,
    "precioUnitario": 250.00,
    "inventarioItemId": "'$INV_ID'"
  }'
```

### 7. Cambiar Estado de Orden
```bash
# Pasar a cotización
curl -X PUT $API_URL/work-orders/$OT_ID/state \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "en_cotizacion"}'

# Aprobar
curl -X PUT $API_URL/work-orders/$OT_ID/state \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "aprobado"}'

# Terminar
curl -X PUT $API_URL/work-orders/$OT_ID/state \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "terminado"}'
```

### 8. Crear Factura
```bash
curl -X POST $API_URL/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workOrderId": "'$OT_ID'"
  }'
```

### 9. Registrar Pago
```bash
export FACTURA_ID="uuid-de-la-factura"

curl -X POST $API_URL/invoices/$FACTURA_ID/pago \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "montoPagado": 5000.00,
    "metodoPago": "efectivo",
    "referencia": "Recibo #123"
  }'
```

### 10. Venta Rápida
```bash
curl -X POST $API_URL/ventas-rapidas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteNombre": "Cliente General",
    "items": [
      {
        "tipo": "repuesto",
        "descripcion": "Aceite 10W-40",
        "cantidad": 2,
        "precioUnitario": 450.00,
        "inventarioItemId": "'$INV_ID'"
      },
      {
        "tipo": "servicio",
        "descripcion": "Cambio de aceite",
        "cantidad": 1,
        "precioUnitario": 300.00
      }
    ]
  }'
```

---

## 🔐 Autenticación con Cognito

### Opción 1: Crear usuario desde AWS Console
1. Ir a Cognito → User Pools → {tu-pool}
2. Users → Create user
3. Ingresar username y password temporal
4. Usuario recibirá email para cambiar password

### Opción 2: Crear usuario con AWS CLI
```bash
export USER_POOL_ID="us-east-1_xxxxx"

aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username admin@taller.com \
  --user-attributes Name=email,Value=admin@taller.com \
  --temporary-password "TempPass123!"
```

### Obtener Token JWT
```bash
export CLIENT_ID="xxxxx"

aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=admin@taller.com,PASSWORD=TempPass123!
```

Respuesta:
```json
{
  "AuthenticationResult": {
    "AccessToken": "eyJhbGc...",
    "IdToken": "eyJhbGc...",
    "RefreshToken": "eyJhbGc..."
  }
}
```

Usar el `IdToken` como Bearer token.

---

## 🧪 Testing con Postman

### 1. Importar colección
Crear una colección con:
- Variable `{{baseUrl}}` = URL de la API
- Variable `{{token}}` = JWT token
- Header global: `Authorization: Bearer {{token}}`

### 2. Requests de ejemplo
Ver `API-REFERENCE.md` para todos los endpoints disponibles.

---

## 🐛 Debugging

### Ver logs de Lambda
```bash
# Listar funciones
aws lambda list-functions --query 'Functions[?contains(FunctionName, `taller`)].FunctionName'

# Ver logs de una función
aws logs tail /aws/lambda/{function-name} --follow
```

### Ver datos en DynamoDB
```bash
# Listar tablas
aws dynamodb list-tables

# Escanear tabla
aws dynamodb scan --table-name {stack-name}-Clientes
```

### Verificar API Gateway
```bash
# Obtener API ID
aws apigateway get-rest-apis

# Ver recursos
aws apigateway get-resources --rest-api-id {api-id}
```

---

## 🧹 Limpieza

### Eliminar stack completo
```bash
cd backend/cdk
npx cdk destroy
```

Esto eliminará:
- Todas las lambdas
- Todas las tablas DynamoDB (y sus datos)
- API Gateway
- Cognito User Pool
- S3 Bucket (si está vacío)

---

## ✅ Checklist de Testing

- [ ] Crear cliente
- [ ] Listar clientes
- [ ] Actualizar cliente
- [ ] Intentar eliminar cliente (debe fallar si tiene OTs)
- [ ] Crear vehículo
- [ ] Listar vehículos por cliente
- [ ] Crear item de inventario con stock inicial
- [ ] Verificar movimiento de entrada inicial
- [ ] Crear orden de trabajo
- [ ] Agregar item de repuesto (verificar descuento de stock)
- [ ] Agregar item de servicio
- [ ] Cambiar estados de OT (verificar flujo)
- [ ] Intentar aprobar sin items (debe fallar)
- [ ] Crear factura desde OT
- [ ] Verificar que OT quedó bloqueada
- [ ] Intentar agregar item a OT facturada (debe fallar)
- [ ] Registrar pago parcial
- [ ] Registrar pago completo
- [ ] Crear venta rápida con repuestos
- [ ] Verificar descuento de inventario
- [ ] Anular venta rápida
- [ ] Verificar reversión de inventario
- [ ] Listar movimientos de inventario (kardex)

---

**Última actualización:** 29 de Enero, 2025
