import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/vehicles" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">Vehículos</h2><p className="text-muted-foreground mt-2">Próximamente...</p></div>} />
          <Route path="/work-orders" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">Órdenes de Trabajo</h2><p className="text-muted-foreground mt-2">Próximamente...</p></div>} />
          <Route path="/inventory" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">Inventario</h2><p className="text-muted-foreground mt-2">Próximamente...</p></div>} />
          <Route path="/invoices" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">Facturas</h2><p className="text-muted-foreground mt-2">Próximamente...</p></div>} />
          <Route path="/quick-sales" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">Ventas Rápidas</h2><p className="text-muted-foreground mt-2">Próximamente...</p></div>} />
          <Route path="/settings" element={<div className="text-center py-12"><h2 className="text-2xl font-bold">Configuración</h2><p className="text-muted-foreground mt-2">Próximamente...</p></div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
