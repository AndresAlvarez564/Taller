import api from './api';
import type { Vehiculo } from '../types';

export const vehicleService = {
  getAll: async (customerId?: string) => {
    const params = customerId ? { customerId } : {};
    const response = await api.get<{ success: boolean; data: Vehiculo[] }>('/vehicles', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Vehiculo }>(`/vehicles/${id}`);
    return response.data.data;
  },

  create: async (data: Omit<Vehiculo, 'vehiculoId' | 'activo' | 'creadoEn' | 'actualizadoEn'>) => {
    const response = await api.post<{ vehiculoId: string }>('/vehicles', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Vehiculo>) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
};
