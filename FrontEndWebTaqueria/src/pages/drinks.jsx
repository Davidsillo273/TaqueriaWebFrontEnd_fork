import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import StatCard from '../components/dashboard/StatCard'
import DrinkCard from '../components/drinks/DrinkCard'
import AddDrinkModal from '../components/drinks/AddDrinkModal'
import ConfirmModal from '../components/commons/ConfirmModal'
import FAIcon from '../components/commons/FAIcon'
import useDrinks from '../hooks/useDrinks'
import { ToastProvider, useToast } from '../components/commons/ToastProvider'

function DrinksContent() {
  const [activeMenu] = useState('drinks')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, drinkId: null })

  const { drinks, loading, error, addDrink, updateDrink, deleteDrink } = useDrinks()
  const { addToast } = useToast()

  // Cálculos derivados de los datos
  const totalDrinksInCatalog = drinks.length
  const criticalStockCount = drinks.filter(drink => drink.stock < 10).length
  const currentMostSold = drinks.find(drink => drink.isMostSold)?.title || 'Ninguna'

  const handleOpenCreateModal = () => {
    setSelectedDrink(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (drink) => {
    setSelectedDrink(drink)
    setIsModalOpen(true)
  }

  const handleSaveDrink = async (formData) => {
    try {
      let success = false
      if (selectedDrink) {
        success = await updateDrink(selectedDrink.id, formData)
        if (success) addToast('Bebida actualizada correctamente', 'success')
      } else {
        success = await addDrink(formData)
        if (success) addToast('Bebida creada correctamente', 'success')
      }
      if (success) {
        setIsModalOpen(false)
        setSelectedDrink(null)
      }
    } catch (err) {
      addToast(err.message || 'Error al guardar la bebida', 'error')
    }
  }

  const handleRequestDelete = (id) => {
    setConfirmDelete({ isOpen: true, drinkId: id })
  }

  const handleDeleteConfirm = async () => {
    const id = confirmDelete.drinkId
    if (!id) return
    try {
      await deleteDrink(id)
      addToast('Bebida eliminada correctamente', 'success')
    } catch (err) {
      addToast(err.message || 'Error al eliminar la bebida', 'error')
    } finally {
      setConfirmDelete({ isOpen: false, drinkId: null })
    }
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
                  Categoría: Bebidas
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Gestión de inventario en tiempo real
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base shadow-md"
              >
                <FAIcon icon="plus" />
                Nueva Bebida
              </button>
            </div>

            {/* Estados de carga y error */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Sincronizando con el servidor...</span>
              </div>
            )}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {/* Sección de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                icon="wine-glass"
                title="Total de Bebidas"
                value={totalDrinksInCatalog.toString()}
                change="En catálogo"
              />
              <StatCard
                icon="exclamation-triangle"
                title="Stock Crítico"
                value={criticalStockCount.toString()}
                change="Menos de 10 uds"
                alert={criticalStockCount > 0}
              />
              <StatCard
                icon="chart-line"
                title="Más Vendida"
                value={currentMostSold}
                change="Destacado"
              />
            </div>

            {/* Catálogo de bebidas */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 min-h-[400px]">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Todas las Bebidas
              </h2>
              {!loading && drinks.length === 0 ? (
                <p className="text-gray-400 text-center py-12">
                  No hay bebidas registradas en este momento.
                </p>
              ) : (
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
            </div>
          </div>
        </main>
      </div>

      {/* Modal de creación/edición */}
      <AddDrinkModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedDrink(null); }}
        onSave={handleSaveDrink}
        editData={selectedDrink}
      />

      {/* Modal de confirmación para eliminar */}
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
  )
}

export default function Drinks() {
  return (
    <ToastProvider>
      <DrinksContent />
    </ToastProvider>
  )
}