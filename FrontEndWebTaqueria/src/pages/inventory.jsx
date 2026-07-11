import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import FAIcon from '../components/commons/FAIcon'
import InventoryModal from '../components/inventory/InventoryModal'
import ConfirmModal from '../components/commons/ConfirmModal'
import { useInventory } from '../hooks/useInventory'
import { ToastProvider, useToast } from '../components/commons/ToastProvider'

function InventoryContent() {
  const [activeMenu] = useState('inventory')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedInsumo, setSelectedInsumo] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, insumoId: null })

  const { insumos = [], loading, error, deleteInsumo, saveInsumo } = useInventory()
  const { addToast } = useToast()

  // Cálculos de estadísticas
  const totalItems = insumos.length
  const alertasStock = insumos.filter(item => Number(item.quantity || 0) <= 10).length
  const valorEstimado = insumos.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0)

  // Función que determina el badge de estado según cantidad y status
  const getStatusBadge = (status, qty) => {
    const cant = Number(qty || 0)
    const currentStatus = String(status || '').toLowerCase()

    if (currentStatus === 'agotado' || cant === 0) {
      return {
        text: 'AGOTADO',
        className: 'bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1'
      }
    }
    if (currentStatus === 'en pedido') {
      return {
        text: 'EN PEDIDO',
        className: 'bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1'
      }
    }
    if (cant <= 10) {
      return {
        text: 'LOW STOCK',
        className: 'bg-yellow-50 text-yellow-600 text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1'
      }
    }
    return {
      text: 'DISPONIBLE',
      className: 'bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1'
    }
  }

  const handleEdit = (insumo) => {
    setSelectedInsumo(insumo)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedInsumo(null)
    setIsModalOpen(true)
  }

  const handleRequestDelete = (id) => {
    setConfirmDelete({ isOpen: true, insumoId: id })
  }

  const handleDeleteConfirm = async () => {
    const id = confirmDelete.insumoId
    if (!id) return
    try {
      const result = await deleteInsumo(id)
      if (result.success) {
        addToast('Insumo eliminado correctamente', 'success')
      } else {
        addToast(result.message || 'No se pudo eliminar el insumo', 'error')
      }
    } catch (err) {
      addToast(err.message || 'Error al eliminar', 'error')
    } finally {
      setConfirmDelete({ isOpen: false, insumoId: null })
    }
  }

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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  Control de Inventario
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Gestión centralizada de insumos y materia prima.
                </p>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base"
              >
                <FAIcon icon="plus" />
                Nuevo Insumo
              </button>
            </div>

            {/* Mensaje de error general */}
            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-100 text-red-700 rounded-lg font-medium text-sm flex items-center gap-2">
                <FAIcon icon="exclamation-circle" />
                {error}
              </div>
            )}

            {/* Sección de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-5 rounded-xl border-l-4 border-l-red-600 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                  <FAIcon icon="box" size="lg" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Total Insumos</span>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalItems} items</p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl border-l-4 border-l-red-600 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                  <FAIcon icon="exclamation-triangle" size="lg" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Alertas de Stock</span>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{alertasStock} críticas</p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl border-l-4 border-l-red-600 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                  <FAIcon icon="money-bill-wave" size="lg" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Valor Estimado</span>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${valorEstimado.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabla de Inventario */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 flex justify-between items-center border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Listado de Materia Prima</h2>
              </div>

              {loading && insumos.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></span>
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
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                      {insumos.map((item) => {
                        const badge = getStatusBadge(item.status, item.quantity)
                        return (
                          <tr key={item._id || item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                  <FAIcon icon="image" size="sm" />
                                </div>
                                <span className="font-bold text-gray-900">{item.name}</span>
                              </div>
                            </td>
                            <td className="p-3 sm:p-4 text-gray-600 font-medium">{item.type || 'Insumo'}</td>
                            <td className="p-3 sm:p-4 text-gray-500 text-xs">{item.ubication || 'No asignada'}</td>
                            <td className="p-3 sm:p-4 font-bold text-gray-800">{item.quantity} units</td>
                            <td className="p-3 sm:p-4 font-medium text-gray-600">
                              ${Number(item.price || 0).toFixed(2)}
                            </td>
                            <td className="p-3 sm:p-4">
                              <span className={badge.className}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {badge.text}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"
                              >
                                <FAIcon icon="edit" />
                              </button>
                              <button
                                onClick={() => handleRequestDelete(item._id || item.id)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 ml-1"
                              >
                                <FAIcon icon="trash" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de creación/edición */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedInsumo(null)
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
  )
}

export default function Inventory() {
  return (
    <ToastProvider>
      <InventoryContent />
    </ToastProvider>
  )
}