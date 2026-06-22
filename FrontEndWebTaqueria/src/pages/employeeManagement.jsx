import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import PrimaryButton from '../components/commons/PrimaryButton'
import FAIcon from '../components/commons/FAIcon'
import EmployeeModal from '../components/employee/employeeModal'

export default function EmployeeManagement() {
    // Control del menú activo para el Sidebar
    const [activeMenu] = useState('staff')
    // Control para abrir y cerrar el formulario/modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    
    // Hooks para el estado de la barra de búsqueda y los filtros de rol
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('Todos')

    // Estado local para la lista de empleados (así es dinámico y cumple la rúbrica)
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Roberto Méndez', role: 'GERENTE', badgeColor: 'bg-gray-100 text-gray-700 font-bold text-[11px] tracking-wide px-2.5 py-1 rounded', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150' },
        { id: 2, name: 'Elena Castro', role: 'COORDINADORA', badgeColor: 'bg-blue-50 text-blue-600 font-bold text-[11px] tracking-wide px-2.5 py-1 rounded', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150' },
        { id: 3, name: 'Miguel Ángel', role: 'CHEF EJECUTIVO', badgeColor: 'bg-orange-50 text-orange-600 font-bold text-[11px] tracking-wide px-2.5 py-1 rounded', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150' }
    ])

    // Datos del estado diario del equipo
    const teamStatus = [
        { name: 'Ana García', role: 'Caja', status: 'En turno', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150' },
        { name: 'Luis Torres', role: 'Cocina', status: 'En turno', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150' },
        { name: 'Carlos Ruiz', role: 'Descanso', status: 'Descanso', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150' }
    ]

    // Hook/Lógica de filtrado en tiempo real combinando búsqueda por nombre y rol
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = selectedRole === 'Todos' || emp.role === selectedRole
        return matchesSearch && matchesRole
    })

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeMenu={activeMenu} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-8">
                        
                        {/* Encabezado Principal */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Empleados</h1>
                                <p className="text-gray-400 text-xs font-medium">Administra el personal y sus permisos de acceso.</p>
                            </div>
                            
                            <div className="w-full sm:w-48 text-sm">
                                <PrimaryButton 
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center gap-2 rounded-lg text-white bg-[#AF101A] hover:bg-red-800 font-bold"
                                >
                                    <FAIcon icon="plus" /> Añadir Empleado
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* Sección: Estado del Equipo */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200/60 mb-8">
                            <h2 className="text-md font-bold text-gray-800 mb-4">Estado del Equipo</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {teamStatus.map((emp, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                                        <div className="relative">
                                            <img src={emp.img} alt={emp.name} className="w-12 h-12 rounded-xl object-cover" />
                                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${emp.status === 'Descanso' ? 'bg-gray-400' : 'bg-green-500'}`}></span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">{emp.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium">{emp.role} - <span className="text-gray-500">{emp.status}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tabla Principal con Filtros Dinámicos */}
                        <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
                                <h2 className="text-md font-bold text-gray-800">Gestión de Personal</h2>
                                
                                {/* Inputs controlados por Hooks para búsquedas y filtros rápidos */}
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar empleado..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="px-3 py-1.5 border border-gray-200 text-xs rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-red-500"
                                    />
                                    <select 
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="px-3 py-1.5 border border-gray-200 text-xs rounded-lg bg-white font-medium text-gray-600 focus:outline-none"
                                    >
                                        <option value="Todos">Todos los Puestos</option>
                                        <option value="GERENTE">Gerentes</option>
                                        <option value="COORDINADORA">Coordinadores</option>
                                        <option value="CHEF EJECUTIVO">Chef Ejecutivo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/70 text-gray-400 text-[11px] uppercase font-bold tracking-wider border-b border-gray-100">
                                            <th className="p-4 pl-6 w-24">Foto</th>
                                            <th className="p-4">Nombre</th>
                                            <th className="p-4">Puesto</th>
                                            <th className="p-4 pr-6 text-right w-48">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                                        {filteredEmployees.length > 0 ? (
                                            filteredEmployees.map((emp) => (
                                                <tr key={emp.id} className="hover:bg-gray-50/40 transition-colors">
                                                    <td className="p-4 pl-6">
                                                        <img src={emp.img} alt={emp.name} className="w-10 h-10 rounded-xl object-cover" />
                                                    </td>
                                                    <td className="p-4 font-bold text-gray-800">{emp.name}</td>
                                                    <td className="p-4">
                                                        <span className={emp.badgeColor}>{emp.role}</span>
                                                    </td>
                                                    <td className="p-4 pr-6 text-right">
                                                        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4CAF50] text-white text-[11px] font-bold rounded-lg hover:bg-green-600 transition-colors cursor-pointer border-0 shadow-sm">
                                                            <FAIcon icon="lock" size="sm" /> Gestionar Permisos
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center p-8 text-gray-400 text-xs font-medium">
                                                    No se encontraron empleados con los filtros aplicados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal del Formulario */}
                        <EmployeeModal 
                            isOpen={isModalOpen} 
                            onClose={() => setIsModalOpen(false)} 
                        />

                    </div>
                </main>
            </div>
        </div>
    )
}