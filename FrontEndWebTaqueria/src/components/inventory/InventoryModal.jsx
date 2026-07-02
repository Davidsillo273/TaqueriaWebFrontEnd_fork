import React, { useState, useEffect } from 'react'
import FAIcon from '../commons/FAIcon'

export default function InventoryModal({ isOpen, onClose, insumoData, onSave }) {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [ubication, setUbication] = useState('')
    const [type, setType] = useState('Carnes')
    const [quantity, setQuantity] = useState('')
    const [status, setStatus] = useState('Disponible')

    useEffect(() => {
        if (insumoData) {
            setName(insumoData.name || '')
            setPrice(insumoData.price || '')
            setUbication(insumoData.ubication || '')
            setType(insumoData.type || 'Carnes')
            setQuantity(insumoData.quantity || '')
            setStatus(insumoData.status || 'Disponible')
        } else {
            setName('')
            setPrice('')
            setUbication('')
            setType('Carnes')
            setQuantity('')
            setStatus('Disponible')
        }
    }, [insumoData, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const payload = { 
            name, 
            price: Number(price), 
            ubication, 
            type, 
            quantity: Number(quantity),
            status
        }
        
        const success = await onSave(payload, insumoData?._id || insumoData?.id)
        if (success) onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                
                <div className="bg-[#AF101A] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-base m-0">{insumoData ? 'Editar Insumo' : 'Añadir Nuevo Insumo'}</h3>
                    <button type="button" onClick={onClose} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer text-lg">
                        <FAIcon icon="times" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Nombre del Insumo</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Carne para Hamburguesa" 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#AF101A]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-700">Precio</label>
                            <input 
                                type="number" 
                                step="0.01"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00" 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-700">Cantidad</label>
                            <input 
                                type="number" 
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="0" 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Ubicación</label>
                        <input 
                            type="text" 
                            value={ubication}
                            onChange={(e) => setUbication(e.target.value)}
                            placeholder="Estante A - Nevera 2" 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-700">Tipo/Categoría</label>
                            <select 
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none"
                            >
                                <option>Carnes</option>
                                <option>Verduras</option>
                                <option>Lácteos</option>
                                <option>Panadería</option>
                                <option>Desechables</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-700">Estado del Insumo</label>
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none"
                            >
                                <option>Disponible</option>
                                <option>Agotado</option>
                                <option>En Pedido</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl border-0 cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2.5 bg-[#AF101A] text-white font-bold text-sm rounded-xl border-0 cursor-pointer hover:bg-red-800 transition-colors"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}