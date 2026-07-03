// hooks/auth/useLogout.js
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './useAuth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const useLogout = () => {
  const navigate = useNavigate();
  const { clearUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Error en logout:', err);
      setError(err.response?.data?.message || 'Error al cerrar sesión');
    } finally {
      clearUser(); // limpia el contexto para que ProtectedRoute reaccione al instante
      setLoading(false);
      navigate('/', { replace: true });
    }
  }, [navigate, clearUser]);

  return { logout, loading, error };
};