import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import FAIcon from '../components/commons/FAIcon'
import OrdersReady from '../components/orders/OrdersReady' // El componente de listos que creamos arriba

export default function Orders() {
    // Setea 'orders-list' para que tu Sidebar pinte la pestaña de Pedidos
    const [activeMenu] = useState('orders-list')
    
    // Este estado controla cuál pestaña de arriba está activa: 'pendientes' o 'listos'
    const [tabActiva, setTabActiva] = useState('pendientes')

    // Tus pedidos prioritarios/pendientes de la imagen
    const pedidosPendientes = [
        { id: '#4582', cliente: 'Juan Pérez', total: '$45.500', tiempo: '16m ago (Retrasado)', retrasado: true, items: [{ n: '2x', name: 'Combo Rey', st: 'Terminado' }, { n: '1x', name: 'Limonada Cerezada', st: 'Pendiente', highlight: true }, { n: '1x', name: 'Papas Grandes', st: 'Terminado' }], btn: 'Marcar como Listo', iconBtn: 'check-circle' },
        { id: '#4583', cliente: 'Mesa 4', total: '$22.000', tiempo: '5m ago', items: [{ n: '1x', name: 'Corralita', st: 'Preparando' }, { n: '1x', name: 'Gaseosa', st: 'Terminado' }], btn: 'En Preparación', iconBtn: 'utensils', disabledBtn: true },
        { id: '#4580', cliente: 'Pedido (Jorge)', total: 'LISTO', tiempo: 'Esperando 2m', items: [], btn: 'Entregar a Repartidor', iconBtn: 'truck', bgBtn: 'bg-green-600 hover:bg-green-700', badge: 'LISTO', badgeColor: 'bg-green-50 text-green-600' },
        { id: '#4581', cliente: 'Para Llevar', total: 'LISTO', tiempo: '', items: [], btn: 'Entregar a Cliente', iconBtn: 'user-check', bgBtn: 'bg-gray-800 hover:bg-gray-900', badge: 'LISTO', badgeColor: 'bg-green-50 text-green-600' }
    ]

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeMenu={activeMenu} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                <main className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-6">
                    
                    {/* COLUMNA IZQUIERDA: Listado de órdenes y Filtros */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Pedidos</h1>
                                <p className="text-gray-400 text-xs font-medium">Monitorea y administra el flujo de órdenes en tiempo real.</p>
                            </div>
                            
                            {/* AQUÍ ESTÁ EL SWITCH MÁGICO DE LAS PESTAÑAS */}
                            <div className="bg-gray-200/60 p-1 rounded-xl flex gap-1 border border-gray-200">
                                <button 
                                    onClick={() => setTabActiva('pendientes')}
                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border-0 cursor-pointer transition-colors ${tabActiva === 'pendientes' ? 'bg-white text-red-600 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    Pedidos Pendientes (12)
                                </button>
                                <button 
                                    onClick={() => setTabActiva('listos')}
                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border-0 cursor-pointer transition-colors ${tabActiva === 'listos' ? 'bg-white text-red-600 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    Pedidos Listos (4)
                                </button>
                            </div>
                        </div>

                        {/* Muestra una lista o la otra dependiendo de cuál botón tocaste */}
                        {tabActiva === 'listos' ? (
                            <OrdersReady />
                        ) : (
                            <div>
                                {/* Tarjetas rápidas de arriba */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Total Pedidos Hoy</span>
                                        <div className="flex justify-between items-baseline"><span className="text-xl font-black text-gray-800">142</span><span className="text-[10px] bg-green-50 text-green-600 font-bold px-1 rounded">+15%</span></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Tiempo Promedio</span>
                                        <div className="flex justify-between items-baseline"><span className="text-xl font-black text-gray-800">14m 30s</span><span className="text-[10px] bg-red-50 text-red-600 font-bold px-1 rounded">-2m</span></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Órdenes en Cocina</span>
                                        <div className="flex justify-between items-baseline"><span className="text-xl font-black text-gray-800">8</span><span className="text-[10px] bg-gray-50 text-gray-500 font-bold px-1 rounded">Actual</span></div>
                                    </div>
                                </div>

                                <h3 className="text-sm font-black text-gray-800 mb-4 border-l-4 border-l-[#AF101A] pl-2 uppercase tracking-wide">Órdenes Prioritarias</h3>
                                
                                {/* Cuadrícula de pedidos pendientes */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {pedidosPendientes.map((p) => (
                                        <div key={p.id} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between min-h-[200px]">
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-black text-sm text-gray-800">{p.id}</span>
                                                    <span className="font-black text-sm text-gray-900">{p.total}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-3">
                                                    <span><FAIcon icon="user" size="xs" /> {p.cliente}</span>
                                                    <span className={p.retrasado ? 'text-red-500 font-bold' : ''}><FAIcon icon="clock" size="xs" /> {p.tiempo}</span>
                                                </div>
                                                <div className="flex flex-col gap-1 mb-4 text-xs">
                                                    {p.items.map((it, idx) => (
                                                        <div key={idx} className="flex justify-between py-1 border-b border-gray-50">
                                                            <span className={it.highlight ? 'text-red-600 font-black' : 'text-gray-700 font-medium'}>{it.n} {it.name}</span>
                                                            <span className={it.highlight ? 'text-red-500 font-bold bg-red-50 px-1.5 rounded text-[10px]' : 'text-gray-400'}>{it.st}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <button className={`w-full py-2 ${p.bgBtn || 'bg-[#AF101A] hover:bg-red-800'} text-white text-xs font-bold rounded-lg border-0 cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`} disabled={p.disabledBtn}>
                                                <FAIcon icon={p.iconBtn} /> {p.btn}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Reportes rápidos laterales */}
                    <div className="w-full lg:w-72 flex flex-col gap-6">
                        {/* Tarjeta de Resumen Diario y Gráfica fake de barras */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm">
                            <h3 className="text-sm font-black text-gray-800 mb-4">Resumen del Día</h3>
                            <div className="h-28 flex items-end justify-between gap-2 px-2 mb-4 border-b border-gray-100 pb-2">
                                <div className="w-full bg-gray-200 h-12 rounded-t"></div>
                                <div className="w-full bg-gray-200 h-20 rounded-t"></div>
                                <div className="w-full bg-[#AF101A] h-24 rounded-t"></div>
                                <div className="w-full bg-gray-200 h-16 rounded-t"></div>
                                <div className="w-full bg-gray-200 h-28 rounded-t"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1 mb-3">
                                <span>10am</span><span>1pm</span><span>4pm</span><span>Ahora</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-1">
                                <span className="text-gray-400 font-medium">Hora Pico Proyectada</span>
                                <span className="font-black text-gray-800">7:30 PM</span>
                            </div>
                        </div>

                        {/* Meseros más activos */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm flex flex-col gap-4">
                            <h3 className="text-sm font-black text-gray-800">Meseros más Activos</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-black">CM</div>
                                    <div className="flex flex-col"><span className="text-xs font-bold text-gray-800">Carlos M.</span><span className="text-[10px] text-gray-400">42 órdenes entregadas</span></div>
                                    <FAIcon icon="trending-up" className="text-green-500 text-xs ml-auto" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xs font-black">LR</div>
                                    <div className="flex flex-col"><span className="text-xs font-bold text-gray-800">Laura R.</span><span className="text-[10px] text-gray-400">38 órdenes entregadas</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xs font-black">AV</div>
                                    <div className="flex flex-col"><span className="text-xs font-bold text-gray-800">Andrés V.</span><span className="text-[10px] text-gray-400">25 órdenes entregadas</span></div>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-white border border-gray-200 text-gray-500 font-bold text-xs rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mt-2">Ver Reporte Detallado</button>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    )
}