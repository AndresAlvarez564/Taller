export function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Resumen general del taller</p>
      </div>

      <div className="stats">
        <div className="stat-card">
          <h3>Clientes</h3>
          <div className="value">2</div>
        </div>
        <div className="stat-card">
          <h3>Vehículos</h3>
          <div className="value">3</div>
        </div>
        <div className="stat-card">
          <h3>OTs Activas</h3>
          <div className="value">5</div>
        </div>
        <div className="stat-card">
          <h3>Items en Stock</h3>
          <div className="value">120</div>
        </div>
      </div>

      <div className="card">
        <h2>Bienvenido al Sistema de Gestión de Taller</h2>
        <p style={{ marginTop: '12px', color: '#666' }}>
          Usa el menú lateral para navegar entre los diferentes módulos.
        </p>
      </div>
    </div>
  );
}
