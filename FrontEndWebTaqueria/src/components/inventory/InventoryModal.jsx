import React from 'react'
import FAIcon from '../commons/FAIcon'

export default function InventoryModal({ isOpen, onClose }) {
    // Si no está abierto, no renderiza ni un solo píxel
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            {/* Cuadro blanco del modal con animación suave */}
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                
                {/* Cabecera Roja oficial de El Corral */}
                <div className="bg-[#AF101A] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-base m-0">Añadir Nuevo Insumo</h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer text-lg">
                        <FAIcon icon="times" />
                    </button>
                </div>

                {/* Formulario del inventario */}
                <div className="p-6 flex flex-col gap-4">
                    
                    {/* Campo: Nombre del insumo */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Nombre del Insumo</label>
                        <input 
                            type="text" 
                            placeholder="Carne para Hamburguesa" 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#AF101A]"
                        />
                    </div>

                    {/* Campo: Categoría */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Categoría</label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none">
                            <option>Carnes</option>
                            <option>Verduras</option>
                            <option>Lácteos</option>
                            <option>Panadería</option>
                        </select>
                    </div>

                    {/* Campo: Cantidad con sus botones de unidad (kg, und, litros) */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Cantidad</label>
                        <div className="flex items-center gap-2">
                            <select className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none">
                                <option>50</option>
                                <option>15</option>
                                <option>20</option>
                            </select>
                            
                            {/* Píldoras de unidades como se ve en tu imagen */}
                            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                                <span className="bg-red-50 text-[#AF101A] text-[10px] font-bold px-2 py-1 rounded">kg</span>
                                <span className="text-gray-400 text-[10px] font-bold px-2 py-1">und</span>
                                <span className="text-gray-400 text-[10px] font-bold px-2 py-1">litros</span>
                            </div>
                        </div>
                    </div>

                    {/* Campo: Estado */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Estado</label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none">
                            <option>En Stock</option>
                            <option>Low Stock</option>
                            <option>Out of Stock</option>
                        </select>
                    </div>

                    {/* Zona discontinua de subir foto (Clavadito a la imagen 4) */}
                    <div className="flex flex-col gap-1.5">
                        <div className="border-2 border-dashed border-red-200 rounded-xl bg-gray-50/50 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                            <FAIcon icon="camera" className="text-gray-400 text-lg" />
                            <span className="text-[#AF101A] text-xs font-bold">Cargar Foto</span>
                        </div>
                    </div>

                    {/* Botones de acción: Cancelar y Guardar */}
                    <div className="flex gap-3 mt-2">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl border-0 cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            className="flex-1 py-2.5 bg-[#AF101A] text-white font-bold text-sm rounded-xl border-0 cursor-pointer hover:bg-red-800 transition-colors"
                        >
                            Guardar
                        </button>
                    </div>

                </div>

            </div>
        </div>
    )
}