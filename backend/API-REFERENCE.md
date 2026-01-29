# API Reference - Sistema de Gestión de Taller

**Base URL:** `https://{api-id}.execute-api.{region}.amazonaws.com/api`

---

## 🔒 Autenticación

Todas las peticiones requieren header de autorización:
```
Authorization: Bearer {cognito-jwt-token}
```

---

## 👥 Customers (Clientes)

### Crear Cliente
```http
POST /customers
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "telefono": "809-555-1234",
  "ciNit": "001-1234567-8",
  "direccion": "Calle Principal #123",
  "email": "juan@example.com"
}
```

### Listar/Buscar Clientes
```http
GET /customers?search=Juan&limit=20
```

### Obtener Cliente
```http
GET /customers/{clienteId}
```

### Actualizar Cliente
```http
PUT /customers/{clienteId}
Content-Type: application/json

{
  "nombre": "Juan Pérez Actualizado",
  "telefono": "809-555-9999"
}
```

### Eliminar Cliente (Soft Delete)
```http
DELETE /customers/{clienteId}
```

---

## 🚗 Vehicles (Vehículos)

### Crear Vehículo
```http
POST /vehicles
Content-Type: application/json

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

### Listar/Buscar Vehículos
```http
GET /vehicles?customerId=uuid&search=A123456
```

### Obtener Vehículo
```http
GET /vehicles/{vehiculoId}
```

### Actualizar Vehículo
```http
PUT /vehicles/{vehiculoId}
Content-Type: application/json

{
  "placa": "A123456",
  "color": "Rojo"
}
```

### Eliminar Vehículo (Soft Delete)
```http
DELETE /vehicles/{vehiculoId}
```

---

## 📦 Inventory (Inventario)

### Crear Item de Inventario
```http
POST /inventory
Content-Type: application/json

{
  "sku": "FIL-001",
  "nombre": "Filtro de Aceite",
  "descripcion": "Filtro de aceite para motor",
  "costo": 150.00,
  "precio": 250.00,
  "stockInicial": 50,
  "stockMinimo": 10,
  "unidad": "unidad",
  "categoria": "Filtros"
}
```

### Listar/Buscar Items
```http
GET /inventory?search=filtro&stockBajo=true
```

### Obtener Item
```http
GET /inventory/{inventarioItemId}
```

### Actualizar Item
```http
PUT /inventory/{inventarioItemId}
Content-Type: application/json

{
  "precio": 275.00,
  "stockMinimo": 15
}
```

### Eliminar Item (Soft Delete)
```http
DELETE /inventory/{inventarioItemId}
```

### Registrar Movimiento de Inventario
```http
POST /inventory/movements
Content-Type: application/json

{
  "inventarioItemId": "uuid",
  "tipo": "entrada",
  "cantidad": 20,
  "motivo": "Compra a proveedor",
  "referenciaId": "orden-compra-123"
}
```
**Tipos válidos:** `entrada`, `salida`, `ajuste`

### Listar Movimientos (Kardex)
```http
GET /inventory/movements?inventarioItemId=uuid
```

---

## 🛠️ Work Orders (Órdenes de Trabajo)

### Crear Orden de Trabajo
```http
POST /work-orders
Content-Type: application/json

{
  "customerId": "uuid",
  "vehicleId": "uuid",
  "descripcionProblema": "Motor hace ruido extraño",
  "kilometraje": 85000,
  "observaciones": "Cliente reporta que el ruido aumenta al acelerar"
}
```

### Listar/Buscar Órdenes
```http
GET /work-orders?estado=en_proceso&customerId=uuid&search=A123456
```

### Obtener Orden (con items opcionales)
```http
GET /work-orders/{workOrderId}?includeItems=true
```

### Actualizar Orden
```http
PUT /work-orders/{workOrderId}
Content-Type: application/json

{
  "kilometraje": 85500,
  "observaciones": "Se encontró fuga de aceite"
}
```

### Cambiar Estado de Orden
```http
PUT /work-orders/{workOrderId}/state
Content-Type: application/json

{
  "estado": "aprobado"
}
```
**Estados válidos:** `en_revision` → `en_cotizacion` → `en_aprobacion` → `aprobado` → `en_proceso` → `terminado` → `facturado`

### Cancelar Orden
```http
DELETE /work-orders/{workOrderId}
```

### Agregar Item a Orden
```http
POST /work-orders/{workOrderId}/items
Content-Type: application/json

