// src/pages/Drinks.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import ComboStats from '../components/dashboard/ComboStats'; // 👈 mismo componente que en Combos
import DrinkCard from '../components/drinks/DrinkCard';
import AddDrinkModal from '../components/drinks/AddDrinkModal';
import DrinkSetsPanel from '../components/drinks/DrinkSetsPanel';
import ConfirmModal from '../components/commons/ConfirmModal';
import PaginationControls from '../components/commons/PaginationControls';
import AttentionCenter from '../components/commons/AttentionCenter';
import FilterBar from '../components/commons/FilterBar';
import ViewDetailsModal from '../components/commons/ViewDetailsModal';
import DetailRow from '../components/commons/DetailRow';
import FAIcon from '../components/commons/FAIcon';
import useDrinks from '../hooks/useDrinks';
import { usePagination } from '../hooks/usePagination';
import { useSettings } from '../hooks/useSettings';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';
import { UNIT_LABELS } from '../constants/units';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'casa', label: 'De Casa' },
  { id: 'tercero', label: 'De Terceros' },
];

function DrinksContent() {
  const [activeMenu] = useState('drinks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [viewingDrink, setViewingDrink] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, drinkId: null });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bestSeller, setBestSeller] = useState(null);

  const { drinks, loading, error, addDrink, updateDrink, deleteDrink } = useDrinks();
  const { settings } = useSettings();
  const { addToast } = useToast();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/menu/drinks/best-sellers?limit=1`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setBestSeller(data[0] || null))
      .catch(() => setBestSeller(null));
  }, [drinks.length]);

  const subcategoryOptions = [...new Set(drinks.map((d) => d.subcategory).filter(Boolean))];

  const filteredDrinks = drinks.filter((d) =>
    (categoryFilter === 'all' || d.category === categoryFilter) &&
    (subcategoryFilter === 'all' || d.subcategory === subcategoryFilter) &&
    (statusFilter === 'all' || d.status === statusFilter)
  );

  const { page, totalPages, paginatedItems, goTo, next, prev } = usePagination(filteredDrinks, 6);

  const lowStockThreshold = settings.operation.lowStockThresholds?.drinks ?? 10;

  // Datos para las tres tarjetas de estadísticas
  const totalBebidas = filteredDrinks.length;
  const stockCritico = drinks.filter((d) => d.category === 'tercero' && d.stock < lowStockThreshold).length;
  const bebidaEstrella = bestSeller?.drink?.name || 'Sin datos aún';

  const handleOpenCreateModal = () => {
    setSelectedDrink(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (drink) => {
    setSelectedDrink(drink);
    setIsModalOpen(true);
  };

  const handleSaveDrink = async (formData) => {
    try {
      let success = false;
      if (selectedDrink) {
        success = await updateDrink(selectedDrink.id, formData);
        if (success) addToast('Bebida actualizada correctamente', 'success');
      } else {
        success = await addDrink(formData);
        if (success) addToast('Bebida creada correctamente', 'success');
      }
      if (success) {
        setIsModalOpen(false);
        setSelectedDrink(null);
      }
    } catch (err) {
      addToast(err.message || 'Error al guardar la bebida', 'error');
    }
  };

  const buildDrinkSections = (drink) => {
    const sections = [
      {
        title: 'Información general',
        content: (
          <div>
            <DetailRow label="Categoría" value={drink.category === 'casa' ? 'De casa' : 'De tercero'} />
            <DetailRow label="Subcategoría" value={drink.subcategory} />
            <DetailRow label="Precio" value={`$${parseFloat(drink.price).toFixed(2)}`} />
            <DetailRow label="Estado" value={drink.status} />
            {drink.category === 'tercero' && <DetailRow label="Stock" value={`${drink.stock} uds.`} />}
            {drink.description && (
              <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{drink.description}</p>
            )}
          </div>
        ),
      },
    ];

    if (drink.category === 'casa') {
      sections.push({
        title: 'Receta',
        content: (
          <div className="space-y-2">
            {(drink.recipe || []).length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">Sin ingredientes registrados</p>
            )}
            {(drink.recipe || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-white/80">
                <span className="text-sm text-gray-800">{item.name}</span>
                <span className="text-xs text-gray-500">{item.quantity} {UNIT_LABELS[item.unit] || item.unit}</span>
              </div>
            ))}
          </div>
        ),
      });
    }

    return sections;
  };

  const handleRequestDelete = (id) => {
    setConfirmDelete({ isOpen: true, drinkId: id });
  };

  const handleDeleteConfirm = async () => {
    const id = confirmDelete.drinkId;
    if (!id) return;
    try {
      await deleteDrink(id);
      addToast('Bebida eliminada correctamente', 'success');
    } catch (err) {
      addToast(err.message || 'Error al eliminar la bebida', 'error');
    } finally {
      setConfirmDelete({ isOpen: false, drinkId: null });
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
            {/* Encabezado (mismo estilo que Combos) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1 sm:mb-2">
                  Gestión de Bebidas
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Administra el catálogo de bebidas y su disponibilidad.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-display font-semibold text-sm
                  shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                  hover:bg-red-600 hover:shadow-[0_8px_20px_rgba(220,38,38,0.4)]
                  transition-all disabled:opacity-60"
                disabled={loading}
              >
                <FAIcon icon="plus" />
                Nueva Bebida
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm shadow-sm">
                {error}
              </div>
            )}

            {/* Bebidas sin imagen */}
            <AttentionCenter
              items={drinks.filter((d) => !d.image)}
              getKey={(d) => d.id}
              getTitle={(d) => d.title}
              getImage={(d) => d.image}
              getReason={() => 'Falta imagen'}
              onEdit={handleOpenEditModal}
            />

            <DrinkSetsPanel />

            <FilterBar
              filters={[
                {
                  label: 'Subcategoría',
                  value: subcategoryFilter,
                  onChange: setSubcategoryFilter,
                  options: [{ value: 'all', label: 'Todas las subcategorías' }, ...subcategoryOptions.map((s) => ({ value: s, label: s }))],
                },
                {
                  label: 'Estado',
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { value: 'all', label: 'Todos los estados' },
                    { value: 'disponible', label: 'Disponibles' },
                    { value: 'no disponible', label: 'No disponibles' },
                  ],
                },
              ]}
            />

            {/* 👇 Tres tarjetas de estadísticas con el MISMO diseño que en Combos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <ComboStats
                icon="wine-glass"
                title="TOTAL BEBIDAS"
                value={loading ? '...' : totalBebidas}
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
                icon="exclamation-triangle"
                title="STOCK CRÍTICO"
                value={loading ? '...' : stockCritico}
                label={stockCritico > 0 ? `Menos de ${lowStockThreshold} unidades` : 'Todo en orden'}
                highlighted={true}
              />
              <ComboStats
                icon="chart-line"
                title="BEBIDA ESTRELLA"
                value={loading ? '...' : bebidaEstrella}
                label="Bebida destacada"
                highlighted={true}
              />
            </div>

            {/* Loader */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <span className="ml-3 text-gray-600 font-medium">Cargando bebidas...</span>
              </div>
            )}

            {/* Grid de bebidas (sin contenedor extra) */}
            {!loading && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedItems.map((drink) => (
                    <DrinkCard
                      key={drink.id}
                      {...drink}
                      isMostSold={bestSeller?.drink?._id === drink.id}
                      onEdit={handleOpenEditModal}
                      onDelete={handleRequestDelete}
                      onView={setViewingDrink}
                    />
                  ))}
                </div>
                <PaginationControls page={page} totalPages={totalPages} onPrev={prev} onNext={next} onGoTo={goTo} />
              </>
            )}

            {/* Estado vacío */}
            {!loading && filteredDrinks.length === 0 && !error && (
              <div className="text-center py-12">
                <FAIcon icon="wine-glass" size="3x" className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-base sm:text-lg font-display font-semibold">
                  No hay bebidas {categoryFilter !== 'all' ? 'en esta categoría' : 'agregadas'}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mb-4">
                  Haz click en "Nueva Bebida" para crear una
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modales (conservan el diseño clay de siempre) */}
      <AddDrinkModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedDrink(null); }}
        onSave={handleSaveDrink}
        onEditExisting={(raw) => {
          const match = drinks.find((d) => d.id === raw._id);
          if (match) handleOpenEditModal(match);
          else addToast('No se encontró el registro existente, actualiza la página', 'error');
        }}
        editData={selectedDrink}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, drinkId: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar bebida"
        message="¿Estás seguro de eliminar esta bebida? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={loading}
      />

      <ViewDetailsModal
        key={viewingDrink?.id}
        isOpen={Boolean(viewingDrink)}
        onClose={() => setViewingDrink(null)}
        title={viewingDrink?.title}
        image={viewingDrink?.image}
        sections={viewingDrink ? buildDrinkSections(viewingDrink) : []}
      />
    </div>
  );
}

export default function Drinks() {
  return (
    <ToastProvider>
      <DrinksContent />
    </ToastProvider>
  );
}