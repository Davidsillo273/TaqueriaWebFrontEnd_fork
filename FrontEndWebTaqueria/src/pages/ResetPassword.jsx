import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../components/commons/TextInput';
import PrimaryButton from '../components/commons/PrimaryButton';
import AuthCard from '../components/commons/AuthCard';
import ConfirmModal from '../components/commons/ConfirmModal';
import useRecoveryPassword from '../hooks/auth/useRecoveryPassword';

export default function ResetPassword() {
    const {
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        inputError,
        apiError,
        isLoading,
        success,
        handleResetPassword,
        showConfirmModal,
        openConfirmModal,
        closeConfirmModal,
        handleConfirmLeave,
        validateResetStep, 
    } = useRecoveryPassword();

    // Validar al cargar que la persona efectivamente haya verificado el código
    useEffect(() => {
        validateResetStep();
    }, []);

    return (
        <div className="min-h-screen bg-[#f3f0eb] flex items-center justify-center relative overflow-hidden p-4">
            <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-red-100/40 blur-3xl" />
            <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-100/20 blur-3xl" />

            <AuthCard>
                <div className="flex flex-col items-center text-center">
                    <div className="mb-6">
                        <img src="/logo.png" alt="Taquería El Corral" className="w-24 h-24 mx-auto" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-gray-800 mb-1">Nueva Contraseña</h1>
                    <p className="text-sm text-gray-500 mb-6">Ingresa y confirma tu nueva clave de acceso</p>
                </div>

                {!success ? (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <TextInput
                            id="new-password"
                            label="Nueva contraseña"
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            disabled={isLoading}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <TextInput
                            id="confirm-password"
                            label="Confirmar contraseña"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            disabled={isLoading}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

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
                            {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
                        </PrimaryButton>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={openConfirmModal}
                                className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
                            >
                                Cancelar y volver al login
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4 text-center">
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-200 shadow-sm">
                            <p className="text-sm text-green-700 font-medium">¡Contraseña actualizada!</p>
                            <p className="text-xs text-green-600 mt-1">
                                Tu contraseña se ha cambiado correctamente. Redirigiéndote al inicio de sesión...
                            </p>
                        </div>
                        <Link className="block text-sm text-red-500 hover:text-red-600 font-medium transition-colors mt-2" to="/">
                            Ir al Login ahora
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
                message="¿Estás seguro de que deseas salir? Perderás el avance y tendrás que solicitar un nuevo código."
                confirmText="Sí, salir"
                cancelText="Continuar aquí"
            />
        </div>
    );
}