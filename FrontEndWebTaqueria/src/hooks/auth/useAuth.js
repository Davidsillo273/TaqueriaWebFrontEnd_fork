// hooks/auth/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext';

// Hook de conveniencia para no importar useContext + AuthContext en cada archivo
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}