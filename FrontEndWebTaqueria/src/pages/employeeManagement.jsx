import React, { useState, useMemo } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import FAIcon from '../components/commons/FAIcon'
import EmployeeModal from '../components/employee/employeeModal'
import { useEmployees } from '../hooks/useEmployees'

export default function EmployeeManagement() {
    const [activeMenu] = useState('staff')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('Todos')

    const { employees = [], loading, updateEmployee } = useEmployees()

    // Estructura de respaldo basada exactamente en el modelo de Mongoose
    const localFallback = useMemo(() => [
        { 
            _id: '64f1a2b3c4d5e6f7a8b9c001', 
            personalInfo: { name: 'Elena', lastname: 'Pérez', DUI_NIT: '00000000-0', address: 'San Salvador', phone: '7000-0000', type: 'manager', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150' }, 
            loginInfo: { email: 'elena.perez@syscor.com', isVerified: true }, 
            workInfo: { salary: 365, status: 'active' }, 
            permissions: ['menuPlatillos', 'gestionMesas'],
            tokenVersion: 0
        },
        { 
            _id: '64f1a2b3c4d5e6f7a8b9c002', 
            personalInfo: { name: 'Roberto', lastname: 'Méndez', DUI_NIT: '00000000-0', address: 'San Salvador', phone: '7000-0000', type: 'waiter', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150' }, 
            loginInfo: { email: 'roberto@syscor.com', isVerified: true }, 
            workInfo: { salary: 365, status: 'active' }, 
            permissions: ['menuPlatillos'],
            tokenVersion: 0
        },
        { 
            _id: '64f1a2b3c4d5e6f7a8b9c003', 
            personalInfo: { name: 'Miguel', lastname: 'Ángel', DUI_NIT: '00000000-0', address: 'San Salvador', phone: '7000-0000', type: 'kitchen', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150' }, 
            loginInfo: { email: 'chef@syscor.com', isVerified: true }, 
            workInfo: { salary: 365, status: 'inactive' }, 
            permissions: ['inventario'],
            tokenVersion: 0
        }
    ], [])

    const displayList = employees.length > 0 ? employees : localFallback

    // Formatea los enums del backend para mostrarlos de forma limpia en la interfaz
    const translateRole = (type) => {
        const t = String(type || '').toLowerCase();
        if (t === 'manager') return 'GERENTE';
        if (t === 'waiter') return 'MESERO';
        if (t === 'cashier') return 'CAJERO';
        if (t === 'kitchen') return 'COCINA';
        if (t === 'cleaner') return 'LIMPIEZA';
        return 'OTRO';
    }

    // Filtra la lista local de manera eficiente usando useMemo para evitar re-cálculos innecesarios
    const filteredEmployees = useMemo(() => {
        return displayList.filter(emp => {
            const firstName = emp.personalInfo?.name || ''
            const lastName = emp.personalInfo?.lastname || ''
            const fullName = `${firstName} ${lastName}`.trim()
            
            const rawType = emp.personalInfo?.type || ''
            const translated = translateRole(rawType)
            
            const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesRole = selectedRole === 'Todos' || translated.toUpperCase() === selectedRole.toUpperCase()
            return matchesSearch && matchesRole
        })
    }, [displayList, searchTerm, selectedRole])

    const getBadgeClass = (puesto) => {
        const p = String(puesto || '').toUpperCase()
        if (p === 'GERENTE') return 'bg-gray-100 text-gray-700 font-bold text-[11px] px-2.5 py-1 rounded'
        if (p === 'COCINA' || p === 'CAJERO') return 'bg-blue-50 text-blue-600 font-bold text-[11px] px-2.5 py-1 rounded'
        return 'bg-orange-50 text-orange-600 font-bold text-[11px] px-2.5 py-1 rounded'
    }

    const handleEditPermissions = (emp) => {
        setSelectedEmployee(emp)
        setIsModalOpen(true)
    }

    // Gestiona la baja/alta lógica alternando el estado entre 'active' e 'inactive'
    const handleToggleStatus = async (emp) => {
        const currentStatus = emp.workInfo?.status || 'active'
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
        
        const payload = {
            ...emp,
            workInfo: {
                ...emp.workInfo,
                status: newStatus
            }
        }
        
        await updateEmployee(emp._id || emp.id, payload)
    }

    // Envuelve la ejecución de guardado desde el modal refrescando el estado del empleado seleccionado
    const handleSavePermissions = async (id, updatedPayload) => {
        const success = await updateEmployee(id, updatedPayload);
        if (success) {
            setSelectedEmployee(updatedPayload);
        }
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeMenu={activeMenu} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-8">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Empleados</h1>
                                <p className="text-gray-400 text-xs font-medium">Controla los accesos y estados del equipo de Taquería El Corral.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
                                <h2 className="text-md font-bold text-gray-800">Personal en el Sistema</h2>
                                
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
                                        <option value="MESERO">Meseros</option>
                                        <option value="CAJERO">Cajeros</option>
                                        <option value="COCINA">Cocina</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                {loading ? (
                                    <div className="p-8 text-center text-gray-400 text-xs">Conectando con SYSCOR_DB...</div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/70 text-gray-400 text-[11px] uppercase font-bold tracking-wider border-b border-gray-100">
                                                <th className="p-4 pl-6 w-24">Foto</th>
                                                <th className="p-4">Empleado</th>
                                                <th className="p-4">Puesto</th>
                                                <th className="p-4">Estado</th>
                                                <th className="p-4 pr-6 text-right w-64">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                                            {filteredEmployees.map((emp, idx) => {
                                                const firstName = emp.personalInfo?.name || ''
                                                const lastName = emp.personalInfo?.lastname || ''
                                                const fullName = `${firstName} ${lastName}`.trim()
                                                
                                                const puesto = translateRole(emp.personalInfo?.type)
                                                const img = emp.personalInfo?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'
                                                const isActive = (emp.workInfo?.status || 'active') === 'active'

                                                return (
                                                    <tr key={emp._id || idx} className={`hover:bg-gray-50/40 transition-colors ${!isActive ? 'opacity-60 bg-gray-50/30' : ''}`}>
                                                        <td className="p-4 pl-6">
                                                            <img src={img} alt={fullName} className="w-10 h-10 rounded-xl object-cover" />
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="font-bold text-gray-800">{fullName}</div>
                                                            <div className="text-[11px] text-gray-400 font-medium">{emp.loginInfo?.email}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={getBadgeClass(puesto)}>{puesto}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {isActive ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 pr-6 text-right space-x-2">
                                                            <button 
                                                                onClick={() => handleEditPermissions(emp)}
                                                                disabled={!isActive}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#4CAF50] disabled:bg-gray-300 text-white text-[11px] font-bold rounded-lg hover:bg-green-600 transition-colors border-0 cursor-pointer shadow-sm"
                                                            >
                                                                <FAIcon icon="lock" size="sm" /> Permisos
                                                            </button>

                                                            <button 
                                                                onClick={() => handleToggleStatus(emp)}
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-white text-[11px] font-bold rounded-lg transition-colors border-0 cursor-pointer shadow-sm ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                                                            >
                                                                <FAIcon icon={isActive ? 'user-slash' : 'user-check'} size="sm" /> 
                                                                {isActive ? 'Baja' : 'Alta'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <EmployeeModal 
                            isOpen={isModalOpen} 
                            onClose={() => setIsModalOpen(false)} 
                            employeeData={selectedEmployee}
                            onSave={handleSavePermissions}
                        />

                    </div>
                </main>
            </div>
        </div>
    )
}