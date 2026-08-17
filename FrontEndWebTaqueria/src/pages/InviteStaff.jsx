import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import FAIcon from '../components/commons/FAIcon'
import LoadingSpinner from '../components/commons/LoadingSpinner'
import { useInvitation } from '../hooks/auth/useInvitation'
import { ToastProvider, useToast } from '../components/commons/ToastProvider'
import ConfirmModal from '../components/commons/ConfirmModal'
import { PERMISSION_GROUPS } from '../constants/permissions'
import { calculatePayrollDeductions } from '../utils/payroll'

// Debe coincidir exacto con el enum de personalInfo.type en employeeModel.js
const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'kitchen', label: 'Cocina' },
  { value: 'waiter', label: 'Mesero' },
  { value: 'cashier', label: 'Cajero' },
  { value: 'manager', label: 'Gerente' },
  { value: 'cleaner', label: 'Limpieza' },
  { value: 'other', label: 'Otro' },
]

const DAYS = [
  { value: 'lunes', label: 'Lun' },
  { value: 'martes', label: 'Mar' },
  { value: 'miercoles', label: 'Mié' },
  { value: 'jueves', label: 'Jue' },
  { value: 'viernes', label: 'Vie' },
  { value: 'sabado', label: 'Sáb' },
  { value: 'domingo', label: 'Dom' },
]

const ROLE_CONFIG = {
  admin: {
    label: 'Administrador',
    icon: 'shield-alt',
    description: 'Acceso completo a la gestión del sistema',
    steps: [
      {
        title: 'Información básica',
        subtitle: 'Datos de contacto del nuevo administrador',
        fields: ['email', 'name', 'lastname'],
      },
    ],
  },
  employee: {
    label: 'Empleado',
    icon: 'briefcase',
    description: 'Acceso operativo con permisos específicos',
    steps: [
      {
        title: 'Información básica',
        subtitle: 'Datos de contacto del nuevo empleado',
        fields: ['email', 'name', 'lastname'],
      },
      {
        title: 'Datos personales',
        subtitle: 'Identificación y puesto de trabajo',
        fields: ['phone', 'duiNit', 'address', 'type'],
      },
      {
        title: 'Información laboral',
        subtitle: 'Salario base. AFP, ISSS y renta se calculan automáticamente',
        fields: ['salary', 'additionalPay', 'workInsurance'],
      },
      {
        title: 'Horario de trabajo',
        subtitle: 'Días y horas en que atiende este empleado (opcional, se puede definir después)',
        fields: ['workDays', 'scheduleStart', 'scheduleEnd'],
      },
      {
        title: 'Permisos del sistema',
        subtitle: 'A qué pantallas y funciones podrá acceder (opcional, se puede definir después)',
        fields: ['permissions'],
      },
    ],
  },
}

const INITIAL_FORM_DATA = {
  email: '',
  name: '',
  lastname: '',
  phone: '',
  duiNit: '',
  address: '',
  type: '',
  salary: '',
  additionalPay: '',
  workInsurance: false,
  workDays: [],
  scheduleStart: '',
  scheduleEnd: '',
  permissions: [],
}

// Estilo base para los inputs clay
const inputClasses =
  'w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 placeholder:text-gray-400 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]'

const selectClasses = inputClasses + ' appearance-none'

