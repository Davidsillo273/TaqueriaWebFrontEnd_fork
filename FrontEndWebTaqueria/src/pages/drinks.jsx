// src/pages/Drinks.jsx
import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import ComboStats from '../components/dashboard/ComboStats'; // 👈 mismo componente que en Combos
import DrinkCard from '../components/drinks/DrinkCard';
import AddDrinkModal from '../components/drinks/AddDrinkModal';
import ConfirmModal from '../components/commons/ConfirmModal';
import FAIcon from '../components/commons/FAIcon';
import useDrinks from '../hooks/useDrinks';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';

function DrinksContent() {
  const [activeMenu] = useState('drinks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, drinkId: null });

  const { drinks, loading, error, addDrink, updateDrink, deleteDrink } = useDrinks();
  const { addToast } = useToast();

  // Datos para las tres tarjetas de estadísticas
  const totalBebidas = drinks.length;
  const stockCritico = drinks.filter(drink => drink.stock < 10).length;
  const bebidaMasVendida = drinks.find(drink => drink.isMostSold)?.title || 'Ninguna';

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

            {/* 👇 Tres tarjetas de estadísticas con el MISMO diseño que en Combos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <ComboStats
                icon="wine-glass"
                title="TOTAL BEBIDAS"
                value={loading ? '...' : totalBebidas}
                label={`${totalBebidas} bebidas registradas`}
                highlighted={true}
              />
              <ComboStats
                icon="exclamation-triangle"
                title="STOCK CRÍTICO"
                value={loading ? '...' : stockCritico}
                label={stockCritico > 0 ? 'Menos de 10 unidades' : 'Todo en orden'}
                highlighted={true}
              />
              <ComboStats
                icon="chart-line"
                title="MÁS VENDIDA"
                value={loading ? '...' : bebidaMasVendida}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {drinks.map((drink) => (
                  <DrinkCard
                    key={drink.id}
                    {...drink}
                    onEdit={handleOpenEditModal}
                    onDelete={handleRequestDelete}
                  />
                ))}
              </div>
            )}

            {/* Estado vacío */}
            {!loading && drinks.length === 0 && !error && (
              <div className="text-center py-12">
                <FAIcon icon="wine-glass" size="3x" className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-base sm:text-lg font-display font-semibold">
                  No hay bebidas agregadas
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