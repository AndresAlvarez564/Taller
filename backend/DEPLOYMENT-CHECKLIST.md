# ✅ Checklist de Deployment - Sistema de Taller

## 📋 Pre-Deployment

### 1. Prerequisitos
- [ ] Node.js 18+ instalado
- [ ] AWS CLI instalado y configurado
- [ ] Cuenta AWS con permisos de administrador
- [ ] Región AWS seleccionada (ej: us-east-1)

### 2. Verificar Configuración AWS
```bash
aws sts get-caller-identity
```
Debe mostrar tu cuenta AWS.

### 3. Verificar Código
```bash
cd backend/cdk
npm install
npm run build
```
Debe compilar sin errores.

---

## 🚀 Deployment

### 1. Bootstrap CDK (Solo Primera Vez)
```bash
cd backend/cdk
npx cdk bootstrap
```
- [ ] Bootstrap completado exitosamente
- [ ] Bucket CDK creado en S3

### 2. Revisar Stack
```bash
npx cdk synth
```
- [ ] Template generado sin errores
- [ ] Revisar recursos que se crearán

### 3. Desplegar Stack
```bash
npx cdk deploy
```
- [ ] Confirmar deployment (y/n)
- [ ] Esperar ~5-10 minutos
- [ ] Deployment completado exitosamente

### 4. Guardar Outputs
Copiar y guardar estos valores del output:
- [ ] `ApiUrl` - URL base de la API
- [ ] `UserPoolId` - ID del User Pool
- [ ] `UserPoolClientId` - ID del cliente
- [ ] `DocumentsBucketName` - Nombre del bucket S3

**Ejemplo:**
```
ApiUrl = https://abc123.execute-api.us-east-1.amazonaws.com/api/
UserPoolId = us-east-1_ABC123
UserPoolClientId = 1234567890abcdefghij
DocumentsBucketName = taller-stack-documentsbucket-xyz
```

---

## ⚙️ Post-Deployment

### 1. Inicializar Configuración
```bash
# Obtener nombre de la función
aws lambda list-functions --query 'Functions[?contains(FunctionName, `InitConfig`)].FunctionName'

# Invocar función
aws lambda invoke \
  --function-name {nombre-funcion} \
  --payload '{}' \
  response.json

# Ver respuesta
cat response.json
```
- [ ] Función ejecutada exitosamente
- [ ] Configuración creada en DynamoDB
- [ ] Roles y permisos inicializados

### 2. Crear Usuario Administrador
```bash
export USER_POOL_ID="us-east-1_ABC123"

aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username admin@taller.com \
  --user-attributes Name=email,Value=admin@taller.com \
  --temporary-password "TempPass123!"
```
- [ ] Usuario creado exitosamente
- [ ] Email de bienvenida recibido (si configurado)

### 3. Obtener Token de Autenticación
```bash
export CLIENT_ID="1234567890abcdefghij"

aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=admin@taller.com,PASSWORD=TempPass123!
```
- [ ] Token obtenido exitosamente
- [ ] Guardar `IdToken` para testing

---

## 🧪 Testing Básico

### 1. Configurar Variables
```bash
export API_URL="https://abc123.execute-api.us-east-1.amazonaws.com/api"
export TOKEN="eyJhbGc..."
```

### 2. Test: Crear Cliente
```bash
curl -X POST $API_URL/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Cliente",
    "telefono": "809-555-1234",
    "ciNit": "001-1234567-8",
    "direccion": "Calle Test #123",
    "email": "test@example.com"
  }'
```
- [ ] Status 201 Created
- [ ] `clienteId` retornado

### 3. Test: Listar Clientes
```bash
curl -X GET $API_URL/customers \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Status 200 OK
- [ ] Cliente creado aparece en la lista

### 4. Test: Crear Item de Inventario
```bash
curl -X POST $API_URL/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TEST-001",
    "nombre": "Item de Prueba",
    "costo": 100.00,
    "precio": 150.00,
    "stockInicial": 10,
    "stockMinimo": 5
  }'
```
- [ ] Status 201 Created
- [ ] `inventarioItemId` retornado
- [ ] Stock inicial registrado

### 5. Test: Verificar Movimiento de Inventario
```bash
export INV_ID="uuid-del-item"

curl -X GET "$API_URL/inventory/movements?inventarioItemId=$INV_ID" \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Status 200 OK
- [ ] Movimiento de entrada inicial aparece

---

## 🔍 Verificación de Recursos

### 1. Verificar Lambdas
```bash
aws lambda list-functions --query 'Functions[?contains(FunctionName, `taller`)].FunctionName'
```
- [ ] ~30 funciones listadas
- [ ] Todas con estado Active

