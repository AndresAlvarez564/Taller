export interface Customer {
  clienteId: string;
  nombre: string;
  telefono: string;
  ciNit?: string;
  direccion?: string;
  email?: string;
  activo: boolean;
  creadoEn: string;
}