function InviteStaffContent() {
  const [step, setStep] = useState(1) // 1: elegir rol, 2: formulario, 3: éxito
  const [subStep, setSubStep] = useState(0) // índice del paso actual
  const [role, setRole] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { loading, error, sendInvitation, reset } = useInvitation()
  const { addToast } = useToast()

  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [validationErrors, setValidationErrors] = useState({})
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (validationErrors[name]) setValidationErrors((prev) => ({ ...prev, [name]: null }))
  }

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      workDays: prev.workDays.includes(day) ? prev.workDays.filter((d) => d !== day) : [...prev.workDays, day],
    }))
  }

  const togglePermission = (id) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(id) ? prev.permissions.filter((p) => p !== id) : [...prev.permissions, id],
    }))
  }

  // Validación específica para los campos del sub‑paso actual
  const validateFields = (fields) => {
    const errors = {}
    if (fields.includes('email')) {
      if (!formData.email.trim()) errors.email = 'El correo electrónico es requerido'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Correo electrónico inválido'
    }
    if (fields.includes('name') && !formData.name.trim()) errors.name = 'El nombre es requerido'
    if (fields.includes('lastname') && !formData.lastname.trim()) errors.lastname = 'El apellido es requerido'
    if (fields.includes('phone') && !formData.phone.trim()) errors.phone = 'El teléfono es requerido'
    if (fields.includes('duiNit') && !formData.duiNit.trim()) errors.duiNit = 'El DUI/NIT es requerido'
    if (fields.includes('address') && !formData.address.trim()) errors.address = 'La dirección es requerida'
    if (fields.includes('type') && !formData.type) errors.type = 'El puesto es requerido'
    if (fields.includes('salary')) {
      if (!formData.salary) errors.salary = 'El salario es requerido'
      else if (isNaN(formData.salary)) errors.salary = 'El salario debe ser un número'
    }
    if (fields.includes('additionalPay') && formData.additionalPay && isNaN(formData.additionalPay)) errors.additionalPay = 'El pago adicional debe ser un número'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const currentStepsConfig = role ? ROLE_CONFIG[role].steps : []
  const isLastSubStep = subStep === currentStepsConfig.length - 1

  const handleNext = async () => {
    const currentFields = currentStepsConfig[subStep].fields
    if (!validateFields(currentFields)) return

    if (!isLastSubStep) {
      setSubStep((prev) => prev + 1)
      return
    }

    // Armar payload y enviar invitación
    const data = {
      email: formData.email.trim(),
      name: formData.name.trim(),
      lastname: formData.lastname.trim(),
    }

    if (role === 'employee') {
      Object.assign(data, {
        phone: formData.phone.trim(),
        duiNit: formData.duiNit.trim(),
        address: formData.address.trim(),
        type: formData.type,
        salary: Number(formData.salary),
        additionalPay: formData.additionalPay ? Number(formData.additionalPay) : 0,
        workInsurance: formData.workInsurance,
        workDays: formData.workDays,
        scheduleStart: formData.scheduleStart || null,
        scheduleEnd: formData.scheduleEnd || null,
        permissions: formData.permissions,
      })
    }

    const result = await sendInvitation(role, data)
    if (result.success) {
      setStep(3)
      addToast('Invitación enviada correctamente', 'success')
    } else {
      addToast(error || 'Error al enviar la invitación', 'error')
    }
  }

  const handleBack = () => {
    if (subStep > 0) {
      setSubStep((prev) => prev - 1)
      return
    }
    setRole(null)
    setStep(1)
    reset()
  }

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole)
    setStep(2)
    setSubStep(0)
    reset()
  }

  const handleInviteAnother = () => {
    setFormData(INITIAL_FORM_DATA)
    setValidationErrors({})
    setRole(null)
    setSubStep(0)
    setStep(1)
    reset()
  }

  // El admin confirmó que quiere descartar el registro en curso: se limpia
  // todo y se vuelve a la selección de rol, igual que "Invitar a otra persona"
  const handleCancelConfirmed = () => {
    setConfirmCancelOpen(false)
    handleInviteAnother()
  }

  // Renderizado de la selección de rol
  const renderRoleSelection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Object.entries(ROLE_CONFIG).map(([key, config]) => (
        <button
          key={key}
          type="button"
          onClick={() => handleSelectRole(key)}
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-white/80
            shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)]
            hover:scale-[1.01] transition-all text-left"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0
            shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.6)]"
          >
            <FAIcon icon={config.icon} className="text-red-600 text-xl" />
          </div>
          <div>
            <p className="font-display font-bold text-gray-900">{config.label}</p>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
        </button>
      ))}
    </div>
  )

  const renderProgressDots = () => {
    if (currentStepsConfig.length <= 1) return null
    return (
      <div className="flex items-center justify-center gap-2 mb-5">
        {currentStepsConfig.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx === subStep ? 'w-8 bg-red-500 shadow-sm' : idx < subStep ? 'w-4 bg-red-300' : 'w-4 bg-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  // Renderiza un campo según su nombre
  const renderField = (fieldName) => {
    switch (fieldName) {
      case 'email':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder={`${ROLE_CONFIG[role].label.toLowerCase()}@syscor.com`}
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.email && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.email}</p>}
          </div>
        )
      case 'name':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombres <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Ej. David Eduardo"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.name && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.name}</p>}
          </div>
        )
      case 'lastname':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastname"
              placeholder="Ej. Pérez García"
              value={formData.lastname}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.lastname && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.lastname}</p>}
          </div>
        )
      case 'phone':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Ej. 1234-5678"
              value={formData.phone}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.phone}</p>}
          </div>
        )
      case 'duiNit':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              DUI/NIT <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="duiNit"
              placeholder="Ej. 12345678-9"
              value={formData.duiNit}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.duiNit && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.duiNit}</p>}
          </div>
        )
      case 'address':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              placeholder="Ej. Calle Principal #123"
              value={formData.address}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.address && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.address}</p>}
          </div>
        )
      case 'type':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Puesto <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={selectClasses}
            >
              <option value="">Selecciona un puesto</option>
              {EMPLOYEE_TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {validationErrors.type && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.type}</p>}
          </div>
        )
      case 'salary': {
        const breakdown = calculatePayrollDeductions(formData.salary)
        return (
          <div key={fieldName} className="mb-3 sm:col-span-2">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Salario Base <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="salary"
              placeholder="Ej. 1500.00"
              value={formData.salary}
              onChange={handleChange}
              className={`${inputClasses} sm:max-w-xs`}
            />
            {validationErrors.salary && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.salary}</p>}

            {breakdown.grossSalary > 0 && (
              <div className="mt-3 bg-white rounded-2xl border border-white/80 shadow-sm p-3 sm:max-w-sm">
                <p className="text-[11px] font-display font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Descuentos de ley (calculados automáticamente)
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between"><span>Salario bruto</span><span className="font-medium text-gray-800">${breakdown.grossSalary.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>AFP (7.25%)</span><span className="text-red-500">-${breakdown.afp.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>ISSS (3%, tope $30)</span><span className="text-red-500">-${breakdown.isss.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Renta (ISR)</span><span className="text-red-500">-${breakdown.isr.toFixed(2)}</span></div>
                  <div className="flex justify-between pt-1.5 mt-1.5 border-t border-gray-100">
                    <span className="font-display font-bold text-gray-800">Salario neto</span>
                    <span className="font-display font-bold text-green-600">${breakdown.netSalary.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
      case 'additionalPay':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Pago Adicional
            </label>
            <input
              type="number"
              name="additionalPay"
              placeholder="Ej. 100.00"
              value={formData.additionalPay}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.additionalPay && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.additionalPay}</p>}
          </div>
        )
      case 'workInsurance':
        return (
          <label
            key={fieldName}
            className="flex items-center gap-2 mb-3 p-3 bg-white rounded-2xl border border-white/80 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <input
              type="checkbox"
              name="workInsurance"
              checked={formData.workInsurance}
              onChange={handleChange}
              className="w-4 h-4 accent-red-500 rounded"
            />
            <span className="text-sm text-gray-700 font-medium">Cuenta con seguro de trabajo</span>
          </label>
        )
      case 'workDays':
        return (
          <div key={fieldName} className="mb-3 sm:col-span-2">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Días que trabaja
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold border transition-colors ${
                    formData.workDays.includes(d.value)
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-500 border-white/80 hover:border-red-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )
      case 'scheduleStart':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Hora de entrada
            </label>
            <input type="time" name="scheduleStart" value={formData.scheduleStart} onChange={handleChange} className={inputClasses} />
          </div>
        )
      case 'scheduleEnd':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Hora de salida
            </label>
            <input type="time" name="scheduleEnd" value={formData.scheduleEnd} onChange={handleChange} className={inputClasses} />
          </div>
        )
      case 'permissions':
        return (
          <div key={fieldName} className="sm:col-span-2 space-y-4">
            {Object.entries(PERMISSION_GROUPS).map(([groupName, perms]) => (
              <div key={groupName}>
                <h4 className="text-xs font-display font-bold text-gray-500 uppercase tracking-wider mb-2">{groupName}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {perms.map((p) => {
                    const checked = formData.permissions.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePermission(p.id)}
                        className={`flex items-center justify-between gap-2 text-left px-3 py-2 rounded-xl border transition-colors ${
                          checked ? 'bg-red-50 border-red-300' : 'bg-white border-white/80 hover:border-gray-200'
                        }`}
                      >
                        <span className={`text-xs font-display font-semibold ${checked ? 'text-red-600' : 'text-gray-700'}`}>{p.label}</span>
                        <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${checked ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 text-transparent'}`}>
                          <FAIcon icon="check" size="xs" />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {formData.permissions.length > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                Este empleado recibirá un código de acceso por correo en cuanto complete su registro, porque tendrá al menos un permiso.
              </p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const renderForm = () => {
    if (!role) return null
    const config = ROLE_CONFIG[role]
    const currentStep = config.steps[subStep]

    return (
      <form onSubmit={(e) => { e.preventDefault(); handleNext() }} className="space-y-1">
        <div className="mb-4">
          <p className="text-sm font-display font-bold text-gray-900">{currentStep.title}</p>
          <p className="text-xs text-gray-500">{currentStep.subtitle}</p>
        </div>

        {renderProgressDots()}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 shadow-sm">
            <FAIcon icon="times-circle" className="text-red-500 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {currentStep.fields.map(renderField)}
        </div>

        <div className="flex gap-2 mt-4 max-w-lg">
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1 border border-gray-300 text-gray-600 py-3 rounded-2xl hover:bg-gray-50 transition disabled:opacity-50 font-display font-semibold text-sm
              shadow-[0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)]"
          >
            <FAIcon icon="chevron-left" /> Volver
          </button>
          <button
            type="button"
            onClick={() => setConfirmCancelOpen(true)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1 border border-red-200 text-red-500 py-3 rounded-2xl hover:bg-red-50 transition disabled:opacity-50 font-display font-semibold text-sm
              shadow-[0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)]"
          >
            <FAIcon icon="xmark" /> Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[1.4] bg-red-500 hover:bg-red-600 text-white font-display font-semibold py-3 rounded-2xl transition disabled:opacity-50 flex items-center justify-center text-sm
              shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]"
          >
            {loading ? <LoadingSpinner color="white" size="sm" /> : isLastSubStep ? 'Enviar invitación' : 'Continuar'}
          </button>
        </div>
      </form>
    )
  }

  const renderSuccess = () => (
    <div className="text-center space-y-4 max-w-md mx-auto">
      <div className="flex justify-center">
        <FAIcon icon="check-circle" className="text-green-500 text-6xl" />
      </div>
      <div className="p-3 bg-green-50 border border-green-200 rounded-2xl shadow-sm">
        <p className="text-green-700 text-sm font-medium">
          Invitación enviada correctamente a <strong>{formData.email}</strong>
        </p>
      </div>
      <p className="text-gray-500 text-xs">
        El {ROLE_CONFIG[role].label.toLowerCase()} recibirá un enlace para completar su registro.
      </p>
      <button
        type="button"
        onClick={handleInviteAnother}
        className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-display font-semibold py-3 rounded-2xl transition shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]"
      >
        Invitar a otra persona
      </button>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar activeMenu="invite-staff" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1">Invitar Staff</h1>
              <p className="text-sm sm:text-base text-gray-600">
                {step === 1 && 'Elige a quién quieres invitar al sistema'}
                {step === 2 && `Datos del nuevo ${ROLE_CONFIG[role]?.label.toLowerCase() || ''}`}
                {step === 3 && 'Invitación enviada'}
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 p-6 sm:p-8">
              {step === 1 && renderRoleSelection()}
              {step === 2 && renderForm()}
              {step === 3 && renderSuccess()}
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancelConfirmed}
        title="Cancelar registro"
        message="¿Estás seguro de que quieres cancelar? Se perderá toda la información que has ingresado."
        confirmText="Sí, cancelar"
        cancelText="Seguir editando"
        icon="triangle-exclamation"
        variant="danger"
      />
    </div>
  )
}

export default function InviteStaff() {
  return (
    <ToastProvider>
      <InviteStaffContent />
    </ToastProvider>
  )
}
