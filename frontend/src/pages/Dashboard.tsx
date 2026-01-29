import React from 'react';
import { Users, Car, Wrench, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export const Dashboard: React.FC = () => {
  const stats = [
    { name: 'Clientes', value: '3', icon: Users, color: 'text-blue-600' },
    { name: 'Vehículos', value: '3', icon: Car, color: 'text-green-600' },
    { name: 'OTs Activas', value: '3', icon: Wrench, color: 'text-orange-600' },
    { name: 'Items en Stock', value: '4', icon: Package, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del taller</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-accent ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes de Trabajo Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md bg-accent/50">
                <div>
                  <p className="font-medium">OT-001 - Toyota Corolla</p>
                  <p className="text-sm text-muted-foreground">Motor hace ruido</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                  En Proceso
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-accent/50">
                <div>
                  <p className="font-medium">OT-002 - Nissan Sentra</p>
                  <p className="text-sm text-muted-foreground">Cambio de aceite</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Aprobado
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-accent/50">
                <div>
                  <p className="font-medium">OT-003 - Honda Civic</p>
                  <p className="text-sm text-muted-foreground">Frenos hacen ruido</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  En Revisión
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md bg-accent/50">
                <div>
                  <p className="font-medium">Batería 12V 75Ah</p>
                  <p className="text-sm text-muted-foreground">SKU: BAT-001</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  3 unidades
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-accent/50">
                <div>
                  <p className="font-medium">Pastillas de freno</p>
                  <p className="text-sm text-muted-foreground">SKU: FRE-001</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  8 unidades
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
