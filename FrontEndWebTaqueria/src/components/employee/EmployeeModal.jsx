// src/components/employee/employeeModal.jsx
import React, { useState, useEffect } from 'react';
import FAIcon from '../commons/FAIcon';
import { useToast } from '../commons/ToastProvider';

export default function EmployeeModal({ isOpen, onClose, employeeData, onSave }) {
  const { addToast } = useToast();
  const [permisos, setPermisos] = useState({
    menuPlatillos: false,
    combos: false,
    gestionMesas: false,
    inventario: false
  });

  useEffect(() => {
    if (employeeData) {
      const backendPerms = employeeData.permissions || [];
      setPermisos({
        menuPlatillos: backendPerms.includes('menuPlatillos'),
        combos: backendPerms.includes('combos'),
        gestionMesas: backendPerms.includes('gestionMesas'),
        inventario: backendPerms.includes('inventario')
      });
    }
  }, [employeeData, isOpen]);

  if (!isOpen || !employeeData) return null;

  const togglePermiso = (key) => {
    setPermisos(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const arrayPermisos = Object.keys(permisos).filter(key => permisos[key]);
    if (arrayPermisos.length === 0) {
      addToast('Selecciona al menos un permiso', 'warning');
      return;
    }

    const payload = {
      permissions: arrayPermisos,
      salary: employeeData.workInfo?.salary,
      type: employeeData.personalInfo?.type
    };

    onSave(employeeData._id || employeeData.id, payload);
  };

  const firstName = employeeData.personalInfo?.name || '';
  const lastName = employeeData.personalInfo?.lastname || '';
  const fullEmployeeName = `${firstName} ${lastName}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] w-full max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/80">
        {/* Cabecera roja con relieve */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-red-500 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(220,38,38,0.3)]">
          <h2 className="text-base sm:text-lg font-display font-bold">Modificar Permisos</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"
          >
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        {/* Nombre del empleado */}
        <div className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 border-b border-white/80 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></span>
          <p className="text-sm text-gray-600">
            Empleado: <span className="font-display font-bold text-gray-900">{fullEmployeeName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          <div className="text-center">
            <span className="text-xs font-display font-semibold text-gray-500 uppercase tracking-wider">Privilegios de acceso</span>
          </div>

          <div className="space-y-3">
            {[
              { key: 'menuPlatillos', label: 'Menú y Platillos', desc: 'Modificar la carta y recetas' },
              { key: 'combos', label: 'Combos', desc: 'Gestión de paquetes promocionales' },
              { key: 'gestionMesas', label: 'Gestión de Mesas', desc: 'Mapeo y distribución de salones' },
              { key: 'inventario', label: 'Inventario', desc: 'Control de insumos de cocina' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-white/80 shadow-sm">
                <div>
                  <h4 className="text-sm font-display font-bold text-gray-800">{label}</h4>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePermiso(key)}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                    permisos[key] ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                      permisos[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/60">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-600 rounded-2xl hover:bg-gray-300 font-display font-semibold text-sm transition-all
                shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)]
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 font-display font-semibold text-sm transition-all
                shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]
              "
            >
              Aplicar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}