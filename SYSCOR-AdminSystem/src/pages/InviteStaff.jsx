// src/pages/InviteStaff.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/commons/PageShell'
import { useAdminTabs } from '../hooks/useSectionTabs'
import FAIcon from '@syscor/web-shared/src/components/FAIcon'
import Select from '../components/commons/Select'
import LoadingSpinner from '@syscor/web-shared/src/components/LoadingSpinner'
import { useInvitation } from '../hooks/auth/useInvitation'
import { ToastProvider, useToast } from '@syscor/web-shared/src/components/ToastProvider'
import ConfirmModal from '@syscor/web-shared/src/components/ConfirmModal'
import { PERMISSION_GROUPS } from '../constants/permissions'
import { calculatePayrollDeductions } from '../utils/payroll'
import { EMPLOYEE_TYPE_OPTIONS } from '../constants/employeeTypes'
import useDuiScan from '../hooks/useDuiScan'
import DuiScanStep from '../components/employee/DuiScanStep'
import { ModalShell, ModalHeader, ModalBody, ModalFooter, MODAL_BTN_SECONDARY, MODAL_BTN_PRIMARY } from '@syscor/web-shared/src/components/FormModal'
import { loadInviteDraft, saveInviteDraft, clearInviteDraft, draftSavedTime } from '../hooks/useInviteDraft'
import useLeaveGuard from '../hooks/useLeaveGuard'
import useEmailAvailability from '../hooks/useEmailAvailability'
import {
  sanitizeName, validateName, formatDui, validateDui, PHONE_PREFIX, formatPhone, validatePhone,
  formatIsss, validateIsss, AFP_INSTITUTIONS, BANKS, formatBankAccount, bankAccountHint,
  validateBankAccount, checkLegalSchedule,
} from '../utils/employeeFields'

