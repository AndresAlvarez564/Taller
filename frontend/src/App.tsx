import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';

function App() {
  return (
    <ConfigProvider locale={esES}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vehicles" element={<div style={{ textAlign: 'center', padding: '48px' }}><h2>Vehículos</h2><p>Próximamente...</p></div>} />
            <Route path="/work-orders" element={<div style={{ textAlign: 'center', padding: '48px' }}><h2>Órdenes de Trabajo</h2><p>Próximamente...</p></div>} />
            <Route path="/inventory" element={<div style={{ textAlign: 'center', padding: '48px' }}><h2>Inventario</h2><p>Próximamente...</p></div>} />
            <Route path="/invoices" element={<div style={{ textAlign: 'center', padding: '48px' }}><h2>Facturas</h2><p>Próximamente...</p></div>} />
            <Route path="/quick-sales" element={<div style={{ textAlign: 'center', padding: '48px' }}><h2>Ventas Rápidas</h2><p>Próximamente...</p></div>} />
            <Route path="/settings" element={<div style={{ textAlign: 'center', padding: '48px' }}><h2>Configuración</h2><p>Próximamente...</p></div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
