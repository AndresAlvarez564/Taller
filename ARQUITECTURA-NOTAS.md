# Notas de Arquitectura AWS - Sistema Taller Automotriz

## 📐 Diagrama de Arquitectura

Ver archivo: `arquitectura.drawio`

El diagrama muestra la arquitectura serverless completa del sistema, organizada en capas:

### Capa de Presentación
- **Route 53 (DNS)**: Resolución de dominio
- **CloudFront (CDN)**: Distribución global, caché, HTTPS
- **S3 (Static Website)**: Hosting del frontend (React/Vue/Angular)

### Capa de API
- **API Gateway**: Punto de entrada único para todas las APIs REST
- **Cognito**: Autenticación y autorización (JWT tokens)

### Capa de Lógica de Negocio (Lambdas)

El diagrama organiza las lambdas en 6 módulos funcionales:

#### 1. Customer (Clientes)
- Customer-create
- Customer-update
- Customer-delete
- Customer-read

**Base de datos:** DB Customer (DynamoDB)

#### 2. Vehicles (Vehículos)
- Vehicles-create
- Vehicles-update
- Vehicles-delete
- Vehicles-read

**Base de datos:** DB Vehicles (DynamoDB)

#### 3. WorkOrder (Órdenes de Trabajo)
- WorkOrder-create
- WorkOrder-update
- WorkOrder-delete
- WorkOrder-read
- WorkOrder-UpdateState
- WorkOrderItem-Add
- WorkOrderItem-Update
- WorkOrderItem-delete

**Bases de datos:** 
- DB WorkOrder (DynamoDB)
- DB Detalles (DynamoDB) - para items de OT

#### 4. Facturas
- Factura-Create
- Factura-Read
- Factura-Anular
- Factura-RegistrarPago (Factura completada)
- Factura-generarPDF
- Factura-getPdfUrl

**Base de datos:** DB Facturas (DynamoDB)

#### 5. Inventario
- Item-create
- Item-update
- Item-delete
- Item-read
- MovimientosInventario
- ListarMovimientos

**Bases de datos:**
- DB Inventario (DynamoDB)
- DB Detalles (DynamoDB) - para movimientos de inventario

#### 6. Admin (Administración)
- Admin-CreateUser
- Admin-UpdateUser
- Admin-DisableUser
- Admin-ListUsers
- Admin-Settings
- Admin-Roles

**Bases de datos:**
- DB Usuarios (DynamoDB)
- DB Config (ConfiguracionTaller - DynamoDB)
- DB RolesPermisos (DynamoDB)

#### 7. Ventas Rápidas
- VentaRapida-create
- VentaRapida-Read
- VentaRapida-Anular
- VentaRapida-Registrar

**Bases de datos:**
- DB Inventario (DynamoDB) - comparte con módulo Inventario
- DB Detalle (DynamoDB) - para movimientos

---

## 🔒 Consideraciones de Seguridad en la Arquitectura

### 1. Modelo de Despliegue - Infraestructura Aislada por Taller
**IMPORTANTE:** Cada taller tiene su propia infraestructura AWS completamente separada.

- **NO es multi-tenancy** (no se comparten recursos entre talleres)
- Cada taller = 1 stack completo de AWS (lambdas, DynamoDB, S3, etc.)
- Aislamiento físico total (diferentes cuentas AWS o diferentes regiones)
- Se usa **IaC (Infrastructure as Code)** para replicar la infraestructura fácilmente

### 2. Autenticación y Autorización
- **Cognito User Pools**: Maneja usuarios y autenticación (uno por taller)
- **JWT Tokens**: Incluyen rol del usuario
- **API Gateway Authorizer**: Valida tokens antes de invocar lambdas
- **Tabla RolesPermisos**: Define permisos granulares por rol

### 3. Comunicación Segura
- **HTTPS obligatorio** en CloudFront y API Gateway
- **Presigned URLs** para acceso temporal a PDFs en S3
- **VPC Endpoints** (opcional): Para comunicación privada entre lambdas y DynamoDB

---

## ⚡ Optimizaciones de Performance

