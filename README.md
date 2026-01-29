# 🚗 Sistema de Gestión para Taller Automotriz

Sistema completo de gestión para talleres automotrices con backend serverless en AWS y frontend moderno.

## 📋 Características

- **Gestión de Clientes** - CRUD completo con validaciones
- **Gestión de Vehículos** - Asociados a clientes con historial
- **Órdenes de Trabajo** - Flujo completo desde recepción hasta facturación
- **Inventario** - Control de stock con kardex y alertas
- **Facturación** - Facturas desde OT y ventas rápidas
- **Autenticación** - Cognito con roles y permisos
- **Auditoría** - Historial completo de cambios

## 🏗️ Arquitectura

### Backend (AWS Serverless)
- **Lambda Functions** - 30 funciones Python 3.11
- **DynamoDB** - 9 tablas con GSIs optimizados
- **API Gateway** - REST API con CORS
- **Cognito** - Autenticación y autorización
- **S3** - Almacenamiento de documentos
- **CDK** - Infrastructure as Code

### Frontend (Pendiente)
- React/Vue/Angular
- Autenticación con Cognito
- Consumo de API REST

## 📊 Estado del Proyecto

### ✅ Backend: 85% Completado
- ✅ Infraestructura CDK
- ✅ 30 Lambdas implementadas
- ✅ 33 Endpoints API
- ✅ Validaciones de negocio
- ✅ Transacciones atómicas
- ✅ Control de concurrencia
- ✅ Documentación completa

### ⏳ Frontend: 0%
- Pendiente de crear

## 🚀 Quick Start

### Prerequisitos
- Node.js 18+
- AWS CLI configurado
- Cuenta AWS con permisos

### Desplegar Backend

```bash
# 1. Instalar dependencias
cd backend/cdk
npm install

# 2. Bootstrap CDK (solo primera vez)
npx cdk bootstrap

# 3. Desplegar
npx cdk deploy

# 4. Guardar outputs
# ApiUrl, UserPoolId, UserPoolClientId
```

### Inicializar Sistema

```bash
# Invocar lambda de inicialización
aws lambda invoke \
  --function-name {stack-name}-AdminInitConfigFunction \
  --payload '{}' \
  response.json
```

### Crear Usuario

```bash
# Crear usuario en Cognito
aws cognito-idp admin-create-user \
  --user-pool-id {user-pool-id} \
  --username admin@taller.com \
  --user-attributes Name=email,Value=admin@taller.com \
  --temporary-password "TempPass123!"
```

### Probar API

```bash
# Obtener token
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id {client-id} \
  --auth-parameters USERNAME=admin@taller.com,PASSWORD=TempPass123!

# Usar token en requests
export TOKEN="eyJhbGc..."
export API_URL="https://xxxxx.execute-api.us-east-1.amazonaws.com/api"

# Crear cliente
curl -X POST $API_URL/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan Pérez", "telefono": "809-555-1234"}'
```

## 📚 Documentación

### Backend
- [`backend/README.md`](backend/README.md) - Descripción general
- [`backend/SETUP.md`](backend/SETUP.md) - Guía de instalación
- [`backend/API-REFERENCE.md`](backend/API-REFERENCE.md) - Referencia API completa
- [`backend/TESTING.md`](backend/TESTING.md) - Guía de testing

### Especificaciones
- [`lambdas.md`](lambdas.md) - Especificación detallada de lambdas
- [`lambdas+Tablas.md`](lambdas+Tablas.md) - Resumen de lambdas y tablas
- [`ARQUITECTURA-NOTAS.md`](ARQUITECTURA-NOTAS.md) - Notas de arquitectura

### Estado
- [`ESTADO-PROYECTO.md`](ESTADO-PROYECTO.md) - Estado actual del proyecto
- [`RESUMEN-BACKEND.md`](RESUMEN-BACKEND.md) - Resumen del backend completado

## 🔧 Estructura del Proyecto

```
.
├── backend/
│   ├── cdk/                    # Infrastructure as Code
│   │   ├── lib/
│   │   │   └── taller-stack.ts # Stack principal
│   │   └── package.json
│   └── lambdas/                # Funciones Lambda
│       ├── customers/          # CRUD clientes
│       ├── vehicles/           # CRUD vehículos
│       ├── inventory/          # CRUD inventario + movimientos
│       ├── work_orders/        # CRUD órdenes + items
│       ├── invoices/           # Facturas + ventas rápidas
│       ├── admin/              # Configuración + usuarios
│       └── shared/             # Utilidades compartidas
│           ├── db_utils.py
│           ├── response_utils.py
│           └── validators.py
├── docs/                       # Documentación
└── README.md
```

## 🎯 Flujo de Trabajo Típico

1. **Recepción del Vehículo**
   - Crear/buscar cliente
   - Crear/buscar vehículo
   - Crear orden de trabajo

2. **Diagnóstico y Cotización**
   - Agregar items (repuestos y servicios)
   - Cambiar estado a "en_cotizacion"
   - Enviar cotización al cliente

3. **Aprobación y Trabajo**
   - Cliente aprueba
   - Cambiar estado a "aprobado" → "en_proceso"
   - Realizar trabajo

4. **Entrega y Facturación**
   - Cambiar estado a "terminado"
   - Crear factura
   - Registrar pago
   - Entregar vehículo

## 🔐 Seguridad

- **Autenticación:** JWT tokens de Cognito
- **Autorización:** Roles y permisos por usuario
- **Aislamiento:** Cada taller tiene su propia infraestructura
- **Auditoría:** Todos los cambios registrados
- **Encriptación:** Datos en reposo y en tránsito

## 📈 Escalabilidad

- **Serverless:** Escala automáticamente con la demanda
- **DynamoDB:** Capacidad on-demand
- **Lambda:** Concurrencia automática
- **API Gateway:** Throttling configurado
- **CloudWatch:** Monitoreo y alertas

## 💰 Costos Estimados

Para un taller pequeño (~100 órdenes/mes):
- Lambda: ~$5/mes
- DynamoDB: ~$10/mes
- API Gateway: ~$3/mes
- Cognito: Gratis (hasta 50k usuarios)
- S3: ~$1/mes
- **Total: ~$20/mes**

## 🛠️ Tecnologías

### Backend
- Python 3.11
- AWS Lambda
- DynamoDB
- API Gateway
- Cognito
- S3
- CloudWatch

### Infrastructure
- AWS CDK (TypeScript)
- CloudFormation

### Frontend (Pendiente)
- React/Vue/Angular
- Amplify/Cognito SDK
- Axios/Fetch

## 🤝 Contribuir

Este es un proyecto privado para un taller específico.

## 📄 Licencia

Propietario - Todos los derechos reservados

## 📞 Soporte

Para soporte técnico, contactar al administrador del sistema.

---

**Desarrollado:** Enero 2025  
**Versión:** 1.0.0 (MVP)  
**Estado:** ✅ Backend listo para producción
