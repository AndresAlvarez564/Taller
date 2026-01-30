# Sistema de Gestión para Taller Automotriz
## Resumen de Lambdas y Tablas DynamoDB

---

## 🔹 RESUMEN DE LAMBDAS (qué hace cada una)

### 🧍‍♂️ Customer (Clientes)

- **Customer-create** → crea cliente
- **Customer-update** → edita cliente
- **Customer-delete** → desactiva cliente (soft delete)
- **Customer-read** → obtener / listar / buscar clientes

### 🚗 Vehicles (Vehículos)

- **Vehicles-create** → crea vehículo y lo asocia a cliente
- **Vehicles-update** → edita vehículo
- **Vehicles-delete** → desactiva vehículo (soft delete)
- **Vehicles-read** → obtener / listar / buscar vehículos

### 🛠️ WorkOrder (OT – Orden de Trabajo)

- **WorkOrder-create** → crea OT
- **WorkOrder-update** → edita datos generales de la OT
- **WorkOrder-delete** → cancela OT
- **WorkOrder-read** → obtener / listar / buscar OT
- **WorkOrder-UpdateState** → cambia estado de la OT

### 🧾 WorkOrder Items (Ítems de OT)

*(viven en la tabla Detalles)*

- **WorkOrderItem-Add**  
  Agrega ítem a la OT  
  → si es repuesto: valida stock, descuenta inventario, registra movimiento

- **WorkOrderItem-Update**  
  Edita ítem  
  → ajusta inventario según diferencia, registra movimiento

- **WorkOrderItem-delete**  
  Elimina ítem (soft)  
  → devuelve stock si era repuesto, registra movimiento

### 📦 Inventario

- **Item-create** → crea repuesto/insumo (opcional stock inicial)
- **Item-update** → edita datos del repuesto (NO stock)
- **Item-delete** → desactiva repuesto
- **Item-read** → obtener / listar / buscar inventario
- **MovimientosInventario**  
  Entrada / salida / ajuste manual  
  → actualiza stock y guarda kardex
- **ListarMovimientos**  
  Lista historial de movimientos por ítem

### 🧾 Facturas (Venta por OT)

- **Factura-Create**  
  Crea factura desde OT  
  → copia ítems (snapshot)  
  → marca OT como facturado  
  → NO toca inventario

- **Factura-read** → obtener / listar / buscar facturas
- **Factura-Anular** → anula factura
- **Factura-RegistrarPago** → marca pagada / parcial
- **Factura-generarPDF** → genera PDF en S3
- **Factura-getPdfUrl** → URL firmada del PDF

### 🛒 Ventas Rápidas (sin OT)

- **VentaRapida-Create**  
  Venta directa  
  → descuenta inventario  
  → registra movimiento  
  → crea factura

- **VentaRapida-Read** → listar / buscar ventas rápidas
- **VentaRapida-Anular** → anula venta y revierte inventario
- **VentaRapida-RegistrarPago** → registra pago

*(reusan Factura-generarPDF y Factura-getPdfUrl)*

### 👤 Admin

- **Admin-CreateUser** → crea usuario del sistema
- **Admin-UpdateUser** → edita usuario / rol
- **Admin-DisableUser** → desactiva usuario
- **Admin-ListUsers** → lista usuarios

### ⚙️ Configuración y Roles

- **Admin-Settings** → moneda, impuestos, numeración, datos del taller
- **Admin-Roles** → roles y permisos editables

---

## 🔹 RESUMEN DE TABLAS DYNAMODB (para qué sirve cada una)

### 1️⃣ Clientes

**Guarda:**
- nombre, teléfono, CI/NIT, dirección
- activo

**Atributos clave:**
- PK: `clienteId` (UUID)
- creadoEn, actualizadoEn
- eliminadoEn, eliminadoPor (para auditoría)

📌 Usada por: clientes, OTs, facturas

---

### 2️⃣ Vehiculos

**Guarda:**
- placa, marca, modelo, año
- customerId
- activo

