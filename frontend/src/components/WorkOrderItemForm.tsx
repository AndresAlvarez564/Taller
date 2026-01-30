import { useState } from 'react';

interface WorkOrderItemFormProps {
  onAddItem: (item: {
    tipo: 'servicio' | 'repuesto';
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    inventarioItemId?: string;
  }) => void;
}

export default function WorkOrderItemForm({ onAddItem }: WorkOrderItemFormProps) {
  const [tipo, setTipo] = useState<'servicio' | 'repuesto'>('servicio');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);

  const handleAdd = () => {
    if (!descripcion.trim() || cantidad <= 0 || precioUnitario <= 0) {
      alert('Complete todos los campos correctamente');
      return;
    }

    const subtotal = cantidad * precioUnitario;
    
    onAddItem({
      tipo,
      descripcion: descripcion.trim(),
      cantidad,
      precioUnitario,
      subtotal
    });

    // Reset form
    setDescripcion('');
    setCantidad(1);
    setPrecioUnitario(0);
  };

  return (
    <div style={{
      padding: '1rem',
      background: '#f7fafc',
      borderRadius: '4px',
      marginBottom: '1rem',
      border: '1px solid #e2e8f0'
    }}>
      <h6 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Agregar Item</h6>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Tipo
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'servicio' | 'repuesto')}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cbd5e0',
              borderRadius: '4px'
            }}
          >
            <option value="servicio">Servicio</option>
            <option value="repuesto">Repuesto</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cbd5e0',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          Descripción
        </label>
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Cambio de aceite, Filtro de aire, etc."
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #cbd5e0',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          Precio Unitario (Bs.)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={precioUnitario}
          onChange={(e) => setPrecioUnitario(parseFloat(e.target.value) || 0)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #cbd5e0',
            borderRadius: '4px'
          }}
        />
      </div>

      <button
        onClick={handleAdd}
        style={{
          width: '100%',
          padding: '0.5rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}
      >
        + Agregar Item
      </button>
    </div>
  );
}
