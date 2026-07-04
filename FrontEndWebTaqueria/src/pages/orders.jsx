import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import FAIcon from '../components/commons/FAIcon'
import OrdersReady from '../components/orders/OrdersReady' 
import useOrders from '../hooks/useOrders' // Importo mi hook con el CRUD listo

export default function Orders() {
    const [activeMenu] = useState('orders-list')
    const [tabActiva, setTabActiva] = useState('pendientes')
    
    // Me traigo todas las herramientas del CRUD desde mi hook
    const { orders, loading, updateOrderStatus, deleteOrder } = useOrders()

    // Filtro los pedidos en base al estado real que viene de MongoDB
    const pendientes = orders.filter(o => o.status === 'pending' || o.status === 'cooking')
    const listos = orders.filter(o => o.status === 'ready')

    // Saco los contadores en caliente usando los datos del back
    const totalPedidosHoy = orders.length
    const ordenesEnCocina = orders.filter(o => o.status === 'cooking').length

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeMenu={activeMenu} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                <main className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-6">
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Pedidos</h1>
                                <p className="text-gray-400 text-xs font-medium">Monitorea y administra el flujo de órdenes en tiempo real.</p>
                            </div>
                            
                            {/* Switch dinámico usando el conteo real del backend */}
                            <div className="bg-gray-200/60 p-1 rounded-xl flex gap-1 border border-gray-200">
                                <button 
                                    onClick={() => setTabActiva('pendientes')}
                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border-0 cursor-pointer transition-colors ${tabActiva === 'pendientes' ? 'bg-white text-red-600 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    Pedidos Pendientes ({pendientes.length})
                                </button>
                                <button 
                                    onClick={() => setTabActiva('listos')}
                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border-0 cursor-pointer transition-colors ${tabActiva === 'listos' ? 'bg-white text-red-600 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    Pedidos Listos ({listos.length})
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-10 text-gray-500 font-bold">Jalando comandas del servidor...</div>
                        ) : tabActiva === 'listos' ? (
                            /* Le paso las funciones y los datos limpios al hijo de listos */
                            <OrdersReady ordenesListas={listos} alEntregar={updateOrderStatus} alBorrar={deleteOrder} />
                        ) : (
                            <div>
                                {/* Tarjetas rápidas automatizadas */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Total Pedidos Hoy</span>
                                        <div className="flex justify-between items-baseline"><span className="text-xl font-black text-gray-800">{totalPedidosHoy}</span></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Tiempo Promedio</span>
                                        <div className="flex justify-between items-baseline"><span className="text-xl font-black text-gray-800">14m 30s</span></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Órdenes en Cocina</span>
                                        <div className="flex justify-between items-baseline"><span className="text-xl font-black text-gray-800">{ordenesEnCocina}</span></div>
                                    </div>
                                </div>

                                <h3 className="text-sm font-black text-gray-800 mb-4 border-l-4 border-l-[#AF101A] pl-2 uppercase tracking-wide">Órdenes Prioritarias</h3>
                                
                                {/* Render real de los carritos pendientes */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {pendientes.map((p) => (
                                        <div key={p._id} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between min-h-[200px] relative">
                                            
                                            {/* Acción DELETE del CRUD: Borrar pedido */}
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm("¿De verdad querés cancelar esta comanda?")) {
                                                        deleteOrder(p._id)
                                                    }
                                                }}
                                                className="absolute top-4 right-4 text-gray-300 hover:text-red-600 bg-transparent border-0 cursor-pointer p-1 transition-colors"
                                                title="Cancelar Pedido"
                                            >
                                                <FAIcon icon="trash-alt" size="sm" />
                                            </button>

                                            <div>
                                                <div className="flex justify-between items-center mb-1 pr-6">
                                                    <span className="font-black text-sm text-gray-800">#{p._id.slice(-4).toUpperCase()}</span>
                                                    <span className="font-black text-sm text-gray-900">${Number(p.total).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-3">
                                                    {/* Usamos el objeto idCustomer del populate */}
                                                    <span><FAIcon icon="user" size="xs" /> {p.idCustomer?.name || 'Cliente'}</span>
                                                    <span className={p.status === 'cooking' ? 'text-orange-500 font-bold' : ''}><FAIcon icon="clock" size="xs" /> {p.status === 'cooking' ? 'Cocinando' : 'En cola'}</span>
                                                </div>
                                                
                                                {/* Mapeo anidado respetando estrictamente el array de details del backend */}
                                                <div className="flex flex-col gap-1 mb-4 text-xs">
                                                    {p.details?.map((detail, dIdx) => (
                                                        <div key={dIdx}>
                                                            {detail.combos?.map((comboItem, cIdx) => (
                                                                <div key={cIdx} className="flex justify-between py-1 border-b border-gray-50">
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

                                            {/* Acción UPDATE del CRUD: Cambiar estado */}
                                            <button 
                                                onClick={() => updateOrderStatus(p._id, p.status)}
                                                className="w-full py-2 bg-[#AF101A] hover:bg-red-800 text-white text-xs font-bold rounded-lg border-0 cursor-pointer flex items-center justify-center gap-2 transition-colors"
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

                    {/* Reportes rápidos estáticos */}
                    <div className="w-full lg:w-72 flex flex-col gap-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm">
                            <h3 className="text-sm font-black text-gray-800 mb-4">Resumen del Día</h3>
                            <div className="h-28 flex items-end justify-between gap-2 px-2 mb-4 border-b border-gray-100 pb-2">
                                <div className="w-full bg-gray-200 h-12 rounded-t"></div>
                                <div className="w-full bg-[#AF101A] h-24 rounded-t"></div>
                                <div className="w-full bg-gray-200 h-28 rounded-t"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1 mb-3">
                                <span>10am</span><span>4pm</span><span>Ahora</span>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    )
}