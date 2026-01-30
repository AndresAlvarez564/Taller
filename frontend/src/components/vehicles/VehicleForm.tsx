import { useState, useEffect } from 'react';
import { vehicleService } from '../../services/vehicleService';
import { customerService } from '../../services/customerService';
import type { Vehiculo, Cliente } from '../../types';

interface VehicleFormProps {
  vehicle: Vehiculo | null;
  onClose: () => void;
  onSave: () => void;
}

export default function VehicleForm({ vehicle, onClose, onSave }: VehicleFormProps) {
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    placa: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    color: '',
    vin: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
    if (vehicle) {
      setFormData({
        customerId: vehicle.customerId,
        placa: vehicle.placa,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        anio: vehicle.anio,
        color: vehicle.color || '',
        vin: vehicle.vin || '',
      });
    }
  }, [vehicle]);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (vehicle) {
        await vehicleService.update(vehicle.vehiculoId, formData);
      } else {
        await vehicleService.create(formData);
      }
      onSave();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al guardar vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>
          {vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Cliente *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Seleccione un cliente</option>
              {customers.map(c => (
                <option key={c.clienteId} value={c.clienteId}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Placa *
            </label>
            <input
              type="text"
              value={formData.placa}
              onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Marca *
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Modelo *
              </label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Año *
              </label>
              <input
                type="number"
                value={formData.anio}
                onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              VIN
            </label>
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: loading ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#e2e8f0',
                color: '#2d3748',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
