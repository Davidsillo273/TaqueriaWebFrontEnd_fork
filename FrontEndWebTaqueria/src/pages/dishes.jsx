// src/pages/Dishes.jsx
import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import ComboStats from '../components/dashboard/ComboStats'; 
import DishCard from '../components/dishes/DishCard';
import AddDishModal from '../components/dishes/AddDishModal';
import ConfirmModal from '../components/commons/ConfirmModal';
import FAIcon from '../components/commons/FAIcon';
import useSaucers from '../hooks/useSaucers';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';

function DishesContent() {
  const [activeMenu] = useState('dishes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, dishId: null });

  const { saucers, loading, error, createSaucer, updateSaucer, deleteSaucer } = useSaucers();
  const { addToast } = useToast();

  // Datos para las estadísticas
  const totalDishes = saucers.length;
  const outOfStockDishes = saucers.filter(dish => dish.status === 'AGOTADO' || dish.status === 'Inactivo').length;
  const platoEstrella = saucers.find(dish => dish.isMostSold)?.name || 'Ninguno';

  const handleSaveDish = async (formData) => {
    try {
      let success = false;
      if (editingDish) {
        success = await updateSaucer(editingDish._id, formData);
        if (success) addToast('Platillo actualizado exitosamente', 'success');
      } else {
        success = await createSaucer(formData);
        if (success) addToast('Platillo creado exitosamente', 'success');
      }
      if (success) {
        setIsModalOpen(false);
        setEditingDish(null);
      }
    } catch (err) {
      addToast(err.message || 'Error al guardar el platillo', 'error');
    }
  };

  const handleRequestDelete = (id) => {
    setConfirmDelete({ isOpen: true, dishId: id });
  };

  const handleDeleteConfirm = async () => {
    const id = confirmDelete.dishId;
    if (!id) return;
    try {
      const result = await deleteSaucer(id);
      if (result.success) {
        addToast('Platillo eliminado correctamente', 'success');
      } else {
        addToast(result.error || 'No se pudo eliminar el platillo', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error al eliminar', 'error');
    } finally {
      setConfirmDelete({ isOpen: false, dishId: null });
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
                  Gestión de Platillos
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Administra el menú de carnes y disponibilidad en tiempo real.
                </p>
              </div>
              <button
                onClick={() => { setEditingDish(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-display font-semibold text-sm
                  shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                  hover:bg-red-600 hover:shadow-[0_8px_20px_rgba(220,38,38,0.4)]
                  transition-all disabled:opacity-60"
                disabled={loading}
              >
                <FAIcon icon="plus" />
                Nuevo Platillo
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm shadow-sm">
                Error de conexión: {error}
              </div>
            )}

            {/* Estadísticas (mismo diseño que Combos y Bebidas) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <ComboStats
                icon="utensils"
                title="TOTAL PLATILLOS"
                value={loading ? '...' : totalDishes}
                label={`${totalDishes} platillos registrados`}
                highlighted={true}
              />
              <ComboStats
                icon="star"
                title="PLATO ESTRELLA"
                value={platoEstrella}
                label="Más vendido"
                highlighted={true}
              />
              <ComboStats
                icon="exclamation-triangle"
                title="PLATILLOS AGOTADOS"
                value={loading ? '...' : outOfStockDishes}
                label={outOfStockDishes > 0 ? 'Fuera de stock' : 'Todos disponibles'}
                highlighted={true}
              />
            </div>

            {/* Loader */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <span className="ml-3 text-gray-600 font-medium">Cargando platillos...</span>
              </div>
            )}

            {/* Grid de platillos (sin contenedor blanco) */}
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {saucers.map((dish) => (
                  <DishCard
                    key={dish._id}
                    image={dish.image}
                    name={dish.name}
                    price={`$${parseFloat(dish.price).toFixed(2)}`}
                    status={dish.status}
                    isMostSold={dish.isMostSold}
                    onEdit={() => { setEditingDish(dish); setIsModalOpen(true); }}
                    onDelete={() => handleRequestDelete(dish._id)}
                  />
                ))}
              </div>
            )}

            {/* Estado vacío */}
            {!loading && saucers.length === 0 && !error && (
              <div className="text-center py-12">
                <FAIcon icon="utensils" size="3x" className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-base sm:text-lg font-display font-semibold">
                  No hay platillos registrados
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mb-4">
                  Haz click en "Nuevo Platillo" para agregar uno
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <AddDishModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDish(null); }}
        onSave={handleSaveDish}
        dishToEdit={editingDish}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, dishId: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar platillo"
        message="¿Estás seguro de que deseas eliminar este platillo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={loading}
      />
    </div>
  );
}

export default function Dishes() {
  return (
    <ToastProvider>
      <DishesContent />
    </ToastProvider>
  );
}