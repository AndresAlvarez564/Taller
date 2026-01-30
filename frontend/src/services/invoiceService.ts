import api from './api';
import type { Factura } from '../types';

export const invoiceService = {
  getAll: async (estado?: string) => {
    const params = estado ? { estado } : {};
    const response = await api.get<{ success: boolean; data: Factura[] }>('/invoices', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Factura }>(`/invoices/${id}`);
    return response.data.data;
  },

  create: async (workOrderId: string) => {
    const response = await api.post<{ facturaId: string }>('/invoices', { workOrderId });
    return response.data;
  },

  anular: async (id: string, motivo: string) => {
    const response = await api.post(`/invoices/${id}/anular`, { motivo });
    return response.data;
  },

  registrarPago: async (id: string, data: {
    metodoPago: string;
    montoPagado: number;
    referencia?: string;
  }) => {
    const response = await api.post(`/invoices/${id}/pago`, data);
    return response.data;
  },
};
