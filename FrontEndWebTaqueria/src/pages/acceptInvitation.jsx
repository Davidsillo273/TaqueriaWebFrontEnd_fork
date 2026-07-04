import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInvitation } from '../hooks/auth/useInvitation';
import InputField from '../components/commons/inputField';
import LoadingSpinner from '../components/commons/loadingSpinner';
import dayReadyLogo from '../../public/logo.png';

export default function AcceptInvitation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { loading, error, validateInvitation, acceptInvitation, reset } = useInvitation();

  // Estados locales
  const [checking, setChecking] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitedData, setInvitedData] = useState(null);
  const [role, setRole] = useState(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [terms, setTerms] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Determina el rol según la ruta actual (admin o employee)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/admin/')) setRole('admin');
    else if (path.includes('/employee/')) setRole('employee');
  }, []);

  // Validar el token de invitación al montar el componente
  useEffect(() => {
    const validate = async () => {
      if (!token || !role) {
        setValidationErrors({ general: 'Enlace de invitación inválido.' });
        setChecking(false);
        return;
      }
      const result = await validateInvitation(token, role);
      if (result.success) {
        setInvitedData(result.data);
        setInvitationValid(true);
      } else {
        setValidationErrors({ general: result.error });
      }
      setChecking(false);
    };
    validate();
  }, [token, role, validateInvitation]);

  // Manejo de la imagen de perfil
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!password) errors.password = 'La contraseña es requerida';
    else if (password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres';
    if (!confirmPassword) errors.confirmPassword = 'Confirma tu contraseña';
    else if (password !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
    if (!terms) errors.terms = 'Debes aceptar los términos y condiciones';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const result = await acceptInvitation(token, password, imageFile, role);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setValidationErrors({ general: result.error });
    }
  };

  // --- VISTA MIENTRAS SE VERIFICA EL TOKEN ---
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <img src={dayReadyLogo} alt="Logo" className="w-48 h-auto mx-auto object-contain" />
          <div className="py-10">
            <LoadingSpinner color="red" />
            <p className="text-gray-500 text-sm mt-4">Verificando invitación...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA SI LA INVITACIÓN NO ES VÁLIDA ---
  if (!invitationValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <img src={dayReadyLogo} alt="Logo" className="w-48 h-auto mx-auto object-contain" />
          <div className="py-6">
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{validationErrors.general}</p>
            </div>
            <button onClick={() => navigate('/')} className="text-red-600 hover:text-red-700 text-sm font-medium">
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA DE ÉXITO TRAS COMPLETAR EL REGISTRO ---
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <img src={dayReadyLogo} alt="Logo" className="w-48 h-auto mx-auto object-contain" />
          <div className="py-6">
            <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-green-700 text-sm font-medium">
                ✓ Registro completado exitosamente. Redirigiendo al inicio de sesión...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FORMULARIO DE REGISTRO ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <img src={dayReadyLogo} alt="Logo" className="w-48 h-auto mx-auto object-contain" />
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-800 font-semibold text-lg">¡Hola, {invitedData?.personalInfo?.name}!</p>
          <p className="text-gray-600 text-sm mt-1">
            {role === 'admin'
              ? 'Crea tu contraseña para completar tu registro como Administrador'
              : `Crea tu contraseña para completar tu registro como ${invitedData?.personalInfo?.type || 'Empleado'}`
            }
          </p>
        </div>

        {validationErrors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{validationErrors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: null }));
            }}
            error={validationErrors.password}
            required
          />
          <InputField
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (validationErrors.confirmPassword) setValidationErrors(prev => ({ ...prev, confirmPassword: null }));
            }}
            error={validationErrors.confirmPassword}
            required
          />

          {/* Subida de foto de perfil (opcional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto de perfil (opcional)</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-400">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
                <span className="text-sm text-gray-600">Seleccionar imagen</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imageFile && (
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-red-600 text-sm hover:text-red-700">
                  Eliminar
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG, GIF</p>
          </div>

          {/* Aceptación de términos */}
          <div className="mb-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => {
                  setTerms(e.target.checked);
                  if (validationErrors.terms) setValidationErrors(prev => ({ ...prev, terms: null }));
                }}
                className="form-checkbox h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-2 text-sm text-gray-600">
                Acepto los{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline">
                  términos y condiciones
                </a>
              </span>
            </label>
            {validationErrors.terms && <p className="text-red-500 text-xs mt-2 ml-6">{validationErrors.terms}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <LoadingSpinner color="white" size="sm" /> : 'Completar registro'}
          </button>
        </form>
      </div>
    </div>
  );
}