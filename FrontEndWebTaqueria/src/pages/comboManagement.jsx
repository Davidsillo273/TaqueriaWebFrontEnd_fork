import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import ComboCard from '../components/dashboard/ComboCard'
import ComboStats from '../components/dashboard/ComboStats'
import AddComboModal from '../components/dashboard/AddComboModal'
import ConfirmModal from '../components/commons/confirmModal'
import FAIcon from '../components/commons/FAIcon'
import { useCombos } from '../hooks/useCombos'
import { ToastProvider, useToast } from '../components/commons/ToastProvider.jsx'

function ComboManagementContent() {
  const [activeMenu] = useState('orders')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCombo, setSelectedCombo] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Estado para el modal de confirmación de eliminación
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, comboId: null })

  const { combos, loading, error, addCombo, updateCombo, deleteCombo } = useCombos()
  const { addToast } = useToast()

  const handleOpenAddModal = () => {
    setSelectedCombo(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (combo) => {
    setSelectedCombo(combo)
    setIsModalOpen(true)
  }

  const handleSaveCombo = async (formData, id) => {
    try {
      if (id) {
        await updateCombo(id, formData)
        addToast('Combo actualizado exitosamente', 'success')
      } else {
        await addCombo(formData)
        addToast('Combo creado exitosamente', 'success')
      }
      setIsModalOpen(false)
      setSelectedCombo(null)
    } catch (err) {
      addToast(err.message || 'Error al guardar el combo', 'error')
    }
  }

  // Abre el modal de confirmación en lugar de window.confirm
  const handleRequestDelete = (id) => {
    setConfirmDelete({ isOpen: true, comboId: id })
  }

  const handleDeleteCombo = async () => {
    const id = confirmDelete.comboId
    if (!id) return
    try {
      await deleteCombo(id)
      addToast('Combo eliminado correctamente', 'success')
    } catch (err) {
      addToast(err.message || 'Error al eliminar combo', 'error')
    } finally {
      setConfirmDelete({ isOpen: false, comboId: null })
    }
  }

  const formatComboForDisplay = (combo) => ({
    id: combo._id,
    image: combo.image || 'https://via.placeholder.com/300x200?text=Combo',
    title: combo.name || 'Sin nombre',
    price: `$${(combo.price || 0).toFixed(2)}`,
    description: combo.description || 'Sin descripción',
    isMostSold: false,
    isAvailable: combo.status === 'available',
  })

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
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
                  Gestión de combos
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Administra el menú de la taquería fusionando platillos y bebidas.
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base"
                disabled={loading}
              >
                <FAIcon icon="plus" />
                Nuevo combo
              </button>
            </div>

            {/* Error banner (adicional al toast) */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                <span>{error}</span>
              </div>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
              <ComboStats icon="list" title="TOTAL COMBOS" value={loading ? '...' : combos.length} label={`${combos.length} combos registrados`} highlighted={true} />
              <ComboStats icon="check-circle" title="COMBOS DISPONIBLES" value={loading ? '...' : combos.filter(c => c.status === 'available').length} label={`${combos.filter(c => c.status === 'available').length} combos disponibles`} highlighted={true} />
            </div>

            {/* Loader */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Cargando combos...</span>
              </div>
            )}

            {/* Grid de combos */}
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {combos.map((combo) => (
                  <ComboCard
                    key={combo._id}
                    {...formatComboForDisplay(combo)}
                    onEdit={() => handleOpenEditModal(combo)}
                    onDelete={() => handleRequestDelete(combo._id)}
                  />
                ))}
              </div>
            )}

            {/* Estado vacío */}
            {!loading && combos.length === 0 && !error && (
              <div className="text-center py-12">
                <FAIcon icon="inbox" size="3xl" className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-base sm:text-lg">No hay combos agregados</p>
                <p className="text-gray-400 text-xs sm:text-sm mb-4">Haz click en "Nuevo combo" para crear uno</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de agregar/editar combo */}
      <AddComboModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCombo(null); }}
        onSave={handleSaveCombo}
        loading={loading}
        comboToEdit={selectedCombo}
      />

      {/* Modal de confirmación de eliminación */}
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
  )
}

export default function ComboManagement() {
  return (
    <ToastProvider>
      <ComboManagementContent />
    </ToastProvider>
  )
}