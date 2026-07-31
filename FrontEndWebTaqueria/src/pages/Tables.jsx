import React, { useState, useMemo } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import ComboStats from '../components/dashboard/ComboStats';
import FAIcon from '../components/commons/FAIcon';
import TableModal from '../components/tables/TableModal';
import ConfirmModal from '../components/commons/ConfirmModal';
import useTables from '../hooks/useTables';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  Disponible: '#22c55e',
  Sirviendo: '#dc2626',
  Ocupada: '#dc2626',
  Reservada: '#f97316',
  'En Limpieza': '#9ca3af',
};

function TablesContent() {
  const [activeMenu] = useState('tables');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, tableId: null });

  const { tables, loading, error, createTable, updateTable, deleteTable } = useTables();
  const { addToast } = useToast();

  const totalMesas = tables.length;
  const mesasLibres = tables.filter(m => m.status === 'Disponible').length;
  const porcentajeOcupacion = totalMesas > 0
    ? Math.round(((totalMesas - mesasLibres) / totalMesas) * 100)
    : 0;

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

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Disponible': return 'bg-green-100 text-green-700 border border-green-200';
      case 'Sirviendo':
      case 'Ocupada': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Reservada': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'En Limpieza': return 'bg-gray-100 text-gray-600 border border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border border-gray-200';
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
    if (status === 'Sirviendo' || status === 'Ocupada')
      return 'bg-red-500 text-white shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)] hover:bg-red-600';
    return 'bg-gray-100 text-gray-700 shadow-[0_4px_10px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] hover:bg-gray-200';
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
    <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar activeMenu={activeMenu} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1">
                  Gestión de Mesas
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Monitoreo en tiempo real del área de comedor.
                </p>
              </div>
              <button
                onClick={() => { setEditingTable(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-display font-semibold text-sm
                  shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                  hover:bg-red-600 hover:shadow-[0_8px_20px_rgba(220,38,38,0.4)]
                  transition-all disabled:opacity-60"
                disabled={loading}
              >
                <FAIcon icon="plus" />
                Nueva Mesa
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-100 text-red-700 rounded-2xl text-sm flex items-center gap-2 shadow-sm">
                <FAIcon icon="exclamation-circle" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <span className="ml-3 text-gray-600 font-medium">Cargando mesas...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Estadísticas (2 ComboStats + 1 tarjeta personalizada con progreso) */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <ComboStats
                      icon="chair"
                      title="TOTAL MESAS"
                      value={totalMesas}
                      label={`${totalMesas} mesas registradas`}
                      highlighted={true}
                    />
                    <ComboStats
                      icon="check-circle"
                      title="MESAS LIBRES"
                      value={mesasLibres}
                      label={`${mesasLibres} disponibles`}
                      highlighted={true}
                    />
                    {/* Tarjeta de ocupación con barra de progreso, misma estética clay */}
                    <div className="rounded-3xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7),inset_-1px_-1px_3px_rgba(0,0,0,0.05)] border border-white/80 bg-red-50/80">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-xs sm:text-sm font-display font-semibold uppercase tracking-wider text-red-600/80">OCUPACIÓN</p>
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]">
                          <FAIcon icon="percentage" size="lg" className="text-red-600" />
                        </div>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-display font-bold text-red-600 mb-1">{porcentajeOcupacion}%</h3>
                      <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-red-500 rounded-full transition-all duration-300"
                          style={{ width: `${porcentajeOcupacion}%` }}
                        />
                      </div>
                      <p className="text-xs text-red-600/70 mt-2 font-medium">
                        {totalMesas - mesasLibres} / {totalMesas} mesas ocupadas
                      </p>
                    </div>
                  </div>

                  {/* Gráfico de dona con estilo clay */}
                  <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 flex flex-col">
                    <span className="text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Distribución de Mesas
                    </span>
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
                            <Tooltip formatter={(value, name) => [`${value} mesa${value === 1 ? '' : 's'}`, name]} />
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

                {/* Grid de mesas (tarjetas clay) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
                  {tables.map((mesa) => (
                    <div
                      key={mesa._id}
                      className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 flex flex-col justify-between min-h-[170px] relative group hover:scale-[1.02] transition-transform"
                    >
                      {/* Acciones ocultas hasta hover */}
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingTable(mesa); setIsModalOpen(true); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <FAIcon icon="edit" size="sm" />
                        </button>
                        <button
                          onClick={() => handleRequestDelete(mesa._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <FAIcon icon="trash" size="sm" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 text-gray-800 font-display font-bold text-sm">
                          <FAIcon icon="chair" className="text-gray-400" />
                          Mesa {String(mesa.number).padStart(2, '0')}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-display font-semibold ${getBadgeClass(mesa.status)}`}>
                          {mesa.status}
                        </span>
                      </div>

                      <div className="mt-auto">
                        <button
                          onClick={() => handleQuickAction(mesa)}
                          className={`w-full py-2 rounded-xl text-xs font-display font-bold transition-all ${getActionButtonClass(mesa.status)}`}
                        >
                          {getActionText(mesa.status)}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Tarjeta para agregar nueva mesa */}
                  <div
                    onClick={() => { setEditingTable(null); setIsModalOpen(true); }}
                    className="border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-gray-400 p-4 sm:p-5 min-h-[170px] hover:border-red-400 hover:text-red-500 cursor-pointer transition-colors bg-white/50 backdrop-blur-sm"
                  >
                    <FAIcon icon="plus-circle" size="lg" className="mb-2" />
                    <span className="text-xs font-display font-semibold">Agregar Mesa</span>
                  </div>
                </div>
              </>
            )}

            {/* Leyenda de estados */}
            <div className="bg-white rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 flex flex-wrap items-center gap-4 sm:gap-6">
              <span className="text-xs font-display font-bold text-gray-800">ESTADOS:</span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></span> Disponible
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></span> Ocupada
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></span> Reservada
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shadow-sm"></span> Limpieza
              </div>
            </div>
          </div>
        </main>
      </div>

      <TableModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTable(null); }}
        onSave={handleSaveTable}
        currentTable={editingTable}
      />
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, tableId: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar mesa"
        message="¿Estás seguro de eliminar esta mesa?"
        confirmText="Eliminar"
        loading={loading}
      />
    </div>
  );
}

export default function Tables() {
  return (
    <ToastProvider>
      <TablesContent />
    </ToastProvider>
  );
}