import React from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../components/commons/TextInput';
import PrimaryButton from '../components/commons/PrimaryButton';
import AuthCard from '../components/commons/AuthCard';
import Logo from '../components/commons/Logo';
import useRecoveryPassword from '../hooks/auth/useRecoveryPassword';

export default function Recovery() {
  const {
    email,
    inputError,
    apiError,
    isLoading,
    success,
    handleEmailChange,
    handleRequestCode,
  } = useRecoveryPassword();

  return (
    <div className="min-h-screen bg-[#f3f0eb] flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-red-100/40 blur-3xl" />
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-100/20 blur-3xl" />

      <AuthCard>
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <Logo variant="auth" height={110} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-800 mb-1">Recuperar contraseña</h1>
          <p className="text-sm text-gray-500 mb-6">Ingresa tu correo para recibir un código de recuperación</p>
        </div>

        {!success ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <TextInput
              key="recovery-email"
              id="recovery-email"
              label="Correo electrónico"
              type="email"
              placeholder="admin@corral.com"
              value={email}
              disabled={isLoading}
              onChange={handleEmailChange}
              error={inputError}
            />

            {/* Renderizado de errores estructurados provenientes de la API */}
            {apiError && (
              <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-center shadow-sm flex flex-col gap-0.5">
                <p className="text-sm font-bold text-red-600">{apiError.title}</p>
                {apiError.message && <p className="text-xs text-red-500">{apiError.message}</p>}
              </div>
            )}

            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar código'}
            </PrimaryButton>

            <div className="text-center">
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="text-xs text-gray-500 hover:text-red-500 font-medium transition-colors cursor-pointer underline underline-offset-2"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 rounded-2xl border border-green-200 shadow-sm">
              <p className="text-sm text-green-700 font-medium">Correo enviado correctamente</p>
              <p className="text-xs text-green-600 mt-1">Revisa tu bandeja de entrada para el código de recuperación</p>
            </div>
            <Link className="block text-sm text-red-500 hover:text-red-600 font-medium transition-colors" to="/">
              Volver al login
            </Link>
          </div>
        )}
      </AuthCard>
    </div>
  );
}