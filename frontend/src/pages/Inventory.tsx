import { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import type { InventarioItem } from '../types';
import InventoryForm from '../components/inventory/InventoryForm';

export default function Inventory() {
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventarioItem | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      console.log('Cargando inventario...');
      const data = await inventoryService.getAll();
      console.log('Inventario cargado:', data);
      setItems(data);
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      alert(`Error al cargar inventario: ${error.response?.data?.mensaje || error.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este item?')) return;
    
    try {
      await inventoryService.delete(id);
      loadItems();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al eliminar item');
    }
  };

  const handleEdit = (item: InventarioItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Inventario</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          + Nuevo Item
        </button>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f7fafc' }}>
            <tr>
              <th style={thStyle}>SKU</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Categoría</th>
              <th style={thStyle}>Stock</th>
              <th style={thStyle}>Stock Mínimo</th>
              <th style={thStyle}>Precio Venta</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.inventarioItemId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={tdStyle}><strong>{item.sku}</strong></td>
                <td style={tdStyle}>{item.nombre}</td>
                <td style={tdStyle}>{item.categoria}</td>
                <td style={{
                  ...tdStyle,
                  color: item.stock <= item.stockMinimo ? '#e53e3e' : '#2d3748',
                  fontWeight: item.stock <= item.stockMinimo ? 'bold' : 'normal'
                }}>
                  {item.stock}
                </td>
                <td style={tdStyle}>{item.stockMinimo}</td>
                <td style={tdStyle}>Bs. {item.precioVenta.toFixed(2)}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleEdit(item)}
                    style={actionButtonStyle('#667eea')}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.inventarioItemId)}
                    style={actionButtonStyle('#e53e3e')}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <InventoryForm
          item={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingItem(null);
            loadItems();
          }}
        />
      )}
    </div>
  );
}

const actionButtonStyle = (color: string): React.CSSProperties => ({
  padding: '0.25rem 0.75rem',
  marginRight: '0.5rem',
  background: color,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.875rem'
});

const thStyle: React.CSSProperties = {
  padding: '0.75rem',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: '#4a5568'
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem',
  fontSize: '0.875rem'
};
