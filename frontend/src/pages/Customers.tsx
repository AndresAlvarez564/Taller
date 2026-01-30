import { useEffect, useState } from 'react';
import { customerService } from '../services/customerService';
import type { Cliente } from '../types';
import CustomerForm from '../components/customers/CustomerForm';

export default function Customers() {
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Cliente | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    
    try {
      await customerService.delete(id);
      loadCustomers();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al eliminar cliente');
    }
  };

  const handleEdit = (customer: Cliente) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Clientes</h1>
        <button
          onClick={() => {
            setEditingCustomer(null);
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
          + Nuevo Cliente
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
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Teléfono</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Dirección</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.clienteId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={tdStyle}>{customer.nombre}</td>
                <td style={tdStyle}>{customer.telefono}</td>
                <td style={tdStyle}>{customer.email || '-'}</td>
                <td style={tdStyle}>{customer.direccion || '-'}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleEdit(customer)}
                    style={actionButtonStyle('#667eea')}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(customer.clienteId)}
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
        <CustomerForm
          customer={editingCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingCustomer(null);
            loadCustomers();
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
