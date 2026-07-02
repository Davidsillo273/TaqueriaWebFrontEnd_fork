import React, { useState, useEffect } from 'react'
import FAIcon from '../commons/FAIcon'

export default function EmployeeModal({ isOpen, onClose, employeeData, onSave }) {
    if (!isOpen || !employeeData) return null

    const [permisos, setPermisos] = useState({
        menuPlatillos: false,
        combos: false,
        gestionMesas: false,
        inventario: false
    })

    useEffect(() => {
        const backendPerms = employeeData.permissions || []
        setPermisos({
            menuPlatillos: backendPerms.includes('menuPlatillos'),
            combos: backendPerms.includes('combos'),
            gestionMesas: backendPerms.includes('gestionMesas'),
            inventario: backendPerms.includes('inventario')
        })
    }, [employeeData, isOpen])

    const togglePermiso = (key) => {
        setPermisos(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const arrayPermisos = Object.keys(permisos).filter(key => permisos[key])

        // CORREGIDO: Enviamos un payload plano que machee con el req.body del Backend Controller
        const payload = {
            permissions: arrayPermisos,
            salary: employeeData.workInfo?.salary,
            type: employeeData.personalInfo?.type
        }

        const success = await onSave(employeeData._id || employeeData.id, payload)
        if (success) onClose()
    }

    const firstName = employeeData.personalInfo?.name || ''
    const lastName = employeeData.personalInfo?.lastname || ''
    const fullEmployeeName = `${firstName} ${lastName}`.trim()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                <div className="bg-[#AF101A] text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-md font-bold">Modificar Permisos Granulares</h2>
                    <button type="button" onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-0 text-xl">
                        <FAIcon icon="xmark" />
                    </button>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                    <p className="text-xs text-gray-500 font-bold">
                        Empleado: <span className="text-gray-800 font-black">{fullEmployeeName}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ajuste de privilegios de acceso</span>
                    </div>

                    <div className="space-y-2">
                        {/* Permiso: Menú y Platillos */}
                        <div className="flex justify-between items-center bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                            <div>
                                <h4 className="text-xs font-bold text-gray-800">Menú y Platillos</h4>
                                <p className="text-[10px] text-gray-400">Modificar la carta y recetas</p>
                            </div>
                            <button type="button" onClick={() => togglePermiso('menuPlatillos')} className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${permisos.menuPlatillos ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${permisos.menuPlatillos ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        {/* Permiso: Combos */}
                        <div className="flex justify-between items-center bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                            <div>
                                <h4 className="text-xs font-bold text-gray-800">Combos</h4>
                                <p className="text-[10px] text-gray-400">Gestión de paquetes promocionales</p>
                            </div>
                            <button type="button" onClick={() => togglePermiso('combos')} className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${permisos.combos ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${permisos.combos ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        {/* Permiso: Gestión de Mesas */}
                        <div className="flex justify-between items-center bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                            <div>
                                <h4 className="text-xs font-bold text-gray-800">Gestión de Mesas</h4>
                                <p className="text-[10px] text-gray-400">Mapeo y distribución de salones</p>
                            </div>
                            <button type="button" onClick={() => togglePermiso('gestionMesas')} className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${permisos.gestionMesas ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${permisos.gestionMesas ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        {/* Permiso: Inventario */}
                        <div className="flex justify-between items-center bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                            <div>
                                <h4 className="text-xs font-bold text-gray-800">Inventario</h4>
                                <p className="text-[10px] text-gray-400">Control de insumos de cocina</p>
                            </div>
                            <button type="button" onClick={() => togglePermiso('inventario')} className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${permisos.inventario ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${permisos.inventario ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer border-0 text-xs">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-[#AF101A] hover:bg-red-800 text-white font-bold rounded-xl transition-colors cursor-pointer border-0 text-xs">Aplicar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    )
}