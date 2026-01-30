import { useEffect, useState } from 'react';
import { vehicleService } from '../services/vehicleService';
import type { Vehiculo } from '../types';
import VehicleForm from '../components/vehicles/VehicleForm';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehiculo | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      console.log('Cargando vehículos...');
      const data = await vehicleService.getAll();
      console.log('Vehículos cargados:', data);
      setVehicles(data);
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      alert(`Error al cargar vehículos: ${error.response?.data?.mensaje || error.message}`);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este vehículo?')) return;
    
    try {
      await vehicleService.delete(id);
      loadVehicles();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al eliminar vehículo');
    }
  };

  const handleEdit = (vehicle: Vehiculo) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Vehículos</h1>
        <button
          onClick={() => {
            setEditingVehicle(null);
            setShowForm(true);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          + Nuevo Vehículo
        </button>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f7fafc' }}>
            <tr>
              <th style={thStyle}>Placa</th>
              <th style={thStyle}>Marca</th>
              <th style={thStyle}>Modelo</th>
              <th style={thStyle}>Año</th>
              <th style={thStyle}>Color</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.vehiculoId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={tdStyle}><strong>{vehicle.placa}</strong></td>
                <td style={tdStyle}>{vehicle.marca}</td>
                <td style={tdStyle}>{vehicle.modelo}</td>
                <td style={tdStyle}>{vehicle.anio}</td>
                <td style={tdStyle}>{vehicle.color || '-'}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleEdit(vehicle)}
                    style={actionButtonStyle('#667eea')}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.vehiculoId)}
                    style={actionButtonStyle('#e53e3e')}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <VehicleForm
          vehicle={editingVehicle}
          onClose={() => {
            setShowForm(false);
            setEditingVehicle(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingVehicle(null);
            loadVehicles();
          }}
        />
      )}
    </div>
  );
}

const actionButtonStyle = (color: string): React.CSSProperties => ({
  padding: '0.25rem 0.75rem',
  marginRight: '0.5rem',
  background: color,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.875rem'
});

const thStyle: React.CSSProperties = {
  padding: '0.75rem',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: '#4a5568'
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem',
  fontSize: '0.875rem'
};
