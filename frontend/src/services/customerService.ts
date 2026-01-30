import api from './api';
import type { Cliente } from '../types';

export const customerService = {
  getAll: async (search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get<{ success: boolean; data: Cliente[] }>('/customers', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Cliente }>(`/customers/${id}`);
    return response.data.data;
  },

  create: async (data: Omit<Cliente, 'clienteId' | 'activo' | 'creadoEn' | 'actualizadoEn'>) => {
    const response = await api.post<{ clienteId: string }>('/customers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Cliente>) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};
