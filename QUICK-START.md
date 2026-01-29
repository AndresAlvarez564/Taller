# ⚡ Quick Start - Sistema de Taller

## 🚀 Desplegar en 5 Minutos

### 1. Prerequisitos
```bash
# Verificar Node.js
node --version  # Debe ser 18+

# Verificar AWS CLI
aws --version

# Configurar AWS (si no está configurado)
aws configure
```

### 2. Instalar y Desplegar
```bash
# Clonar/navegar al proyecto
cd backend/cdk

# Instalar dependencias
npm install

# Bootstrap CDK (solo primera vez)
npx cdk bootstrap

# Desplegar
npx cdk deploy
```

**Tiempo estimado:** 5-10 minutos

### 3. Guardar Outputs
Copiar estos valores del output:
```
ApiUrl = https://xxxxx.execute-api.us-east-1.amazonaws.com/api/
UserPoolId = us-east-1_xxxxx
UserPoolClientId = xxxxx
```

---

## 🔧 Configuración Inicial

### 1. Inicializar Sistema
```bash
# Obtener nombre de función
aws lambda list-functions --query 'Functions[?contains(FunctionName, `InitConfig`)].FunctionName' --output text

# Invocar (reemplazar NOMBRE_FUNCION)
aws lambda invoke --function-name NOMBRE_FUNCION --payload '{}' response.json
```

### 2. Crear Usuario Admin
```bash
# Reemplazar USER_POOL_ID con tu valor
aws cognito-idp admin-create-user \
  --user-pool-id USER_POOL_ID \
  --username admin@taller.com \
  --user-attributes Name=email,Value=admin@taller.com \
  --temporary-password "TempPass123!"
```

### 3. Obtener Token
```bash
# Reemplazar CLIENT_ID con tu valor
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id CLIENT_ID \
  --auth-parameters USERNAME=admin@taller.com,PASSWORD=TempPass123!
```

Copiar el `IdToken` de la respuesta.

---

## 🧪 Probar API

### Configurar Variables
```bash
export API_URL="https://xxxxx.execute-api.us-east-1.amazonaws.com/api"
export TOKEN="eyJhbGc..."  # Tu IdToken
```

### Test 1: Crear Cliente
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

**Respuesta esperada:**
```json
{
  "clienteId": "uuid-generado",
  "mensaje": "Cliente creado exitosamente"
}
```

### Test 2: Listar Clientes
```bash
curl -X GET $API_URL/customers \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3: Crear Item de Inventario
```bash
curl -X POST $API_URL/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "FIL-001",
    "nombre": "Filtro de Aceite",
    "costo": 150.00,
    "precio": 250.00,
    "stockInicial": 50,
    "stockMinimo": 10
  }'
```

---

## 📱 Usar con Postman

### 1. Importar Colección
Crear nueva colección con:

**Variables:**
- `baseUrl` = Tu API URL
- `token` = Tu IdToken

**Headers (Global):**
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`

### 2. Requests Básicos

**Crear Cliente:**
```
POST {{baseUrl}}/customers
Body: { "nombre": "...", "telefono": "..." }
```

**Listar Clientes:**
```
GET {{baseUrl}}/customers
```

**Crear Vehículo:**
```
POST {{baseUrl}}/vehicles
Body: { "customerId": "...", "placa": "..." }
```

---

## 📚 Documentación Completa

Para más detalles, ver:
- `backend/API-REFERENCE.md` - Todos los endpoints
- `backend/TESTING.md` - Guía completa de testing
- `backend/DEPLOYMENT-CHECKLIST.md` - Checklist detallado

---

## 🐛 Problemas Comunes

### Error: "User is not authorized"
**Solución:** Token expirado, obtener uno nuevo.

### Error: "ResourceNotFoundException"
**Solución:** Verificar que el recurso exista y el ID sea correcto.

### Error: "ConditionalCheckFailed"
**Solución:** Conflicto de concurrencia, reintentar.

---

## 🧹 Eliminar Todo

Si necesitas eliminar el stack completo:
```bash
cd backend/cdk
npx cdk destroy
```

**ADVERTENCIA:** Esto eliminará todos los datos.

---

## ✅ Checklist Rápido

- [ ] AWS CLI configurado
- [ ] CDK desplegado
- [ ] Outputs guardados
- [ ] Sistema inicializado
- [ ] Usuario admin creado
- [ ] Token obtenido
- [ ] Test de cliente exitoso
- [ ] Test de inventario exitoso

**¡Listo para usar!** 🎉

---

## 🎯 Siguiente Paso

Ahora puedes:
1. Probar más endpoints (ver `API-REFERENCE.md`)
2. Crear un frontend
3. Probar flujo completo de orden de trabajo

---

**Tiempo total:** ~15 minutos  
**Dificultad:** Fácil  
**Prerequisitos:** AWS CLI + Node.js
