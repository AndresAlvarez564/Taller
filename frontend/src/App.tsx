import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import WorkOrders from './pages/WorkOrders';
import Vehicles from './pages/Vehicles';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';

type Page = 'dashboard' | 'customers' | 'work-orders' | 'vehicles' | 'inventory' | 'invoices';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <Customers />;
      case 'work-orders':
        return <WorkOrders />;
      case 'vehicles':
        return <Vehicles />;
      case 'inventory':
        return <Inventory />;
      case 'invoices':
        return <Invoices />;
      default:
        return <div>Página en construcción</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7fafc' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        background: '#2d3748',
        color: 'white',
        padding: '1.5rem'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          Taller
        </h1>
        
        <nav>
          <NavItem
            active={currentPage === 'dashboard'}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Dashboard
          </NavItem>
          <NavItem
            active={currentPage === 'customers'}
            onClick={() => setCurrentPage('customers')}
          >
            👥 Clientes
          </NavItem>
          <NavItem
            active={currentPage === 'work-orders'}
            onClick={() => setCurrentPage('work-orders')}
          >
            🔧 Órdenes de Trabajo
          </NavItem>
          <NavItem
            active={currentPage === 'vehicles'}
            onClick={() => setCurrentPage('vehicles')}
          >
            🚗 Vehículos
          </NavItem>
          <NavItem
            active={currentPage === 'inventory'}
            onClick={() => setCurrentPage('inventory')}
          >
            📦 Inventario
          </NavItem>
          <NavItem
            active={currentPage === 'invoices'}
            onClick={() => setCurrentPage('invoices')}
          >
            💰 Facturas
          </NavItem>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        {renderPage()}
      </main>
    </div>
  );
}

function NavItem({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        background: active ? '#667eea' : 'transparent',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: '0.95rem',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = '#4a5568';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

export default App;
