import { useState } from 'react';
import { Customer } from './types';
import { mockCustomers } from './mockData';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciNit: '',
    email: '',
    direccion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      setCustomers(customers.map(c => 
        c.clienteId === editingCustomer.clienteId 
          ? { ...c, ...formData }
          : c
      ));
    } else {
      const newCustomer: Customer = {
        ...formData,
        clienteId: Date.now().toString(),
        activo: true,
        creadoEn: new Date().toISOString(),
      };
      setCustomers([...customers, newCustomer]);
    }
    
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({ nombre: '', telefono: '', ciNit: '', email: '', direccion: '' });
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      nombre: customer.nombre,
      telefono: customer.telefono,
      ciNit: customer.ciNit || '',
      email: customer.email || '',
      direccion: customer.direccion || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este cliente?')) {
      setCustomers(customers.filter(c => c.clienteId !== id));
    }
  };

  if (showForm) {
    return (
      <div>
        <div className="page-header">
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setShowForm(false);
              setEditingCustomer(null);
              setFormData({ nombre: '', telefono: '', ciNit: '', email: '', direccion: '' });
            }}
          >
            ← Volver
          </button>
          <h1>{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre *</label>
              <input
                className="input"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono *</label>
              <input
                className="input"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Cédula/RNC</label>
              <input
                className="input"
                value={formData.ciNit}
                onChange={(e) => setFormData({ ...formData, ciNit: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                className="input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                className="input"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              />
            </div>

            <div className="actions">
              <button type="submit" className="btn btn-primary">
                {editingCustomer ? 'Actualizar' : 'Guardar'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingCustomer(null);
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

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Clientes</h1>
          <p>Gestión de clientes del taller</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo Cliente
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Cédula/RNC</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.clienteId}>
                <td>{customer.nombre}</td>
                <td>{customer.telefono}</td>
                <td>{customer.ciNit || '-'}</td>
                <td>{customer.email || '-'}</td>
                <td>
                  <div className="actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEdit(customer)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(customer.clienteId)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
