// pages/admin/InviteStaff.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Briefcase, CheckCircle2, XCircle } from 'lucide-react';
import { useInvitation } from '../hooks/auth/useInvitation';
import InputField from '../components/commons/inputField';
import LoadingSpinner from '../components/commons/loadingSpinner';
import dayReadyLogo from '../../public/logo.png';

const ROLE_CONFIG = {
  admin: {
    label: 'Administrador',
    icon: Shield,
    description: 'Acceso completo a la gestión del sistema',
    fields: ['email', 'name', 'lastname']
  },
  employee: {
    label: 'Empleado',
    icon: Briefcase,
    description: 'Acceso operativo con permisos específicos',
    fields: ['email', 'name', 'lastname', 'phone', 'DUI_NIT', 'address', 'type', 'salary', 'AFP', 'rent', 'additionalPay']
  }
};

const EMPLOYEE_TYPES = [
  'Camarero',
  'Cocinero',
  'Ayudante de cocina',
  'Bartender',
  'Encargado de local'
];

export default function InviteStaff() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const { loading, error, success, sendInvitation, reset } = useInvitation();

  const [formData, setFormData] = useState({
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
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const fields = ROLE_CONFIG[role].fields;

    if (fields.includes('email') && !formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (fields.includes('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Correo electrónico inválido';
    }

    if (fields.includes('name') && !formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (fields.includes('lastname') && !formData.lastname.trim()) {
      errors.lastname = 'El apellido es requerido';
    }

    if (fields.includes('phone') && !formData.phone.trim()) {
      errors.phone = 'El teléfono es requerido';
    }

    if (fields.includes('DUI_NIT') && !formData.DUI_NIT.trim()) {
      errors.DUI_NIT = 'El DUI/NIT es requerido';
    }

    if (fields.includes('address') && !formData.address.trim()) {
      errors.address = 'La dirección es requerida';
    }

    if (fields.includes('type') && !formData.type) {
      errors.type = 'El tipo de empleado es requerido';
    }

    if (fields.includes('salary') && !formData.salary) {
      errors.salary = 'El salario es requerido';
    } else if (fields.includes('salary') && isNaN(formData.salary)) {
      errors.salary = 'El salario debe ser un número';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const data = {
      email: formData.email.trim(),
      name: formData.name.trim(),
      lastname: formData.lastname.trim(),
    };

    // Agregar campos específicos de empleado
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
      });
    }

    const result = await sendInvitation(role, data);
    
    if (result.success) {
      setStep(3);
    }
  };

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
    reset();
  };

  const handleInviteAnother = () => {
    setFormData({
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
    });
    setValidationErrors({});
    setRole(null);
    setStep(1);
    reset();
  };

  const renderRoleSelection = () => (
    <div className="space-y-3">
      {Object.entries(ROLE_CONFIG).map(([key, config]) => {
        const Icon = config.icon;
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleSelectRole(key)}
            className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{config.label}</p>
              <p className="text-xs text-gray-500">{config.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderEmployeeFields = () => (
    <>
      <InputField
        label="Teléfono"
        type="tel"
        name="phone"
        placeholder="Ej. 1234-5678"
        value={formData.phone}
        onChange={handleChange}
        error={validationErrors.phone}
        required
      />
      <InputField
        label="DUI/NIT"
        type="text"
        name="DUI_NIT"
        placeholder="Ej. 12345678-9"
        value={formData.DUI_NIT}
        onChange={handleChange}
        error={validationErrors.DUI_NIT}
        required
      />
      <InputField
        label="Dirección"
        type="text"
        name="address"
        placeholder="Ej. Calle Principal #123"
        value={formData.address}
        onChange={handleChange}
        error={validationErrors.address}
        required
      />
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Empleado <span className="text-red-500">*</span>
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition"
        >
          <option value="">Selecciona un tipo</option>
          {EMPLOYEE_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {validationErrors.type && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.type}</p>
        )}
      </div>
      <InputField
        label="Salario Base"
        type="number"
        name="salary"
        placeholder="Ej. 1500.00"
        value={formData.salary}
        onChange={handleChange}
        error={validationErrors.salary}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="AFP (%)"
          type="number"
          name="AFP"
          placeholder="Ej. 7.25"
          value={formData.AFP}
          onChange={handleChange}
          error={validationErrors.AFP}
        />
        <InputField
          label="Renta (%)"
          type="number"
          name="rent"
          placeholder="Ej. 10.00"
          value={formData.rent}
          onChange={handleChange}
          error={validationErrors.rent}
        />
      </div>
      <InputField
        label="Pago Adicional"
        type="number"
        name="additionalPay"
        placeholder="Ej. 100.00"
        value={formData.additionalPay}
        onChange={handleChange}
        error={validationErrors.additionalPay}
      />
    </>
  );

  const renderForm = () => {
    const config = ROLE_CONFIG[role];
    const isEmployee = role === 'employee';

    return (
      <form onSubmit={handleSubmit} className="space-y-1">
        <p className="text-xs text-gray-500 mb-4 text-center">
          Se enviará un enlace de registro al correo proporcionado
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <InputField
          label="Correo electrónico"
          type="email"
          name="email"
          placeholder={`${config.label.toLowerCase()}@syscor.com`}
          value={formData.email}
          onChange={handleChange}
          error={validationErrors.email}
          required
        />
        <InputField
          label="Nombres"
          type="text"
          name="name"
          placeholder="Ej. David Eduardo"
          value={formData.name}
          onChange={handleChange}
          error={validationErrors.name}
          required
        />
        <InputField
          label="Apellidos"
          type="text"
          name="lastname"
          placeholder="Ej. Pérez García"
          value={formData.lastname}
          onChange={handleChange}
          error={validationErrors.lastname}
          required
        />

        {isEmployee && renderEmployeeFields()}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={loading}
            className="w-1/3 border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-2/3 bg-red-400 hover:bg-red-500 active:bg-red-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <LoadingSpinner /> : 'Enviar invitación'}
          </button>
        </div>
      </form>
    );
  };

  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
      </div>
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
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
        className="w-full mt-2 bg-red-400 hover:bg-red-500 active:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
      >
        Invitar a otra persona
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <img src={dayReadyLogo} alt="SYSCOR Logo" className="w-48 h-auto mx-auto object-contain" />
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
    </div>
  );
}