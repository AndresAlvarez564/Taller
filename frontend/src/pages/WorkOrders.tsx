import { useEffect, useState } from 'react';
import { workOrdersService } from '../services/workOrders.service';
import type { OrdenTrabajo } from '../types';
import WorkOrderItemForm from '../components/WorkOrderItemForm';

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'en_cotizacion', label: 'En Cotización' },
  { value: 'en_aprobacion', label: 'En Aprobación' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'terminado', label: 'Terminado' },
  { value: 'facturado', label: 'Facturado' },
];

const ESTADOS_KANBAN = [
  { key: 'en_revision', label: 'En Revisión', color: 'bg-blue-100 border-blue-300', description: 'Diagnóstico inicial' },
  { key: 'en_cotizacion', label: 'En Cotización', color: 'bg-yellow-100 border-yellow-300', description: 'Desglose de piezas' },
  { key: 'en_aprobacion', label: 'En Aprobación', color: 'bg-orange-100 border-orange-300', description: 'Esperando cliente' },
  { key: 'aprobado', label: 'Aprobado', color: 'bg-green-100 border-green-300', description: 'Cliente confirmó' },
  { key: 'en_proceso', label: 'En Proceso', color: 'bg-purple-100 border-purple-300', description: 'Mecánico trabajando' },
  { key: 'terminado', label: 'Terminado', color: 'bg-teal-100 border-teal-300', description: 'Vehículo listo' },
  { key: 'facturado', label: 'Facturado', color: 'bg-gray-100 border-gray-300', description: 'Servicio pagado' }
];

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<OrdenTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrdenTrabajo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    loadWorkOrders();
  }, [estadoFilter]);

  const loadWorkOrders = async () => {
    try {
      const data = await workOrdersService.getAll(estadoFilter || undefined);
      setWorkOrders(data);
    } catch (error) {
      console.error('Error loading work orders:', error);
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta orden?')) return;
    
    try {
      await workOrdersService.delete(id);
      loadWorkOrders();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al eliminar orden');
    }
  };

  const handleViewDetails = (order: OrdenTrabajo) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleChangeState = async (orderId: string, newState: string) => {
    try {
      await workOrdersService.updateState(orderId, newState);
      loadWorkOrders();
      if (selectedOrder?.workOrderId === orderId) {
        setShowDetails(false);
        setSelectedOrder(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al cambiar estado');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colors: any = {
      en_revision: '#718096',
      en_cotizacion: '#4299e1',
      en_aprobacion: '#ed8936',
      aprobado: '#48bb78',
      en_proceso: '#9f7aea',
      terminado: '#38b2ac',
      facturado: '#2d3748',
      cancelado: '#e53e3e',
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
        {estado.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getOrdersByState = (estado: string) => {
    return workOrders.filter(order => order.estado === estado);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Órdenes de Trabajo</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'kanban' ? '#667eea' : '#e2e8f0',
              color: viewMode === 'kanban' ? 'white' : '#2d3748',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Vista Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'list' ? '#667eea' : '#e2e8f0',
              color: viewMode === 'list' ? 'white' : '#2d3748',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Vista Lista
          </button>
          <button
            onClick={() => setShowForm(true)}
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
            + Nueva Orden
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Filtrar por estado:
          </label>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minWidth: '200px'
            }}
          >
            {ESTADOS.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
      )}

      {viewMode === 'kanban' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          overflowX: 'auto'
        }}>
          {ESTADOS_KANBAN.map(estado => {
            const ordersInState = getOrdersByState(estado.key);
            return (
              <div
                key={estado.key}
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  border: `2px solid`,
                  borderColor: estado.color.includes('blue') ? '#bee3f8' :
                              estado.color.includes('yellow') ? '#fef08a' :
                              estado.color.includes('orange') ? '#fed7aa' :
                              estado.color.includes('green') ? '#9ae6b4' :
                              estado.color.includes('purple') ? '#d6bcfa' :
                              estado.color.includes('teal') ? '#81e6d9' : '#e2e8f0',
                  padding: '1rem',
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {estado.label}
                  </h3>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    {estado.description}
                  </p>
                  <div style={{
                    background: '#f7fafc',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#4a5568'
                  }}>
                    {ordersInState.length} {ordersInState.length === 1 ? 'orden' : 'órdenes'}
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {ordersInState.map(order => (
                    <div
                      key={order.workOrderId}
                      onClick={() => handleViewDetails(order)}
                      style={{
                        background: '#f7fafc',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#667eea',
                        marginBottom: '0.5rem'
                      }}>
                        #{order.numeroOrden}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {order.clienteSnapshot.nombre}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#718096',
                        marginBottom: '0.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {order.vehiculoSnapshot.placa} - {order.vehiculoSnapshot.marca} {order.vehiculoSnapshot.modelo}
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        color: '#a0aec0',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #e2e8f0'
                      }}>
                        <span>{new Date(order.creadoEn).toLocaleDateString()}</span>
                        <span style={{ fontWeight: 600, color: '#2d3748' }}>
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {ordersInState.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem 1rem',
                      color: '#a0aec0',
                      fontSize: '0.875rem'
                    }}>
                      Sin órdenes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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
                <th style={thStyle}>Vehículo</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo) => (
                <tr key={wo.workOrderId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={tdStyle}><strong>{wo.numeroOrden}</strong></td>
                  <td style={tdStyle}>{wo.clienteSnapshot.nombre}</td>
                  <td style={tdStyle}>
                    {wo.vehiculoSnapshot.placa} - {wo.vehiculoSnapshot.marca} {wo.vehiculoSnapshot.modelo}
                  </td>
                  <td style={tdStyle}>{getEstadoBadge(wo.estado)}</td>
                  <td style={tdStyle}><strong>${wo.total.toFixed(2)}</strong></td>
                  <td style={tdStyle}>{new Date(wo.creadoEn).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleViewDetails(wo)}
                      style={actionButtonStyle('#667eea')}
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDelete(wo.workOrderId)}
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
      )}

      {showForm && (
        <WorkOrderForm
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false);
            loadWorkOrders();
          }}
        />
      )}

      {showDetails && selectedOrder && (
        <WorkOrderDetails
          order={selectedOrder}
          onClose={() => {
            setShowDetails(false);
            setSelectedOrder(null);
          }}
          onChangeState={handleChangeState}
          onRefresh={loadWorkOrders}
        />
      )}
    </div>
  );
}

