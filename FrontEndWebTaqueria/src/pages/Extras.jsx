// src/pages/Extras.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import ComboStats from '../components/dashboard/ComboStats';
import ExtraCard from '../components/extras/ExtraCard';
import AddExtraModal from '../components/extras/AddExtraModal';
import ConfirmModal from '../components/commons/ConfirmModal';
import PaginationControls from '../components/commons/PaginationControls';
import AttentionCenter from '../components/commons/AttentionCenter';
import FilterBar from '../components/commons/FilterBar';
import ViewDetailsModal from '../components/commons/ViewDetailsModal';
import DetailRow from '../components/commons/DetailRow';
import FAIcon from '../components/commons/FAIcon';
import useExtras from '../hooks/useExtras';
import { usePagination } from '../hooks/usePagination';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';
import { UNIT_LABELS } from '../constants/units';

function ExtrasContent() {
  const [activeMenu] = useState('extras');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState(null);
  const [viewingExtra, setViewingExtra] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, extraId: null });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bestSeller, setBestSeller] = useState(null);

  const { extras, loading, error, addExtra, updateExtra, deleteExtra } = useExtras();
  const { addToast } = useToast();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/menu/extras/best-sellers?limit=1`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setBestSeller(data[0] || null))
      .catch(() => setBestSeller(null));
  }, [extras.length]);

  const categoryOptions = ['all', ...new Set(extras.map((e) => e.category).filter(Boolean))];
  const filteredExtras = extras.filter((e) =>
    (categoryFilter === 'all' || e.category === categoryFilter) &&
    (statusFilter === 'all' || e.status === statusFilter)
  );

  const { page, totalPages, paginatedItems, goTo, next, prev } = usePagination(filteredExtras, 6);

  // Datos para las tarjetas de estadísticas
  const totalExtras = filteredExtras.length;
  const lowInventoryCount = extras.filter(e => e.status === 'AGOTADO').length;
  const mostRequestedExtra = bestSeller?.extra?.name || 'Sin datos aún';

  const handleSave = async (formData) => {
    try {
      let result;
      if (editingExtra) {
        result = await updateExtra(editingExtra._id, formData);
        if (result.success) addToast('Extra actualizado exitosamente', 'success');
      } else {
        result = await addExtra(formData);
        if (result.success) addToast('Extra creado exitosamente', 'success');
      }

      if (result.success) {
        setIsModalOpen(false);
        setEditingExtra(null);
      } else {
        addToast(result.message || 'Error al guardar el extra', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error inesperado', 'error');
    }
  };

  const buildExtraSections = (extra) => [
    {
      title: 'Información general',
      content: (
        <div>
          <DetailRow label="Categoría" value={extra.category} />
          <DetailRow label="Precio" value={`$${parseFloat(extra.price).toFixed(2)}`} />
          <DetailRow label="Estado" value={extra.status} />
        </div>
      ),
    },
    {
      title: 'Ingredientes',
      content: (
        <div className="space-y-2">
          {(extra.ingredients || []).length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">Sin ingredientes registrados</p>
          )}
          {(extra.ingredients || []).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-white/80">
              <span className="text-sm text-gray-800">{item.ingredientId?.name || 'Insumo eliminado'}</span>
              <span className="text-xs text-gray-500">{item.quantity} {UNIT_LABELS[item.unit] || item.unit}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const handleRequestDelete = (extraId) => {
    setConfirmDelete({ isOpen: true, extraId });
  };

  const handleDeleteConfirm = async () => {
    const id = confirmDelete.extraId;
    if (!id) return;
    try {
      const result = await deleteExtra(id);
      if (result.success) {
        addToast('Extra eliminado correctamente', 'success');
      } else {
        addToast(result.message || 'No se pudo eliminar el extra', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error al eliminar', 'error');
    } finally {
      setConfirmDelete({ isOpen: false, extraId: null });
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
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1 sm:mb-2">
                  Gestión de extras
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Controla los acompañamientos extras disponibles en el menú.
                </p>
              </div>
              <button
                onClick={() => { setEditingExtra(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-display font-semibold text-sm
                  shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                  hover:bg-red-600 hover:shadow-[0_8px_20px_rgba(220,38,38,0.4)]
                  transition-all disabled:opacity-60"
                disabled={loading}
              >
                <FAIcon icon="plus" />
                Nuevo extra
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm shadow-sm">
                Error: {error}
              </div>
            )}

            {/* Extras sin imagen */}
            <AttentionCenter
              items={extras.filter((e) => !e.image)}
              getKey={(e) => e._id}
              getTitle={(e) => e.name}
              getImage={(e) => e.image}
              getReason={() => 'Falta imagen'}
              onEdit={(extra) => { setEditingExtra(extra); setIsModalOpen(true); }}
            />

            <FilterBar
              filters={[
                {
                  label: 'Estado',
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { value: 'all', label: 'Todos los estados' },
                    { value: 'DISPONIBLE', label: 'Disponibles' },
                    { value: 'AGOTADO', label: 'Agotados' },
                  ],
                },
              ]}
            />

            {/* Estadísticas (con ComboStats, mismo diseño que en Combos) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <ComboStats
                icon="box"
                title="TOTAL EXTRAS"
                value={loading ? '...' : totalExtras}
                label={
                  <span className="flex gap-1.5 flex-wrap mt-1">
                    {categoryOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCategoryFilter(c); }}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                          categoryFilter === c ? 'bg-red-500 text-white' : 'bg-white/60 text-gray-600 hover:bg-white'
                        }`}
                      >
                        {c === 'all' ? 'Todos' : c}
                      </button>
                    ))}
                  </span>
                }
                highlighted={true}
              />
              <ComboStats
                icon="star"
                title="EXTRA MÁS PEDIDO"
                value={mostRequestedExtra}
                label="Favorito de clientes"
                highlighted={true}
              />
              <ComboStats
                icon="exclamation-triangle"
                title="ALERTAS"
                value={loading ? '...' : lowInventoryCount}
                label={lowInventoryCount > 0 ? 'Extras agotados' : 'Todo en orden'}
                highlighted={true}
              />
            </div>

            {/* Loader */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <span className="ml-3 text-gray-600 font-medium">Cargando extras...</span>
              </div>
            )}

            {/* Grid de extras (sin contenedor blanco) */}
            {!loading && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {paginatedItems.map(extra => (
                    <ExtraCard
                      key={extra._id}
                      title={extra.name}
                      price={`$${extra.price}`}
                      image={extra.image}
                      status={extra.status}
                      onEdit={() => { setEditingExtra(extra); setIsModalOpen(true); }}
                      onDelete={() => handleRequestDelete(extra._id)}
                      onView={() => setViewingExtra(extra)}
                    />
                  ))}
                </div>
                <PaginationControls page={page} totalPages={totalPages} onPrev={prev} onNext={next} onGoTo={goTo} />
              </>
            )}

            {/* Estado vacío */}
            {!loading && filteredExtras.length === 0 && !error && (
              <div className="text-center py-12">
                <FAIcon icon="inbox" size="3x" className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-base sm:text-lg font-display font-semibold">
                  No hay extras disponibles
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mb-4">
                  Crea tu primer extra para empezar
                </p>
                <button
                  onClick={() => { setEditingExtra(null); setIsModalOpen(true); }}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-display font-semibold text-sm
                    shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                    hover:bg-red-600 transition-all"
                >
                  Crear extra
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <AddExtraModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingExtra(null); }}
        onAdd={handleSave}
        onEditExisting={(existing) => { setEditingExtra(existing); setIsModalOpen(true); }}
        editingExtra={editingExtra}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, extraId: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar extra"
        message="¿Estás seguro de que deseas eliminar este extra? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={loading}
      />

      <ViewDetailsModal
        key={viewingExtra?._id}
        isOpen={Boolean(viewingExtra)}
        onClose={() => setViewingExtra(null)}
        title={viewingExtra?.name}
        image={viewingExtra?.image}
        sections={viewingExtra ? buildExtraSections(viewingExtra) : []}
      />
    </div>
  );
}

export default function Extras() {
  return (
    <ToastProvider>
      <ExtrasContent />
    </ToastProvider>
  );
}