**Atributos clave:**
- PK: `vehiculoId` (UUID)
- customerId (referencia)
- creadoEn, actualizadoEn
- eliminadoEn, eliminadoPor

📌 Usada por: OTs

---

### 3️⃣ OrdenesTrabajo (OT)

**Guarda:**
- cliente, vehículo, placa (snapshot)
- problema, km, estado
- flags: bloquearItems

**Atributos clave:**
- PK: `workOrderId` (UUID)
- version (para optimistic locking)
- creadoEn, actualizadoEn, creadoPor
- facturaId (cuando se factura)

**Estados válidos:**
- en_revision → en_cotizacion → en_aprobacion → aprobado → en_proceso → terminado → facturado

📌 Representa el trabajo, no la venta

---

### 4️⃣ InventarioItems

**Guarda:**
- SKU, nombre, costo, precio
- stock actual, stock mínimo
- activo

**Atributos clave:**
- PK: `inventarioItemId` (UUID)
- version (para control de concurrencia en stock)
- creadoEn, actualizadoEn

**Nota crítica:** Todas las actualizaciones de stock DEBEN usar conditional writes para evitar race conditions.

📌 Fuente única del stock actual

---

### 5️⃣ Facturas

**Guarda:**
- tipo (taller / venta_rapida)
- referencia OT (si aplica)
- snapshot de ítems (items[])
- totales, estado, pagos
- facturaPdfKey

**Atributos clave:**
- PK: `facturaId` (UUID)
- numeroFactura (generado secuencialmente)
- creadoEn, creadoPor
- anuladoEn, anuladoPor, motivoAnulacion

**Estados válidos:**
- borrador → emitida → aprobada → pagada / vencida / anulada

📌 Factura = venta

---

### 6️⃣ Detalles ⭐ (tabla clave)

**Guarda dos cosas distintas:**

**A) Ítems de OT**
- PK: `OT#<workOrderId>`
- SK: `ITEM#<timestamp>#<itemId>`
- Atributos: descripción, cantidad, precio, tipo, inventarioItemId, activo

**B) Movimientos de inventario**
- PK: `INV#<inventarioItemId>`
- SK: `MOV#<timestamp>#<movId>`
- Atributos: tipo (entrada/salida/ajuste), cantidad, stockAntes, stockDespues, motivo, referenciaId (OT o venta)

**Nota crítica:** Esta tabla permite queries eficientes:
- Todos los ítems de una OT: query PK=OT#123
- Historial de un repuesto: query PK=INV#456

📌 Es:
- ítems de trabajo
- kardex de inventario

---

### 7️⃣ Usuarios

**Guarda:**
- userId, nombre
- rol
- estado

**Atributos clave:**
- PK: `userId` (Cognito sub)
- email, nombre
- rol (admin, cajero, asesor, tecnico)
- activo

**Integración con Cognito:**
- Cognito maneja autenticación
- Esta tabla guarda metadata adicional y tallerId

📌 Usuarios internos del sistema

---

### 8️⃣ ConfiguracionTaller

**Guarda:**
- moneda
- impuestos
- numeración de facturas
- datos del negocio

**Atributos clave:**
- PK: `config` (singleton, un solo registro)
- moneda, tasaImpuesto
- contadorFacturas (atomic counter para numeración)
- nombreNegocio, telefono, direccion
- configuracionEmail (SMTP para notificaciones)

**Nota crítica:** El contadorFacturas debe actualizarse con UpdateItem + ADD para garantizar atomicidad.

📌 Reglas globales del sistema

---

### 9️⃣ RolesPermisos

**Guarda:**
- rol
- permisos asociados

**Atributos clave:**
- PK: `rolId`
- nombreRol
- permisos[] (array de strings: "clientes:read", "facturas:write", etc.)

📌 Control de acceso editable

---

## 🔒 CONSIDERACIONES DE SEGURIDAD

### Modelo de Despliegue
**IMPORTANTE:** Cada taller tiene su propia infraestructura AWS completamente separada.