### 1. DynamoDB
- **On-Demand Billing**: Escala automáticamente sin provisionar capacidad
- **GSI (Global Secondary Indexes)**: Para queries eficientes
  - nombre-index (Clientes)
  - placa-index (Vehiculos)
  - estado-fechaIngreso-index (OrdenesTrabajo)
  - numeroFactura-index (Facturas)
  - SKU-index (InventarioItems)

### 2. Lambda
- **Provisioned Concurrency** (opcional): Para lambdas críticas (Factura-Create)
- **Lambda Layers**: Compartir dependencias comunes (AWS SDK, librerías)
- **Timeout apropiado**: 
  - Lambdas CRUD: 10-15 segundos
  - Factura-generarPDF: 30 segundos
  - Queries complejas: 20 segundos

### 3. CloudFront
- **Cache TTL**: 
  - Assets estáticos (JS/CSS/images): 1 año
  - HTML: 5 minutos (para permitir actualizaciones rápidas)
- **Compression**: Gzip/Brotli habilitado

### 4. S3
- **Lifecycle Policies**:
  - PDFs < 90 días: S3 Standard
  - PDFs 90-365 días: S3 Standard-IA
  - PDFs > 365 días: S3 Glacier
- **Versioning**: Habilitado para recuperación de PDFs

---

## 🔄 Flujo de Datos Críticos

### Flujo 1: Crear Orden de Trabajo con Items
```
Frontend → API Gateway → WorkOrder-create
  ↓
  Escribe en DB WorkOrder
  ↓
Frontend → API Gateway → WorkOrderItem-Add (por cada item)
  ↓
  TRANSACCIÓN ATÓMICA:
    - Escribe en DB Detalles (item)
    - Actualiza DB Inventario (descuenta stock)
    - Escribe en DB Detalles (movimiento salida)
```

### Flujo 2: Facturar Orden de Trabajo
```
Frontend → API Gateway → Factura-Create
  ↓
  TRANSACCIÓN ATÓMICA:
    - Lee DB WorkOrder (validar estado)
    - Lee DB Detalles (obtener items)
    - Lee DB Config (obtener contador, impuesto)
    - Escribe DB Facturas (snapshot de items)
    - Actualiza DB WorkOrder (estado=facturado, bloquear)
    - Actualiza DB Config (incrementar contador)
  ↓
Frontend → API Gateway → Factura-generarPDF
  ↓
  - Lee DB Facturas
  - Genera PDF
  - Sube a S3
  - Actualiza DB Facturas (pdfKey)
```

### Flujo 3: Venta Rápida
```
Frontend → API Gateway → VentaRapida-Create
  ↓
  TRANSACCIÓN ATÓMICA:
    - Lee DB Inventario (validar stock de cada item)
    - Lee DB Config (contador, impuesto)
    - Escribe DB Facturas (tipo=venta_rapida)
    - Actualiza DB Inventario (descuenta stock de cada item)
    - Escribe DB Detalles (movimientos salida)
    - Actualiza DB Config (incrementar contador)
```

---

## 🚨 Puntos Críticos de Fallo y Mitigación

### 1. Concurrencia en Stock
**Problema:** Dos usuarios venden el mismo repuesto simultáneamente, stock queda negativo.

**Solución:**
- Usar `version` attribute en InventarioItems
- Conditional writes: `ConditionExpression: "version = :oldVersion AND stock >= :cantidad"`
- Si falla: retry con exponential backoff o rechazar operación

### 2. Numeración de Facturas
**Problema:** Dos facturas obtienen el mismo número.

**Solución:**
- Usar atomic counter en ConfiguracionTaller
- UpdateItem con `ADD` operation: `contadorFacturas :1`
- Es atómico por diseño de DynamoDB

### 3. Transacciones Parciales
**Problema:** Se descuenta inventario pero falla al crear item de OT.

**Solución:**
- Usar `TransactWriteItems` de DynamoDB
- Todas las operaciones son atómicas (all-or-nothing)
- Si una falla, todas se revierten

### 4. Lambda Timeout
**Problema:** Lambda timeout al generar PDF grande.

**Solución:**
- Aumentar timeout a 30 segundos
- O usar procesamiento asíncrono:
  - Factura-Create → envía mensaje a SQS
  - Lambda async procesa PDF
  - Notifica cuando está listo

---

## 📊 Monitoreo y Observabilidad

