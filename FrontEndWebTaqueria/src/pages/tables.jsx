import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import FAIcon from '../components/commons/FAIcon';
import TableModal from '../components/tables/TableModal';
import useTables from '../hooks/useTables';

export default function Tables() {
  const [activeMenu] = useState('tables');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const { tables, loading, error, createTable, updateTable, deleteTable } = useTables();

  // Estadísticas en tiempo real
  const totalMesas = tables.length;
  const mesasLibres = tables.filter(m => m.status === 'Disponible').length;
  const porcentajeOcupacion = totalMesas > 0 
    ? Math.round(((totalMesas - mesasLibres) / totalMesas) * 100) 
    : 0;

  // Clases para los badges de estado
  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Disponible':
        return 'bg-green-50 text-green-600 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded';
      case 'Sirviendo':
      case 'Ocupada':
        return 'bg-red-50 text-red-500 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded';
      case 'Reservada':
        return 'bg-orange-50 text-orange-500 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded';
      case 'En Limpieza':
        return 'bg-gray-100 text-gray-500 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded';
      default:
        return 'bg-gray-100 text-gray-500 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded';
    }
  };

  // Guardar mesa (crear o editar)
  const handleSaveTable = async (formData) => {
    let result;
    if (editingTable) {
      result = await updateTable(editingTable._id, formData);
    } else {
      result = await createTable(formData);
    }
    
    if (!result.success) {
      alert(result.message || 'Error al guardar la mesa');
      return;
    }
    
    setIsModalOpen(false);
    setEditingTable(null);
  };

  // Cambio rápido de estado
  const handleQuickAction = async (mesa) => {
    let nuevoEstado = mesa.status;
    
    if (mesa.status === 'Disponible') nuevoEstado = 'Sirviendo';
    else if (mesa.status === 'Sirviendo' || mesa.status === 'Ocupada') nuevoEstado = 'En Limpieza';
    else if (mesa.status === 'En Limpieza' || mesa.status === 'Reservada') nuevoEstado = 'Disponible';

    const result = await updateTable(mesa._id, { 
      number: mesa.number, 
      status: nuevoEstado 
    });
    
    if (!result.success) {
      alert(result.message || 'Error al cambiar estado');
    }
  };

  // Texto del botón de acción rápida
  const getActionText = (status) => {
    switch (status) {
      case 'Sirviendo':
      case 'Ocupada':
        return 'Liberar / Limpieza';
      case 'Disponible':
        return 'Asignar Mesa';
      case 'En Limpieza':
        return 'Finalizar Limpieza';
      case 'Reservada':
        return 'Registrar Ocupación';
      default:
        return 'Cambiar Estado';
    }
  };

  // Clase del botón de acción rápida
  const getActionButtonClass = (status) => {
    if (status === 'Sirviendo' || status === 'Ocupada') {
      return 'bg-[#AF101A] text-white hover:bg-red-800 border-0';
    }
    return 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeMenu={activeMenu} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Encabezado */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Mesas</h1>
              <p className="text-gray-400 text-xs font-medium">
                Monitoreo en tiempo real del área de comedor.
              </p>
            </div>
            <button 
              onClick={() => { setEditingTable(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#AF101A] text-white text-xs font-bold rounded-lg hover:bg-red-800 border-0 cursor-pointer transition-colors shadow-sm"
              disabled={loading}
            >
              <FAIcon icon="plus" /> Nueva Mesa
            </button>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF101A]"></div>
              <span className="ml-3 text-gray-600">Cargando mesas...</span>
            </div>
          ) : (
            <>
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border-l-4 border-l-[#AF101A] border-gray-200 shadow-sm">
                  <div className="text-gray-400 mb-2">
                    <FAIcon icon="utensils" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Total Mesas
                  </span>
                  <span className="text-3xl font-bold text-gray-800 block mt-1">
                    {totalMesas}
                  </span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm">
                  <div className="text-gray-400 mb-1">
                    <FAIcon icon="percentage" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Ocupación
                  </span>
                  <span className="text-3xl font-bold text-gray-800 block my-1">
                    {porcentajeOcupacion}%
                  </span>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="bg-[#AF101A] h-full transition-all duration-300" 
                      style={{ width: `${porcentajeOcupacion}%` }}
                    />
                  </div>
                  <span className="text-right text-[10px] text-gray-400 mt-1 block font-medium">
                    {totalMesas - mesasLibres} / {totalMesas}
                  </span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200/60 shadow-sm">
                  <div className="text-green-500 mb-2">
                    <FAIcon icon="check-circle" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Mesas Libres
                  </span>
                  <span className="text-3xl font-bold text-gray-800 block mt-1">
                    {mesasLibres}
                  </span>
                </div>
              </div>

              {/* Grid de mesas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                {tables.map((mesa) => (
                  <div 
                    key={mesa._id} 
                    className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between min-h-[170px] relative group hover:shadow-md transition-shadow"
                  >
                    {/* Botones de acción */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingTable(mesa); setIsModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar mesa"
                      >
                        <FAIcon icon="edit" size="sm" />
                      </button>
                      <button 
                        onClick={() => { 
                          if(confirm(`¿Eliminar Mesa ${mesa.number}?`)) {
                            deleteTable(mesa._id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar mesa"
                      >
                        <FAIcon icon="trash" size="sm" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                        <FAIcon icon="chair" className="text-gray-400" />
                        Mesa {String(mesa.number).padStart(2, '0')}
                      </div>
                      <span className={getBadgeClass(mesa.status)}>
                        {mesa.status}
                      </span>
                    </div>

                    <div className="mt-auto">
                      <button 
                        onClick={() => handleQuickAction(mesa)}
                        className={`w-full py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${getActionButtonClass(mesa.status)}`}
                      >
                        {getActionText(mesa.status)}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Botón para agregar mesa */}
                <div 
                  onClick={() => { setEditingTable(null); setIsModalOpen(true); }}
                  className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-5 min-h-[170px] hover:border-[#AF101A] hover:text-[#AF101A] cursor-pointer transition-colors"
                >
                  <FAIcon icon="plus-circle" size="lg" className="mb-2" />
                  <span className="text-xs font-bold">Agregar Mesa</span>
                </div>
              </div>
            </>
          )}

          {/* Leyenda de estados */}
          <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-wrap items-center gap-6">
            <span className="text-xs font-bold text-gray-800">ESTADOS:</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> 
              Disponible
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#AF101A]"></span> 
              Ocupada
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 
              Reservada
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> 
              Limpieza
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      <TableModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTable(null); }} 
        onSave={handleSaveTable}
        currentTable={editingTable}
      />
    </div>
  );
}