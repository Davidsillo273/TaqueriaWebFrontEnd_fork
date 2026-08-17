// src/components/employee/employeeModal.jsx
import React, { useState, useEffect } from 'react';
import FAIcon from '../commons/FAIcon';
import { PERMISSION_GROUPS } from '../../constants/permissions';

export default function EmployeeModal({ isOpen, onClose, employeeData, onSave }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (employeeData) {
      setSelected(employeeData.permissions || []);
    }
  }, [employeeData, isOpen]);

  if (!isOpen || !employeeData) return null;

  const togglePermiso = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const toggleGroup = (groupPerms, allSelected) => {
    const ids = groupPerms.map((p) => p.id);
    setSelected((prev) => {
      if (allSelected) return prev.filter((p) => !ids.includes(p));
      const merged = new Set([...prev, ...ids]);
      return Array.from(merged);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(employeeData._id || employeeData.id, { permissions: selected });
  };

  const firstName = employeeData.personalInfo?.name || '';
  const lastName = employeeData.personalInfo?.lastname || '';
  const fullEmployeeName = `${firstName} ${lastName}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/80">
        {/* Cabecera roja con relieve */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-red-500 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(220,38,38,0.3)]">
          <h2 className="text-base sm:text-lg font-display font-bold">Permisos del empleado</h2>
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <p className="text-xs text-gray-500">
            Marca a qué pantallas y funciones puede acceder este empleado. Si le das su primer
            permiso, el sistema le mandará un código de acceso a su correo.
          </p>

          {Object.entries(PERMISSION_GROUPS).map(([groupName, perms]) => {
            const allSelected = perms.every((p) => selected.includes(p.id));
            return (
              <div key={groupName}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-display font-bold text-gray-500 uppercase tracking-wider">{groupName}</h3>
                  <button
                    type="button"
                    onClick={() => toggleGroup(perms, allSelected)}
                    className="text-[11px] font-display font-semibold text-red-500 hover:text-red-600"
                  >
                    {allSelected ? 'Quitar todos' : 'Seleccionar todos'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {perms.map((p) => {
                    const checked = selected.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePermiso(p.id)}
                        className={`flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-xl border transition-colors ${
                          checked ? 'bg-red-50 border-red-300' : 'bg-white border-white/80 hover:border-gray-200'
                        }`}
                      >
                        <span className={`text-xs font-display font-semibold ${checked ? 'text-red-600' : 'text-gray-700'}`}>{p.label}</span>
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${checked ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 text-transparent'}`}>
                          <FAIcon icon="check" size="xs" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

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