### CloudWatch Dashboards
Crear dashboard con:
- Invocaciones de lambdas por minuto
- Errores por lambda
- Latencia p50, p95, p99
- Throttles de DynamoDB
- Uso de capacidad de DynamoDB

### CloudWatch Alarms
Configurar alarmas para:
- Lambda errors > 5 en 5 minutos → SNS → Email
- DynamoDB throttles > 10 en 1 minuto
- Stock negativo detectado (custom metric)
- Transacciones fallidas > threshold

### X-Ray
Habilitar en:
- API Gateway
- Todas las lambdas
- DynamoDB (automatic)

Permite ver:
- Trace completo de un request
- Identificar cuellos de botella
- Errores en servicios downstream

### CloudWatch Logs Insights
Queries útiles:
```
# Errores en últimas 24 horas
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc

# Latencia de Factura-Create
fields @timestamp, @duration
| filter @message like /Factura-Create/
| stats avg(@duration), max(@duration), min(@duration)

# Stock negativo (custom log)
fields @timestamp, inventarioItemId, stock
| filter stock < 0
```

---

## 💰 Estimación de Costos AWS (mensual)

### Escenario: Taller mediano (1000 OTs/mes)

**Lambda:**
- 50,000 invocaciones/mes
- 128 MB memoria promedio
- 500 ms duración promedio
- Costo: ~$0.50/mes (dentro de free tier)

**DynamoDB:**
- On-Demand pricing
- 100,000 lecturas/mes
- 50,000 escrituras/mes
- 1 GB almacenamiento
- Costo: ~$5-10/mes

**S3:**
- 1000 PDFs/mes × 100 KB = 100 MB
- 5000 descargas/mes
- Costo: ~$0.50/mes

**CloudFront:**
- 10 GB transferencia/mes
- 100,000 requests/mes
- Costo: ~$1-2/mes

**API Gateway:**
- 50,000 requests/mes
- Costo: ~$0.20/mes (dentro de free tier)

**Cognito:**
- 100 usuarios activos/mes
- Costo: Gratis (< 50,000 MAU)

**Total estimado: $7-15/mes por taller**

### Escenario: 10 talleres (infraestructura replicada)
- Lambda: ~$5/mes × 10 = $50/mes
- DynamoDB: ~$7/mes × 10 = $70/mes
- S3: ~$0.50/mes × 10 = $5/mes
- CloudFront: ~$1.50/mes × 10 = $15/mes
- API Gateway: ~$0.20/mes × 10 = $2/mes
- Cognito: Gratis × 10 = $0/mes

**Total estimado: $142/mes para 10 talleres**

**Costo por taller: ~$14/mes**

**Ventajas de este modelo:**
- Aislamiento total de datos (seguridad)
- Fallo en un taller no afecta a otros
- Personalización por taller sin afectar otros
- Cumplimiento de regulaciones de privacidad más fácil

---

## 🚀 Plan de Despliegue

### Fase 0: Desarrollo de IaC (Semana 1-2)
- [ ] Crear template de IaC (AWS CDK o Terraform)
- [ ] Definir todos los recursos AWS como código
- [ ] Parametrizar configuraciones por taller (nombre, dominio, región)
- [ ] Crear scripts de despliegue automatizado
- [ ] Documentar proceso de replicación

### Fase 1: Infraestructura Base - Taller Piloto (Semana 3-4)
- [ ] Desplegar stack completo usando IaC
- [ ] Configurar Cognito User Pool
- [ ] Crear tablas DynamoDB con GSIs
- [ ] Configurar S3 buckets (website + PDFs)
- [ ] Configurar CloudFront distributions
- [ ] Configurar Route 53 (DNS)

### Fase 2: Lambdas Core (Semana 5-6)
- [ ] Customer (CRUD)
- [ ] Vehicles (CRUD)
- [ ] WorkOrder (CRUD + UpdateState)
- [ ] Admin (Users, Settings, Roles)

### Fase 3: Inventario y Items (Semana 7-8)
- [ ] Inventario (CRUD + Movimientos)
- [ ] WorkOrderItem (Add/Update/Delete con transacciones)
- [ ] Validaciones de stock