- **NO es multi-tenancy** (no se comparten recursos entre talleres)
- Cada taller = 1 stack completo de AWS (lambdas, DynamoDB, S3, etc.)
- Aislamiento físico total
- Se usa **IaC (Infrastructure as Code)** para replicar la infraestructura fácilmente

### Control de concurrencia
**Stock de inventario:**
- Usar `version` attribute con conditional writes
- Ejemplo: `ConditionExpression: "version = :oldVersion"`

**Transacciones atómicas:**
- WorkOrderItem-Add/Update/Delete DEBEN usar `TransactWriteItems`
- Operación: update stock + create movimiento + create/update item

### Auditoría
Todas las tablas principales deben tener:
- `creadoEn`, `creadoPor`
- `actualizadoEn`, `actualizadoPor`
- `eliminadoEn`, `eliminadoPor` (soft delete)

---

## 📊 ÍNDICES SECUNDARIOS GLOBALES (GSI) RECOMENDADOS

### Clientes
- GSI: `nombre-index` (para búsquedas por nombre)
- GSI: `telefono-index` (para búsquedas por teléfono)

### Vehiculos
- GSI: `placa-index` (para búsquedas por placa)
- GSI: `customerId-index` (para listar vehículos de un cliente)

### OrdenesTrabajo
- GSI: `estado-fechaIngreso-index` (para listar OTs por estado)
- GSI: `customerId-index` (para historial del cliente)

### Facturas
- GSI: `estado-fecha-index` (para reportes)
- GSI: `numeroFactura-index` (para búsqueda por número)

### InventarioItems
- GSI: `SKU-index` (para búsqueda por SKU)
- GSI: `stockBajo-index` (donde stock < stockMinimo)

---

## ⚠️ VALIDACIONES DE NEGOCIO CRÍTICAS

### Customer-delete
- ❌ No permitir si tiene OTs activas (estado != cancelado/facturado)
- ✅ Solo soft delete (activo=false)

### Vehicles-delete
- ❌ No permitir si tiene OTs activas
- ✅ Solo soft delete

### WorkOrder-UpdateState
- ❌ No permitir aprobado → en_revision (retroceso)
- ❌ No permitir facturado → cualquier otro estado
- ✅ Validar que tiene ítems activos antes de aprobar

### WorkOrderItem-Add/Update/Delete
- ❌ No permitir si OT está facturada (bloquearItems=true)
- ❌ No permitir stock negativo
- ✅ Usar transacciones para atomicidad

### Factura-Create
- ❌ No permitir si OT ya tiene factura
- ❌ No permitir si OT no está en estado "terminado"
- ✅ Copiar ítems como snapshot (no referencias)
- ✅ Marcar OT como facturada y bloquear ítems

### Factura-Anular
- ❌ No permitir si ya está pagada (requiere autorización especial)
- ✅ Registrar motivo y usuario que anula
- ⚠️ Decidir: ¿revertir inventario? ¿desbloquear OT?

### Item-Update (inventario)
- ❌ No permitir cambiar precio si hay OTs abiertas con ese ítem
- ✅ Solo cambiar datos descriptivos, no stock (usar MovimientosInventario)

---

## 🚀 MEJORAS FUTURAS RECOMENDADAS

### Notificaciones
- EventBridge + Lambda + SES para emails:
  - OT lista para entrega
  - Stock bajo mínimo
  - Factura vencida

### Reportes
- Lambda dedicada para:
  - Ventas por período
  - Rotación de inventario
  - Clientes frecuentes
  - Servicios más solicitados

### Procesamiento asíncrono
- SQS para:
  - Generación de PDFs (puede ser lenta)
  - Envío de emails
  - Sincronización con sistemas externos

### Backup y recuperación
- DynamoDB Point-in-time recovery (PITR)
- Backup automático diario a S3
- Lifecycle policies en S3 para PDFs antiguos

### Monitoreo
- CloudWatch Alarms:
  - Lambda errors > threshold
  - Stock negativo detectado
  - Transacciones fallidas
- X-Ray para tracing de requests complejos

---

**Última actualización:** Enero 2025
