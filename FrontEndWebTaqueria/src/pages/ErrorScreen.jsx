// src/pages/ErrorScreen.jsx
// Pantalla única para los dos casos de "no puedo mostrarte esto":
//  - 404: la URL no coincide con ninguna ruta conocida.
//  - 403: hay sesión iniciada, pero el usuario no tiene permiso para ver
//    la pantalla que pidió (ProtectedRoute la usa cuando falla el chequeo
//    de requiredPermission, en vez de mandar directo al dashboard sin
//    explicación).
// El caso 401 (sin sesión) no pasa por aquí: ProtectedRoute sigue
// redirigiendo a "/" como antes, ese flujo no se toca.
import { useNavigate } from 'react-router-dom';
import FAIcon from '../components/commons/FAIcon';
import PrimaryButton from '../components/commons/PrimaryButton';
import Logo from '../components/commons/Logo';
import { useAuth } from '../hooks/auth/useAuth';

const VARIANTS = {
  404: {
    code: '404',
    icon: 'map-signs',
    title: 'Página no encontrada',
    message: 'La dirección a la que intentaste entrar no existe o fue movida. Revisa el enlace o vuelve a un lugar conocido.',
  },
  403: {
    code: '403',
    icon: 'user-lock',
    title: 'No tienes autorización',
    message: 'Tu cuenta no tiene permiso para ver esta sección. Si crees que deberías tener acceso, pídele a un administrador que te lo habilite.',
  },
};

export default function ErrorScreen({ variant = 404 }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const content = VARIANTS[variant] || VARIANTS[404];

  const handleGoBack = () => {
    navigate(isAuthenticated ? '/dashboard' : '/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f3f0eb] flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-red-100/40 blur-3xl" />
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-100/20 blur-3xl" />

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <Logo variant="auth" height={90} />

        <div className="w-full bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7),inset_-1px_-1px_3px_rgba(0,0,0,0.05)] border border-white/80 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <FAIcon icon={content.icon} size="2xl" className="text-red-500" />
          </div>

          <p className="text-sm font-display font-bold tracking-widest text-red-500 mb-1">
            ERROR {content.code}
          </p>
          <h1 className="text-2xl font-display font-bold text-gray-800 mb-2">
            {content.title}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {content.message}
          </p>

          <PrimaryButton onClick={handleGoBack}>
            {isAuthenticated ? 'Volver al panel' : 'Ir al inicio de sesión'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