### Fase 4: Facturación (Semana 9-10)
- [ ] Factura-Create (con transacciones)
- [ ] Factura-generarPDF
- [ ] Factura-getPdfUrl
- [ ] VentaRapida (con transacciones)
- [ ] Factura-Anular, RegistrarPago

### Fase 5: Frontend (Semana 11-14)
- [ ] Módulo de recepción (tablet)
- [ ] Módulo de órdenes de trabajo
- [ ] Módulo de inventario
- [ ] Módulo de facturación
- [ ] Módulo de administración

### Fase 6: Testing y Optimización (Semana 15-16)
- [ ] Testing de carga
- [ ] Testing de concurrencia
- [ ] Optimización de queries
- [ ] Configurar monitoreo y alarmas

### Fase 7: Producción - Taller Piloto (Semana 17-18)
- [ ] Migración de datos desde Excel
- [ ] Capacitación de usuarios
- [ ] Go-live con taller piloto
- [ ] Monitoreo intensivo primera semana

### Fase 8: Replicación a Otros Talleres (Semana 19+)
- [ ] Usar IaC para desplegar stack completo para nuevo taller
- [ ] Personalizar configuraciones (dominio, nombre, región)
- [ ] Migrar datos del nuevo taller
- [ ] Capacitación de usuarios del nuevo taller
- [ ] Go-live

**Tiempo estimado por taller adicional:** 1-2 semanas (gracias a IaC)

---

## 📝 Checklist de Seguridad Pre-Producción

- [ ] Todas las lambdas validan permisos por rol
- [ ] Conditional writes implementados en operaciones críticas
- [ ] TransactWriteItems usado en operaciones multi-tabla
- [ ] Secrets (SMTP, API keys) en AWS Secrets Manager
- [ ] Logs no contienen información sensible (passwords, tokens)
- [ ] S3 buckets con acceso privado (no public)
- [ ] CloudFront con HTTPS obligatorio
- [ ] API Gateway con rate limiting configurado
- [ ] Cognito con MFA habilitado para admins
- [ ] DynamoDB con Point-in-time recovery habilitado
- [ ] Backup automático configurado
- [ ] CloudWatch Alarms configuradas
- [ ] X-Ray habilitado en producción

---

---

## 🏗️ MODELO DE INFRAESTRUCTURA Y PARTNERSHIP

### Arquitectura: Infraestructura Aislada por Taller

**Cada taller obtiene:**
- Su propia cuenta AWS (o subcuenta con AWS Organizations)
- Stack completo de recursos AWS independiente
- Base de datos completamente separada
- Dominio propio (ej: taller-experto.tuapp.com)
- Usuarios y configuraciones propias

**Ventajas de este modelo:**
1. **Seguridad máxima**: Datos completamente aislados
2. **Cumplimiento**: Más fácil cumplir regulaciones de privacidad
3. **Personalización**: Cada taller puede tener features custom sin afectar otros
4. **Resiliencia**: Fallo en un taller no afecta a otros
5. **Escalabilidad**: Cada taller escala independientemente
6. **Facturación clara**: Costos AWS separados por taller

**Desventajas (mitigadas con IaC):**
1. ~~Despliegue lento~~ → IaC automatiza todo (15-30 min por taller)
2. ~~Mantenimiento complejo~~ → Actualizaciones se aplican con IaC a todos
3. ~~Costo mayor~~ → Mínimo ($14/mes vs $8/mes), pero vale la pena por seguridad

---

### Infrastructure as Code (IaC) - Pieza Clave

**¿Qué es IaC?**
- Definir toda la infraestructura AWS como código (no clicks en consola)
- Versionado en Git
- Replicable, consistente, auditable

**Ejemplo con AWS CDK (TypeScript):**

```typescript
// stack-taller.ts
export class TallerStack extends Stack {
  constructor(scope: Construct, id: string, props: TallerStackProps) {
    super(scope, id, props);
    
    // Parámetros por taller
    const tallerName = props.tallerName; // "Taller El Experto"
    const domain = props.domain; // "taller-experto.tuapp.com"
    const region = props.region; // "us-east-1"
    
    // DynamoDB Tables
    const clientesTable = new Table(this, 'Clientes', {
      partitionKey: { name: 'clienteId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
    });
    
    // Lambdas
    const customerCreateLambda = new Function(this, 'CustomerCreate', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambdas/customer-create'),
      environment: {
        CLIENTES_TABLE: clientesTable.tableName,
      },
    });
    
    // API Gateway
    const api = new RestApi(this, 'TallerAPI', {
      restApiName: `${tallerName} API`,
    });
    
    // ... más recursos
  }
}
```

