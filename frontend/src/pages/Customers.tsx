import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Customer } from '../types';
import { customerService } from '../services/customerService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { CustomerForm } from '../components/customers/CustomerForm';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadCustomers();
      return;
    }
    
    try {
      setLoading(true);
      const data = await customerService.search(searchQuery);
      setCustomers(data);
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    
    try {
      await customerService.delete(id);
      loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error al eliminar cliente');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCustomer(null);
    loadCustomers();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  if (showForm) {
    return (
      <CustomerForm
        customer={editingCustomer}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestión de clientes del taller</p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)}>
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, teléfono, cédula o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button icon={Search} onClick={handleSearch}>
              Buscar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Cargando clientes...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron clientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium">Teléfono</th>
                    <th className="text-left py-3 px-4 font-medium">Cédula/RNC</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Dirección</th>
                    <th className="text-right py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.clienteId} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4 font-medium">{customer.nombre}</td>
                      <td className="py-3 px-4">{customer.telefono}</td>
                      <td className="py-3 px-4">{customer.ciNit || '-'}</td>
                      <td className="py-3 px-4">{customer.email || '-'}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{customer.direccion || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleEdit(customer)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDelete(customer.clienteId)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
