import { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import type { InventarioItem } from '../../types';

interface InventoryFormProps {
  item: InventarioItem | null;
  onClose: () => void;
  onSave: () => void;
}

export default function InventoryForm({ item, onClose, onSave }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    stock: 0,
    stockMinimo: 0,
    precioCompra: 0,
    precioVenta: 0,
    ubicacion: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        categoria: item.categoria,
        stock: item.stock,
        stockMinimo: item.stockMinimo,
        precioCompra: item.precioCompra,
        precioVenta: item.precioVenta,
        ubicacion: item.ubicacion || '',
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        await inventoryService.update(item.inventarioItemId, formData);
      } else {
        await inventoryService.create(formData);
      }
      onSave();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al guardar item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>
          {item ? 'Editar Item' : 'Nuevo Item'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Categoría *
              </label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                required
                placeholder="Ej: Repuestos, Aceites, Filtros"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={2}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Stock *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
                min="0"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Stock Mínimo *
              </label>
              <input
                type="number"
                value={formData.stockMinimo}
                onChange={(e) => setFormData({ ...formData, stockMinimo: parseInt(e.target.value) || 0 })}
                required
                min="0"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Precio Compra (Bs.) *
              </label>
              <input
                type="number"
                value={formData.precioCompra}
                onChange={(e) => setFormData({ ...formData, precioCompra: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Precio Venta (Bs.) *
              </label>
              <input
                type="number"
                value={formData.precioVenta}
                onChange={(e) => setFormData({ ...formData, precioVenta: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Ubicación
            </label>
            <input
              type="text"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Ej: Estante A-3"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: loading ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#e2e8f0',
                color: '#2d3748',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