function WorkOrderDetails({ order, onClose, onChangeState }: {
  order: OrdenTrabajo;
  onClose: () => void;
  onChangeState: (orderId: string, newState: string) => void;
}) {
  const [showTransitionForm, setShowTransitionForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [diagnostico, setDiagnostico] = useState('');
  const [observacionesRevision, setObservacionesRevision] = useState('');
  const [notasAprobacion, setNotasAprobacion] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoPagado, setMontoPagado] = useState(0);

  const getNextState = (currentState: string): string | null => {
    const transitions: Record<string, string> = {
      en_revision: 'en_cotizacion',
      en_cotizacion: 'en_aprobacion',
      en_aprobacion: 'aprobado',
      aprobado: 'en_proceso',
      en_proceso: 'terminado',
      terminado: 'facturado'
    };
    return transitions[currentState] || null;
  };

  const getNextStateLabel = (currentState: string): string => {
    const labels: Record<string, string> = {
      en_revision: 'Completar Diagnóstico',
      en_cotizacion: 'Enviar Cotización al Cliente',
      en_aprobacion: 'Cliente Aprobó',
      aprobado: 'Iniciar Reparación',
      en_proceso: 'Trabajo Completado',
      terminado: 'Registrar Pago'
    };
    return labels[currentState] || 'Siguiente Estado';
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleTransition = async () => {
    const nextState = getNextState(order.estado);
    if (!nextState) return;

    // Validaciones específicas por estado
    if (order.estado === 'en_revision' && !diagnostico.trim()) {
      alert('Debe ingresar el diagnóstico del vehículo');
      return;
    }

    if (order.estado === 'en_cotizacion' && items.length === 0) {
      alert('Debe agregar al menos un servicio o repuesto para la cotización');
      return;
    }

    if (order.estado === 'terminado' && montoPagado <= 0) {
      alert('Debe ingresar el monto pagado');
      return;
    }

    try {
      // Si estamos en cotización, primero guardar los items
      if (order.estado === 'en_cotizacion' && items.length > 0) {
        for (const item of items) {
          await workOrdersService.addItem(order.workOrderId, {
            tipo: item.tipo,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            inventarioItemId: item.inventarioItemId || undefined
          });
        }
      }

      // Preparar datos adicionales según el estado
      const additionalData: any = {};
      
      if (order.estado === 'en_revision') {
        additionalData.diagnostico = diagnostico;
        if (observacionesRevision) {
          additionalData.observacionesRevision = observacionesRevision;
        }
      }
      
      if (order.estado === 'en_aprobacion' && notasAprobacion) {
        additionalData.notasAprobacion = notasAprobacion;
      }
      
      if (order.estado === 'terminado') {
        additionalData.metodoPago = metodoPago;
        additionalData.montoPagado = montoPagado;
      }

      // Cambiar estado con datos adicionales
      await workOrdersService.updateState(order.workOrderId, nextState, additionalData);
      
      // Cerrar modal y recargar
      setShowTransitionForm(false);
      onClose();
      
      // Recargar la página para ver cambios
      window.location.reload();
      
    } catch (error: any) {
      console.error('Error en transición:', error);
      alert(error.response?.data?.mensaje || 'Error al cambiar estado de la orden');
    }
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const nextState = getNextState(order.estado);
  const canTransition = nextState !== null;

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
      zIndex: 1000,
      overflow: 'auto',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Orden de Trabajo: {order.numeroOrden}</h2>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Estado y Transición */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f7fafc', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <strong>Estado Actual:</strong> 
              <span style={{ 
                marginLeft: '0.5rem',
                padding: '0.25rem 0.75rem',
                background: '#667eea',
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                {order.estado.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            {canTransition && order.estado !== 'facturado' && (
              <button
                onClick={() => setShowTransitionForm(!showTransitionForm)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {getNextStateLabel(order.estado)}
              </button>
            )}
          </div>

          {/* Formulario de Transición */}
          {showTransitionForm && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'white', 
              borderRadius: '4px',
              border: '2px solid #667eea'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#667eea' }}>
                {getNextStateLabel(order.estado)}
              </h4>

              {/* Formulario específico según estado */}
              {order.estado === 'en_revision' && (
                <div>
                  <h5 style={{ marginBottom: '0.75rem', color: '#2d3748' }}>Diagnóstico del Vehículo</h5>
                  <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem' }}>
                    Ingrese el diagnóstico completo después de revisar el vehículo. Describa los problemas encontrados y las reparaciones necesarias.
                  </p>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Diagnóstico Técnico *
                    </label>
                    <textarea
                      value={diagnostico}
                      onChange={(e) => setDiagnostico(e.target.value)}
                      placeholder="Ej: Se detectó fuga de aceite en el motor, pastillas de freno desgastadas al 80%, batería con bajo voltaje..."
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                        fontSize: '0.875rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Observaciones Adicionales
                    </label>
                    <textarea
                      value={observacionesRevision}
                      onChange={(e) => setObservacionesRevision(e.target.value)}
                      placeholder="Notas adicionales, recomendaciones, etc."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                        fontSize: '0.875rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              )}

              {order.estado === 'en_cotizacion' && (
                <div>
                  <h5 style={{ marginBottom: '0.75rem', color: '#2d3748' }}>Cotización - Servicios y Repuestos</h5>
                  <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem' }}>
                    Agregue todos los servicios y repuestos necesarios con sus precios. Esta cotización se enviará al cliente para su aprobación.
                  </p>
                  
                  {/* Usar el nuevo componente */}
                  <WorkOrderItemForm onAddItem={(item) => setItems([...items, item])} />

                  {/* Lista de Items */}
                  {items.length > 0 ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <h6 style={{ marginBottom: '0.75rem', color: '#2d3748' }}>Items en la Cotización:</h6>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        {items.map((item, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: index % 2 === 0 ? 'white' : '#f7fafc',
                            borderBottom: index < items.length - 1 ? '1px solid #e2e8f0' : 'none'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                {item.tipo === 'servicio' ? '🔧' : '🔩'} {item.descripcion}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                                {item.cantidad} x ${item.precioUnitario.toFixed(2)} = ${item.subtotal.toFixed(2)}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(index)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#e53e3e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              ✕ Eliminar
                            </button>
                          </div>
                        ))}
                        <div style={{ 
                          padding: '1rem',
                          background: '#667eea',
                          color: 'white',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontSize: '1.25rem'
                        }}>
                          TOTAL: ${getTotalItems().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '2rem',
                      textAlign: 'center',
                      background: '#fff5f5',
                      border: '2px dashed #fc8181',
                      borderRadius: '4px',
                      color: '#c53030',
                      marginBottom: '1rem'
                    }}>
                      ⚠️ Debe agregar al menos un item para continuar
                    </div>
                  )}
                </div>
              )}

              {order.estado === 'en_aprobacion' && (
                <div>
                  <p style={{ marginBottom: '1rem', color: '#718096' }}>
                    ¿El cliente ha aprobado la cotización? Al continuar, la orden quedará lista para iniciar el trabajo.
                  </p>
                </div>
              )}

              {order.estado === 'aprobado' && (
                <div>
                  <p style={{ marginBottom: '1rem', color: '#718096' }}>
                    ¿Está listo para iniciar el trabajo en el vehículo?
                  </p>
                </div>
              )}

              {order.estado === 'en_proceso' && (
                <div>
                  <p style={{ marginBottom: '1rem', color: '#718096' }}>
                    ¿El trabajo ha sido completado y el vehículo está listo para entregar?
                  </p>
                </div>
              )}

              {order.estado === 'terminado' && (
                <div>
                  <p style={{ marginBottom: '1rem', color: '#718096' }}>
                    ¿El cliente ha pagado el servicio? Al continuar, se marcará como facturado.
                  </p>
                </div>
              )}

              {/* Botones de Acción */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={handleTransition}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Confirmar y Continuar
                </button>
                <button
                  onClick={() => setShowTransitionForm(false)}
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
            </div>
          )}
        </div>

        {/* Información del Cliente */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Cliente</h3>
          <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '4px' }}>
            <p><strong>Nombre:</strong> {order.clienteSnapshot.nombre}</p>
            <p><strong>Teléfono:</strong> {order.clienteSnapshot.telefono}</p>
            {order.clienteSnapshot.email && <p><strong>Email:</strong> {order.clienteSnapshot.email}</p>}
          </div>
        </div>

        {/* Información del Vehículo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Vehículo</h3>
          <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '4px' }}>
            <p><strong>Placa:</strong> {order.vehiculoSnapshot.placa}</p>
            <p><strong>Marca/Modelo:</strong> {order.vehiculoSnapshot.marca} {order.vehiculoSnapshot.modelo}</p>
            <p><strong>Año:</strong> {order.vehiculoSnapshot.anio}</p>
            {order.vehiculoSnapshot.color && <p><strong>Color:</strong> {order.vehiculoSnapshot.color}</p>}
          </div>
        </div>

        {/* Detalles del Trabajo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Detalles del Trabajo</h3>
          <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '4px' }}>
            <p><strong>Descripción del Problema:</strong></p>
            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{order.descripcionProblema}</p>
            {order.kilometraje > 0 && <p style={{ marginTop: '0.5rem' }}><strong>Kilometraje:</strong> {order.kilometraje.toLocaleString()} km</p>}
            {order.observaciones && (
              <>
                <p style={{ marginTop: '0.5rem' }}><strong>Observaciones:</strong></p>
                <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{order.observaciones}</p>
              </>
            )}
          </div>
        </div>

        {/* Total */}
        <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '4px', textAlign: 'right' }}>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>
            Total: <span style={{ color: '#667eea' }}>${order.total.toFixed(2)}</span>
          </h3>
        </div>

        {/* Fechas */}
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#718096' }}>
          <p>Creado: {new Date(order.creadoEn).toLocaleString()}</p>
          {order.actualizadoEn && order.actualizadoEn !== order.creadoEn && (
            <p>Actualizado: {new Date(order.actualizadoEn).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkOrderForm({ onClose, onSave }: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    descripcionProblema: '',
    kilometraje: 0,
    observaciones: '',
  });
  const [loading, setLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (formData.customerId) {
      loadVehicles(formData.customerId);
    } else {
      setVehicles([]);
      setFormData(prev => ({ ...prev, vehicleId: '' }));
    }
  }, [formData.customerId]);

  const loadCustomers = async () => {
    try {
      const response = await fetch('https://x4rtbi7bo4.execute-api.us-east-1.amazonaws.com/api/customers');
      const data = await response.json();
      setCustomers(data.data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadVehicles = async (customerId: string) => {
    try {
      const response = await fetch(`https://x4rtbi7bo4.execute-api.us-east-1.amazonaws.com/api/vehicles?customerId=${customerId}`);
      const data = await response.json();
      setVehicles(data.data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await workOrdersService.create(formData);
      onSave();
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al crear orden de trabajo');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.nombre.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.telefono.includes(customerSearch)
  );

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
      zIndex: 1000,
      overflow: 'auto',
      padding: '1rem'
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
        <h2 style={{ marginBottom: '1.5rem' }}>Nueva Orden de Trabajo</h2>

        <form onSubmit={handleSubmit}>
          {/* Cliente */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Cliente *
            </label>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '0.5rem'
              }}
            />
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Seleccione un cliente</option>
              {filteredCustomers.map(c => (
                <option key={c.clienteId} value={c.clienteId}>
                  {c.nombre} - {c.telefono}
                </option>
              ))}
            </select>
          </div>

          {/* Vehículo */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Vehículo *
            </label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              required
              disabled={!formData.customerId}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: !formData.customerId ? '#f5f5f5' : 'white'
              }}
            >
              <option value="">
                {formData.customerId ? 'Seleccione un vehículo' : 'Primero seleccione un cliente'}
              </option>
              {vehicles.map(v => (
                <option key={v.vehiculoId} value={v.vehiculoId}>
                  {v.placa} - {v.marca} {v.modelo} ({v.anio})
                </option>
              ))}
            </select>
          </div>

          {/* Descripción del Problema */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Descripción del Problema *
            </label>
            <textarea
              value={formData.descripcionProblema}
              onChange={(e) => setFormData({ ...formData, descripcionProblema: e.target.value })}
              required
              rows={3}
              placeholder="Describa el problema reportado por el cliente..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Kilometraje */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Kilometraje
            </label>
            <input
              type="number"
              value={formData.kilometraje}
              onChange={(e) => setFormData({ ...formData, kilometraje: parseInt(e.target.value) || 0 })}
              min="0"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          {/* Observaciones */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={2}
              placeholder="Observaciones adicionales..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'inherit',
                resize: 'vertical'
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
              {loading ? 'Creando...' : 'Crear Orden'}
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
