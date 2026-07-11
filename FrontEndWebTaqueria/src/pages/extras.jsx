import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import ExtraCard from '../components/extras/ExtraCard'
import ExtraStats from '../components/extras/ExtraStats'
import AddExtraModal from '../components/extras/AddExtraModal'
import ConfirmModal from '../components/commons/ConfirmModal'
import FAIcon from '../components/commons/FAIcon'
import useExtras from '../hooks/useExtras'
import { ToastProvider, useToast } from '../components/commons/ToastProvider'

function ExtrasContent() {
  const [activeMenu] = useState('extras')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExtra, setEditingExtra] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, extraId: null })

  const { extras, loading, error, addExtra, updateExtra, deleteExtra } = useExtras()
  const { addToast } = useToast()

  // Cálculo de estadísticas
  const totalExtras = extras.length
  const lowInventoryCount = extras.filter(e => e.status === 'AGOTADO').length

  const handleAddOrUpdateExtra = async (formData) => {
    try {
      const cleanPrice = parseFloat(String(formData.price).replace(/[^0-9.]/g, ''))
      const payload = {
        name: formData.name,
        price: cleanPrice,
        status: formData.status
      }

      let result
      if (editingExtra) {
        result = await updateExtra(editingExtra._id, payload)
        if (result.success) addToast('Extra actualizado exitosamente', 'success')
      } else {
        result = await addExtra(payload)
        if (result.success) addToast('Extra creado exitosamente', 'success')
      }

      if (result.success) {
        setIsModalOpen(false)
        setEditingExtra(null)
      } else {
        addToast(result.message || 'Error al guardar el extra', 'error')
      }
    } catch (err) {
      addToast(err.message || 'Error inesperado', 'error')
    }
  }

  const handleEditExtra = (extra) => {
    setEditingExtra(extra)
    setIsModalOpen(true)
  }

  const handleRequestDelete = (extraId) => {
    setConfirmDelete({ isOpen: true, extraId })
  }

  const handleDeleteConfirm = async () => {
    const id = confirmDelete.extraId
    if (!id) return
    try {
      const result = await deleteExtra(id)
      if (result.success) {
        addToast('Extra eliminado correctamente', 'success')
      } else {
        addToast(result.message || 'No se pudo eliminar el extra', 'error')
      }
    } catch (err) {
      addToast(err.message || 'Error al eliminar', 'error')
    } finally {
      setConfirmDelete({ isOpen: false, extraId: null })
    }
  }

  const handleOpenNewModal = () => {
    setEditingExtra(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExtra(null)
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
                  Gestión de extras
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Controla los acompañamientos extras disponibles en el menú.
                </p>
              </div>
              <button
                onClick={handleOpenNewModal}
                className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base"
              >
                <FAIcon icon="plus" />
                Nuevo extra
              </button>
            </div>

            {/* Sección de Estadísticas */}
            <ExtraStats
              totalExtras={totalExtras}
              mostRequestedExtra={extras[0]?.name || 'N/A'}
              lowInventoryCount={lowInventoryCount}
            />

            {/* Mensajes de carga y error */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Cargando extras...</span>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-100 text-red-700 rounded-lg text-sm">
                Error: {error}
              </div>
            )}

            {/* Catálogo de Extras */}
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {extras.map(extra => (
                  <ExtraCard
                    key={extra._id}
                    title={extra.name}
                    price={`$${extra.price}`}
                    status={extra.status}
                    onEdit={() => handleEditExtra(extra)}
                    onDelete={() => handleRequestDelete(extra._id)}
                  />
                ))}
              </div>
            )}

            {/* Estado vacío */}
            {!loading && extras.length === 0 && !error && (
              <div className="text-center py-12">
                <FAIcon icon="inbox" size="3xl" className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay extras disponibles</h3>
                <p className="text-gray-500 mb-6">Crea tu primer extra para empezar</p>
                <button
                  onClick={handleOpenNewModal}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Crear extra
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de creación/edición */}
      <AddExtraModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddOrUpdateExtra}
        editingExtra={editingExtra}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, extraId: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar extra"
        message="¿Estás seguro de que deseas eliminar este extra? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={loading}
      />
    </div>
  )
}

export default function Extras() {
  return (
    <ToastProvider>
      <ExtrasContent />
    </ToastProvider>
  )
}