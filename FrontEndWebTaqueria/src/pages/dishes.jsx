import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import DishCard from '../components/dishes/DishCard'
import AddDishModal from '../components/dishes/AddDishModal'
import ConfirmModal from '../components/commons/ConfirmModal'
import FAIcon from '../components/commons/FAIcon'
import useSaucers from '../hooks/useSaucers'
import { ToastProvider, useToast } from '../components/commons/ToastProvider'

function DishesContent() {
  const [activeMenu] = useState('dishes')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, dishId: null })

  const { saucers, loading, error, createSaucer, updateSaucer, deleteSaucer } = useSaucers()
  const { addToast } = useToast()

  // Cálculo de estadísticas basado en datos reales
  const totalDishes = saucers.length
  const outOfStockDishes = saucers.filter(dish => dish.status === 'AGOTADO' || dish.status === 'Inactivo').length

  const handleSaveDish = async (formData) => {
    try {
      let success = false
      if (editingDish) {
        success = await updateSaucer(editingDish._id, formData)
        if (success) addToast('Platillo actualizado exitosamente', 'success')
      } else {
        success = await createSaucer(formData)
        if (success) addToast('Platillo creado exitosamente', 'success')
      }

      if (success) {
        setIsModalOpen(false)
        setEditingDish(null)
      }
    } catch (err) {
      addToast(err.message || 'Error al guardar el platillo', 'error')
    }
  }

  const handleRequestDelete = (id) => {
    setConfirmDelete({ isOpen: true, dishId: id })
  }

  const handleDeleteConfirm = async () => {
    const id = confirmDelete.dishId
    if (!id) return
    try {
      const result = await deleteSaucer(id)
      if (result.success) {
        addToast('Platillo eliminado correctamente', 'success')
      } else {
        addToast(result.error || 'No se pudo eliminar el platillo', 'error')
      }
    } catch (err) {
      addToast(err.message || 'Error al eliminar', 'error')
    } finally {
      setConfirmDelete({ isOpen: false, dishId: null })
    }
  }

  const handleEditClick = (dish) => {
    setEditingDish(dish)
    setIsModalOpen(true)
  }

  const handleOpenNewModal = () => {
    setEditingDish(null)
    setIsModalOpen(true)
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Overlay para cerrar sidebar en móvil/tableta */}
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  GESTIÓN DE PLATILLOS
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Administra el menú de carnes y disponibilidad en tiempo real.
                </p>
              </div>
              <button
                onClick={handleOpenNewModal}
                className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base"
              >
                <FAIcon icon="plus" />
                Nuevo Platillo
              </button>
            </div>

            {/* Mensaje de error general */}
            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-100 text-red-700 rounded-lg font-medium text-sm">
                Error de conexión: {error}
              </div>
            )}

            {/* Sección de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg p-4 sm:p-6 border-l-4 border-red-600 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <FAIcon icon="utensils" size="2xl" className="text-red-600" />
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-2">TOTAL PLATILLOS</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {loading ? '...' : totalDishes}
                </h3>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 border-l-4 border-red-600 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <FAIcon icon="star" size="2xl" className="text-red-600" />
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-2">PLATO ESTRELLA</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Corte Tomahawk</h3>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 border-l-4 border-red-600 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <FAIcon icon="exclamation-triangle" size="2xl" className="text-red-600" />
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-2">PLATILLOS AGOTADOS</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-red-600">
                  {loading ? '...' : outOfStockDishes}
                </h3>
              </div>
            </div>

            {/* Catálogo de Platillos */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Todos los Platillos
              </h2>

              {loading ? (
                <div className="flex items-center gap-2 text-gray-500 py-4 text-sm">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></span>
                  Cargando menú desde el servidor...
                </div>
              ) : saucers.length === 0 ? (
                <p className="text-gray-500 py-4">No hay platillos registrados en el sistema.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {saucers.map((dish) => (
                    <DishCard
                      key={dish._id}
                      image={dish.image}
                      name={dish.name}
                      price={`$${parseFloat(dish.price).toFixed(2)}`}
                      status={dish.status}
                      onEdit={() => handleEditClick(dish)}
                      onDelete={() => handleRequestDelete(dish._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Agregar/Editar */}
      <AddDishModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDish(null); }}
        onSave={handleSaveDish}
        dishToEdit={editingDish}
      />

      {/* Modal de confirmación para eliminar */}
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
  )
}

export default function Dishes() {
  return (
    <ToastProvider>
      <DishesContent />
    </ToastProvider>
  )
}