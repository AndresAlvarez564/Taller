import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import { Dashboard } from './Dashboard';
import { Customers } from './Customers';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="app">
      <div className="sidebar">
        <h1>Taller Pro</h1>
        <nav>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/customers" className={location.pathname === '/customers' ? 'active' : ''}>
            Clientes
          </Link>
          <Link to="/vehicles" className={location.pathname === '/vehicles' ? 'active' : ''}>
            Vehículos
          </Link>
          <Link to="/work-orders" className={location.pathname === '/work-orders' ? 'active' : ''}>
            Órdenes de Trabajo
          </Link>
        </nav>
      </div>
      <div className="main">
        <div className="header">
          <h2>Sistema de Gestión</h2>
          <div>Admin</div>
        </div>
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/vehicles" element={<div className="card"><h2>Vehículos</h2><p>Próximamente...</p></div>} />
          <Route path="/work-orders" element={<div className="card"><h2>Órdenes de Trabajo</h2><p>Próximamente...</p></div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
