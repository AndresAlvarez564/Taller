import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Space, Card, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Customer } from '../types';
import { customerService } from '../services/customerService';
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
      message.error('Error al cargar clientes');
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
      message.error('Error al buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await customerService.delete(id);
      message.success('Cliente eliminado exitosamente');
      loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      message.error('Error al eliminar cliente');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCustomer(null);
    loadCustomers();
    message.success(editingCustomer ? 'Cliente actualizado' : 'Cliente creado exitosamente');
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
    },
    {
      title: 'Cédula/RNC',
      dataIndex: 'ciNit',
      key: 'ciNit',
      render: (text: string) => text || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => text || '-',
    },
    {
      title: 'Dirección',
      dataIndex: 'direccion',
      key: 'direccion',
      render: (text: string) => text || '-',
      ellipsis: true,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: Customer) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Editar
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.clienteId)}
            danger
            size="small"
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

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
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Clientes</h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>Gestión de clientes del taller</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }}>
          <Input
            placeholder="Buscar por nombre, teléfono, cédula o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 400 }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Buscar
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={customers}
          loading={loading}
          rowKey="clienteId"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};
