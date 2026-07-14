import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import FAIcon from '../components/commons/FAIcon'
import LoadingSpinner from '../components/commons/loadingSpinner'
import { useInvitation } from '../hooks/auth/useInvitation'
import { ToastProvider, useToast } from '../components/commons/ToastProvider'
import dayReadyLogo from '../../public/logo.png'

const EMPLOYEE_TYPES = [
  'kitchen',
  'Cocinero',
  'Ayudante de cocina',
  'Bartender',
  'Encargado de local',
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
        fields: ['phone', 'DUI_NIT', 'address', 'type'],
      },
      {
        title: 'Información laboral',
        subtitle: 'Salario y descuentos aplicables',
        fields: ['salary', 'AFP', 'rent', 'additionalPay', 'workInsurance'],
      },
    ],
  },
}

const INITIAL_FORM_DATA = {
  email: '',
  name: '',
  lastname: '',
  phone: '',
  DUI_NIT: '',
  address: '',
  type: '',
  salary: '',
  AFP: '',
  rent: '',
  additionalPay: '',
  workInsurance: false,
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

  const { loading, error, success, sendInvitation, reset } = useInvitation()
  const { addToast } = useToast()

  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (validationErrors[name]) setValidationErrors((prev) => ({ ...prev, [name]: null }))
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
    if (fields.includes('DUI_NIT') && !formData.DUI_NIT.trim()) errors.DUI_NIT = 'El DUI/NIT es requerido'
    if (fields.includes('address') && !formData.address.trim()) errors.address = 'La dirección es requerida'
    if (fields.includes('type') && !formData.type) errors.type = 'El tipo de empleado es requerido'
    if (fields.includes('salary')) {
      if (!formData.salary) errors.salary = 'El salario es requerido'
      else if (isNaN(formData.salary)) errors.salary = 'El salario debe ser un número'
    }
    if (fields.includes('AFP') && formData.AFP && isNaN(formData.AFP)) errors.AFP = 'AFP debe ser un número'
    if (fields.includes('rent') && formData.rent && isNaN(formData.rent)) errors.rent = 'La renta debe ser un número'
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
        DUI_NIT: formData.DUI_NIT.trim(),
        address: formData.address.trim(),
        type: formData.type,
        salary: Number(formData.salary),
        AFP: formData.AFP ? Number(formData.AFP) : 0,
        rent: formData.rent ? Number(formData.rent) : 0,
        additionalPay: formData.additionalPay ? Number(formData.additionalPay) : 0,
        workInsurance: formData.workInsurance,
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

  // Renderizado de la selección de rol
  const renderRoleSelection = () => (
    <div className="space-y-3">
      {Object.entries(ROLE_CONFIG).map(([key, config]) => (
        <button
          key={key}
          type="button"
          onClick={() => handleSelectRole(key)}
          className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border border-white/80
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
      case 'DUI_NIT':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              DUI/NIT <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="DUI_NIT"
              placeholder="Ej. 12345678-9"
              value={formData.DUI_NIT}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.DUI_NIT && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.DUI_NIT}</p>}
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
              Tipo de Empleado <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={selectClasses}
            >
              <option value="">Selecciona un tipo</option>
              {EMPLOYEE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {validationErrors.type && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.type}</p>}
          </div>
        )
      case 'salary':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Salario Base <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="salary"
              placeholder="Ej. 1500.00"
              value={formData.salary}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.salary && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.salary}</p>}
          </div>
        )
      case 'AFP':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              AFP (%)
            </label>
            <input
              type="number"
              name="AFP"
              placeholder="Ej. 7.25"
              value={formData.AFP}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.AFP && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.AFP}</p>}
          </div>
        )
      case 'rent':
        return (
          <div key={fieldName} className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Renta (%)
            </label>
            <input
              type="number"
              name="rent"
              placeholder="Ej. 10.00"
              value={formData.rent}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.rent && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.rent}</p>}
          </div>
        )
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
      default:
        return null
    }
  }

  const renderForm = () => {
    if (!role) return null
    const config = ROLE_CONFIG[role]
    const currentStep = config.steps[subStep]

    const paired = ['AFP', 'rent']
    const remainingFields = currentStep.fields.filter((f) => !paired.includes(f))

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

        {currentStep.fields.includes('AFP') && currentStep.fields.includes('rent') ? (
          <>
            {remainingFields.filter(f => f !== 'AFP' && f !== 'rent').map(renderField)}
            <div className="grid grid-cols-2 gap-3">
              {renderField('AFP')}
              {renderField('rent')}
            </div>
            {currentStep.fields.includes('additionalPay') && renderField('additionalPay')}
            {currentStep.fields.includes('workInsurance') && renderField('workInsurance')}
          </>
        ) : (
          currentStep.fields.map(renderField)
        )}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="w-1/3 flex items-center justify-center gap-1 border border-gray-300 text-gray-600 py-3 rounded-2xl hover:bg-gray-50 transition disabled:opacity-50 font-display font-semibold text-sm
              shadow-[0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)]"
          >
            <FAIcon icon="chevron-left" /> Volver
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-2/3 bg-red-500 hover:bg-red-600 text-white font-display font-semibold py-3 rounded-2xl transition disabled:opacity-50 flex items-center justify-center text-sm
              shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]"
          >
            {loading ? <LoadingSpinner color="white" size="sm" /> : isLastSubStep ? 'Enviar invitación' : 'Continuar'}
          </button>
        </div>
      </form>
    )
  }

  const renderSuccess = () => (
    <div className="text-center space-y-4">
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
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            {/* Tarjeta principal con claymorphism */}
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1),inset_1px_1px_3px_rgba(255,255,255,0.8)] border border-white/80 p-6 sm:p-8">
              <div className="text-center mb-6">
                <img src={dayReadyLogo} alt="Logo" className="w-48 h-auto mx-auto object-contain" />
              </div>
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm font-medium">
                  {step === 1 && 'Invitar Usuario'}
                  {step === 2 && `Datos del nuevo ${ROLE_CONFIG[role]?.label.toLowerCase() || ''}`}
                  {step === 3 && 'Invitación enviada'}
                </p>
              </div>
              {step === 1 && renderRoleSelection()}
              {step === 2 && renderForm()}
              {step === 3 && renderSuccess()}
            </div>
          </div>
        </main>
      </div>
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