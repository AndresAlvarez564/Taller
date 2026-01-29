# Taller Pro - Frontend

Sistema de gestión para talleres automotrices construido con React + Vite + TypeScript + TailwindCSS.

## 🚀 Tecnologías

- **React 18** - UI Library
- **Vite** - Build tool (super rápido)
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Zustand** - State management (próximamente)
- **Lucide React** - Icons

## 📦 Instalación

```bash
npm install
```

## 🏃 Desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:5173/`

## 🏗️ Build

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/              # Componentes UI reutilizables
│   ├── layout/          # Layout, Navbar, Sidebar
│   └── customers/       # Componentes específicos de clientes
├── pages/               # Páginas/Vistas
├── services/            # API calls y mock data
├── types/               # TypeScript types
└── utils/               # Helpers
```

## 🎨 Módulos Implementados

### ✅ Dashboard
- Vista general con estadísticas
- Órdenes de trabajo recientes
- Alertas de stock bajo

### ✅ Clientes
- Lista de clientes con búsqueda
- Crear nuevo cliente
- Editar cliente existente
- Eliminar cliente (soft delete)
- Validación de formularios

### 🚧 Próximamente
- Vehículos
- Órdenes de Trabajo
- Inventario
- Facturas
- Ventas Rápidas
- Configuración

## 🔌 Conexión con Backend

Actualmente usa **mock data** para desarrollo.

Para conectar con el API Gateway real:

1. Editar `src/services/api.ts`
2. Cambiar `USE_MOCK_DATA = false`
3. Configurar `VITE_API_URL` en `.env`:

```env
VITE_API_URL=https://tu-api-gateway.amazonaws.com/prod
```

## 📝 Tipos TypeScript

Todos los tipos están definidos en `src/types/index.ts` basados en la documentación del proyecto:

- Customer
- Vehicle
- WorkOrder
- WorkOrderItem
- InventoryItem
- Invoice
- User
- TallerConfig

## 🎯 Próximos Pasos

1. Implementar módulo de Vehículos
2. Implementar módulo de Órdenes de Trabajo
3. Implementar módulo de Inventario
4. Agregar autenticación con Cognito
5. Conectar con API Gateway real
6. Agregar tests

## 🤝 Contribuir

Este es un proyecto privado para Methodica Technology & Co.
