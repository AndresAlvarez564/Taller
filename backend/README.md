# Backend - Sistema de Gestión de Taller

Backend serverless construido con **AWS CDK (TypeScript)** y **AWS Lambda (Python 3.11)**.

## 📁 Estructura del Proyecto

```
backend/
├── cdk/                      # Infraestructura como código (CDK)
│   ├── bin/
│   │   └── taller-stack.ts   # Entry point del CDK
│   ├── lib/
│   │   └── taller-stack.ts   # Definición del stack principal
│   ├── package.json
│   ├── tsconfig.json
│   └── cdk.json
│
├── lambdas/                  # Funciones Lambda (Python)
│   ├── shared/               # Utilidades compartidas
│   │   ├── db_utils.py       # Helpers de DynamoDB
│   │   ├── response_utils.py # Respuestas HTTP estandarizadas
│   │   └── validators.py     # Validadores comunes
│   │
│   ├── customers/            # Módulo de Clientes
│   │   ├── create.py
│   │   ├── read.py
│   │   ├── update.py
│   │   └── delete.py
│   │
│   ├── vehicles/             # Módulo de Vehículos
│   ├── work_orders/          # Módulo de Órdenes de Trabajo
│   ├── inventory/            # Módulo de Inventario
│   ├── invoices/             # Módulo de Facturas
│   └── admin/                # Módulo de Administración
│
└── README.md
```

## 🚀 Requisitos Previos

1. **Node.js** (v18 o superior) - para CDK
2. **Python** (v3.11) - para Lambdas
3. **AWS CLI** configurado con credenciales
4. **AWS CDK CLI** instalado globalmente:
   ```bash
   npm install -g aws-cdk
   ```

## 📦 Instalación

### 1. Instalar dependencias de CDK

```bash
cd backend/cdk
npm install
```

### 2. Instalar dependencias de Python (opcional, para desarrollo local)

```bash
cd backend/lambdas
pip install boto3
```

## 🏗️ Despliegue

### Bootstrap de CDK (solo primera vez por cuenta/región)

```bash
cd backend/cdk
cdk bootstrap
```

### Desplegar a DEV

```bash
cd backend/cdk
npm run deploy:dev
```

Esto desplegará:
- ✅ Todas las tablas DynamoDB con GSIs
- ✅ S3 Bucket para documentos
- ✅ Cognito User Pool
- ✅ API Gateway
- ✅ Todas las funciones Lambda
- ✅ Permisos y roles IAM

### Desplegar a PROD

```bash
cd backend/cdk
npm run deploy:prod
```

### Ver cambios antes de desplegar

```bash
cd backend/cdk
cdk diff
```

### Sintetizar CloudFormation template

```bash
cd backend/cdk
cdk synth
```

## 🔧 Configuración por Taller

Para desplegar para un taller específico:

```bash
cd backend/cdk
cdk deploy --context tallerName="TallerElExperto" --context env=prod
```

Esto creará un stack llamado `TallerElExperto-prod` con todos los recursos aislados.

## 📊 Recursos Desplegados

### DynamoDB Tables
- `Clientes` - Información de clientes
- `Vehiculos` - Vehículos de clientes
- `OrdenesTrabajo` - Órdenes de trabajo
- `InventarioItems` - Items de inventario
- `Facturas` - Facturas emitidas
- `Detalles` - Items de OT + Movimientos de inventario
- `Usuarios` - Usuarios del sistema
- `ConfiguracionTaller` - Configuración global
- `RolesPermisos` - Roles y permisos

### API Endpoints (ejemplo)

```
POST   /customers          - Crear cliente
GET    /customers          - Listar clientes
GET    /customers/{id}     - Obtener cliente
PUT    /customers/{id}     - Actualizar cliente
DELETE /customers/{id}     - Eliminar cliente (soft delete)

POST   /vehicles           - Crear vehículo
GET    /vehicles           - Listar vehículos
GET    /vehicles/{id}      - Obtener vehículo

POST   /work-orders        - Crear orden de trabajo
GET    /work-orders        - Listar órdenes
PUT    /work-orders/{id}/state - Cambiar estado

... (más endpoints)
```

## 🧪 Testing Local

### Invocar Lambda localmente (con SAM)

```bash
sam local invoke CustomerCreateFunction --event events/create-customer.json
```

### Ejecutar API Gateway localmente

```bash
sam local start-api
```

## 🗑️ Destruir Stack

**⚠️ CUIDADO: Esto eliminará todos los recursos**

```bash
cd backend/cdk
cdk destroy
```

## 📝 Variables de Entorno

Las lambdas reciben automáticamente estas variables:

- `CLIENTES_TABLE` - Nombre de tabla Clientes
- `VEHICULOS_TABLE` - Nombre de tabla Vehiculos
- `ORDENES_TRABAJO_TABLE` - Nombre de tabla OrdenesTrabajo
- `INVENTARIO_TABLE` - Nombre de tabla InventarioItems
- `FACTURAS_TABLE` - Nombre de tabla Facturas
- `DETALLES_TABLE` - Nombre de tabla Detalles
- `USUARIOS_TABLE` - Nombre de tabla Usuarios
- `CONFIGURACION_TABLE` - Nombre de tabla ConfiguracionTaller
- `ROLES_PERMISOS_TABLE` - Nombre de tabla RolesPermisos
- `DOCUMENTS_BUCKET` - Nombre del bucket S3
- `USER_POOL_ID` - ID del Cognito User Pool

## 🔐 Seguridad

- ✅ Todas las tablas tienen Point-in-Time Recovery habilitado
- ✅ S3 Bucket con encriptación y sin acceso público
- ✅ API Gateway con throttling configurado
- ✅ Cognito para autenticación de usuarios
- ✅ IAM roles con permisos mínimos necesarios

## 📈 Monitoreo

Después del despliegue, puedes monitorear en AWS Console:

- **CloudWatch Logs** - Logs de cada Lambda
- **CloudWatch Metrics** - Métricas de invocaciones, errores, duración
- **X-Ray** - Tracing de requests (si se habilita)
- **DynamoDB Metrics** - Consumo de capacidad, throttles

## 🔄 CI/CD (Próximamente)

Pipeline sugerido:
1. Push a `main` → Deploy a DEV automático
2. Tag release → Deploy a PROD con aprobación manual

## 📚 Documentación Adicional

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Python](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

## 🆘 Troubleshooting

### Error: "Unable to resolve AWS account"
```bash
aws configure
# Configurar credenciales AWS
```

### Error: "Stack already exists"
```bash
cdk destroy
# Luego volver a desplegar
```

### Lambda timeout
- Aumentar timeout en `taller-stack.ts`
- Revisar logs en CloudWatch

---

**Última actualización:** Enero 2025
