import { useEffect, useState } from 'react';
import { invoiceService } from '../services/invoiceService';
import type { Factura } from '../types';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      console.log('Cargando facturas...');
      const data = await invoiceService.getAll();
      console.log('Facturas cargadas:', data);
      setInvoices(data);
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      alert(`Error al cargar facturas: ${error.response?.data?.mensaje || error.message}`);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colors: any = {
      borrador: '#718096',
      emitida: '#4299e1',
      aprobada: '#48bb78',
      pagada: '#38b2ac',
      parcial: '#ed8936',
      vencida: '#e53e3e',
      anulada: '#a0aec0',
    };

    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: colors[estado] || '#718096',
        color: 'white'
      }}>
        {estado.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Facturas</h1>
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
              <th style={thStyle}>Número</th>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.facturaId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={tdStyle}><strong>{invoice.numeroFactura}</strong></td>
                <td style={tdStyle}>{invoice.clienteSnapshot.nombre}</td>
                <td style={tdStyle}>{invoice.tipo === 'orden_trabajo' ? 'Orden de Trabajo' : 'Venta Rápida'}</td>
                <td style={tdStyle}><strong>Bs. {invoice.total.toFixed(2)}</strong></td>
                <td style={tdStyle}>{getEstadoBadge(invoice.estado)}</td>
                <td style={tdStyle}>{new Date(invoice.creadoEn).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