{
  "workOrderId": "uuid",
  "tipo": "repuesto",
  "descripcion": "Filtro de aceite",
  "cantidad": 1,
  "precioUnitario": 250.00,
  "inventarioItemId": "uuid"
}
```
**Tipos válidos:** `servicio`, `repuesto`

### Actualizar Item de Orden
```http
PUT /work-orders/{workOrderId}/items
Content-Type: application/json

{
  "workOrderId": "uuid",
  "itemId": "uuid",
  "cantidad": 2,
  "precioUnitario": 240.00
}
```

### Eliminar Item de Orden
```http
DELETE /work-orders/{workOrderId}/items
Content-Type: application/json

{
  "workOrderId": "uuid",
  "itemId": "uuid"
}
```

---

## 🧾 Invoices (Facturas)

### Crear Factura desde Orden de Trabajo
```http
POST /invoices
Content-Type: application/json

{
  "workOrderId": "uuid"
}
```

### Listar/Buscar Facturas
```http
GET /invoices?estado=emitida&tipo=taller&search=F-000123
```

### Obtener Factura
```http
GET /invoices/{facturaId}
```

### Anular Factura
```http
POST /invoices/{facturaId}/anular
Content-Type: application/json

{
  "motivo": "Error en datos del cliente"
}
```

### Registrar Pago
```http
POST /invoices/{facturaId}/pago
Content-Type: application/json

{
  "montoPagado": 5000.00,
  "metodoPago": "efectivo",
  "referencia": "Recibo #123"
}
```

---

## 🛒 Ventas Rápidas (sin Orden de Trabajo)

### Crear Venta Rápida
```http
POST /ventas-rapidas
Content-Type: application/json

{
  "clienteNombre": "Cliente General",
  "clienteTelefono": "809-555-0000",
  "items": [
    {
      "tipo": "repuesto",
      "descripcion": "Aceite 10W-40",
      "cantidad": 2,
      "precioUnitario": 450.00,
      "inventarioItemId": "uuid"
    },
    {
      "tipo": "servicio",
      "descripcion": "Cambio de aceite",
      "cantidad": 1,
      "precioUnitario": 300.00
    }
  ]
}
```

### Anular Venta Rápida
```http
POST /ventas-rapidas/{facturaId}/anular
Content-Type: application/json

{
  "motivo": "Cliente devolvió productos",
  "revertirInventario": true
}
```

---

## 📊 Códigos de Respuesta

- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Datos inválidos
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto de negocio (ej: stock insuficiente)
- `500 Internal Server Error` - Error del servidor

---

## 🔄 Flujos de Trabajo Comunes

### Flujo Completo de Orden de Trabajo

1. **Crear cliente** (si es nuevo)
   ```
   POST /customers
   ```

2. **Crear vehículo** (si es nuevo)
   ```
   POST /vehicles
   ```

3. **Crear orden de trabajo**
   ```
   POST /work-orders
   ```

4. **Agregar items a la orden**
   ```
   POST /work-orders/{id}/items (múltiples veces)
   ```

5. **Cambiar estado a cotización**
   ```
   PUT /work-orders/{id}/state → "en_cotizacion"
   ```

6. **Aprobar orden**
   ```
   PUT /work-orders/{id}/state → "aprobado"
   ```

7. **Iniciar trabajo**
   ```
   PUT /work-orders/{id}/state → "en_proceso"
   ```

8. **Terminar trabajo**
   ```
   PUT /work-orders/{id}/state → "terminado"
   ```

9. **Crear factura**
   ```
   POST /invoices
   ```

10. **Registrar pago**
    ```
    POST /invoices/{id}/pago
    ```

### Flujo de Venta Rápida

1. **Crear venta con items**
   ```
   POST /ventas-rapidas
   ```

2. **Registrar pago**
   ```
   POST /invoices/{id}/pago
   ```

---

## ⚠️ Validaciones Importantes

### Clientes
- No se puede eliminar un cliente con órdenes activas
- CI/NIT debe ser único por taller

### Vehículos
- No se puede eliminar un vehículo con órdenes activas
- Placa debe ser única por taller
- Debe pertenecer a un cliente existente

### Inventario
- Stock no puede ser negativo
- Movimientos usan control de concurrencia (version attribute)
- Ajustes establecen stock exacto

### Órdenes de Trabajo
- No se pueden agregar/modificar items si está facturada
- Debe tener items activos para aprobar
- Transiciones de estado siguen flujo definido
- Items de repuesto descuentan inventario automáticamente

### Facturas
- Solo se pueden facturar órdenes en estado "terminado"
- Una orden solo puede tener una factura
- No se puede anular una factura pagada sin autorización
- Número de factura es secuencial y automático

---

**Última actualización:** 29 de Enero, 2025
