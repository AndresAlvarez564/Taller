import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-border bg-background sticky top-0 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Bienvenido</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={Bell}>
            <span className="sr-only">Notificaciones</span>
          </Button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Admin</span>
          </div>
          
          <Button variant="ghost" size="sm" icon={LogOut}>
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
};
