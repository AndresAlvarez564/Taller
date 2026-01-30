export default function Dashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Dashboard
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
            Órdenes Activas
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
            12
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
            Clientes
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#48bb78' }}>
            45
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
            Inventario Bajo
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f56565' }}>
            8
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
            Ingresos del Mes
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ed8936' }}>
            Bs. 15,420
          </p>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Actividad Reciente
        </h2>
        <p style={{ color: '#718096' }}>
          No hay actividad reciente para mostrar.
        </p>
      </div>
    </div>
  );
}
