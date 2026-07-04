import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInvitation } from '../hooks/auth/useInvitation';
import InputField from '../components/commons/inputField';
import LoadingSpinner from '../components/commons/loadingSpinner';
import dayReadyLogo from '../../public/logo.png';

const ROLE_PATHS = {
  admin: '/admin/accept-invitation',
  employee: '/employee/accept-invitation'
};

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

  // Determinar el rol basado en la URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/admin/')) {
      setRole('admin');
    } else if (path.includes('/employee/')) {
      setRole('employee');
    }
  }, []);

  // Validar token al cargar
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!password) errors.password = 'La contraseña es requerida';
    if (password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres';
    if (!confirmPassword) errors.confirmPassword = 'Confirma tu contraseña';
    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!terms) errors.terms = 'Debes aceptar los términos y condiciones';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const result = await acceptInvitation(token, password, imageFile, role);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setValidationErrors({ general: result.error });
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
        }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <img src={dayReadyLogo} alt="SYSCOR Logo" className="w-48 h-auto mx-auto object-contain" />
          </div>
          <div className="py-10 text-center">
            <LoadingSpinner />
            <p className="text-gray-500 text-sm mt-4">Verificando invitación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invitationValid) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
       
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <img src={dayReadyLogo} alt="SYSCOR Logo" className="w-48 h-auto mx-auto object-contain" />
          </div>
          <div className="py-6 text-center">
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{validationErrors.general}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('//')}
              className="text-red-400 hover:text-red-500 text-sm font-medium"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
        }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <img src={dayReadyLogo} alt="SYSCOR Logo" className="w-48 h-auto mx-auto object-contain" />
          </div>
          <div className="py-6 text-center">
            <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
              <p className="text-green-700 text-sm font-medium">
                ✓ Registro completado exitosamente. Redirigiendo al inicio de sesión...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
      }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <img src={dayReadyLogo} alt="SYSCOR Logo" className="w-48 h-auto mx-auto object-contain" />
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-800 font-semibold">
            ¡Hola, {invitedData?.personalInfo?.name}!
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {role === 'admin' ? 'Crea tu contraseña para completar tu registro como Administrador' : 
             `Crea tu contraseña para completar tu registro como ${invitedData?.personalInfo?.type || 'Empleado'}`}
          </p>
        </div>

        {validationErrors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{validationErrors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <InputField
            label="Contraseña"
            type="password"
            placeholder="•••••••• (mínimo 8 caracteres)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationErrors.password) {
                setValidationErrors({ ...validationErrors, password: null });
              }
            }}
            error={validationErrors.password}
            required
          />
          <InputField
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (validationErrors.confirmPassword) {
                setValidationErrors({ ...validationErrors, confirmPassword: null });
              }
            }}
            error={validationErrors.confirmPassword}
            required
          />

          {/* Subida de foto de perfil */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto de perfil (opcional)
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-400">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
                <span className="text-sm text-gray-600">Seleccionar imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Eliminar
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG, GIF</p>
          </div>

          <div className="mb-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => {
                  setTerms(e.target.checked);
                  if (validationErrors.terms) {
                    setValidationErrors({ ...validationErrors, terms: null });
                  }
                }}
                className="form-checkbox h-4 w-4 text-red-500 focus:ring-red-400 border-gray-300 rounded mt-1"
              />
              <span className="ml-2 text-sm text-gray-600">
                Acepto los{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">
                  términos y condiciones
                </a>
              </span>
            </label>
            {validationErrors.terms && (
              <p className="text-red-500 text-xs mt-2 ml-6">{validationErrors.terms}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-400 hover:bg-red-500 active:bg-red-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <LoadingSpinner /> : 'Completar registro'}
          </button>
        </form>
      </div>
    </div>
  );
}