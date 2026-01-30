# Sistema de Gestión para Taller Automotriz
## Especificación Detallada de Lambdas

---

## 🔒 CONTEXTO DE SEGURIDAD (TODAS LAS LAMBDAS)

**Modelo de Despliegue:**
- Cada taller tiene su propia infraestructura AWS completamente separada
- NO hay multi-tenancy (no se comparten recursos entre talleres)
- Cada stack es independiente y aislado

**Headers requeridos:**
- `Authorization: Bearer <token>` (JWT de Cognito)

**Validación de permisos:**
- Extraer rol del usuario del JWT
- Validar permisos según tabla RolesPermisos

**Respuesta estándar de error:**
```json
{
  "error": "mensaje descriptivo",
  "code": "ERROR_CODE",
  "timestamp": "ISO8601"
}
```

---

## 1) CUSTOMER (Clientes)

### Customer-create

**Qué hace**

Crea un cliente con datos básicos.

**Input típico**

```json
{
  "nombre": "Juan Pérez",
  "telefono": "809-555-1234",
  "ciNit": "001-1234567-8",
  "direccion": "Calle Principal #123",
  "email": "juan@example.com"
}
```

**DB**

- Escribe: Clientes

**Reglas**

- Normalizar teléfono/ciNit para búsqueda
- Validar que ciNit no exista ya en este taller
- Agregar: creadoEn, creadoPor, activo=true

**Respuesta exitosa:**
```json
{
  "clienteId": "uuid",
  "mensaje": "Cliente creado exitosamente"
}
```

---

### Customer-update

**Qué hace**

Edita datos del cliente.

**Input**

```json
{
  "customerId": "uuid",
  "nombre": "Juan Pérez Actualizado",
  "telefono": "809-555-9999"
}
```

**DB**

- Actualiza: Clientes

**Reglas**

- Validar que el cliente existe
- Actualizar: actualizadoEn, actualizadoPor

---

### Customer-delete (soft delete)

**Qué hace**

Desactiva cliente (no borra físicamente).

**Input**

```json
{
  "customerId": "uuid"
}
```

**DB**

- Lee: OrdenesTrabajo (validar que no tenga OTs activas)
- Actualiza: Clientes (activo=false, eliminadoEn, eliminadoPor)

**Reglas**

- ❌ No permitir si tiene OTs con estado != (cancelado | facturado)
- ✅ Solo soft delete para mantener historial

---

### Customer-read (get + list + search)

**Qué hace**

- Si viene `customerId`: devuelve 1 cliente
- Si viene `search`: busca por nombre/teléfono/ciNit
- Si no: lista paginada

**Input ejemplos**

```json
// GET uno
{ "customerId": "uuid" }

// Buscar
{ "search": "Juan", "limit": 20 }

// Listar todos
{ "limit": 50, "cursor": "token_paginacion" }
```

**DB**

- Lee: Clientes (filtrado por activo)
- Usa GSI: `nombre-index` o `telefono-index`

**Reglas**

- Paginación (limit, cursor)
- Solo devolver clientes activos (a menos que se pida includeInactive=true)

---

## 2) VEHICLES (Vehículos)

### Vehicles-create

**Qué hace**

Crea vehículo y lo asocia a un cliente.

**Input**

```json
{
  "customerId": "uuid",
  "placa": "A123456",
  "marca": "Toyota",
  "modelo": "Corolla",
  "anio": 2020,
  "chasis": "JT2BF18K8X0123456",
  "color": "Blanco"
}
```

**DB**

- Lee: Clientes (validar que existe y pertenece al taller)
- Escribe: Vehiculos

**Reglas**

- Placa debe ser única en este taller (usar conditional write)
- Agregar: creadoEn, creadoPor, activo=true

---

### Vehicles-update

**Qué hace**

Edita datos del vehículo.

**DB**

- Actualiza: Vehiculos

**Reglas**

- Validar que el vehículo existe
- Actualizar: actualizadoEn, actualizadoPor

---

### Vehicles-delete (soft delete)

**Qué hace**

Desactiva vehículo.

**DB**

- Lee: OrdenesTrabajo (validar que no tenga OTs activas)
- Actualiza: Vehiculos (activo=false, eliminadoEn, eliminadoPor)

**Reglas**

- ❌ No permitir si tiene OTs activas
- ✅ Solo soft delete

---

### Vehicles-read (get + list + search)

**Qué hace**

