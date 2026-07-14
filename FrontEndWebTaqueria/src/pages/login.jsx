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
  } = useLogin();

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-[#f3f0eb] flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-red-100/40 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-100/20 blur-3xl" />

        <AuthCard>
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <img src="/logo.png" alt="Taquería El Corral" className="w-24 h-24 mx-auto" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-800 mb-1">Recuperar Contraseña</h1>
            <p className="text-sm text-gray-500 mb-6">
              {forgotStep === 1
                ? 'Ingresa tu correo para recibir un código'
                : 'Ingresa el código y tu nueva contraseña'}
            </p>
          </div>

          <form onSubmit={forgotStep === 1 ? handleForgotStep1 : handleForgotStep2} className="space-y-4">
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
              <div className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-2xl border border-red-200 shadow-sm">
                {error}
              </div>
            )}

            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? 'Cargando...' : forgotStep === 1 ? 'Enviar código' : 'Actualizar contraseña'}
            </PrimaryButton>

            <p onClick={goBackToLogin} className="mt-4 cursor-pointer text-center text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
              Volver al inicio de sesión
            </p>
          </form>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f0eb] flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-red-100/40 blur-3xl" />
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-100/20 blur-3xl" />

      <AuthCard>
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <img src="/logo.png" alt="Taquería El Corral" className="w-24 h-24 mx-auto" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-800 mb-1">Admin Portal</h1>
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
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            disabled={isLoading}
            error={error && !form.password ? error : ''}
          />

          <div className="w-full">
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Tipo de usuario
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] appearance-none"
              disabled={isLoading}
            >
              <option value="admin">Administrador</option>
              <option value="employee">Empleado</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <p onClick={() => setShowForgotPassword(true)} className="cursor-pointer text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
              ¿Olvidó su contraseña?
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-2xl border border-red-200 shadow-sm">
              {error}
            </div>
          )}

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </PrimaryButton>
        </form>
      </AuthCard>
    </div>
  );
}