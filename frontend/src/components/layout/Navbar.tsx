import React from 'react';
import { Layout, Button, Space, Avatar } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header } = Layout;

export const Navbar: React.FC = () => {
  return (
    <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0 }}>Bienvenido</h2>
      <Space>
        <Button icon={<BellOutlined />} type="text" />
        <Avatar icon={<UserOutlined />} />
        <span>Admin</span>
        <Button icon={<LogoutOutlined />} type="text">Salir</Button>
      </Space>
    </Header>
  );
};
