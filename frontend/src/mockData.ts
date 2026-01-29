import { Customer } from './types';

export const mockCustomers: Customer[] = [
  {
    clienteId: '1',
    nombre: 'Juan Pérez',
    telefono: '809-555-1234',
    ciNit: '001-1234567-8',
    direccion: 'Calle Principal #123',
    email: 'juan@example.com',
    activo: true,
    creadoEn: '2025-01-15T10:00:00Z',
  },
  {
    clienteId: '2',
    nombre: 'María García',
    telefono: '809-555-5678',
    ciNit: '001-9876543-2',
    direccion: 'Av. Independencia #456',
    email: 'maria@example.com',
    activo: true,
    creadoEn: '2025-01-16T14:30:00Z',
  },
];
