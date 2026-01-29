# 🚀 Setup del Backend

## ✅ Estado Actual

El backend está **completamente configurado** y listo para desplegar:

### Estructura Creada

```
backend/
├── cdk/                          ✅ CDK Infrastructure (TypeScript)
│   ├── bin/taller-stack.ts       ✅ Entry point
│   ├── lib/taller-stack.ts       ✅ Stack principal con todos los recursos
│   ├── package.json              ✅ Dependencias instaladas
│   ├── tsconfig.json             ✅ Configuración TypeScript
│   └── cdk.json                  ✅ Configuración CDK
│
├── lambdas/                      ✅ Funciones Lambda (Python 3.11)
│   ├── shared/                   ✅ Utilidades compartidas
│   │   ├── db_utils.py           ✅ Helpers DynamoDB
│   │   ├── response_utils.py     ✅ Respuestas HTTP
│   │   └── validators.py         ✅ Validadores
│   │
│   └── customers/                ✅ Módulo Clientes (ejemplo)
│       ├── create.py             ✅ Crear cliente
│       └── read.py               ✅ Leer cliente(s)
│
├── install.bat / install.sh      ✅ Scripts de instalación
└── README.md                     ✅ Documentación completa
```

### Recursos AWS que se Desplegarán

✅ **9 Tablas DynamoDB** con GSIs:
- Clientes
- Vehiculos  
- OrdenesTrabajo
- InventarioItems
- Facturas
- Detalles (Items OT + Movimientos)
- Usuarios
- ConfiguracionTaller
- RolesPermisos

✅ **S3 Bucket** para PDFs y documentos

✅ **Cognito User Pool** para autenticación

✅ **API Gateway** con CORS configurado

✅ **Lambda Layer** con utilidades compartidas

✅ **IAM Roles** y permisos automáticos

## 📋 Próximos Pasos

### 1. Configurar AWS CLI (si no lo has hecho)

```bash
aws configure
```

Ingresa:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### 2. Bootstrap CDK (solo primera vez)

```bash
cd backend/cdk
cdk bootstrap
```

### 3. Ver qué se va a desplegar

```bash
cd backend/cdk
cdk synth
```

Esto genera el template de CloudFormation.

### 4. Desplegar a DEV

```bash
cd backend/cdk
npm run deploy:dev
```

Esto desplegará todo el stack. Tomará ~5-10 minutos.

### 5. Obtener URLs y IDs

Después del despliegue, verás outputs como:

```
Outputs:
TallerStack-dev.ApiUrl = https://xxxxx.execute-api.us-east-1.amazonaws.com/api/
TallerStack-dev.UserPoolId = us-east-1_xxxxxx
TallerStack-dev.UserPoolClientId = xxxxxxxxxxxxxx
TallerStack-dev.DocumentsBucketName = tallerstack-dev-documents
```

Guarda estos valores para configurar el frontend.

## 🔧 Comandos Útiles

```bash
# Ver diferencias antes de desplegar
cdk diff

# Desplegar
cdk deploy

# Desplegar con contexto personalizado
cdk deploy --context tallerName="TallerElExperto" --context env=prod

# Ver logs de CloudFormation
cdk deploy --verbose

# Destruir stack (CUIDADO!)
cdk destroy
```

## 🐛 Troubleshooting

### Error: "Cannot find module 'aws-cdk-lib'"

```bash
cd backend/cdk
npm install
```

### Error: "Unable to resolve AWS account"

```bash
aws configure
# Configurar credenciales
```

### Error: "Stack already exists"

```bash
cdk destroy
# Luego volver a desplegar
```

### Errores en el editor (VS Code)

Los errores de TypeScript en el editor son normales hasta que recargues la ventana:
- Presiona `Ctrl+Shift+P` → "Reload Window"
- O cierra y abre VS Code

El código compila correctamente (verificado con `npm run build`).

## 📝 Próximas Tareas

1. ✅ Estructura del backend creada
2. ✅ CDK configurado
3. ✅ Lambdas de ejemplo (Customer Create/Read)
4. ⏳ Crear más lambdas (Update, Delete, Vehicles, WorkOrders, etc.)
5. ⏳ Conectar lambdas con API Gateway en el stack
6. ⏳ Desplegar a AWS
7. ⏳ Conectar frontend con API

## 🎯 Para Crear Más Lambdas

Sigue el patrón de `customers/create.py`:

```python
import json
import sys
import os
from uuid import uuid4
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from db_utils import put_item, TABLES
from response_utils import success, validation_error
from validators import validate, validate_required

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Tu lógica aquí
        
        return success(data, 201)
    except Exception as e:
        return server_error('Error', str(e))
```

---

**Estado:** ✅ Listo para desplegar
**Última actualización:** Enero 2025