**Desplegar nuevo taller:**
```bash
# Configurar parámetros
export TALLER_NAME="Taller El Experto"
export DOMAIN="taller-experto.tuapp.com"
export AWS_REGION="us-east-1"

# Desplegar stack completo
cdk deploy TallerElExpertoStack

# ¡Listo! Infraestructura completa en 15-30 minutos
```

**Actualizar todos los talleres:**
```bash
# Cambio en código (ej: nueva lambda)
git commit -m "feat: agregar lambda de reportes"

# Desplegar a todos los talleres
./scripts/deploy-all-talleres.sh

# Script aplica cambios a cada stack automáticamente
```

---

### Modelo de Partnership y Comercialización

**Taller Piloto (Cliente Inicial):**
- Paga desarrollo inicial (inversión única)
- Obtiene sistema completo funcional
- Se convierte en socio estratégico
- Beneficios:
  - Descuento permanente (50% off mensualidad)
  - Comisión por referidos (10-20% de mensualidad)
  - Prioridad en nuevas features
  - Voz en roadmap del producto

**Talleres Adicionales:**
- Pagan solo mensualidad (SaaS)
- Infraestructura desplegada en días (gracias a IaC)
- Migración de datos incluida
- Capacitación incluida
- Soporte técnico

**Modelo de Precios Sugerido:**

| Concepto | Taller Piloto | Talleres Nuevos |
|----------|---------------|-----------------|
| Desarrollo inicial | $5,000-10,000 | $0 |
| Setup/Despliegue | Incluido | $500 |
| Mensualidad | $50/mes (50% off) | $99/mes |
| Costos AWS | ~$14/mes | ~$14/mes |
| Migración datos | Incluido | Incluido |
| Capacitación | Incluido | Incluido |
| Soporte | Prioritario | Estándar |

**Comisiones para Taller Piloto:**
- Por cada taller referido que contrate: 15% de mensualidad recurrente
- Ejemplo: 5 talleres referidos = 5 × $99 × 15% = $74/mes pasivo

**Escalabilidad del Negocio:**
- 10 talleres = $990/mes ingresos - $140/mes AWS = $850/mes neto
- 50 talleres = $4,950/mes ingresos - $700/mes AWS = $4,250/mes neto
- 100 talleres = $9,900/mes ingresos - $1,400/mes AWS = $8,500/mes neto

**Ventajas de este modelo:**
- Taller piloto recupera inversión con referidos
- Methodica escala ingresos sin escalar desarrollo
- Cada taller paga sus propios costos AWS
- Margen alto (85-90%) después de desarrollo inicial

---

## 🔧 HERRAMIENTAS DE DESARROLLO RECOMENDADAS

### IaC (Infrastructure as Code) - **CRÍTICO PARA ESTE PROYECTO**
- **AWS CDK** (TypeScript/Python): **RECOMENDADO** - Para definir toda la infraestructura como código
- **Terraform**: Alternativa popular, multi-cloud
- **AWS SAM**: Para desarrollo y testing local de lambdas
- **Serverless Framework**: Alternativa a SAM

**Ventajas de usar IaC:**
- Replicar infraestructura completa en minutos (no días)
- Consistencia entre talleres
- Versionado de infraestructura (Git)
- Rollback fácil si algo falla
- Documentación automática de la arquitectura

### Testing
- **Jest**: Unit tests para lambdas
- **LocalStack**: Emular servicios AWS localmente
- **Artillery**: Load testing de APIs
- **Postman/Insomnia**: Testing manual de APIs

### CI/CD
- **GitHub Actions** o **GitLab CI**: Pipeline de despliegue
- **AWS CodePipeline**: Alternativa nativa de AWS

### Monitoreo
- **Datadog** o **New Relic**: APM avanzado (opcional, costo adicional)
- **Sentry**: Error tracking y alertas

---

**Última actualización:** Enero 2025
