// src/pages/EmployeeManagement.jsx
import React, { useState, useMemo } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import FAIcon from '../components/commons/FAIcon';
import EmployeeModal from '../components/employee/employeeModal';
import ConfirmModal from '../components/commons/ConfirmModal';
import { useEmployees } from '../hooks/useEmployees';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';

function EmployeeManagementContent() {
  const [activeMenu] = useState('staff');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [confirmStatus, setConfirmStatus] = useState({ isOpen: false, employee: null });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Todos');

  const { employees = [], loading, updateEmployee } = useEmployees();
  const { addToast } = useToast();

  const translateRole = (type) => {
    const t = String(type || '').toLowerCase();
    if (t === 'manager') return 'GERENTE';
    if (t === 'waiter') return 'MESERO';
    if (t === 'cashier') return 'CAJERO';
    if (t === 'kitchen') return 'COCINA';
    if (t === 'cleaner') return 'LIMPIEZA';
    return 'OTRO';
  };

  const filteredEmployees = useMemo(() => {
    if (!employees.length) return [];
    return employees.filter(emp => {
      const firstName = emp.personalInfo?.name || '';
      const lastName = emp.personalInfo?.lastname || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const translated = translateRole(emp.personalInfo?.type);
      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'Todos' || translated.toUpperCase() === selectedRole.toUpperCase();
      return matchesSearch && matchesRole;
    });
  }, [employees, searchTerm, selectedRole]);

  const getBadgeClass = (puesto) => {
    const p = String(puesto || '').toUpperCase();
    if (p === 'GERENTE') return 'bg-gray-100 text-gray-700 border border-gray-200';
    if (p === 'COCINA' || p === 'CAJERO') return 'bg-blue-50 text-blue-700 border border-blue-200';
    return 'bg-orange-50 text-orange-700 border border-orange-200';
  };

  const handleEditPermissions = (emp) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const handleRequestToggleStatus = (emp) => {
    setConfirmStatus({ isOpen: true, employee: emp });
  };

  const handleToggleStatusConfirm = async () => {
    const emp = confirmStatus.employee;
    if (!emp) return;

    const currentStatus = emp.workInfo?.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    const payload = {
      ...emp,
      workInfo: { ...emp.workInfo, status: newStatus }
    };

    const success = await updateEmployee(emp._id || emp.id, payload);
    if (success) {
      addToast(`Empleado ${newStatus === 'active' ? 'dado de alta' : 'dado de baja'} correctamente`, 'success');
    } else {
      addToast('Error al cambiar el estado del empleado', 'error');
    }
    setConfirmStatus({ isOpen: false, employee: null });
  };

  const handleSavePermissions = async (id, updatedPayload) => {
    const success = await updateEmployee(id, updatedPayload);
    if (success) {
      setSelectedEmployee(updatedPayload);
      addToast('Permisos actualizados correctamente', 'success');
      setIsModalOpen(false);
    } else {
      addToast('No se pudieron actualizar los permisos', 'error');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar activeMenu={activeMenu} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1">
                  Gestión de Empleados
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Controla los accesos y estados del equipo de Taquería El Corral.
                </p>
              </div>
            </div>

            {/* Tabla de empleados con estilo clay */}
            <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 overflow-hidden">
              <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
                <h2 className="text-lg font-display font-bold text-gray-800">Personal en el Sistema</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar empleado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm text-gray-700 placeholder:text-gray-400 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]"
                  />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm font-medium text-gray-700 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] appearance-none"
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
                  <div className="p-8 text-center text-gray-500 text-sm">Cargando personal...</div>
                ) : employees.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No hay empleados registrados.</div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">Ningún empleado coincide con los filtros.</div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50/80 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        <th className="p-3 sm:p-4 pl-4 sm:pl-6">Foto</th>
                        <th className="p-3 sm:p-4">Empleado</th>
                        <th className="p-3 sm:p-4">Puesto</th>
                        <th className="p-3 sm:p-4">Estado</th>
                        <th className="p-3 sm:p-4 pr-4 sm:pr-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {filteredEmployees.map((emp) => {
                        const firstName = emp.personalInfo?.name || '';
                        const lastName = emp.personalInfo?.lastname || '';
                        const fullName = `${firstName} ${lastName}`.trim();
                        const puesto = translateRole(emp.personalInfo?.type);
                        const img = emp.personalInfo?.image || 'https://via.placeholder.com/40';
                        const isActive = (emp.workInfo?.status || 'active') === 'active';

                        return (
                          <tr key={emp._id || emp.id} className={`hover:bg-gray-50/80 transition-colors ${!isActive ? 'opacity-60 bg-gray-50/30' : ''}`}>
                            <td className="p-3 sm:p-4 pl-4 sm:pl-6">
                              <img src={img} alt={fullName} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                            </td>
                            <td className="p-3 sm:p-4">
                              <div className="font-display font-bold text-gray-900">{fullName}</div>
                              <div className="text-xs text-gray-500">{emp.loginInfo?.email}</div>
                            </td>
                            <td className="p-3 sm:p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-display font-semibold ${getBadgeClass(puesto)}`}>
                                {puesto}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-display font-semibold border ${isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                {isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right space-x-2">
                              <button
                                onClick={() => handleEditPermissions(emp)}
                                disabled={!isActive}
                                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-display font-semibold rounded-xl border border-red-500 text-red-500 hover:bg-red-50 transition-colors shadow-sm disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                              >
                                <FAIcon icon="lock" /> Permisos
                              </button>
                              <button
                                onClick={() => handleRequestToggleStatus(emp)}
                                className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-display font-semibold rounded-xl text-white transition-all shadow-sm ${
                                  isActive
                                    ? 'bg-red-500 hover:bg-red-600 shadow-[0_4px_12px_rgba(220,38,38,0.3)]'
                                    : 'bg-gray-600 hover:bg-gray-700'
                                }`}
                              >
                                <FAIcon icon={isActive ? 'user-slash' : 'user-check'} />
                                {isActive ? 'Baja' : 'Alta'}
                              </button>
                            </td>
                          </tr>
                        );
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

            <ConfirmModal
              isOpen={confirmStatus.isOpen}
              onClose={() => setConfirmStatus({ isOpen: false, employee: null })}
              onConfirm={handleToggleStatusConfirm}
              title={confirmStatus.employee?.workInfo?.status === 'active' ? 'Dar de baja empleado' : 'Dar de alta empleado'}
              message={`¿Estás seguro de cambiar el estado de ${confirmStatus.employee?.personalInfo?.name || 'este empleado'}?`}
              confirmText={confirmStatus.employee?.workInfo?.status === 'active' ? 'Dar de baja' : 'Dar de alta'}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function EmployeeManagement() {
  return (
    <ToastProvider>
      <EmployeeManagementContent />
    </ToastProvider>
  );
}