// src/pages/Combos.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import ComboCard from '../components/dashboard/ComboCard';
import ComboStats from '../components/dashboard/ComboStats';
import AddComboModal from '../components/dashboard/AddComboModal';
import ConfirmModal from '../components/commons/confirmModal';
import PaginationControls from '../components/commons/PaginationControls';
import MissingInfoBanner from '../components/commons/MissingInfoBanner';
import FAIcon from '../components/commons/FAIcon';
import { useCombos } from '../hooks/useCombos';
import { usePagination } from '../hooks/usePagination';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'familiar', label: 'Familiares' },
  { id: 'duo', label: 'Duos' },
  { id: 'individual', label: 'Individuales' },
];

function ComboManagementContent() {
  const [activeMenu] = useState('combos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, comboId: null });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bestSellers, setBestSellers] = useState([]);

  const { combos, loading, error, addCombo, updateCombo, deleteCombo } = useCombos();
  const { addToast } = useToast();

  useEffect(() => {
    fetch('http://localhost:4000/api/combos/best-sellers?limit=1', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then(setBestSellers)
      .catch(() => setBestSellers([]));
  }, [combos.length]);

  const filteredCombos = categoryFilter === 'all'
    ? combos
    : combos.filter((c) => c.category === categoryFilter);

  const { page, totalPages, paginatedItems, goTo, next, prev } = usePagination(filteredCombos, 6);

  const handleOpenAddModal = () => {
    setSelectedCombo(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (combo) => {
    setSelectedCombo(combo);
    setIsModalOpen(true);
  };

  const handleSaveCombo = async (formData, id) => {
    try {
      if (id) {
        await updateCombo(id, formData);
        addToast('Combo actualizado exitosamente', 'success');
      } else {
        await addCombo(formData);
        addToast('Combo creado exitosamente', 'success');
      }
      setIsModalOpen(false);
      setSelectedCombo(null);
    } catch (err) {
      addToast(err.message || 'Error al guardar el combo', 'error');
    }
  };

  const handleRequestDelete = (id) => {
    setConfirmDelete({ isOpen: true, comboId: id });
  };

  const handleDeleteCombo = async () => {
    const id = confirmDelete.comboId;
    if (!id) return;
    try {
      await deleteCombo(id);
      addToast('Combo eliminado correctamente', 'success');
    } catch (err) {
      addToast(err.message || 'Error al eliminar combo', 'error');
    } finally {
      setConfirmDelete({ isOpen: false, comboId: null });
    }
  };

  const formatComboForDisplay = (combo) => ({
    id: combo._id,
    image: combo.image || 'https://placehold.co/300x200/f3f0eb/9ca3af?text=Combo',
    title: combo.name || 'Sin nombre',
    price: `$${(combo.price || 0).toFixed(2)}`,
    description: combo.description || 'Sin descripción',
    isMostSold: bestSellers[0]?.combo?._id === combo._id,
    isAvailable: combo.status === 'disponible',
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeMenu={activeMenu}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1 sm:mb-2">
                  Gestión de combos
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Administra el menú de la taquería fusionando platillos y bebidas.
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-display font-semibold text-sm
                  shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                  hover:bg-red-600 hover:shadow-[0_8px_20px_rgba(220,38,38,0.4)]
                  transition-all disabled:opacity-60"
                disabled={loading}
              >
                <FAIcon icon="plus" />
                Nuevo combo
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-4 text-sm shadow-sm">
                <span>{error}</span>
              </div>
            )}

            {/* Aviso de combos sin imagen */}
            <MissingInfoBanner
              message="Hay combos faltantes de imágenes"
              names={combos.filter((c) => !c.image).map((c) => c.name)}
            />

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
              <ComboStats
                icon="list"
                title="TOTAL COMBOS"
                value={loading ? '...' : filteredCombos.length}
                label={
                  <span className="flex gap-1.5 flex-wrap mt-1">
                    {CATEGORY_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCategoryFilter(f.id); }}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                          categoryFilter === f.id ? 'bg-red-500 text-white' : 'bg-white/60 text-gray-600 hover:bg-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </span>
                }
                highlighted={true}
              />
              <ComboStats
                icon="check-circle"
                title="COMBOS DISPONIBLES"
                value={loading ? '...' : combos.filter(c => c.status === 'disponible').length}
                label={`${combos.filter(c => c.status === 'disponible').length} combos disponibles`}
                highlighted={true}
              />
              <ComboStats
                icon="star"
                title="COMBO ESTRELLA"
                value={loading ? '...' : (bestSellers[0]?.combo?.name || 'Sin datos aún')}
                label={bestSellers[0] ? `${bestSellers[0].totalSold} vendidos` : 'Aún no hay ventas registradas'}
                highlighted={true}
              />
            </div>

            {/* Loader */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <span className="ml-3 text-gray-600 font-medium">Cargando combos...</span>
              </div>
            )}

            {/* Grid de combos */}
            {!loading && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedItems.map((combo) => (
                    <ComboCard
                      key={combo._id}
                      {...formatComboForDisplay(combo)}
                      onEdit={() => handleOpenEditModal(combo)}
                      onDelete={() => handleRequestDelete(combo._id)}
                    />
                  ))}
                </div>
                <PaginationControls page={page} totalPages={totalPages} onPrev={prev} onNext={next} onGoTo={goTo} />
              </>
            )}

            {/* Estado vacío */}
            {!loading && filteredCombos.length === 0 && !error && (
              <div className="text-center py-12">
                <FAIcon icon="inbox" size="3x" className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-base sm:text-lg font-display font-semibold">
                  No hay combos {categoryFilter !== 'all' ? 'en esta categoría' : 'agregados'}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mb-4">
                  Haz click en "Nuevo combo" para crear uno
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modales (se mantienen igual) */}
      <AddComboModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCombo(null); }}
        onSave={handleSaveCombo}
        loading={loading}
        comboToEdit={selectedCombo}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, comboId: null })}
        onConfirm={handleDeleteCombo}
        title="Eliminar combo"
        message="¿Estás seguro de eliminar este combo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={loading}
      />
    </div>
  );
}

export default function ComboManagement() {
  return (
    <ToastProvider>
      <ComboManagementContent />
    </ToastProvider>
  );
}
