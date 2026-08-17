import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../components/commons/AuthCard';
import PrimaryButton from '../components/commons/PrimaryButton';
import TextInput from '../components/commons/TextInput';
import Logo from '../components/commons/Logo';
import FAIcon from '../components/commons/FAIcon';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../hooks/auth/useAuth';
import useLogin from '../hooks/auth/useLogin.js';
import useAccessCodeLogin from '../hooks/auth/useAccessCodeLogin.js';

export default function Login() {
  const navigate = useNavigate();
  const { form, isLoading, error, handleChange, handleLogin } = useLogin();
  const { theme, toggleTheme } = useTheme();
  const { checkAuth } = useAuth();
  const { verifying, loggingIn, verifyCode, loginWithCode } = useAccessCodeLogin();

  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState(null);

  // Una vez el código es válido, se pasa a pedir la contraseña con el fondo
  // borroso, sin volver a pedir el correo.
  const [verifiedEmployee, setVerifiedEmployee] = useState(null); // { name } | null
  const [codePassword, setCodePassword] = useState('');
  const [codeLoginError, setCodeLoginError] = useState(null);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setCodeError(null);
    if (!accessCode.trim()) {
      setCodeError('Ingresa tu código de acceso');
      return;
    }
    const result = await verifyCode(accessCode.trim().toUpperCase());
    if (result.success) {
      setVerifiedEmployee({ name: result.name });
    } else {
      setCodeError(result.message);
    }
  };

  const handleCodeLogin = async (e) => {
    e.preventDefault();
    setCodeLoginError(null);
    if (!codePassword) {
      setCodeLoginError('Ingresa tu contraseña');
      return;
    }
    const result = await loginWithCode(accessCode.trim().toUpperCase(), codePassword);
    if (!result.success) {
      setCodeLoginError(result.message);
      return;
    }
    const currentUser = await checkAuth();
    if (!currentUser) {
      setCodeLoginError('Sesión iniciada pero no se pudo verificar. Intenta de nuevo.');
      return;
    }
    navigate('/dashboard');
  };

  const closeCodeLogin = () => {
    setVerifiedEmployee(null);
    setCodePassword('');
    setCodeLoginError(null);
  };

  return (
    <div className="min-h-screen bg-[#f3f0eb] flex items-center justify-center relative overflow-hidden p-4">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-2 pl-1 pr-1 py-1 bg-white/90 border border-white/80 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_1px_1px_2px_rgba(255,255,255,0.6)]"
      >
        <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${theme === 'light' ? 'bg-red-500 text-white' : 'text-gray-400'}`}>
          <FAIcon icon="sun" size="sm" />
        </span>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-red-500 text-white' : 'text-gray-400'}`}>
          <FAIcon icon="moon" size="sm" />
        </span>
      </button>

      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-red-100/40 blur-3xl" />
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-100/20 blur-3xl" />

      <div className="flex flex-col items-center gap-5 w-full">
        <AuthCard>
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <Logo variant="auth" height={110} className="mx-auto" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-800 mb-1">Portal administrador</h1>
            <p className="text-sm text-gray-500 mb-6">Ingrese sus credenciales</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <TextInput
              id="login-email"
              label="Correo electrónico"
              placeholder="admin@corral.com"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <TextInput
              id="login-password"
              label="Contraseña"
              placeholder="********"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/recovery')}
                className="cursor-pointer text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            {/* Mensaje de error de Login con Título y Mensaje */}
            {error && (
              <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-center shadow-sm flex flex-col gap-0.5">
                {typeof error === 'object' ? (
                  <>
                    <p className="text-sm font-bold text-red-600">{error.title}</p>
                    {error.message && <p className="text-xs text-red-500">{error.message}</p>}
                  </>
                ) : (
                  <p className="text-sm text-red-500 whitespace-pre-line">{error}</p>
                )}
              </div>
            )}

            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </PrimaryButton>
          </form>
        </AuthCard>

        {/* Acceso alterno para empleados con permisos: fuera de la tarjeta de
            login, flotando debajo, tal como lo pidió el admin. */}
        <div className="w-full max-w-md bg-white/90 border border-white/80 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.6)] p-5">
          <p className="text-sm font-display font-semibold text-gray-700 mb-3">
            ¿Empleado con permisos? Ingresa tu código de acceso:
          </p>
          <form onSubmit={handleVerifyCode} className="flex gap-2">
            <input
              type="text"
              value={accessCode}
              onChange={(e) => { setAccessCode(e.target.value); if (codeError) setCodeError(null); }}
              placeholder="Ej. A3F92C"
              maxLength={8}
              className="flex-1 px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm text-gray-700 placeholder:text-gray-400 uppercase tracking-widest shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]"
            />
            <button
              type="submit"
              disabled={verifying}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-display font-semibold rounded-2xl transition-colors disabled:opacity-60 shadow-[0_6px_16px_rgba(220,38,38,0.3)]"
            >
              {verifying ? '...' : 'Continuar'}
            </button>
          </form>
          {codeError && <p className="text-red-500 text-xs mt-2 font-medium">{codeError}</p>}
        </div>
      </div>

      {/* Fondo borroso + contraseña, una vez el código fue validado */}
      {verifiedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/80 max-w-sm w-full p-6 sm:p-8">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <FAIcon icon="lock" className="text-red-500" />
              </div>
              <p className="font-display font-bold text-gray-900 text-lg">Hola, {verifiedEmployee.name}</p>
              <p className="text-sm text-gray-500">Ingresa tu contraseña para continuar</p>
            </div>

            <form onSubmit={handleCodeLogin} className="space-y-4">
              <TextInput
                id="code-login-password"
                label="Contraseña"
                placeholder="********"
                type="password"
                name="codePassword"
                value={codePassword}
                onChange={(e) => { setCodePassword(e.target.value); if (codeLoginError) setCodeLoginError(null); }}
                disabled={loggingIn}
              />

              {codeLoginError && (
                <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-center shadow-sm">
                  <p className="text-sm text-red-500">{codeLoginError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeCodeLogin}
                  disabled={loggingIn}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-display font-semibold rounded-2xl transition-colors disabled:opacity-60"
                >
                  Cancelar
                </button>
                <PrimaryButton type="submit" disabled={loggingIn} className="flex-1">
                  {loggingIn ? 'Ingresando...' : 'Ingresar'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
