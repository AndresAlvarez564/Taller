// Types basados en la documentación del proyecto

export interface Customer {
  clienteId: string;
  nombre: string;
  telefono: string;
  ciNit?: string;
  direccion?: string;
  email?: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn?: string;
  eliminadoEn?: string;
}

export interface Vehicle {
  vehiculoId: string;
  customerId: string;
  placa: string;
  marca: string;
  modelo: string;
  anio?: number;
  chasis?: string;
  color?: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn?: string;
}

export type WorkOrderStatus = 
  | 'en_revision'
  | 'en_cotizacion'
  | 'en_aprobacion'
  | 'aprobado'
  | 'en_proceso'
  | 'terminado'
  | 'facturado'
  | 'cancelado';

export interface WorkOrder {
  workOrderId: string;
  customerId: string;
  vehicleId: string;
  // Snapshot del vehículo
  placa: string;
  marca: string;
  modelo: string;
  // Datos de la OT
  descripcionProblema: string;
  kilometraje?: number;
  observaciones?: string;
  estado: WorkOrderStatus;
  bloquearItems: boolean;
  version: number;
  facturaId?: string;
  creadoEn: string;
  actualizadoEn?: string;
  creadoPor: string;
}

export type WorkOrderItemType = 'repuesto' | 'servicio' | 'mano_obra';

export interface WorkOrderItem {
  itemId: string;
  workOrderId: string;
  tipo: WorkOrderItemType;
  inventarioItemId?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  activo: boolean;
  creadoEn: string;
}

export interface InventoryItem {
  inventarioItemId: string;
  SKU: string;
  nombre: string;
  categoria?: string;
  costo: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  version: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn?: string;
}

export type InventoryMovementType = 'entrada' | 'salida' | 'ajuste';

export interface InventoryMovement {
  movimientoId: string;
  inventarioItemId: string;
  tipo: InventoryMovementType;
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  motivo: string;
  referenciaId?: string;
  creadoEn: string;
  creadoPor: string;
}

export type InvoiceStatus = 
  | 'borrador'
  | 'emitida'
  | 'aprobada'
  | 'pagada'
  | 'vencida'
  | 'anulada';

export type InvoiceType = 'taller' | 'venta_rapida';

export interface Invoice {
  facturaId: string;
  numeroFactura: string;
  tipoFactura: InvoiceType;
  customerId?: string;
  workOrderId?: string;
  items: WorkOrderItem[];
  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;
  estado: InvoiceStatus;
  metodoPago?: string;
  montoPagado: number;
  facturaPdfKey?: string;
  creadoEn: string;
  creadoPor: string;
  anuladoEn?: string;
  anuladoPor?: string;
  motivoAnulacion?: string;
}

export type UserRole = 'admin' | 'cajero' | 'asesor' | 'tecnico' | 'almacenista';

export interface User {
  userId: string;
  email: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  creadoEn: string;
}

export interface TallerConfig {
  nombreNegocio: string;
  telefono: string;
  direccion: string;
  moneda: string;
  tasaImpuesto: number;
  contadorFacturas: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  cursor?: string;
  hasMore: boolean;
}
