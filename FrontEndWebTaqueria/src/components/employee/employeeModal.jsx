import React, { useState, useEffect } from 'react'
import FAIcon from '../commons/FAIcon'
import { useToast } from '../commons/ToastProvider'

export default function EmployeeModal({ isOpen, onClose, employeeData, onSave }) {
  const { addToast } = useToast()
  const [permisos, setPermisos] = useState({
    menuPlatillos: false,
    combos: false,
    gestionMesas: false,
    inventario: false
  })

  useEffect(() => {
    if (employeeData) {
      const backendPerms = employeeData.permissions || []
      setPermisos({
        menuPlatillos: backendPerms.includes('menuPlatillos'),
        combos: backendPerms.includes('combos'),
        gestionMesas: backendPerms.includes('gestionMesas'),
        inventario: backendPerms.includes('inventario')
      })
    }
  }, [employeeData, isOpen])

  if (!isOpen || !employeeData) return null

  const togglePermiso = (key) => {
    setPermisos(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const arrayPermisos = Object.keys(permisos).filter(key => permisos[key])
    if (arrayPermisos.length === 0) {
      addToast('Selecciona al menos un permiso', 'warning')
      return
    }

    const payload = {
      permissions: arrayPermisos,
      salary: employeeData.workInfo?.salary,
      type: employeeData.personalInfo?.type
    }

    onSave(employeeData._id || employeeData.id, payload)
  }

  const firstName = employeeData.personalInfo?.name || ''
  const lastName = employeeData.personalInfo?.lastname || ''
  const fullEmployeeName = `${firstName} ${lastName}`.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <div className="bg-red-600 text-white px-4 sm:px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold">Modificar Permisos</h2>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white">
            <FAIcon icon="times" />
          </button>
        </div>

        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          <p className="text-sm text-gray-600">
            Empleado: <span className="font-bold text-gray-900">{fullEmployeeName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="text-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">Privilegios de acceso</span>
          </div>

          <div className="space-y-3">
            {[
              { key: 'menuPlatillos', label: 'Menú y Platillos', desc: 'Modificar la carta y recetas' },
              { key: 'combos', label: 'Combos', desc: 'Gestión de paquetes promocionales' },
              { key: 'gestionMesas', label: 'Gestión de Mesas', desc: 'Mapeo y distribución de salones' },
              { key: 'inventario', label: 'Inventario', desc: 'Control de insumos de cocina' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{label}</h4>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePermiso(key)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${permisos[key] ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${permisos[key] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors">
              Aplicar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}