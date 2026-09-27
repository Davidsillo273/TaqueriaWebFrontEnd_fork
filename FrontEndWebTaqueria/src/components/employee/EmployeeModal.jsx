// src/components/employee/employeeModal.jsx
import React, { useState, useEffect } from 'react';
import FAIcon from '../commons/FAIcon';
import FormModal, { FormSection } from '../commons/FormModal';
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
    <FormModal
      icon="user-lock"
      title="Permisos del empleado"
      subtitle={`Empleado: ${fullEmployeeName}`}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Aplicar cambios"
      maxWidth="max-w-lg"
    >
      <p className="text-xs text-muted">
        Marca a qué pantallas y funciones puede acceder este empleado. Si le das su primer
        permiso, el sistema le mandará un código de acceso a su correo.
      </p>

      {Object.entries(PERMISSION_GROUPS).map(([groupName, perms]) => {
        const allSelected = perms.every((p) => selected.includes(p.id));
        return (
          <FormSection
            key={groupName}
            icon="shield-halved"
            title={groupName}
            badge={
              <button
                type="button"
                onClick={() => toggleGroup(perms, allSelected)}
                className="text-xs font-medium text-ac hover:text-ink transition-colors cursor-pointer"
              >
                {allSelected ? 'Quitar todos' : 'Seleccionar todos'}
              </button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {perms.map((p) => {
                const checked = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePermiso(p.id)}
                    className={`flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-lg border transition-colors ${
                      checked ? 'bg-acsoft border-acline' : 'bg-surface border-line hover:border-line'
                    }`}
                  >
                    <span className={`text-xs font-medium ${checked ? 'text-ac' : 'text-inkalt'}`}>{p.label}</span>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${checked ? 'bg-ac border-ac text-white' : 'border-linealt text-transparent'}`}>
                      <FAIcon icon="check" size="xs" />
                    </span>
                  </button>
                );
              })}
            </div>
          </FormSection>
        );
      })}

    </FormModal>
  );
}