### 2. Verificar Tablas DynamoDB
```bash
aws dynamodb list-tables --query 'TableNames[?contains(@, `taller`)]'
```
- [ ] 9 tablas listadas
- [ ] Todas con estado ACTIVE

### 3. Verificar API Gateway
```bash
aws apigateway get-rest-apis --query 'items[?contains(name, `Taller`)].{Name:name,Id:id}'
```
- [ ] API listada
- [ ] Stage 'api' desplegado

### 4. Verificar Cognito
```bash
aws cognito-idp list-user-pools --max-results 10 --query 'UserPools[?contains(Name, `taller`)]'
```
- [ ] User Pool listado
- [ ] Usuario admin creado

### 5. Verificar S3
```bash
aws s3 ls | grep taller
```
- [ ] Bucket de documentos listado
- [ ] Bucket CDK listado

---

## 📊 Monitoreo

### 1. CloudWatch Logs
```bash
# Ver logs de una lambda
aws logs tail /aws/lambda/{nombre-funcion} --follow
```
- [ ] Logs accesibles
- [ ] Sin errores críticos

### 2. CloudWatch Metrics
- [ ] Acceder a CloudWatch Console
- [ ] Verificar métricas de Lambda
- [ ] Verificar métricas de API Gateway
- [ ] Configurar alarmas (opcional)

---

## 🔒 Seguridad

### 1. Revisar Permisos IAM
- [ ] Lambdas tienen permisos mínimos necesarios
- [ ] No hay políticas con `*` innecesarias
- [ ] Roles creados automáticamente por CDK

### 2. Revisar Configuración de API
- [ ] CORS configurado correctamente
- [ ] Throttling habilitado
- [ ] Logs habilitados

### 3. Revisar Cognito
- [ ] Password policy configurado
- [ ] MFA disponible (opcional)
- [ ] Email verification habilitado

---

## 📝 Documentación

### 1. Documentar Deployment
- [ ] Guardar outputs en archivo seguro
- [ ] Documentar credenciales de admin
- [ ] Documentar URL de API
- [ ] Compartir con equipo (si aplica)

### 2. Crear Usuarios Adicionales
```bash
# Crear usuario cajero
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username cajero@taller.com \
  --user-attributes Name=email,Value=cajero@taller.com \
  --temporary-password "TempPass123!"
```
- [ ] Usuarios creados según necesidad
- [ ] Roles asignados correctamente

---

## 🎯 Testing Completo

Ver `backend/TESTING.md` para testing exhaustivo:
- [ ] CRUD de clientes
- [ ] CRUD de vehículos
- [ ] CRUD de inventario
- [ ] Flujo completo de orden de trabajo
- [ ] Creación de factura
- [ ] Registro de pago
- [ ] Venta rápida
- [ ] Anulación de venta

---

## 🚨 Troubleshooting

### Error: "User is not authorized"
- Verificar que el token no haya expirado
- Verificar que el header Authorization esté correcto
- Regenerar token si es necesario

### Error: "ConditionalCheckFailed"
- Conflicto de concurrencia en inventario
- Reintentar la operación
- Verificar que el item no haya sido modificado

### Error: "ResourceNotFoundException"
- Verificar que el recurso exista
- Verificar IDs correctos
- Verificar que no haya sido eliminado (soft delete)

### Lambda Timeout
- Verificar logs en CloudWatch
- Aumentar timeout si es necesario
- Verificar que no haya loops infinitos

---

## 🧹 Rollback (Si es necesario)

### Eliminar Stack Completo
```bash
cd backend/cdk
npx cdk destroy
```
- [ ] Confirmar eliminación
- [ ] Esperar ~5 minutos
- [ ] Verificar que todos los recursos fueron eliminados

**ADVERTENCIA:** Esto eliminará TODOS los datos.

---

## ✅ Deployment Exitoso

Si todos los checks están marcados:
- ✅ Backend desplegado correctamente
- ✅ Configuración inicializada
- ✅ Usuario admin creado
- ✅ Tests básicos pasando
- ✅ Recursos verificados
- ✅ Documentación actualizada

**¡El sistema está listo para usar!**

---

## 📞 Siguiente Paso

Ahora puedes:
1. Continuar con testing exhaustivo
2. Crear frontend para conectar con la API
3. Configurar dominio personalizado
4. Configurar CI/CD pipeline
5. Agregar funcionalidades adicionales

---

**Fecha de Deployment:** _____________  
**Desplegado por:** _____________  
**Región AWS:** _____________  
**Stack Name:** _____________  
**API URL:** _____________
