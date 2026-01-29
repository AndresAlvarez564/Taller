import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CarOutlined,
  ToolOutlined,
  InboxOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/customers', icon: <UserOutlined />, label: 'Clientes' },
  { key: '/vehicles', icon: <CarOutlined />, label: 'Vehículos' },
  { key: '/work-orders', icon: <ToolOutlined />, label: 'Órdenes de Trabajo' },
  { key: '/inventory', icon: <InboxOutlined />, label: 'Inventario' },
  { key: '/invoices', icon: <FileTextOutlined />, label: 'Facturas' },
  { key: '/quick-sales', icon: <ShoppingCartOutlined />, label: 'Ventas Rápidas' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Configuración' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <Sider width={250} theme="dark">
      <div style={{ height: 64, margin: 16, color: 'white', fontSize: 20, fontWeight: 'bold' }}>
        Taller Pro
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map(item => ({
          ...item,
          label: <Link to={item.key}>{item.label}</Link>,
        }))}
      />
    </Sider>
  );
};
