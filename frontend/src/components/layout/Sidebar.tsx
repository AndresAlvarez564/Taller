import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  Package,
  FileText,
  ShoppingCart,
  Settings,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Clientes', path: '/customers', icon: Users },
  { name: 'Vehículos', path: '/vehicles', icon: Car },
  { name: 'Órdenes de Trabajo', path: '/work-orders', icon: Wrench },
  { name: 'Inventario', path: '/inventory', icon: Package },
  { name: 'Facturas', path: '/invoices', icon: FileText },
  { name: 'Ventas Rápidas', path: '/quick-sales', icon: ShoppingCart },
  { name: 'Configuración', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Taller Pro</h1>
        <p className="text-sm text-muted-foreground">Sistema de Gestión</p>
      </div>
      
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
