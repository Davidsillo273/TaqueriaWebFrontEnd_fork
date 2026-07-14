import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInvitation } from '../hooks/auth/useInvitation';
import LoadingSpinner from '../components/commons/loadingSpinner';
import dayReadyLogo from '../../public/logo.png';

// Estilos base para inputs clay (los mismos que usamos en todo el sistema)
const inputClasses =
  'w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 placeholder:text-gray-400 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]';

export default function AcceptInvitation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { loading, error, validateInvitation, acceptInvitation, reset } = useInvitation();

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
      <div className="min-h-screen flex items-center justify-center bg-[#f3f0eb] p-4">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1),inset_1px_1px_3px_rgba(255,255,255,0.8)] border border-white/80 p-8 max-w-md w-full text-center">
          <img src={dayReadyLogo} alt="Logo" className="w-48 h-auto mx-auto object-contain" />
          <div className="py-10">
            <LoadingSpinner color="red" />
            <p className="text-gray-500 text-sm mt-4 font-medium">Verificando invitación...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA SI LA INVITACIÓN NO ES VÁLIDA ---
  if (!invitationValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f0eb] p-4">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1),inset_1px_1px_3px_rgba(255,255,255,0.8)] border border-white/80 p-8 max-w-md w-full text-center">
          <img src={dayReadyLogo} alt="Logo" className="w-48 h-auto mx-auto object-contain" />
          <div className="py-6">
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
              <p className="text-red-600 text-sm">{validationErrors.general}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-red-500 hover:text-red-600 text-sm font-display font-semibold transition-colors"
            >
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
      <div className="min-h-screen flex items-center justify-center bg-[#f3f0eb] p-4">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1),inset_1px_1px_3px_rgba(255,255,255,0.8)] border border-white/80 p-8 max-w-md w-full text-center">
          <img src={dayReadyLogo} alt="Logo" className="w-48 h-auto mx-auto object-contain" />
          <div className="py-6">
            <div className="p-3 bg-green-50 border border-green-200 rounded-2xl shadow-sm">
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
    <div className="min-h-screen flex items-center justify-center bg-[#f3f0eb] p-4">
      <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1),inset_1px_1px_3px_rgba(255,255,255,0.8)] border border-white/80 p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <img src={dayReadyLogo} alt="Logo" className="w-48 h-auto mx-auto object-contain" />
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-800 font-display font-bold text-lg">¡Hola, {invitedData?.personalInfo?.name}!</p>
          <p className="text-gray-600 text-sm mt-1">
            {role === 'admin'
              ? 'Crea tu contraseña para completar tu registro como Administrador'
              : `Crea tu contraseña para completar tu registro como ${invitedData?.personalInfo?.type || 'Empleado'}`
            }
          </p>
        </div>

        {validationErrors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
            <p className="text-red-600 text-sm text-center">{validationErrors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña */}
          <div className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: null }));
              }}
              className={inputClasses}
            />
            {validationErrors.password && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.password}</p>}
          </div>

          {/* Confirmar contraseña */}
          <div className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Confirmar contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (validationErrors.confirmPassword) setValidationErrors(prev => ({ ...prev, confirmPassword: null }));
              }}
              className={inputClasses}
            />
            {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.confirmPassword}</p>}
          </div>

          {/* Subida de foto de perfil (opcional) */}
          <div className="mb-4">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Foto de perfil (opcional)
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-400 shadow-sm">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition font-display font-semibold text-sm text-gray-600 shadow-[0_2px_6px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)]">
                <span>Seleccionar imagen</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imageFile && (
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="text-red-500 text-sm font-display font-semibold hover:text-red-600 transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG, GIF</p>
          </div>

          {/* Aceptación de términos */}
          <div className="mb-6">
            <label className="flex items-start cursor-pointer p-3 bg-white rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition-shadow">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => {
                  setTerms(e.target.checked);
                  if (validationErrors.terms) setValidationErrors(prev => ({ ...prev, terms: null }));
                }}
                className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded mt-0.5 accent-red-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                Acepto los{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600 underline font-medium">
                  términos y condiciones
                </a>
              </span>
            </label>
            {validationErrors.terms && <p className="text-red-500 text-xs mt-2 ml-6">{validationErrors.terms}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-display font-semibold py-3 rounded-2xl transition disabled:opacity-50 flex items-center justify-center
              shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
              active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]"
          >
            {loading ? <LoadingSpinner color="white" size="sm" /> : 'Completar registro'}
          </button>
        </form>
      </div>
    </div>
  );
}