import { Customer, ApiResponse } from '../types';
import { apiClient, USE_MOCK_DATA } from './api';
import { mockCustomers, delay } from './mockData';

class CustomerService {
  private mockData: Customer[] = [...mockCustomers];

  async getAll(): Promise<Customer[]> {
    if (USE_MOCK_DATA) {
      await delay(500); // Simular latencia de red
      return this.mockData.filter(c => c.activo);
    }
    
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers');
    return response.data || [];
  }

  async getById(id: string): Promise<Customer | null> {
    if (USE_MOCK_DATA) {
      await delay(300);
      return this.mockData.find(c => c.clienteId === id) || null;
    }
    
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data || null;
  }

  async search(query: string): Promise<Customer[]> {
    if (USE_MOCK_DATA) {
      await delay(400);
      const lowerQuery = query.toLowerCase();
      return this.mockData.filter(c => 
        c.activo && (
          c.nombre.toLowerCase().includes(lowerQuery) ||
          c.telefono.includes(query) ||
          c.ciNit?.includes(query) ||
          c.email?.toLowerCase().includes(lowerQuery)
        )
      );
    }
    
    const response = await apiClient.get<ApiResponse<Customer[]>>(`/customers/search?q=${query}`);
    return response.data || [];
  }

  async create(customer: Omit<Customer, 'clienteId' | 'creadoEn' | 'activo'>): Promise<Customer> {
    if (USE_MOCK_DATA) {
      await delay(600);
      const newCustomer: Customer = {
        ...customer,
        clienteId: `${Date.now()}`,
        activo: true,
        creadoEn: new Date().toISOString(),
      };
      this.mockData.push(newCustomer);
      return newCustomer;
    }
    
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', customer);
    if (!response.data) throw new Error('Failed to create customer');
    return response.data;
  }

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    if (USE_MOCK_DATA) {
      await delay(600);
      const index = this.mockData.findIndex(c => c.clienteId === id);
      if (index === -1) throw new Error('Customer not found');
      
      this.mockData[index] = {
        ...this.mockData[index],
        ...customer,
        actualizadoEn: new Date().toISOString(),
      };
      return this.mockData[index];
    }
    
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, customer);
    if (!response.data) throw new Error('Failed to update customer');
    return response.data;
  }

  async delete(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await delay(500);
      const index = this.mockData.findIndex(c => c.clienteId === id);
      if (index === -1) throw new Error('Customer not found');
      
      // Soft delete
      this.mockData[index] = {
        ...this.mockData[index],
        activo: false,
        eliminadoEn: new Date().toISOString(),
      };
      return;
    }
    
    await apiClient.delete(`/customers/${id}`);
  }
}

export const customerService = new CustomerService();
