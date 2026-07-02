import React, { useState, useEffect } from 'react'
import FAIcon from '../commons/FAIcon'

export default function InventoryModal({ isOpen, onClose, insumoData, onSave }) {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [ubication, setUbication] = useState('')
    const [type, setType] = useState('Carnes')
    const [quantity, setQuantity] = useState('')
    const [status, setStatus] = useState('Disponible')
    const [localError, setLocalError] = useState('')

    useEffect(() => {
        setLocalError('');
        if (insumoData) {
            setName(insumoData.name || '')
            setPrice(insumoData.price !== undefined ? insumoData.price : '')
            setUbication(insumoData.ubication || '')
            setType(insumoData.type || 'Carnes')
            setQuantity(insumoData.quantity !== undefined ? insumoData.quantity : '')
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
        setLocalError('')

        // Validación frontend preventiva alineada al backend
        if (name.trim().length < 3) {
            setLocalError('El nombre debe tener al menos 3 caracteres.');
            return;
        }
        if (!ubication.trim()) {
            setLocalError('La ubicación es requerida por el sistema.');
            return;
        }

        const payload = { 
            name: name.trim(), 
            price: Number(price), 
            ubication: ubication.trim(), 
            type, 
            quantity: Number(quantity),
            status
        }
        
        const result = await onSave(payload, insumoData?._id || insumoData?.id)
        if (result.success) {
            onClose()
        } else {
            setLocalError(result.message || 'Error al guardar el insumo')
        }
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
                    
                    {localError && (
                        <div className="bg-red-50 text-red-600 text-xs font-semibold p-2.5 rounded-lg border border-red-100 text-center">
                            {localError}
                        </div>
                    )}

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
                                min="0"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00" 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#AF101A]"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-700">Cantidad</label>
                            <input 
                                type="number" 
                                min="0"
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="0" 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#AF101A]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Ubicación</label>
                        <input 
                            type="text" 
                            required
                            value={ubication}
                            onChange={(e) => setUbication(e.target.value)}
                            placeholder="Estante A - Nevera 2" 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#AF101A]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-700">Tipo/Categoría</label>
                            <select 
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:border-[#AF101A]"
                            >
                                <option value="Carnes">Carnes</option>
                                <option value="Verduras">Verduras</option>
                                <option value="Lácteos">Lácteos</option>
                                <option value="Panadería">Panadería</option>
                                <option value="Desechables">Desechables</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-700">Estado del Insumo</label>
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:border-[#AF101A]"
                            >
                                <option value="Disponible">Disponible</option>
                                <option value="Agotado">Agotado</option>
                                <option value="En Pedido">En Pedido</option>
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