import api from './api';
import type { InventarioItem } from '../types';

export const inventoryService = {
  getAll: async (categoria?: string) => {
    const params = categoria ? { categoria } : {};
    const response = await api.get<{ success: boolean; data: InventarioItem[] }>('/inventory', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: InventarioItem }>(`/inventory/${id}`);
    return response.data.data;
  },

  create: async (data: Omit<InventarioItem, 'inventarioItemId' | 'activo' | 'creadoEn' | 'actualizadoEn'>) => {
    const response = await api.post<{ inventarioItemId: string }>('/inventory', data);
    return response.data;
  },

  update: async (id: string, data: Partial<InventarioItem>) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  movement: async (data: {
    inventarioItemId: string;
    tipo: 'entrada' | 'salida';
    cantidad: number;
    motivo: string;
  }) => {
    const response = await api.post('/inventory/movements', data);
    return response.data;
  },
};
