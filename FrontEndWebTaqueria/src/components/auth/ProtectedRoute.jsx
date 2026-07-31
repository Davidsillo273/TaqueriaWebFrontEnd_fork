// components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth';

// Envuelve cualquier página privada. Mientras se resuelve /auth/me muestra
// un loader simple para evitar el "parpadeo" de mandar al login por error
// antes de que la petición termine.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">Verificando sesión...</p>
      </div>
    );
  }
console.log("valor de isAutenticated:" + isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}