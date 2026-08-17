import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DigitInput from '../components/auth/DigitInput';
import PrimaryButton from '../components/commons/PrimaryButton';
import AuthCard from '../components/commons/AuthCard';
import ConfirmModal from '../components/commons/ConfirmModal';
import Logo from '../components/commons/Logo';
import useRecoveryPassword from '../hooks/auth/useRecoveryPassword';

export default function VerifyCode() {
  const {
    digits,
    inputError,
    apiError,
    isLoading,
    isLoadingResend,
    resendSuccess,
    timer,
    success,
    showConfirmModal,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmLeave,
    validateVerifyStep, 
    handleDigitChange,
    handleKeyDown,
    handleVerifyCode,
    handleResendCode,
  } = useRecoveryPassword();

  const inputRefs = useRef([]);

  // Validar al cargar la pantalla
  useEffect(() => {
    validateVerifyStep();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#f3f0eb] flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-red-100/40 blur-3xl" />
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-100/20 blur-3xl" />

      <AuthCard>
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <Logo variant="auth" height={110} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-800 mb-1">Admin Portal</h1>
          <p className="text-sm text-gray-500 mb-6">Recuperación de contraseña</p>
        </div>

        {!success ? (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-display font-bold text-gray-800 text-center">Ingresa el código</h2>
              <p className="text-sm text-gray-600 text-center">
                Por favor, escribe el código de 6 dígitos que hemos enviado a tu correo.
              </p>
            </div>

            <div className="flex justify-center gap-2 sm:gap-3">
              {digits.map((digit, index) => (
                <DigitInput
                  key={index}
                  value={digit}
                  onChange={(val, i) => handleDigitChange(val, i, inputRefs)}
                  onKeyDown={(e, i) => handleKeyDown(e, i, inputRefs)}
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  index={index}
                />
              ))}
            </div>

            {resendSuccess && (
              <div className="p-3 bg-green-50 rounded-2xl border border-green-200 text-center shadow-sm">
                <p className="text-xs font-semibold text-green-700">{resendSuccess}</p>
              </div>
            )}

            {inputError && (
              <p className="text-sm text-red-500 text-center font-medium">{inputError}</p>
            )}

            {apiError && (
              <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-center shadow-sm flex flex-col gap-0.5">
                <p className="text-sm font-bold text-red-600">{apiError.title}</p>
                {apiError.message && <p className="text-xs text-red-500">{apiError.message}</p>}
              </div>
            )}

            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar'}
            </PrimaryButton>

            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-xs text-gray-600">
                ¿No recibiste el código?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={timer > 0 || isLoadingResend}
                  className="text-red-500 hover:text-red-600 font-semibold transition-colors disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoadingResend
                    ? 'Reenviando...'
                    : timer > 0
                    ? `Reenviar en (${formatTime(timer)})`
                    : 'Reenviar'}
                </button>
              </p>

              <button
                type="button"
                onClick={openConfirmModal}
                className="text-xs text-gray-500 hover:text-red-500 font-medium transition-colors cursor-pointer underline underline-offset-2"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 rounded-2xl border border-green-200 shadow-sm">
              <p className="text-sm text-green-700 font-medium">Código verificado correctamente</p>
              <p className="text-xs text-green-600 mt-1">Tu identidad ha sido confirmada</p>
            </div>
            <Link className="block text-sm text-red-500 hover:text-red-600 font-medium transition-colors" to="/reset-password">
              Continuar a restablecer contraseña
            </Link>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400 text-center">
          © Taquería El Corral Admin Portal. Acceso restringido a personal autorizado.
        </p>
      </AuthCard>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmLeave}
        title="¿Volver al inicio de sesión?"
        message="¿Estás seguro de que deseas salir? Perderás el código ingresado y tendrás que volver a solicitarlo."
        confirmText="Sí, salir"
        cancelText="Continuar aquí"
      />
    </div>
  );
}