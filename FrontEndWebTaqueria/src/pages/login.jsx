// src/pages/login.jsx
import AuthCard from '../components/commons/AuthCard';
import PrimaryButton from '../components/commons/PrimaryButton';
import TextInput from '../components/commons/TextInput';
import useLogin from '../hooks/auth/useLogin.js';

export default function Login() {
  const {
    form,
    forgotForm,
    isLoading,
    error,
    showForgotPassword,
    setShowForgotPassword,
    forgotStep,
    handleChange,
    handleForgotChange,
    handleLogin,
    handleForgotStep1,
    handleForgotStep2,
    goBackToLogin,
    // No extraemos navigate porque no lo usamos en la vista
  } = useLogin();

  // Si está en modo recuperación
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-rose-100 opacity-60 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-50 opacity-60 blur-3xl" />

        <AuthCard>
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <img src="/logo.png" alt="Taquería El Corral" className="w-24 h-24 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Recuperar Contraseña</h1>
            <p className="text-sm text-gray-500 mb-6">
              {forgotStep === 1
                ? 'Ingresa tu correo para recibir un código'
                : 'Ingresa el código y tu nueva contraseña'}
            </p>
          </div>

          <form
            onSubmit={forgotStep === 1 ? handleForgotStep1 : handleForgotStep2}
            className="space-y-4"
          >
            {forgotStep === 1 ? (
              <TextInput
                id="forgot-email"
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
                type="email"
                name="email"
                value={forgotForm.email}
                onChange={handleForgotChange}
                disabled={isLoading}
                error={error && !forgotForm.email ? error : ''}
              />
            ) : (
              <>
                <TextInput
                  id="forgot-code"
                  label="Código de verificación"
                  placeholder="Ej: 123456"
                  type="text"
                  name="code"
                  value={forgotForm.code}
                  onChange={handleForgotChange}
                  disabled={isLoading}
                  error={error && !forgotForm.code ? error : ''}
                />
                <TextInput
                  id="forgot-new-password"
                  label="Nueva contraseña"
                  placeholder=""
                  type="password"
                  name="newPassword"
                  value={forgotForm.newPassword}
                  onChange={handleForgotChange}
                  disabled={isLoading}
                  error={error && !forgotForm.newPassword ? error : ''}
                />
                <TextInput
                  id="forgot-confirm-password"
                  label="Confirmar nueva contraseña"
                  placeholder=""
                  type="password"
                  name="confirmPassword"
                  value={forgotForm.confirmPassword}
                  onChange={handleForgotChange}
                  disabled={isLoading}
                  error={error && !forgotForm.confirmPassword ? error : ''}
                />
              </>
            )}

            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md">
                {error}
              </div>
            )}

            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading
                ? 'Cargando...'
                : forgotStep === 1
                ? 'Enviar código'
                : 'Actualizar contraseña'}
            </PrimaryButton>

            <p
              onClick={goBackToLogin}
              className="mt-4 cursor-pointer text-center text-sm text-red-600 hover:underline"
            >
              Volver al login
            </p>
          </form>

          <p className="mt-6 text-xs text-gray-400 text-center">
            © 2026 Taquería El Corral Admin Portal.
          </p>
        </AuthCard>
      </div>
    );
  }

  // --- Formulario de login ---
  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center relative overflow-hidden">
      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-rose-100 opacity-60 blur-3xl" />
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-50 opacity-60 blur-3xl" />

      <AuthCard>
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <img src="/logo.png" alt="Taquería El Corral" className="w-24 h-24 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Portal</h1>
          <p className="text-sm text-gray-500 mb-6">Panel de Administración</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <TextInput
            id="email"
            label="Correo electrónico"
            placeholder="admin@corral.com"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={isLoading}
            error={error && !form.email ? error : ''}
          />

          <TextInput
            id="password"
            label="Contraseña"
            placeholder=""
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            disabled={isLoading}
            error={error && !form.password ? error : ''}
          />

          {/* Selector de rol */}
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              Tipo de usuario
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:border-red-500"
              disabled={isLoading}
            >
              <option value="admin">Administrador</option>
              <option value="employee">Empleado</option>
              <option value="customer">Cliente</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <p
              onClick={() => setShowForgotPassword(true)}
              className="cursor-pointer text-sm text-red-600 hover:underline"
            >
              ¿Olvidó su contraseña?
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </PrimaryButton>
        </form>

        <p className="mt-6 text-xs text-gray-400 text-center">
          © 2026 Taquería El Corral Admin Portal.
        </p>
      </AuthCard>
    </div>
  );
}