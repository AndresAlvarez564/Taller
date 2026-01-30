import api from './api';
import type { OrdenTrabajo } from '../types';

export const workOrdersService = {
  getAll: async (estado?: string, customerId?: string, search?: string) => {
    const params: any = {};
    if (estado) params.estado = estado;
    if (customerId) params.customerId = customerId;
    if (search) params.search = search;
    const response = await api.get<{ success: boolean; data: OrdenTrabajo[] }>('/work-orders', { params });
    return response.data.data;
  },

  getById: async (id: string, includeItems = true) => {
    const response = await api.get<{ success: boolean; data: OrdenTrabajo }>(`/work-orders/${id}`, {
      params: { includeItems: includeItems ? 'true' : 'false' }
    });
    return response.data.data;
  },

  create: async (data: {
    customerId: string;
    vehicleId: string;
    descripcionProblema: string;
    kilometraje?: number;
    observaciones?: string;
  }) => {
    const response = await api.post<{ workOrderId: string }>('/work-orders', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/work-orders/${id}`, data);
    return response.data;
  },

  updateState: async (id: string, estado: string, additionalData?: {
    diagnostico?: string;
    observacionesRevision?: string;
    notasAprobacion?: string;
    tecnicoAsignado?: string;
    fechaEstimadaEntrega?: string;
    metodoPago?: string;
    montoPagado?: number;
  }) => {
    const response = await api.put(`/work-orders/${id}/state`, { 
      estado,
      ...additionalData
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/work-orders/${id}`);
    return response.data;
  },

  addItem: async (workOrderId: string, item: {
    tipo: 'servicio' | 'repuesto';
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    inventarioItemId?: string;
  }) => {
    const response = await api.post(`/work-orders/${workOrderId}/items`, item);
    return response.data;
  },

  updateItem: async (workOrderId: string, itemId: string, data: {
    cantidad?: number;
    precioUnitario?: number;
  }) => {
    const response = await api.put(`/work-orders/${workOrderId}/items`, {
      workOrderId,
      itemId,
      ...data
    });
    return response.data;
  },

  deleteItem: async (workOrderId: string, itemId: string) => {
    const response = await api.delete(`/work-orders/${workOrderId}/items`, {
      data: { workOrderId, itemId }
    });
    return response.data;
  },
};
