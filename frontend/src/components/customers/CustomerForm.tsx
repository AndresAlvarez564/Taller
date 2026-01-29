import React, { useState } from 'react';
import { Button, Form, Input, Card, Space, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import type { Customer } from '../../types';
import { customerService } from '../../services/customerService';

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
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      if (customer) {
        await customerService.update(customer.clienteId, values);
      } else {
        await customerService.create(values);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving customer:', error);
      message.error('Error al guardar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={onCancel}>
          Volver
        </Button>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>
            {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>
            {customer ? 'Actualiza la información del cliente' : 'Registra un nuevo cliente'}
          </p>
        </div>
      </Space>

      <Card title="Información del Cliente">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={customer || {}}
        >
          <Form.Item
            label="Nombre completo"
            name="nombre"
            rules={[{ required: true, message: 'El nombre es requerido' }]}
          >
            <Input placeholder="Juan Pérez" />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="telefono"
            rules={[{ required: true, message: 'El teléfono es requerido' }]}
          >
            <Input placeholder="809-555-1234" />
          </Form.Item>

          <Form.Item
            label="Cédula / RNC"
            name="ciNit"
          >
            <Input placeholder="001-1234567-8" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Email inválido' }]}
          >
            <Input placeholder="juan@example.com" />
          </Form.Item>

          <Form.Item
            label="Dirección"
            name="direccion"
          >
            <Input.TextArea placeholder="Calle Principal #123, Santo Domingo" rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                {customer ? 'Actualizar Cliente' : 'Guardar Cliente'}
              </Button>
              <Button onClick={onCancel}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
