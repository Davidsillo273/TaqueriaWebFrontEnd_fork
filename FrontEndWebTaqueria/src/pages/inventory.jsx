// src/pages/Inventory.jsx
import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import ComboStats from '../components/dashboard/ComboStats';
import FAIcon from '../components/commons/FAIcon';
import InventoryModal from '../components/inventory/InventoryModal';
import ConfirmModal from '../components/commons/ConfirmModal';
import PaginationControls from '../components/commons/PaginationControls';
import MissingInfoBanner from '../components/commons/MissingInfoBanner';
import { useInventory } from '../hooks/useInventory';
import { usePagination } from '../hooks/usePagination';
import { useSettings } from '../hooks/useSettings';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';

function InventoryContent() {
  const [activeMenu] = useState('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, insumoId: null });

  const { insumos = [], loading, error, deleteInsumo, saveInsumo } = useInventory();
  const { settings } = useSettings();
  const { addToast } = useToast();
  const { page, totalPages, paginatedItems, goTo, next, prev } = usePagination(insumos, 6);

  const lowStockThreshold = settings.operation.lowStockThresholds?.inventory ?? 10;

  // Cálculos de estadísticas
  const totalItems = insumos.length;
  const alertasStock = insumos.filter(item => Number(item.quantity || 0) <= lowStockThreshold).length;
  const valorEstimado = insumos.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0);

  // Badge de estado según cantidad y status
  const getStatusBadge = (status, qty) => {
    const cant = Number(qty || 0);
    const currentStatus = String(status || '').toLowerCase();

    if (currentStatus === 'agotado' || cant === 0) {
      return {
        text: 'AGOTADO',
        className: 'bg-red-100 text-red-700 border border-red-200',
      };
    }
    if (currentStatus === 'en pedido') {
      return {
        text: 'EN PEDIDO',
        className: 'bg-blue-100 text-blue-700 border border-blue-200',
      };
    }
    if (cant <= lowStockThreshold) {
      return {
        text: 'LOW STOCK',
        className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      };
    }
    return {
      text: 'DISPONIBLE',
      className: 'bg-green-100 text-green-700 border border-green-200',
    };
  };

  const handleEdit = (insumo) => {
    setSelectedInsumo(insumo);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedInsumo(null);
    setIsModalOpen(true);
  };

  const handleRequestDelete = (id) => {
    setConfirmDelete({ isOpen: true, insumoId: id });
  };

  const handleDeleteConfirm = async () => {
    const id = confirmDelete.insumoId;
    if (!id) return;
    try {
      const result = await deleteInsumo(id);
      if (result.success) {
        addToast('Insumo eliminado correctamente', 'success');
      } else {
        addToast(result.message || 'No se pudo eliminar el insumo', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error al eliminar', 'error');
    } finally {
      setConfirmDelete({ isOpen: false, insumoId: null });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
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
                  Control de Inventario
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Gestión centralizada de insumos y materia prima.
                </p>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-display font-semibold text-sm
                  shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                  hover:bg-red-600 hover:shadow-[0_8px_20px_rgba(220,38,38,0.4)]
                  transition-all disabled:opacity-60"
                disabled={loading}
              >
                <FAIcon icon="plus" />
                Nuevo Insumo
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm shadow-sm flex items-center gap-2">
                <FAIcon icon="exclamation-circle" />
                {error}
              </div>
            )}

            {/* Aviso de insumos pendientes de completar (creados desde el builder de recetas) */}
            <MissingInfoBanner
              message="Hay insumos por terminar de agregar información"
              names={insumos.filter((i) => i.pending).map((i) => i.name)}
            />

            {/* Estadísticas (usando ComboStats, mismo diseño que en Combos) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <ComboStats
                icon="box"
                title="TOTAL INSUMOS"
                value={loading ? '...' : totalItems}
                label={`${totalItems} items registrados`}
                highlighted={true}
              />
              <ComboStats
                icon="exclamation-triangle"
                title="ALERTAS DE STOCK"
                value={loading ? '...' : alertasStock}
                label={alertasStock > 0 ? 'Stock crítico' : 'Todo en orden'}
                highlighted={true}
              />
              <ComboStats
                icon="money-bill-wave"
                title="VALOR ESTIMADO"
                value={loading ? '...' : `$${valorEstimado.toFixed(2)}`}
                label="Valor total del inventario"
                highlighted={true}
              />
            </div>

            {/* Tabla de Inventario con estilo clay */}
            <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 overflow-hidden">
              <div className="p-4 sm:p-5 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-lg font-display font-bold text-gray-900">Listado de Materia Prima</h2>
              </div>

              {loading && insumos.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></span>
                  Cargando insumos...
                </div>
              ) : insumos.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No hay insumos en el inventario. ¡Agrega uno nuevo!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="p-3 sm:p-4 pl-4 sm:pl-6">Insumo</th>
                        <th className="p-3 sm:p-4">Categoría</th>
                        <th className="p-3 sm:p-4">Ubicación</th>
                        <th className="p-3 sm:p-4">Cantidad</th>
                        <th className="p-3 sm:p-4">Precio Unit.</th>
                        <th className="p-3 sm:p-4">Estado</th>
                        <th className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {paginatedItems.map((item) => {
                        const badge = getStatusBadge(item.status, item.quantity);
                        return (
                          <tr key={item._id || item.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
                                  <FAIcon icon="image" size="sm" />
                                </div>
                                <span className="font-display font-semibold text-gray-900">{item.name}</span>
                                {item.pending && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold uppercase">
                                    Pendiente
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 sm:p-4 text-gray-600 font-medium">{item.type || 'Insumo'}</td>
                            <td className="p-3 sm:p-4 text-gray-500 text-xs">{item.ubication || 'No asignada'}</td>
                            <td className="p-3 sm:p-4 font-display font-semibold text-gray-800">{item.quantity} units</td>
                            <td className="p-3 sm:p-4 font-medium text-gray-600">
                              ${Number(item.price || 0).toFixed(2)}
                            </td>
                            <td className="p-3 sm:p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-display font-semibold ${badge.className}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                                {badge.text}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-gray-500 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                              >
                                <FAIcon icon="edit" />
                              </button>
                              <button
                                onClick={() => handleRequestDelete(item._id || item.id)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded-xl hover:bg-red-50 transition-colors ml-1"
                              >
                                <FAIcon icon="trash" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <PaginationControls page={page} totalPages={totalPages} onPrev={prev} onNext={next} onGoTo={goTo} />
          </div>
        </main>
      </div>

      {/* Modal de creación/edición */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInsumo(null);
        }}
        insumoData={selectedInsumo}
        onSave={saveInsumo}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, insumoId: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar insumo"
        message="¿Estás seguro de que deseas eliminar este insumo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={loading}
      />
    </div>
  );
}

export default function Inventory() {
  return (
    <ToastProvider>
      <InventoryContent />
    </ToastProvider>
  );
}