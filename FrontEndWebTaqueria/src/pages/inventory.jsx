import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import FAIcon from '../components/commons/FAIcon'
import InventoryModal from '../components/inventory/InventoryModal' // Enganchamos el modal de arriba

export default function Inventory() {
    // Le avisa a tu Sidebar que pinte la opción 'inventory' de rojo
    const [activeMenu] = useState('inventory')
    
    // Abre y cierra tu modal de insumos
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Datos quemados de materia prima calcados de tu imagen 3
    const insumos = [
        { id: 1, nombre: 'Tomate Chonto', categoria: 'Verduras', cantidad: '15 kg', estado: 'LOW STOCK' },
        { id: 2, nombre: 'Carne de Res - Lomo', categoria: 'Carnes', cantidad: '45 kg', estado: 'IN STOCK' },
        { id: 3, nombre: 'Lechuga Crespa', categoria: 'Verduras', cantidad: '10 und', estado: 'OUT OF STOCK' },
        { id: 4, nombre: 'Queso Sabanero', categoria: 'Lácteos', cantidad: '20 kg', estado: 'IN STOCK' },
        { id: 5, nombre: 'Cebolla Blanca', categoria: 'Verduras', cantidad: '12 kg', estado: 'IN STOCK' }
    ]

    // Función rápida para los badges de estado de los materiales
    const getStockBadge = (estado) => {
        if (estado === 'IN STOCK') return 'bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-max'
        if (estado === 'LOW STOCK') return 'bg-amber-50 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-max'
        return 'bg-red-50 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-max' // Out of stock
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar original intacto */}
            <Sidebar activeMenu={activeMenu} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TopBar original intacto */}
                <TopBar />

                {/* Panel de control de inventario */}
                <main className="flex-1 overflow-y-auto p-8">
                    
                    {/* Títulos y los botones superiores de reportes e insumos */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Control de Inventario</h1>
                            <p className="text-gray-400 text-xs font-medium">Gestión centralizada de insumos y materia prima.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer shadow-sm">
                                <FAIcon icon="download" /> Descargar Reporte
                            </button>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#AF101A] text-white text-xs font-bold rounded-lg border-0 hover:bg-red-800 cursor-pointer shadow-sm"
                            >
                                <FAIcon icon="plus" /> Nuevo Insumo
                            </button>
                        </div>
                    </div>

                    {/* Las 3 tarjetas de métricas de inventario (Tomate, alertas y valor) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Tarjeta 1: Total items */}
                        <div className="bg-white p-5 rounded-xl border-l-4 border-l-[#AF101A] border-y-gray-200 border-r-gray-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                    <FAIcon icon="box" size="lg" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Insumos</span>
                                    <span className="text-2xl font-black text-gray-800">142 items</span>
                                </div>
                            </div>
                            <span className="text-[10px] bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded">+3%</span>
                        </div>

                        {/* Tarjeta 2: Alertas de Stock Críticas (Borde Rojo) */}
                        <div className="bg-white p-5 rounded-xl border-l-4 border-l-red-500 border-y-gray-200 border-r-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                                <FAIcon icon="exclamation-triangle" size="lg" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Alertas de Stock</span>
                                <span className="text-2xl font-black text-gray-800">8 críticas</span>
                            </div>
                        </div>

                        {/* Tarjeta 3: Valor Estimado */}
                        <div className="bg-white p-5 rounded-xl border-l-4 border-l-gray-400 border-y-gray-200 border-r-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 border border-gray-100">
                                <FAIcon icon="money-bill-wave" size="lg" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Valor Estimado</span>
                                <span className="text-2xl font-black text-gray-800">$12,450.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Contenedor blanco para la Tabla de Materiales */}
                    <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
                        
                        {/* Cabecera interna de la tabla: Título y Filtros */}
                        <div className="p-5 flex justify-between items-center border-b border-gray-100">
                            <span className="text-sm font-bold text-gray-800">Listado de Materia Prima</span>
                            <div className="flex gap-4 text-gray-400 cursor-pointer">
                                <FAIcon icon="filter" />
                                <FAIcon icon="sort-amount-down" />
                            </div>
                        </div>

                        {/* La Tabla de Datos */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="p-4 pl-6">Insumo</th>
                                        <th className="p-4">Categoría</th>
                                        <th className="p-4">Cantidad</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4 pr-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {insumos.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                                            {/* Insumo con su foto circular gris */}
                                            <td className="p-4 pl-6 flex items-center gap-3 font-bold text-gray-900">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200/50 flex items-center justify-center text-gray-300">
                                                    <FAIcon icon="image" size="sm" />
                                                </div>
                                                {item.nombre}
                                            </td>
                                            <td className="p-4 text-gray-500 font-medium">{item.categoria}</td>
                                            <td className="p-4 font-bold text-gray-800">{item.cantidad}</td>
                                            <td className="p-4">
                                                <div className={getStockBadge(item.estado)}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {item.estado}
                                                </div>
                                            </td>
                                            {/* Botoneras de acción rápidos */}
                                            <td className="p-4 pr-6 text-right text-gray-400 space-x-3">
                                                <button className="bg-transparent border-0 text-gray-400 hover:text-gray-600 cursor-pointer"><FAIcon icon="edit" /></button>
                                                <button className="bg-transparent border-0 text-red-400 hover:text-red-600 cursor-pointer"><FAIcon icon="trash" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginador oficial idéntico al pie de la tabla */}
                        <div className="p-4 bg-gray-50/30 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium">
                            <span>Mostrando 5 de 142 insumos registrados</span>
                            <div className="flex items-center gap-1">
                                <button className="w-6 h-6 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-400 cursor-pointer disabled:opacity-50" disabled><FAIcon icon="chevron-left" size="xs" /></button>
                                <button className="w-6 h-6 rounded bg-[#AF101A] text-white font-bold flex items-center justify-center border-0 cursor-pointer">1</button>
                                <button className="w-6 h-6 rounded border border-transparent bg-transparent text-gray-600 flex items-center justify-center cursor-pointer">2</button>
                                <button className="w-6 h-6 rounded border border-transparent bg-transparent text-gray-600 flex items-center justify-center cursor-pointer">3</button>
                                <span className="px-1">...</span>
                                <button className="w-6 h-6 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-600 cursor-pointer">29</button>
                                <button className="w-6 h-6 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-400 cursor-pointer"><FAIcon icon="chevron-right" size="xs" /></button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* Inyectamos el modal pasándole los controles de estado */}
            <InventoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}