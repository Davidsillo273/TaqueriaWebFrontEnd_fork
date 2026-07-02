import React, { useState, useEffect } from 'react';
import FAIcon from '../commons/FAIcon';

export default function TableModal({ isOpen, onClose, onSave, currentTable }) {
    const [number, setNumber] = useState('');
    const [status, setStatus] = useState('Disponible');

    // Si le damos a editar, cargamos los datos de la mesa en los inputs
    useEffect(() => {
        if (currentTable) {
            setNumber(currentTable.number || '');
            setStatus(currentTable.status || 'Disponible');
        } else {
            setNumber('');
            setStatus('Disponible');
        }
    }, [currentTable, isOpen]);

    // Si la pantalla dice que está cerrado, no renderiza nada
    if (!isOpen) return null;

    // Cuando mandamos el formulario de la mesa
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!number) return alert("Por favor ingresa el número de mesa");
        
        // Pasamos los datos convirtiendo el número a entero para que no llore Mongoose
        onSave({
            number: Number(number),
            status
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                
                {/* Encabezado Rojo Chulo */}
                <div className="bg-[#AF101A] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-base m-0">
                        {currentTable ? 'Editar Mesa' : 'Añadir Nueva Mesa'}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer text-lg">
                        <FAIcon icon="times" />
                    </button>
                </div>

                {/* Formulario que conecta con los estados locales */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    
                    {/* Input para el Número de la mesa */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Número de la Mesa (ID numérico)</label>
                        <input 
                            type="number" 
                            placeholder="Ej: 8" 
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#AF101A]"
                            required
                        />
                    </div>

                    {/* Selector de Estado */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Estado de la Mesa</label>
                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none"
                        >
                            <option value="Disponible">Disponible</option>
                            <option value="Sirviendo">Sirviendo</option>
                            <option value="Reservada">Reservada</option>
                            <option value="En Limpieza">En Limpieza</option>
                        </select>
                    </div>

                    {/* Botones de acción del Modal */}
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
                </form>
            </div>
        </div>
    );
}