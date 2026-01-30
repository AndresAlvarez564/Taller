export interface Cliente {
  clienteId: string;
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  cedula?: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface Vehiculo {
  vehiculoId: string;
  customerId: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color?: string;
  vin?: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface OrdenTrabajo {
  workOrderId: string;
  numeroOrden: string;
  customerId: string;
  vehicleId: string;
  clienteSnapshot: {
    nombre: string;
    telefono: string;
    email?: string;
  };
  vehiculoSnapshot: {
    placa: string;
    marca: string;
    modelo: string;
    anio: number;
    color?: string;
  };
  descripcionProblema: string;
  diagnostico?: string;
  kilometraje: number;
  observaciones?: string;
  estado: string;
  subtotal: number;
  impuesto: number;
  total: number;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface ItemOrdenTrabajo {
  itemId: string;
  workOrderId: string;
  tipo: 'servicio' | 'repuesto';
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  inventarioItemId?: string;
  activo: boolean;
  creadoEn: string;
}

export interface InventarioItem {
  inventarioItemId: string;
  sku: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  precioCompra: number;
  precioVenta: number;
  ubicacion?: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface Factura {
  facturaId: string;
  numeroFactura: string;
  tipo: 'orden_trabajo' | 'venta_rapida';
  workOrderId?: string;
  clienteSnapshot: {
    nombre: string;
    telefono: string;
    email?: string;
  };
  subtotal: number;
  impuesto: number;
  total: number;
  estado: string;
  metodoPago?: string;
  montoPagado: number;
  saldoPendiente: number;
  creadoEn: string;
  actualizadoEn?: string;
}
