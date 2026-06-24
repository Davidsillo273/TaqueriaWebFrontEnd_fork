import React from 'react'
import FAIcon from '../commons/FAIcon'

export default function TableModal({ isOpen, onClose }) {
    // Si la pantalla principal dice que el modal está cerrado, no mostramos nada
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            {/* Contenedor del cuadrito blanco del modal */}
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                
                {/* Encabezado Rojo del Modal (Igual a tu imagen) */}
                <div className="bg-[#AF101A] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-base m-0">Añadir Nuevo Mesa</h3>
                    {/* Botón X para cerrar */}
                    <button onClick={onClose} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer text-lg">
                        <FAIcon icon="times" />
                    </button>
                </div>

                {/* Formulario/Cuerpo del modal */}
                <div className="p-6 flex flex-col gap-4">
                    
                    {/* Campo: Nombre de la mesa */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Nombre de la Mesas</label>
                        <input 
                            type="text" 
                            placeholder="Mesa 08" 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#AF101A]"
                        />
                    </div>

                    {/* Campo: Categoría/Estado */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Categoría</label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none">
                            <option>Disponible</option>
                            <option>Sirviendo</option>
                            <option>Reservada</option>
                            <option>Limpieza</option>
                        </select>
                    </div>

                    {/* Campo: Cantidad de personas */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Cantidad</label>
                        <div className="flex items-center gap-2">
                            <select className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none">
                                <option>1</option>
                                <option>2</option>
                                <option>4</option>
                                <option>6</option>
                                <option>8</option>
                            </select>
                            <span className="bg-red-50 text-[#AF101A] text-xs font-bold px-2.5 py-1.5 rounded-md">Pers</span>
                        </div>
                    </div>

                    {/* Campo: Tiempo/Asignar/Reserva/Limpieza (El selector raro de abajo) */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex gap-4 text-[11px] font-bold text-gray-500 uppercase px-1">
                            <span>Tiempo</span>
                            <span className="text-[#AF101A]">Asignar</span>
                            <span>Reserva</span>
                            <span>Limpieza</span>
                        </div>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none">
                            <option>lista</option>
                        </select>
                    </div>

                    {/* Botones de abajo: Cancelar y Guardar */}
                    <div className="flex gap-3 mt-4">
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