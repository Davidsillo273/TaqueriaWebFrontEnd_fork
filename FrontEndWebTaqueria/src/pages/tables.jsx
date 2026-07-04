import React, { useState, useMemo } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import FAIcon from '../components/commons/FAIcon';
import TableModal from '../components/tables/TableModal';
import ConfirmModal from '../components/commons/ConfirmModal';
import useTables from '../hooks/useTables';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mismos colores que ya usas en getBadgeClass / la leyenda de estados,
// para que el gráfico no introduzca una paleta nueva
const STATUS_COLORS = {
  Disponible: '#22c55e',   // green-500
  Sirviendo: '#dc2626',    // red-600
  Ocupada: '#dc2626',      // red-600
  Reservada: '#f97316',    // orange-500
  'En Limpieza': '#9ca3af', // gray-400
};

function TablesContent() {
  const [activeMenu] = useState('tables');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, tableId: null });

  const { tables, loading, error, createTable, updateTable, deleteTable } = useTables();
  const { addToast } = useToast();

  // Estadísticas en tiempo real
  const totalMesas = tables.length;
  const mesasLibres = tables.filter(m => m.status === 'Disponible').length;
  const porcentajeOcupacion = totalMesas > 0 
    ? Math.round(((totalMesas - mesasLibres) / totalMesas) * 100) 
    : 0;

  // Agrupa las mesas por estado para alimentar el gráfico de dona.
  // Solo incluye estados que realmente tienen al menos una mesa,
  // para no llenar la leyenda con ceros.
  const chartData = useMemo(() => {
    const counts = tables.reduce((acc, mesa) => {
      acc[mesa.status] = (acc[mesa.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status] || '#9ca3af',
    }));
  }, [tables]);

  // Badges de estado
  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Disponible': return 'bg-green-50 text-green-600 font-bold text-xs px-2.5 py-1 rounded';
      case 'Sirviendo':
      case 'Ocupada': return 'bg-red-50 text-red-600 font-bold text-xs px-2.5 py-1 rounded';
      case 'Reservada': return 'bg-orange-50 text-orange-600 font-bold text-xs px-2.5 py-1 rounded';
      case 'En Limpieza': return 'bg-gray-100 text-gray-600 font-bold text-xs px-2.5 py-1 rounded';
      default: return 'bg-gray-100 text-gray-600 font-bold text-xs px-2.5 py-1 rounded';
    }
  };

  const handleSaveTable = async (formData) => {
    let result;
    if (editingTable) result = await updateTable(editingTable._id, formData);
    else result = await createTable(formData);
    
    if (result.success) {
      addToast(editingTable ? 'Mesa actualizada' : 'Mesa creada', 'success');
      setIsModalOpen(false);
      setEditingTable(null);
    } else {
      addToast(result.message || 'Error al guardar', 'error');
    }
  };

  const handleQuickAction = async (mesa) => {
    let nuevoEstado = mesa.status;
    if (mesa.status === 'Disponible') nuevoEstado = 'Sirviendo';
    else if (mesa.status === 'Sirviendo' || mesa.status === 'Ocupada') nuevoEstado = 'En Limpieza';
    else if (mesa.status === 'En Limpieza' || mesa.status === 'Reservada') nuevoEstado = 'Disponible';

    const result = await updateTable(mesa._id, { number: mesa.number, status: nuevoEstado });
    if (result.success) addToast(`Mesa ${mesa.number} → ${nuevoEstado}`, 'success');
    else addToast(result.message || 'Error al cambiar estado', 'error');
  };

  const getActionText = (status) => {
    if (status === 'Sirviendo' || status === 'Ocupada') return 'Liberar / Limpieza';
    if (status === 'Disponible') return 'Asignar Mesa';
    if (status === 'En Limpieza') return 'Finalizar Limpieza';
    if (status === 'Reservada') return 'Registrar Ocupación';
    return 'Cambiar Estado';
  };

  const getActionButtonClass = (status) => {
    if (status === 'Sirviendo' || status === 'Ocupada') return 'bg-red-600 text-white hover:bg-red-700';
    return 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50';
  };

  const handleRequestDelete = (id) => setConfirmDelete({ isOpen: true, tableId: id });

  const handleDeleteConfirm = async () => {
    const id = confirmDelete.tableId;
    if (!id) return;
    const result = await deleteTable(id);
    if (result.success) addToast('Mesa eliminada', 'success');
    else addToast(result.message || 'Error al eliminar', 'error');
    setConfirmDelete({ isOpen: false, tableId: null });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar activeMenu={activeMenu} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Gestión de Mesas</h1>
                <p className="text-sm sm:text-base text-gray-600">Monitoreo en tiempo real del área de comedor.</p>
              </div>
              <button onClick={() => { setEditingTable(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base" disabled={loading}>
                <FAIcon icon="plus" /> Nueva Mesa
              </button>
            </div>

            {error && <div className="mb-4 p-3 sm:p-4 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2"><FAIcon icon="exclamation-circle" />{error}</div>}

            {loading ? (
              <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div><span className="ml-3 text-gray-600">Cargando mesas...</span></div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Tarjetas de estadísticas: ahora ocupan 2/3 en pantallas grandes */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl border-l-4 border-l-red-600 shadow-sm">
                      <div className="text-red-600 mb-2"><FAIcon icon="utensils" /></div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Total Mesas</span>
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900 block mt-1">{totalMesas}</span>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border-l-4 border-l-red-600 shadow-sm">
                      <div className="text-red-600 mb-2"><FAIcon icon="percentage" /></div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Ocupación</span>
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900 block my-1">{porcentajeOcupacion}%</span>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${porcentajeOcupacion}%` }} />
                      </div>
                      <span className="text-right text-xs text-gray-500 mt-1 block">{totalMesas - mesasLibres} / {totalMesas}</span>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border-l-4 border-l-red-600 shadow-sm">
                      <div className="text-green-500 mb-2"><FAIcon icon="check-circle" /></div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Mesas Libres</span>
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900 block mt-1">{mesasLibres}</span>
                    </div>
                  </div>

                  {/* Gráfico de distribución por estado */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 uppercase mb-2">Distribución de Mesas</span>
                    {totalMesas === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-sm text-gray-400 py-8">
                        Aún no hay mesas registradas
                      </div>
                    ) : (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={2}
                            >
                              {chartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [`${value} mesa${value === 1 ? '' : 's'}`, name]}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              iconType="circle"
                              iconSize={8}
                              wrapperStyle={{ fontSize: '11px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
                  {tables.map((mesa) => (
                    <div key={mesa._id} className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between min-h-[170px] relative group hover:shadow-md transition-shadow">
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingTable(mesa); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><FAIcon icon="edit" size="sm" /></button>
                        <button onClick={() => handleRequestDelete(mesa._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><FAIcon icon="trash" size="sm" /></button>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 text-gray-800 font-bold text-sm"><FAIcon icon="chair" className="text-gray-400" />Mesa {String(mesa.number).padStart(2, '0')}</div>
                        <span className={getBadgeClass(mesa.status)}>{mesa.status}</span>
                      </div>
                      <div className="mt-auto">
                        <button onClick={() => handleQuickAction(mesa)} className={`w-full py-1.5 text-xs font-bold rounded-lg transition-colors ${getActionButtonClass(mesa.status)}`}>
                          {getActionText(mesa.status)}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div onClick={() => { setEditingTable(null); setIsModalOpen(true); }} className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-4 sm:p-5 min-h-[170px] hover:border-red-600 hover:text-red-600 cursor-pointer transition-colors">
                    <FAIcon icon="plus-circle" size="lg" className="mb-2" />
                    <span className="text-xs font-bold">Agregar Mesa</span>
                  </div>
                </div>
              </>
            )}

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <span className="text-xs font-bold text-gray-800">ESTADOS:</span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Disponible</div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Ocupada</div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Reservada</div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Limpieza</div>
            </div>
          </div>
        </main>
      </div>
      <TableModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTable(null); }} onSave={handleSaveTable} currentTable={editingTable} />
      <ConfirmModal isOpen={confirmDelete.isOpen} onClose={() => setConfirmDelete({ isOpen: false, tableId: null })} onConfirm={handleDeleteConfirm} title="Eliminar mesa" message="¿Estás seguro de eliminar esta mesa?" confirmText="Eliminar" loading={loading} />
    </div>
  );
}

export default function Tables() {
  return <ToastProvider><TablesContent /></ToastProvider>;
}