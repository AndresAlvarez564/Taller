import React from 'react';
import { Card, Row, Col, Statistic, List, Tag } from 'antd';
import { UserOutlined, CarOutlined, ToolOutlined, InboxOutlined } from '@ant-design/icons';

export const Dashboard: React.FC = () => {
  const recentOrders = [
    { id: '1', title: 'OT-001 - Toyota Corolla', description: 'Motor hace ruido', status: 'En Proceso', color: 'orange' },
    { id: '2', title: 'OT-002 - Nissan Sentra', description: 'Cambio de aceite', status: 'Aprobado', color: 'green' },
    { id: '3', title: 'OT-003 - Honda Civic', description: 'Frenos hacen ruido', status: 'En Revisión', color: 'blue' },
  ];

  const lowStock = [
    { id: '1', name: 'Batería 12V 75Ah', sku: 'BAT-001', stock: 3, color: 'red' },
    { id: '2', name: 'Pastillas de freno', sku: 'FRE-001', stock: 8, color: 'orange' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Clientes"
              value={3}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Vehículos"
              value={3}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="OTs Activas"
              value={3}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Items en Stock"
              value={4}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Órdenes de Trabajo Recientes">
            <List
              dataSource={recentOrders}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                  <Tag color={item.color}>{item.status}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Stock Bajo">
            <List
              dataSource={lowStock}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={`SKU: ${item.sku}`}
                  />
                  <Tag color={item.color}>{item.stock} unidades</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