- GET id: devuelve 1 vehículo
- ?customerId: lista vehículos de ese cliente
- ?placa / ?search: buscar

**DB**

- Lee: Vehiculos
- Usa GSI: `placa-index` o `customerId-index`

---

## 3) WORKORDER / OT (Ordenes de Trabajo)

### WorkOrder-create

**Qué hace**

Crea OT con estado inicial `en_revision`.

Guarda: problema, km, fechaIngreso, placa (snapshot).

**Input**

```json
{
  "customerId": "uuid",
  "vehicleId": "uuid",
  "descripcionProblema": "Motor hace ruido extraño",
  "kilometraje": 85000,
  "observaciones": "Cliente reporta que el ruido aumenta al acelerar"
}
```

**DB**

- Lee: Clientes, Vehiculos (validar y obtener datos para snapshot)
- Escribe: OrdenesTrabajo

**Reglas**

- Guardar estado=`en_revision`, creadoEn, creadoPor
- Snapshot de datos del vehículo (placa, marca, modelo) para historial inmutable
- Agregar: version=1, bloquearItems=false

---

### WorkOrder-update

Qué hace

Actualiza campos no-financieros (km, notas, checklist, etc.).
DB

Actualiza: OrdenesTrabajo
Reglas

Si estado=facturado, bloquear ciertas ediciones.

WorkOrder-delete (cancelar/soft)

Qué hace

Cancela OT (no borrar).
DB

Actualiza: OrdenesTrabajo (estado=cancelado o activo=false)
Reglas

Si ya tiene factura, no permitir cancelar (o requiere admin).

WorkOrder-read (get + list + search)

Qué hace

GET id: devuelve OT.

?includeItems=true: además devuelve items desde Detalles.

Listar por estado/fechas/búsqueda por placa/cliente.
DB

Lee: OrdenesTrabajo

Lee (opcional): Detalles con PK=OT#<id>

WorkOrder-UpdateState

Qué hace

Cambia estado con validaciones:

no aprobado sin items activos

no facturado si ya hay factura o se hace desde Factura-Create
DB

Lee: OrdenesTrabajo

Lee: Detalles (para validar items)

Actualiza: OrdenesTrabajo
Reglas

Flujo: en_revision → en_cotizacion → en_aprobacion → aprobado → en_proceso → terminado → facturado

4) WORKORDER ITEMS (Items de OT)

Tabla: Detalles

Formato en Detalles

Item OT:

PK=OT#<workOrderId>

SK=ITEM#<fechaISO>#<itemId>

Movimiento inventario:

PK=INV#<inventarioItemId>

SK=MOV#<fechaISO>#<movId>

WorkOrderItem-Add

Qué hace

Crea un item en la OT.

Si es repuesto con inventarioItemId:

valida stock

descuenta stock

guarda movimiento salida en Detalles
DB

Lee: OrdenesTrabajo (existencia y no facturado)

Escribe: Detalles (item OT)

Lee/Actualiza: InventarioItems (si repuesto)

Escribe: Detalles (movimiento salida)
Reglas

Usar transacción (ideal) para:

update stock + put movimiento + put item

Guardar stockAntes/Despues en movimiento.

WorkOrderItem-Update

Qué hace

Actualiza item (cantidad/precio/desc).

Ajusta inventario si cambia cantidad o repuesto.

Registra movimiento:

aumento cantidad → salida

disminución → entrada

cambio repuesto → entrada del anterior + salida del nuevo
DB

Lee: Detalles (item actual)

Actualiza: Detalles (item)

Lee/Actualiza: InventarioItems

Escribe: Detalles (movimiento(s))
Reglas

Bloquear si OT facturada.

Evitar stock negativo.

WorkOrderItem-delete (soft)

Qué hace

Marca item como inactivo.

Si era repuesto:

devuelve stock (entrada)

registra movimiento entrada
DB

Lee: Detalles (item)

Actualiza: Detalles (activo=false)

Lee/Actualiza: InventarioItems

Escribe: Detalles (movimiento entrada)
Reglas

Bloquear si OT facturada.

5) INVENTARIO
Item-create

Qué hace

Crea repuesto/insumo (SKU, nombre, costo, precio, mínimo).

Si stockInicial>0:

suma stock

movimiento “entrada_inicial” en Detalles
DB

Escribe: InventarioItems

Escribe (opcional): Detalles (movimiento)
Reglas

SKU único ideal.

Item-update

Qué hace

Edita datos del repuesto (no stock).
DB

