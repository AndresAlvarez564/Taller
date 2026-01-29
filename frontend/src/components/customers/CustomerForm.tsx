import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Customer } from '../../types';
import { customerService } from '../../services/customerService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface CustomerFormProps {
  customer: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: customer?.nombre || '',
    telefono: customer?.telefono || '',
    ciNit: customer?.ciNit || '',
    direccion: customer?.direccion || '',
    email: customer?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      
      if (customer) {
        await customerService.update(customer.clienteId, formData);
      } else {
        await customerService.create(formData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error al guardar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={ArrowLeft} onClick={onCancel}>
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
          <p className="text-muted-foreground">
            {customer ? 'Actualiza la información del cliente' : 'Registra un nuevo cliente'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre completo *"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                error={errors.nombre}
                placeholder="Juan Pérez"
              />

              <Input
                label="Teléfono *"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                error={errors.telefono}
                placeholder="809-555-1234"
              />

              <Input
                label="Cédula / RNC"
                value={formData.ciNit}
                onChange={(e) => handleChange('ciNit', e.target.value)}
                error={errors.ciNit}
                placeholder="001-1234567-8"
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder="juan@example.com"
              />
            </div>

            <Input
              label="Dirección"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              error={errors.direccion}
              placeholder="Calle Principal #123, Santo Domingo"
            />

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" icon={Save} loading={loading}>
                {customer ? 'Actualizar Cliente' : 'Guardar Cliente'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
