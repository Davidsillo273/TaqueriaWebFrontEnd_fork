import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import FAIcon from '../components/commons/FAIcon'
import InventoryModal from '../components/inventory/InventoryModal'
import { useInventory } from '../hooks/useInventory'

export default function Inventory() {
    const [activeMenu] = useState('inventory')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedInsumo, setSelectedInsumo] = useState(null)

    const { insumos = [], loading, error, deleteInsumo, saveInsumo } = useInventory()

    const totalItems = insumos.length
    const alertasStock = insumos.filter(item => Number(item.quantity || 0) <= 10).length
    const valorEstimado = insumos.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0)

    const getStatusBadge = (status, qty) => {
        const cant = Number(qty || 0);
        const currentStatus = String(status || '').toLowerCase();

        if (currentStatus === 'agotado' || cant === 0) {
            return { text: 'AGOTADO', className: 'bg-red-50 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-max' }
        }
        if (currentStatus === 'en pedido') {
            return { text: 'EN PEDIDO', className: 'bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-max' }
        }
        if (cant <= 10) {
            return { text: 'LOW STOCK', className: 'bg-amber-50 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-max' }
        }
        return { text: 'DISPONIBLE', className: 'bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-max' }
    }

    const handleEdit = (insumo) => {
        setSelectedInsumo(insumo)
        setIsModalOpen(true)
    }

    const handleCreate = () => {
        setSelectedInsumo(null)
        setIsModalOpen(true)
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeMenu={activeMenu} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                <main className="flex-1 overflow-y-auto p-8">
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
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#AF101A] text-white text-xs font-bold rounded-lg border-0 hover:bg-red-800 cursor-pointer shadow-sm"
                            >
                                <FAIcon icon="plus" /> Nuevo Insumo
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2">
                            <FAIcon icon="exclamation-circle" /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-5 rounded-xl border-l-4 border-l-[#AF101A] border-y-gray-200 border-r-gray-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                    <FAIcon icon="box" size="lg" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Insumos</span>
                                    <span className="text-2xl font-black text-gray-800">{totalItems} items</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border-l-4 border-l-red-500 border-y-gray-200 border-r-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                                <FAIcon icon="exclamation-triangle" size="lg" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Alertas de Stock</span>
                                <span className="text-2xl font-black text-gray-800">{alertasStock} críticas</span>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border-l-4 border-l-gray-400 border-y-gray-200 border-r-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 border border-gray-100">
                                <FAIcon icon="money-bill-wave" size="lg" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Valor Estimado</span>
                                <span className="text-2xl font-black text-gray-800">${valorEstimado.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
                        <div className="p-5 flex justify-between items-center border-b border-gray-100">
                            <span className="text-sm font-bold text-gray-800">Listado de Materia Prima</span>
                        </div>

                        <div className="overflow-x-auto">
                            {loading && insumos.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Cargando insumos...</div>
                            ) : insumos.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">No hay insumos en el inventario. ¡Agrega uno nuevo!</div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="p-4 pl-6">Insumo</th>
                                            <th className="p-4">Categoría (Tipo)</th>
                                            <th className="p-4">Ubicación</th>
                                            <th className="p-4">Cantidad</th>
                                            <th className="p-4">Precio Unit.</th>
                                            <th className="p-4">Estado</th>
                                            <th className="p-4 pr-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {insumos.map((item) => {
                                            const badge = getStatusBadge(item.status, item.quantity);
                                            return (
                                                <tr key={item._id || item.id} className="hover:bg-gray-50/40 transition-colors">
                                                    <td className="p-4 pl-6 flex items-center gap-3 font-bold text-gray-900">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200/50 flex items-center justify-center text-gray-300">
                                                            <FAIcon icon="image" size="sm" />
                                                        </div>
                                                        {item.name}
                                                    </td>
                                                    <td className="p-4 text-gray-500 font-medium">{item.type || 'Insumo'}</td>
                                                    <td className="p-4 text-gray-400 text-xs font-medium">{item.ubication || 'No asignada'}</td>
                                                    <td className="p-4 font-bold text-gray-800">{item.quantity} units</td>
                                                    <td className="p-4 font-medium text-gray-600">${Number(item.price || 0).toFixed(2)}</td>
                                                    <td className="p-4">
                                                        <div className={badge.className}>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                            {badge.text}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 pr-6 text-right text-gray-400 space-x-3">
                                                        <button onClick={() => handleEdit(item)} className="bg-transparent border-0 text-gray-400 hover:text-gray-600 cursor-pointer"><FAIcon icon="edit" /></button>
                                                        <button onClick={() => deleteInsumo(item._id || item.id)} className="bg-transparent border-0 text-red-400 hover:text-red-600 cursor-pointer"><FAIcon icon="trash" /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <InventoryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                insumoData={selectedInsumo}
                onSave={saveInsumo}
            />
        </div>
    )
}