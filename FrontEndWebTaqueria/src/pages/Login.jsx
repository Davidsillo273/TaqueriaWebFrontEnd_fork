import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../components/commons/AuthCard';
import PrimaryButton from '../components/commons/PrimaryButton';
import TextInput from '../components/commons/TextInput';
import useLogin from '../hooks/auth/useLogin.js';

export default function Login() {
  const navigate = useNavigate();
  const { form, isLoading, error, handleChange, handleLogin } = useLogin();

  return (
    <div className="min-h-screen bg-[#f3f0eb] flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-red-100/40 blur-3xl" />
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-100/20 blur-3xl" />

      <AuthCard>
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <img src="/logo.png" alt="Taquería El Corral" className="w-24 h-24 mx-auto" />
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
    </div>
  );
}