Actualiza: InventarioItems
Reglas

Stock solo cambia por movimientos o por WorkOrderItem/VentaRapida.

Item-delete (soft)

Qué hace

Desactiva repuesto.
DB

Actualiza: InventarioItems (activo=false)

Item-read (get + list + search)

Qué hace

Obtener/listar/buscar por nombre/SKU.
DB

Lee: InventarioItems

MovimientosInventario (1 lambda)

Qué hace

Entrada/salida/ajuste manual (kardex).

Cambia stock + registra movimiento.
Input

inventarioItemId, tipoMovimiento, cantidad, motivo, ordenTrabajoId?
DB

Lee/Actualiza: InventarioItems

Escribe: Detalles (movimiento)
Reglas

Salida valida stock suficiente.

Ajuste deja stock exacto.

ListarMovimientos

Qué hace

Lista movimientos por item y fechas.
DB

Lee: Detalles con PK=INV#itemId

6) FACTURAS (Venta por OT)
Factura-Create

Qué hace

Crea factura desde una OT.

Lee items OT y los copia como snapshot Facturas.items.

Calcula totales.

Marca OT como facturado y bloquea items.

NO toca inventario.
DB

Lee: OrdenesTrabajo

Lee: Detalles (PK=OT#workOrderId)

Escribe: Facturas

Actualiza: OrdenesTrabajo (estado=facturado, bloquearItems=true)
Reglas

Rechazar si ya existe factura para esa OT (o manejar re-factura explícita).

Factura-read (get + list + search)

Qué hace

Obtener factura por id.

Listar por fecha/estado.

Buscar por número.
DB

Lee: Facturas

Factura-Anular

Qué hace

Cambia estado a anulada + motivo.
DB

Actualiza: Facturas
Reglas

Decide si anular revierte OT o no (tu decisión).

Factura-RegistrarPago

Qué hace

Cambia estado: pagada o parcial.

Guarda montoPagado, metodo, fecha.
DB

Actualiza: Facturas
(Si luego usas tabla Pagos, aquí escribirías Pagos.)

Factura-generarPDF

Qué hace

Genera PDF de factura y guarda en S3.

Guarda facturaPdfKey.
DB/S3

Lee: Facturas

Actualiza: Facturas (facturaPdfKey)

S3: put object

Factura-getPdfUrl

Qué hace

Genera URL firmada para ver/descargar PDF.
DB/S3

Lee: Facturas.facturaPdfKey

S3: presigned GET

7) VENTAS RÁPIDAS (sin OT)
VentaRapida-Create

Qué hace

Crea factura tipo venta_rapida con items enviados en request.

Descuenta inventario por cada repuesto.

Registra movimientos salida.

Guarda snapshot Facturas.items.
DB

Escribe: Facturas (tipoFactura=venta_rapida)

Lee/Actualiza: InventarioItems

Escribe: Detalles (movimientos)
Reglas

Puede permitir items tipo “servicio” sin inventario.

VentaRapida-Read

Qué hace

Lista y busca ventas rápidas.
DB

Lee: Facturas filtrando tipoFactura=venta_rapida

VentaRapida-Anular

Qué hace

Anula venta rápida y (recomendado) revierte inventario.
DB

Actualiza: Facturas

Actualiza: InventarioItems (devolver stock)

Escribe: Detalles (movimientos entrada)

VentaRapida-RegistrarPago

Qué hace

Marca pagada/parcial y guarda info de pago.
DB

Actualiza: Facturas

✅ Reusa:

Factura-generarPDF

Factura-getPdfUrl

8) ADMIN (Usuarios / Roles / Config)
Admin-CreateUser

Qué hace

Crea usuario del sistema y asigna rol.
Servicios/DB

Cognito: create user

Escribe: Usuarios

Admin-UpdateUser

Qué hace

Cambia rol/datos.
Servicios/DB

Cognito: update

Actualiza: Usuarios

Admin-DisableUser

Qué hace

Deshabilita usuario.
Servicios/DB

Cognito: disable

Actualiza: Usuarios

Admin-ListUsers

Qué hace

Lista usuarios.
DB

Lee: Usuarios

Admin-Settings

Qué hace

Lee/actualiza configuración del taller:

moneda, impuestos

numeración de facturas

nombre/telefono del negocio
DB

Lee/Actualiza: ConfiguracionTaller

Admin-Roles

Qué hace

Gestiona roles y permisos editables.
DB

Lee/Actualiza: RolesPermisos