const API_URL = import.meta.env.VITE_API_URL || '/api'

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
    icon: 'shield-check',
    description: 'Acceso completo a la configuración, reportes y gestión global del sistema.',
    steps: [
      {
        title: 'Información básica',
        subtitle: 'Datos de contacto y credenciales del nuevo administrador',
        fields: ['email', 'name', 'lastname'],
      },
    ],
  },
  employee: {
    label: 'Empleado operativo',
    icon: 'briefcase',
    description: 'Acceso operativo con permisos asignables, horario y expediente de nómina.',
    requirement: 'Debes tener el DUI físico del colaborador a la mano para su escaneo',
    steps: [
      {
        title: 'Información básica',
        subtitle: 'Correo electrónico al que se enviará la invitación de acceso',
        fields: ['email'],
        compact: true,
        note: 'Los nombres y apellidos se leerán automáticamente del DUI en el siguiente paso.',
      },
      {
        title: 'Escanear el DUI',
        subtitle: 'Captura el frente y reverso del documento para auto-completar los datos',
        fields: ['duiScan'],
      },
      {
        title: 'Datos del documento',
        subtitle: 'Verifica la información leída del documento de identidad',
        fields: ['name', 'lastname', 'duiNit', 'birthDate', 'gender', 'maritalStatus', 'address'],
      },
      {
        title: 'Contacto y puesto',
        subtitle: 'Número telefónico y asignación de puesto en taquería',
        fields: ['phone', 'type'],
      },
      {
        title: 'Información laboral',
        subtitle: 'Salario base mensual y retenciones de ley calculadas',
        fields: ['salary', 'additionalPay', 'workInsurance'],
      },
      {
        title: 'Identificadores y banco',
        subtitle: 'Afiliaciones de seguridad social y cuenta de planilla (opcional)',
        fields: ['isssNumber', 'afpInstitution', 'bankName', 'bankAccount'],
      },
      {
        title: 'Horario de trabajo',
        subtitle: 'Días laborables y turnos asignados al empleado',
        fields: ['workDays', 'scheduleStart', 'scheduleEnd'],
      },
      {
        title: 'Permisos del sistema',
        subtitle: 'Módulos y funciones operativas a las que tendrá acceso',
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
  additionalPayDuration: '',
  workInsurance: false,
  workDays: [],
  scheduleStart: '',
  scheduleEnd: '',
  permissions: [],
  birthDate: '',
  gender: '',
  maritalStatus: '',
  isssNumber: '',
  afpInstitution: '',
  bankName: '',
  bankAccount: '',
}

const ADDITIONAL_PAY_DURATIONS = [
  { value: '15d', label: '15 días' },
  { value: '1m', label: '1 mes' },
  { value: '2m', label: '2 meses' },
  { value: '3m', label: '3 meses' },
]

// Las instituciones de AFP y los bancos están en utils/employeeFields.js

const GENDER_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
]

const MARITAL_STATUS_OPTIONS = [
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
  { value: 'acompanado', label: 'Acompañado/a' },
]

const inputClasses =
  'w-full px-3 py-1.5 bg-surfalt/40 border border-line rounded-none focus:outline-none focus:border-ac transition-colors text-ink placeholder:text-muted text-xs'


// Etiquetas para los avisos del correo (el rol viene en inglés).
const ACCOUNT_ROLE_LABELS = { admin: 'administrador', employee: 'empleado' }

// Estado de la búsqueda del correo, debajo del campo.
function EmailStatus({ check, role }) {
  if (check.status === 'idle') return null

  if (check.status === 'checking') {
    return (
      <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
        <FAIcon icon="spinner" size="xs" className="animate-spin" />
        Buscando si el correo ya está registrado…
      </p>
    )
  }

  if (check.status === 'error') {
    return (
      <p className="text-xs text-muted mt-1">
        No se pudo comprobar el correo ahora; se verificará al enviar la invitación.
      </p>
    )
  }

  if (check.exists) {
    return (
      <p className="text-xs text-ac mt-1 flex items-start gap-1.5">
        <FAIcon icon="times-circle" size="xs" className="mt-0.5 shrink-0" />
        <span>
          Ya existe un {ACCOUNT_ROLE_LABELS[role]} con este correo
          {check.name ? ` (${check.name})` : ''}. No se puede invitar de nuevo.
        </span>
      </p>
    )
  }

  return (
    <p className="text-xs text-ok mt-1 flex items-center gap-1.5">
      <FAIcon icon="circle-check" size="xs" />
      Correo disponible: no hay ningún {ACCOUNT_ROLE_LABELS[role]} registrado con él.
    </p>
  )
}

function InviteStaffContent() {
  const navigate = useNavigate()
  // Si quedó una invitación a medias hace menos de 30 minutos, se retoma
  // donde se dejó (ver hooks/useInviteDraft.js). Se lee una sola vez.
  const [restoredDraft] = useState(() => loadInviteDraft())
  // Se oculta el aviso de "invitación retomada" si se descarta o se envía.
  const [showDraftNotice, setShowDraftNotice] = useState(!!restoredDraft)

  const [step, setStep] = useState(restoredDraft ? 2 : 1) // 1: elegir rol, 2: formulario, 3: éxito
  const [subStep, setSubStep] = useState(restoredDraft?.subStep ?? 0)
  const [role, setRole] = useState(restoredDraft?.role ?? null)
  const adminTabs = useAdminTabs('invitations')

  const { loading, error, sendInvitation, reset } = useInvitation()
  const { addToast } = useToast()

  const duiScan = useDuiScan({
    onExtracted: (d) => {
      setFormData((prev) => ({
        ...prev,
        ...(d.duiNumber ? { duiNit: formatDui(d.duiNumber) } : {}),
        ...(d.names ? { name: sanitizeName(d.names) } : {}),
        ...(d.lastNames ? { lastname: sanitizeName(d.lastNames) } : {}),
        ...(d.birthDate ? { birthDate: d.birthDate } : {}),
        ...(d.gender ? { gender: d.gender } : {}),
        ...(d.maritalStatus ? { maritalStatus: d.maritalStatus } : {}),
        ...(d.address ? { address: d.address } : {}),
      }))

      setSubStep((prev) => (ROLE_CONFIG.employee.steps[prev]?.fields?.includes('duiScan') ? prev + 1 : prev))
    },
  })


  const [formData, setFormData] = useState(
    restoredDraft ? { ...INITIAL_FORM_DATA, ...restoredDraft.formData } : INITIAL_FORM_DATA
  )
  const [validationErrors, setValidationErrors] = useState({})
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  // Destino al que se intentó ir a mitad del alta (abre el aviso de salida)
  const [leaveTarget, setLeaveTarget] = useState(null)

  // Las fotos del DUI del borrador ya están subidas: solo se reponen.
  useEffect(() => {
    if (restoredDraft?.dui) duiScan.restore(restoredDraft.dui)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Hay trabajo a medias en cuanto se eligió rol y se escribió algo.
  const hasProgress = step === 2 && !!role && (!!formData.email.trim() || subStep > 0)

  // Cada cambio renueva el borrador: los 30 minutos corren desde lo último
  // que se tocó.
  useEffect(() => {
    if (!hasProgress) return
    saveInviteDraft({
      role,
      subStep,
      formData,
      dui: { documents: duiScan.documents, extracted: duiScan.extracted },
    })
  }, [hasProgress, role, subStep, formData, duiScan.documents, duiScan.extracted])

  useLeaveGuard(hasProgress, setLeaveTarget)

  // Correo: se busca si ya existe una cuenta mientras se escribe.
  // Solo se busca entre las cuentas del tipo que se invita (empleados o
  // administradores), igual que la validación del envío en el backend.
  const emailCheck = useEmailAvailability(step === 2 ? formData.email : '', role)
  const emailTakenForRole = emailCheck.status === 'done' && emailCheck.exists

  const leaveKeepingDraft = () => {
    const target = leaveTarget
    setLeaveTarget(null)
    navigate(target)
  }

  const leaveCancellingInvite = () => {
    const target = leaveTarget
    clearInviteDraft()
    setLeaveTarget(null)
    navigate(target)
  }

  // Cada campo se limpia mientras se escribe: el nombre no admite números,
  // el DUI y el teléfono solo dígitos (el guion lo pone el sistema), el ISSS
  // hasta 9 dígitos y la cuenta solo dígitos hasta el largo de su banco.
  const FORMATTERS = {
    name: sanitizeName,
    lastname: sanitizeName,
    duiNit: formatDui,
    phone: formatPhone,
    isssNumber: formatIsss,
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => {
      if (type === 'checkbox') return { ...prev, [name]: checked }
      if (name === 'bankAccount') return { ...prev, bankAccount: formatBankAccount(value, prev.bankName) }
      // Al cambiar de banco, la cuenta se recorta al largo que admite el nuevo.
      if (name === 'bankName') return { ...prev, bankName: value, bankAccount: formatBankAccount(prev.bankAccount, value) }
      const format = FORMATTERS[name]
      return { ...prev, [name]: format ? format(value) : value }
    })
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

  const validateFields = (fields) => {
    const errors = {}
    if (fields.includes('email')) {
      if (!formData.email.trim()) errors.email = 'El correo electrónico es requerido'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Correo electrónico inválido'
    }
    const check = (field, message) => { if (fields.includes(field) && message) errors[field] = message }
    check('name', validateName(formData.name, 'El nombre'))
    check('lastname', validateName(formData.lastname, 'El apellido'))
    check('phone', validatePhone(formData.phone))
    check('duiNit', validateDui(formData.duiNit))
    check('isssNumber', validateIsss(formData.isssNumber))
    check('bankAccount', validateBankAccount(formData.bankName, formData.bankAccount))
    if (fields.includes('scheduleEnd')) {
      const { error: scheduleError } = checkLegalSchedule(formData)
      if (scheduleError) errors.scheduleEnd = scheduleError
    }
    if (fields.includes('address') && !formData.address.trim()) errors.address = 'La dirección es requerida'
    if (fields.includes('type') && !formData.type) errors.type = 'El puesto es requerido'
    if (fields.includes('salary')) {
      if (!formData.salary) errors.salary = 'El salario es requerido'
      else if (isNaN(formData.salary)) errors.salary = 'El salario debe ser un número'
    }
    if (fields.includes('additionalPay') && formData.additionalPay) {
      if (isNaN(formData.additionalPay)) errors.additionalPay = 'El pago adicional debe ser un número'
      else if (Number(formData.additionalPay) > 0 && !formData.additionalPayDuration) {
        errors.additionalPayDuration = 'Indica por cuánto tiempo se dará el pago adicional'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const currentStepsConfig = role ? ROLE_CONFIG[role].steps : []
  const isLastSubStep = subStep === currentStepsConfig.length - 1

  const handleNext = async () => {
    const currentFields = currentStepsConfig[subStep].fields
    if (!validateFields(currentFields)) return

    if (currentFields.includes('email') && emailTakenForRole) {
      setValidationErrors((prev) => ({
        ...prev,
        email: `Ya existe un ${ACCOUNT_ROLE_LABELS[role]} con este correo. No se puede invitar de nuevo.`,
      }))
      return
    }

    if (!isLastSubStep) {
      setSubStep((prev) => prev + 1)
      return
    }

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
        additionalPayDuration: formData.additionalPay ? (formData.additionalPayDuration || null) : null,
        workInsurance: formData.workInsurance,
        workDays: formData.workDays,
        scheduleStart: formData.scheduleStart || null,
        scheduleEnd: formData.scheduleEnd || null,
        permissions: formData.permissions,
        birthDate: formData.birthDate || null,
        gender: formData.gender || null,
        maritalStatus: formData.maritalStatus || null,
        isssNumber: formData.isssNumber.trim() || null,
        afpInstitution: formData.afpInstitution || null,
        bankName: formData.bankName.trim() || null,
        bankAccount: formData.bankAccount.trim() || null,
        documents: { ...(duiScan.documents || {}) },
      })
    }

    const result = await sendInvitation(role, data)
    if (result.success) {
      clearInviteDraft()
      setShowDraftNotice(false)
      setStep(3)
      addToast('Invitación enviada correctamente', 'success')
    } else {
      // `error` del hook todavía no se actualizó en este render: se usa el del resultado.
      addToast(result.error || 'Error al enviar la invitación', 'error')
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
    duiScan.reset()
    clearInviteDraft()
    setShowDraftNotice(false)
  }

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole)
    setStep(2)
    setSubStep(0)
    reset()
    duiScan.reset()
  }

  const handleInviteAnother = () => {
    clearInviteDraft()
    setShowDraftNotice(false)
    setFormData(INITIAL_FORM_DATA)
    setValidationErrors({})
    setRole(null)
    setSubStep(0)
    setStep(1)
    reset()
    duiScan.reset()
  }

  const handleCancelConfirmed = () => {
    setConfirmCancelOpen(false)
    handleInviteAnother()
  }

  // Selección de rol con diseño acorde al resto del sistema
  const renderRoleSelection = () => (
    <div>
      <div className="mb-8">
        <p className="kick text-ac mb-2">
          NUEVA INCORPORACIÓN · INVITAR AL SISTEMA
        </p>
        <h2 className="text-xl sm:text-2xl font-light text-ink tracking-tight mb-2">
          Selecciona el tipo de usuario a invitar
        </h2>
        <p className="text-xs text-muted max-w-xl leading-relaxed">
          Elige el perfil correspondiente para iniciar el alta guiada. Para colaboradores operativos, se completará el expediente laboral con escaneo de DUI y turnos de trabajo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {Object.entries(ROLE_CONFIG).map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSelectRole(key)}
            className="flex flex-col justify-between p-6 bg-surface border border-line hover:border-ac hover:bg-surfalt/30 transition-all text-left group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-surfalt border border-line flex items-center justify-center text-ink group-hover:border-ac group-hover:bg-acsoft group-hover:text-ac transition-colors">
                  <FAIcon icon={config.icon} className="text-lg" />
                </div>
                <span className="kick px-2 py-0.5 border border-line text-muted">
                  {key === 'admin' ? 'Acceso Total' : 'Operativo'}
                </span>
              </div>

              <h3 className="text-base font-bold text-ink group-hover:text-ac transition-colors mb-1.5">
                {config.label}
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {config.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-line/60">
              {config.requirement ? (
                <div className="flex items-center gap-2 text-[11px] text-warn font-medium mb-3">
                  <FAIcon icon="id-card" size="xs" />
                  <span>{config.requirement}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px] text-muted mb-3">
                  <FAIcon icon="circle-info" size="xs" />
                  <span>Requiere únicamente correo electrónico y nombres completos</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs font-bold text-ink group-hover:text-ac transition-colors">
                <span>Continuar registro</span>
                <FAIcon icon="arrow-right" size="xs" className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Tarjetas informativas de buenas prácticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-line">
        <div className="border-t border-line pt-2.5">
          <p className="kick text-muted mb-1.5">
            ESCANEO INTELIGENTE
          </p>
          <p className="text-xs text-ink font-bold">Validación de DUI OCR</p>
          <p className="text-[11px] text-muted mt-1 leading-relaxed">
            Extracción automática de datos del documento para reducir errores de digitación en planilla.
          </p>
        </div>

        <div className="border-t border-line pt-2.5">
          <p className="kick text-muted mb-1.5">
            EXPEDIENTE LABORAL
          </p>
          <p className="text-xs text-ink font-bold">Cálculos automáticos de ley</p>
          <p className="text-[11px] text-muted mt-1 leading-relaxed">
            Deducciones de ISSS, AFP y retención de Renta calculadas en tiempo real según el salario base.
          </p>
        </div>

        <div className="border-t border-line pt-2.5">
          <p className="kick text-muted mb-1.5">
            ACCESO SEGURO
          </p>
          <p className="text-xs text-ink font-bold">Credenciales por correo</p>
          <p className="text-[11px] text-muted mt-1 leading-relaxed">
            Se envía un enlace seguro al correo registrado para que el usuario active su cuenta y contraseña.
          </p>
        </div>
      </div>
    </div>
  )

  const renderProgressDots = () => {
    if (currentStepsConfig.length <= 1) return null
    return (
      <div className="mb-6 pb-4 border-b border-line">
        <div className="flex items-center justify-between text-[11px] mb-2">
          <span className="kick text-ac">
            Paso {subStep + 1} de {currentStepsConfig.length} · {currentStepsConfig[subStep]?.title}
          </span>
          <span className="text-muted num font-medium">
            {Math.round(((subStep + 1) / currentStepsConfig.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-surfalt h-1 flex gap-1">
          {currentStepsConfig.map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all ${
                idx === subStep ? 'bg-ac' : idx < subStep ? 'bg-ac/40' : 'bg-line'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  const renderField = (fieldName) => {
    switch (fieldName) {
      case 'email':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Correo electrónico <span className="text-ac">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder={`${ROLE_CONFIG[role].label.toLowerCase()}@elcorral.com`}
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.email ? (
              <p className="text-ac text-xs mt-1 font-medium">{validationErrors.email}</p>
            ) : (
              <EmailStatus check={emailCheck} role={role} />
            )}
          </div>
        )
      case 'name':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Nombres <span className="text-ac">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Ej. David Eduardo"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.name && <p className="text-ac text-xs mt-1 font-medium">{validationErrors.name}</p>}
          </div>
        )
      case 'lastname':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Apellidos <span className="text-ac">*</span>
            </label>
            <input
              type="text"
              name="lastname"
              placeholder="Ej. Pérez García"
              value={formData.lastname}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.lastname && <p className="text-ac text-xs mt-1 font-medium">{validationErrors.lastname}</p>}
          </div>
        )
      case 'phone':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Teléfono <span className="text-ac">*</span>
            </label>
            {/* El código de país va fijo: solo se escriben los 8 dígitos y
                el guion lo pone el sistema. */}
            <div className="flex">
              <span className="num px-3 py-1.5 text-xs text-muted bg-surfalt border border-r-0 border-line flex items-center">
                {PHONE_PREFIX}
              </span>
              <input
                type="tel"
                inputMode="numeric"
                name="phone"
                placeholder="7123-4567"
                value={formData.phone}
                onChange={handleChange}
                maxLength={9}
                className={`${inputClasses} num`}
              />
            </div>
            {validationErrors.phone && <p className="text-ac text-xs mt-1 font-medium">{validationErrors.phone}</p>}
          </div>
        )
      case 'duiNit':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              DUI <span className="text-ac">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              name="duiNit"
              placeholder="01234567-8"
              value={formData.duiNit}
              onChange={handleChange}
              maxLength={10}
              className={`${inputClasses} num`}
            />
            {validationErrors.duiNit
              ? <p className="text-ac text-xs mt-1 font-medium">{validationErrors.duiNit}</p>
              : <p className="text-[11px] text-muted mt-1">9 dígitos; el guion se agrega solo.</p>}
          </div>
        )
      case 'address':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Dirección de residencia <span className="text-ac">*</span>
            </label>
            <input
              type="text"
              name="address"
              placeholder="Ej. Av. Roosevelt #123, San Salvador"
              value={formData.address}
              onChange={handleChange}
              className={inputClasses}
            />
            {validationErrors.address && <p className="text-ac text-xs mt-1 font-medium">{validationErrors.address}</p>}
          </div>
        )
      case 'type':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Puesto en el restaurante <span className="text-ac">*</span>
            </label>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="">Selecciona un puesto</option>
              {EMPLOYEE_TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
            {validationErrors.type && <p className="text-ac text-xs mt-1 font-medium">{validationErrors.type}</p>}
          </div>
        )
      case 'salary': {
        const breakdown = calculatePayrollDeductions(formData.salary)
        return (
          <div key={fieldName} className="mb-4 sm:col-span-2">
            <label className="block kick text-muted mb-1.5">
              Salario Base Mensual <span className="text-ac">*</span>
            </label>
            <input
              type="number"
              name="salary"
              placeholder="Ej. 450.00"
              value={formData.salary}
              onChange={handleChange}
              className={`${inputClasses} sm:max-w-xs`}
            />
            {validationErrors.salary && <p className="text-ac text-xs mt-1 font-medium">{validationErrors.salary}</p>}

            {breakdown.grossSalary > 0 && (
              <div className="mt-3 bg-surfalt/40 border border-line p-4 sm:max-w-md">
                <p className="kick text-muted mb-2">
                  Retenciones de ley calculadas automáticamente
                </p>
                <div className="space-y-1.5 text-xs text-inkalt">
                  <div className="flex justify-between">
                    <span>Salario bruto:</span>
                    <span className="font-medium text-ink">${breakdown.grossSalary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AFP (7.25%):</span>
                    <span className="text-ac num">-${breakdown.afp.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ISSS (3%, tope $30):</span>
                    <span className="text-ac num">-${breakdown.isss.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Renta de ley (ISR):</span>
                    <span className="text-ac num">-${breakdown.isr.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-1.5 border-t border-line">
                    <span className="font-bold text-ink">Neto estimado a pagar:</span>
                    <span className="font-bold text-ok num text-sm">${breakdown.netSalary.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
      case 'additionalPay':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Bono o pago adicional <span className="text-muted normal-case font-normal">(opcional)</span>
            </label>
            <input
              type="number"
              name="additionalPay"
              placeholder="Ej. 50.00"
              value={formData.additionalPay}
              onChange={handleChange}
              className={inputClasses}
            />
            <p className="text-[11px] text-muted mt-1">
              Gratificación independiente del salario: exenta de descuentos de ley.
            </p>
            {validationErrors.additionalPay && <p className="text-ac text-xs mt-1 font-medium">{validationErrors.additionalPay}</p>}

            {formData.additionalPay && Number(formData.additionalPay) > 0 && (
              <div className="mt-3">
                <label className="block kick text-muted mb-1.5">
                  Vigencia del bono <span className="text-ac">*</span>
                </label>
                <Select
                  name="additionalPayDuration"
                  value={formData.additionalPayDuration}
                  onChange={handleChange}
                >
                  <option value="">Selecciona el plazo</option>
                  {ADDITIONAL_PAY_DURATIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </Select>
                {validationErrors.additionalPayDuration && (
                  <p className="text-ac text-xs mt-1 font-medium">{validationErrors.additionalPayDuration}</p>
                )}
              </div>
            )}
          </div>
        )
      case 'workInsurance':
        return (
          <label
            key={fieldName}
            className="flex items-center gap-2.5 mb-4 p-3 bg-surfalt/30 border border-line cursor-pointer"
          >
            <input
              type="checkbox"
              name="workInsurance"
              checked={formData.workInsurance}
              onChange={handleChange}
              className="w-4 h-4 accent-red-600 rounded-none cursor-pointer"
            />
            <span className="text-xs text-ink font-medium">Cuenta con seguro de vida o accidentes laborales</span>
          </label>
        )
      case 'workDays':
        return (
          <div key={fieldName} className="mb-4 sm:col-span-2">
            <label className="block kick text-muted mb-1.5">
              Días de trabajo semanales
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    formData.workDays.includes(d.value)
                      ? 'bg-ac text-white border-ac'
                      : 'bg-surface text-muted border-line hover:border-linealt hover:text-ink'
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
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Hora de entrada
            </label>
            <input type="time" name="scheduleStart" value={formData.scheduleStart} onChange={handleChange} className={inputClasses} />
          </div>
        )
      case 'scheduleEnd': {
        const schedule = checkLegalSchedule(formData)
        const scheduleError = validationErrors.scheduleEnd || schedule.error
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Hora de salida
            </label>
            <input type="time" name="scheduleEnd" value={formData.scheduleEnd} onChange={handleChange} className={inputClasses} />
            {scheduleError ? (
              <p className="text-ac text-xs mt-1 font-medium">{scheduleError}</p>
            ) : schedule.summary ? (
              <p className="text-ok text-xs mt-1">{schedule.summary}</p>
            ) : null}
          </div>
        )
      }
      case 'duiScan':
        return (
          <div key={fieldName} className="mb-4 sm:col-span-2">
            <DuiScanStep
              {...duiScan}
              onSkip={() => setSubStep((prev) => prev + 1)}
            />
          </div>
        )
      case 'birthDate':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        )
      case 'gender':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Sexo
            </label>
            <Select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Sin especificar</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </Select>
          </div>
        )
      case 'maritalStatus':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Estado familiar
            </label>
            <Select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
              <option value="">Sin especificar</option>
              {MARITAL_STATUS_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
          </div>
        )
      case 'isssNumber':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Número de afiliación ISSS
            </label>
            <input
              type="text"
              inputMode="numeric"
              name="isssNumber"
              placeholder="123456789"
              value={formData.isssNumber}
              onChange={handleChange}
              maxLength={9}
              className={`${inputClasses} num`}
            />
            {validationErrors.isssNumber
              ? <p className="text-ac text-xs mt-1 font-medium">{validationErrors.isssNumber}</p>
              : <p className="text-[11px] text-muted mt-1">Exactamente 9 dígitos.</p>}
          </div>
        )
      case 'afpInstitution':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Institución administradora de pensión (AFP)
            </label>
            <Select name="afpInstitution" value={formData.afpInstitution} onChange={handleChange}>
              <option value="">Sin especificar</option>
              {AFP_INSTITUTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </Select>
            <p className="text-[11px] text-muted mt-1">El número de afiliación va vinculado al DUI.</p>
          </div>
        )
      case 'bankName':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Banco para pago de planilla
            </label>
            <Select name="bankName" value={formData.bankName} onChange={handleChange}>
              <option value="">Sin especificar</option>
              {BANKS.map((b) => (
                <option key={b.value} value={b.value}>{b.value}</option>
              ))}
            </Select>
          </div>
        )
      case 'bankAccount':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block kick text-muted mb-1.5">
              Número de cuenta bancaria
            </label>
            <input
              type="text"
              inputMode="numeric"
              name="bankAccount"
              placeholder={formData.bankName ? 'Solo dígitos' : 'Elige primero el banco'}
              value={formData.bankAccount}
              onChange={handleChange}
              disabled={!formData.bankName}
              className={`${inputClasses} num disabled:opacity-60`}
            />
            {validationErrors.bankAccount
              ? <p className="text-ac text-xs mt-1 font-medium">{validationErrors.bankAccount}</p>
              : <p className="text-[11px] text-muted mt-1">{bankAccountHint(formData.bankName)}</p>}
          </div>
        )
      case 'permissions':
        return (
          <div key={fieldName} className="sm:col-span-2 space-y-4">
            {Object.entries(PERMISSION_GROUPS).map(([groupName, perms]) => (
              <div key={groupName}>
                <h4 className="kick text-muted mb-2">{groupName}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {perms.map((p) => {
                    const checked = formData.permissions.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePermission(p.id)}
                        className={`flex items-center justify-between gap-2 text-left px-3 py-2 rounded-none border transition-colors ${
                          checked ? 'bg-acsoft/40 border-ac text-ink' : 'bg-surface border-line hover:border-linealt text-inkalt'
                        }`}
                      >
                        <span className="text-xs font-medium">{p.label}</span>
                        <span className={`w-3.5 h-3.5 flex items-center justify-center shrink-0 border ${checked ? 'bg-ac border-ac text-white' : 'border-line text-transparent'}`}>
                          <FAIcon icon="check" size="2xs" />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {formData.permissions.length > 0 && (
              <p className="text-xs text-warn bg-warnsoft/50 border border-warn p-3">
                El usuario recibirá un correo de activación con sus accesos directos al completar el alta.
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
      <form onSubmit={(e) => { e.preventDefault(); handleNext() }} className="space-y-4">
        {renderProgressDots()}

        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink mb-1">
            {currentStep.title}
          </h2>
          <p className="text-xs text-muted">
            {currentStep.subtitle}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-acsoft/40 border border-ac text-ac text-xs flex items-center gap-2">
            <FAIcon icon="circle-exclamation" />
            <span>{error}</span>
          </div>
        )}

        <div className={currentStep.compact ? 'max-w-xl' : 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1'}>
          {currentStep.fields.map(renderField)}
        </div>

        {currentStep.note && (
          <div className="max-w-xl flex items-start gap-3 p-3 border border-line bg-surfalt/40">
            <FAIcon icon="id-card" className="text-ac mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">{currentStep.note}</p>
          </div>
        )}

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-6 mt-6 border-t border-line max-w-xl">
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="px-4 py-2 border border-line text-xs font-semibold text-ink hover:border-linealt hover:bg-surfalt transition disabled:opacity-40"
          >
            <FAIcon icon="arrow-left" className="mr-1.5" /> Volver
          </button>
          <button
            type="button"
            onClick={() => setConfirmCancelOpen(true)}
            disabled={loading}
            className="px-4 py-2 border border-line text-xs font-semibold text-muted hover:text-ac hover:border-ac transition disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-ac hover:bg-ac/90 text-white text-xs font-semibold transition disabled:opacity-50 ml-auto flex items-center gap-2"
          >
            {loading ? (
              <LoadingSpinner color="white" size="xs" />
            ) : (
              <>
                <span>{isLastSubStep ? 'Enviar invitación' : 'Continuar'}</span>
                {!isLastSubStep && <FAIcon icon="arrow-right" size="xs" />}
              </>
            )}
          </button>
        </div>
      </form>
    )
  }

  const renderSuccess = () => (
    <div className="py-8 max-w-md mx-auto text-center">
      <div className="w-12 h-12 bg-oksoft border border-ok/30 flex items-center justify-center mx-auto text-ok mb-4">
        <FAIcon icon="check" className="text-xl" />
      </div>
      <h2 className="text-xl font-bold text-ink mb-1">
        Invitación enviada
      </h2>
      <p className="text-xs text-muted mb-6 leading-relaxed">
        Se ha enviado el enlace de activación a <strong className="text-ink">{formData.email}</strong>. El colaborador podrá completar su registro y definir su contraseña.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleInviteAnother}
          className="w-full sm:w-auto px-5 py-2 bg-ac hover:bg-ac/90 text-white text-xs font-semibold transition"
        >
          Invitar a otra persona
        </button>
        <Link
          to="/employees"
          className="w-full sm:w-auto px-5 py-2 border border-line hover:border-linealt text-ink text-xs font-semibold transition text-center"
        >
          Ir al listado de empleados
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <PageShell
        activeMenu="invite-staff"
        title="Administración"
        subtitle={
          <>
            {step === 1 && 'Envío de invitaciones y alta guiada de colaboradores y administradores.'}
            {step === 2 && `Alta de nuevo ${ROLE_CONFIG[role]?.label.toLowerCase() || 'usuario'} · Paso ${subStep + 1} de ${currentStepsConfig.length}`}
            {step === 3 && 'Invitación enviada exitosamente.'}
          </>
        }
        tabs={adminTabs}
        tabsLabel="Secciones de administración"
      >

        {/* Invitación retomada desde el borrador */}
        {step === 2 && showDraftNotice && restoredDraft && (
          <div className="mb-5 flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-surface shadow-2xs">
            <span className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <FAIcon icon="clock" size="xs" />
            </span>
            <p className="text-[13px] text-inkalt flex-1 min-w-[200px]">
              Retomaste la invitación que dejaste pendiente a las{' '}
              <span className="num text-ink">{draftSavedTime(restoredDraft.savedAt)}</span>.
              Si vuelves a salir sin terminarla, se conserva 30 minutos desde tu último cambio.
            </p>
            <button type="button" onClick={() => setConfirmCancelOpen(true)} className={MODAL_BTN_SECONDARY}>
              Descartar
            </button>
          </div>
        )}

        {/* Contenido principal según el paso */}
        {step === 1 && renderRoleSelection()}
        {step === 2 && renderForm()}
        {step === 3 && renderSuccess()}
      </PageShell>

      {/* Aviso al intentar salir a mitad del alta */}
      {leaveTarget && (
        <ModalShell maxWidth="max-w-md">
          <ModalHeader
            icon="clock"
            tone="warn"
            title="Invitación sin terminar"
            subtitle={`Alta de ${ROLE_CONFIG[role]?.label.toLowerCase() || 'usuario'} en curso`}
            onClose={() => setLeaveTarget(null)}
          />
          <ModalBody>
            <div className="bg-white dark:bg-surface rounded-xl border border-line p-4 shadow-2xs space-y-2">
              <p className="text-[13px] text-inkalt leading-relaxed">
                Si sales ahora, la invitación quedará <span className="text-ink font-medium">pendiente durante 30 minutos</span>.
                Si vuelves a Invitaciones antes de eso, seguirás donde la dejaste; después se borrará.
              </p>
              <p className="text-xs text-muted">También puedes cancelarla y descartar lo que llevas.</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => setLeaveTarget(null)} className={MODAL_BTN_SECONDARY}>
              Seguir aquí
            </button>
            <button type="button" onClick={leaveCancellingInvite} className={MODAL_BTN_SECONDARY}>
              Cancelar invitación
            </button>
            <button type="button" onClick={leaveKeepingDraft} className={MODAL_BTN_PRIMARY}>
              Dejar pendiente
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      <ConfirmModal
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancelConfirmed}
        title="Cancelar registro"
        message="¿Estás seguro de que deseas cancelar? Se perderá la información ingresada en este formulario."
        confirmText="Sí, cancelar"
        cancelText="Seguir editando"
        icon="triangle-exclamation"
        variant="danger"
      />
    </>
  )
}

export default function InviteStaff() {
  return (
    <ToastProvider>
      <InviteStaffContent />
    </ToastProvider>
  )
}
