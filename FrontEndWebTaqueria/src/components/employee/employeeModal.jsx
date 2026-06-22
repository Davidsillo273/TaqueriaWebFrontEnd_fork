import React, { useState } from 'react'
import FAIcon from '../commons/FAIcon'

export default function EmployeeModal({ isOpen, onClose }) {
    // Si no está abierto no renderiza nada en pantalla
    if (!isOpen) return null

    // Estados para controlar los campos del formulario de empleados
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [puesto, setPuesto] = useState('Mesero')
    const [turno, setTurno] = useState('Mañana (AM)')

    // Estados para los permisos del sistema tal como pide el figma
    const [permisos, setPermisos] = useState({
        menuPlatillos: true,
        combos: false,
        gestionMesas: false,
        inventario: false
    })

    // Función para alternar el estado de cada switch de permisos
    const togglePermiso = (key) => {
        setPermisos(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    // Manejador del submit del formulario
    const handleSubmit = (e) => {
        e.preventDefault()
        // Aquí se conectará con el backend después, por ahora simula el guardado
        console.log('Guardando empleado:', { nombre, email, puesto, turno, permisos })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Encabezado del modal con el color institucional de El Corral */}
                <div className="bg-[#AF101A] text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Registrar Nuevo Empleado</h2>
                    <button 
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-0 text-xl"
                    >
                        <FAIcon icon="xmark" />
                    </button>
                </div>

                {/* Formulario de registro */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Campo de Nombre */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Del Empleado</label>
                        <input 
                            type="text"
                            placeholder="Juan Perez...."
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-red-500 text-gray-800"
                            required
                        />
                    </div>

                    {/* Campo de Correo Electrónico */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                        <input 
                            type="email"
                            placeholder="usuario@elcorral.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-red-500 text-gray-800"
                            required
                        />
                    </div>

                    {/* Fila doble: Puesto y Turno */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Puesto</label>
                            <select 
                                value={puesto}
                                onChange={(e) => setPuesto(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-700 focus:outline-none"
                            >
                                <option value="Mesero">Mesero</option>
                                <option value="Gerente">Gerente</option>
                                <option value="Coordinador">Coordinador</option>
                                <option value="Chef Ejecutivo">Chef Ejecutivo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Turno</label>
                            <select 
                                value={turno}
                                onChange={(e) => setTurno(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-700 focus:outline-none"
                            >
                                <option value="Mañana (AM)">Mañana (AM)</option>
                                <option value="Tarde (PM)">Tarde (PM)</option>
                                <option value="Completo">Completo</option>
                            </select>
                        </div>
                    </div>

                    {/* Subtítulo central de Permisos de Sistema */}
                    <div className="text-center pt-2">
                        <span className="text-xs font-black text-[#AF101A] uppercase tracking-wider">Permisos de Sistema</span>
                    </div>

                    {/* Listado de interruptores / switches */}
                    <div className="space-y-2">
                        
                        {/* Permiso: Menú y Platillos */}
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div>
                                <h4 className="text-xs font-bold text-gray-800">Menú y Platillos</h4>
                                <p className="text-[10px] text-gray-400">Agregar/Quitar</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => togglePermiso('menuPlatillos')}
                                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${permisos.menuPlatillos ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${permisos.menuPlatillos ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        {/* Permiso: Combos */}
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div>
                                <h4 className="text-xs font-bold text-gray-800">Combos</h4>
                                <p className="text-[10px] text-gray-400">Crear/Eliminar</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => togglePermiso('combos')}
                                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${permisos.combos ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${permisos.combos ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        {/* Permiso: Gestión de Mesas */}
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div>
                                <h4 className="text-xs font-bold text-gray-800">Gestión de Mesas</h4>
                                <p className="text-[10px] text-gray-400">Mapeo de sala</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => togglePermiso('gestionMesas')}
                                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${permisos.gestionMesas ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${permisos.gestionMesas ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        {/* Permiso: Inventario */}
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div>
                                <h4 className="text-xs font-bold text-gray-800">Inventario</h4>
                                <p className="text-[10px] text-gray-400">Editar insumos</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => togglePermiso('inventario')}
                                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${permisos.inventario ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${permisos.inventario ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                    </div>

                    {/* Botones de Acción del Formulario */}
                    <div className="flex gap-4 pt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer border-0 text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2 bg-[#AF101A] hover:bg-red-800 text-white font-bold rounded-xl transition-colors cursor-pointer border-0 text-sm"
                        >
                            Guardar
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}