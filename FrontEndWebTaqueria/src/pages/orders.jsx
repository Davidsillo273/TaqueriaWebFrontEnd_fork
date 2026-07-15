import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import ComboStats from '../components/dashboard/ComboStats'
import FAIcon from '../components/commons/FAIcon'
import OrdersReady from '../components/orders/OrdersReady'
import ConfirmModal from '../components/commons/ConfirmModal'
import useOrders from '../hooks/useOrders'
import { ToastProvider, useToast } from '../components/commons/ToastProvider'

function OrdersContent() {
  const [activeMenu] = useState('orders-list')
  const [tabActiva, setTabActiva] = useState('pendientes')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, orderId: null })

  const { orders, loading, updateOrderStatus, deleteOrder } = useOrders()
  const { addToast } = useToast()

  const pendientes = orders.filter(o => o.status === 'pending' || o.status === 'cooking')
  const listos = orders.filter(o => o.status === 'ready')

  const totalPedidosHoy = orders.length
  const ordenesEnCocina = orders.filter(o => o.status === 'cooking').length

  const handleRequestDelete = (id) => {
    setConfirmDelete({ isOpen: true, orderId: id })
  }

  const handleDeleteConfirm = async () => {
    const id = confirmDelete.orderId
    if (!id) return
    try {
      await deleteOrder(id)
      addToast('Pedido eliminado correctamente', 'success')
    } catch (err) {
      addToast('Error al eliminar el pedido', 'error')
    } finally {
      setConfirmDelete({ isOpen: false, orderId: null })
    }
  }

  const handleUpdateStatus = async (id, currentStatus) => {
    try {
      await updateOrderStatus(id, currentStatus)
      const newStatus = currentStatus === 'pending' ? 'cooking' : currentStatus === 'cooking' ? 'ready' : 'delivered'
      addToast(`Pedido ${id.slice(-4).toUpperCase()} → ${newStatus}`, 'success')
    } catch (err) {
      addToast('Error al actualizar el pedido', 'error')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar activeMenu={activeMenu} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {/* Encabezado y tabs */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1">Gestión de Pedidos</h1>
                  <p className="text-sm sm:text-base text-gray-600">Monitorea y administra el flujo de órdenes en tiempo real.</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-1 rounded-2xl flex gap-1 border border-white/80 shadow-sm">
                  <button
                    onClick={() => setTabActiva('pendientes')}
                    className={`px-4 py-2 text-xs font-display font-bold rounded-xl transition-all ${
                      tabActiva === 'pendientes'
                        ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3),inset_1px_1px_2px_rgba(255,255,255,0.3)]'
                        : 'bg-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Pendientes ({pendientes.length})
                  </button>
                  <button
                    onClick={() => setTabActiva('listos')}
                    className={`px-4 py-2 text-xs font-display font-bold rounded-xl transition-all ${
                      tabActiva === 'listos'
                        ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3),inset_1px_1px_2px_rgba(255,255,255,0.3)]'
                        : 'bg-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Listos ({listos.length})
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-10 text-gray-500 font-medium">Cargando pedidos...</div>
              ) : tabActiva === 'listos' ? (
                <OrdersReady
                  ordenesListas={listos}
                  alEntregar={handleUpdateStatus}
                  onDeleteRequest={handleRequestDelete}
                />
              ) : (
                <div>
                  {/* Tarjetas de estadísticas con ComboStats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
                    <ComboStats
                      icon="list"
                      title="TOTAL PEDIDOS HOY"
                      value={totalPedidosHoy}
                      label={`${totalPedidosHoy} órdenes registradas`}
                      highlighted={true}
                    />
                    <ComboStats
                      icon="clock"
                      title="TIEMPO PROMEDIO"
                      value="14m 30s"
                      label="Tiempo de preparación"
                      highlighted={true}
                    />
                    <ComboStats
                      icon="utensils"
                      title="EN COCINA"
                      value={ordenesEnCocina}
                      label={`${ordenesEnCocina} órdenes preparándose`}
                      highlighted={true}
                    />
                  </div>

                  <h3 className="text-lg font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                    Órdenes Prioritarias
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {pendientes.map((p) => (
                      <div key={p._id} className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 flex flex-col justify-between min-h-[200px] relative hover:scale-[1.01] transition-transform">
                        <button
                          onClick={() => handleRequestDelete(p._id)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 transition-colors"
                          title="Cancelar Pedido"
                        >
                          <FAIcon icon="trash-alt" size="sm" />
                        </button>

                        <div>
                          <div className="flex justify-between items-center mb-1 pr-6">
                            <span className="font-display font-bold text-sm text-gray-900">#{p._id.slice(-4).toUpperCase()}</span>
                            <span className="font-display font-bold text-sm text-gray-900">${Number(p.total).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 font-medium mb-3">
                            <span><FAIcon icon="user" size="xs" /> {p.idCustomer?.name || 'Cliente'}</span>
                            <span className={p.status === 'cooking' ? 'text-orange-600 font-bold' : ''}>
                              <FAIcon icon="clock" size="xs" /> {p.status === 'cooking' ? 'Cocinando' : 'En cola'}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1 mb-4 text-xs">
                            {p.details?.map((detail, dIdx) => (
                              <div key={dIdx}>
                                {detail.combos?.map((comboItem, cIdx) => (
                                  <div key={cIdx} className="flex justify-between py-1 border-b border-gray-100">
                                    <span className="text-gray-700 font-medium">
                                      {comboItem.quantity}x {comboItem.comboId?.name || 'Combo'}
                                    </span>
                                    <span className="text-gray-400">
                                      {p.status === 'cooking' ? 'En parrilla' : 'Pendiente'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleUpdateStatus(p._id, p.status)}
                          className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-display font-semibold rounded-xl flex items-center justify-center gap-2 transition-all
                            shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                            active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]
                          "
                        >
                          <FAIcon icon={p.status === 'pending' ? 'utensils' : 'check-circle'} />
                          {p.status === 'pending' ? 'Mandar a Cocina' : 'Marcar como Listo'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Panel lateral de resumen con estilo clay */}
            <div className="w-full lg:w-72 flex flex-col gap-6 mt-6 lg:mt-0">
              <div className="bg-white rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80">
                <h3 className="text-sm font-display font-bold text-gray-800 mb-4">Resumen del Día</h3>
                <div className="h-28 flex items-end justify-between gap-2 px-2 mb-4 border-b border-gray-100 pb-2">
                  <div className="w-full bg-gray-200 h-12 rounded-t-xl"></div>
                  <div className="w-full bg-red-500 h-24 rounded-t-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]"></div>
                  <div className="w-full bg-gray-200 h-28 rounded-t-xl"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-display font-bold px-1 mb-3">
                  <span>10am</span><span>4pm</span><span>Ahora</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, orderId: null })}
        onConfirm={handleDeleteConfirm}
        title="Cancelar pedido"
        message="¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={loading}
      />
    </div>
  )
}

export default function Orders() {
  return (
    <ToastProvider>
      <OrdersContent />
    </ToastProvider>
  )
}