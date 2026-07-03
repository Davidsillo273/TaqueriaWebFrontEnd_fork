// context/AuthContext.jsx
import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AuthContext = createContext(null);

// Provider único para toda la app: consulta /auth/me una vez al montar,
// y expone user/isAuthenticated para que ProtectedRoute y el resto de
// componentes no tengan que repetir esa lógica cada uno por su cuenta.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/auth/me`, {
        withCredentials: true, // manda la authCookie httpOnly
      });
      setUser(response.data);
      return response.data;
    } catch (err) {
      // 401 o cualquier error de red = no hay sesión válida
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Al abrir/recargar la app, verificamos si ya hay sesión
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const clearUser = useCallback(() => setUser(null), []);

  const value = {
    user,
    isAuthenticated: !user,
    isLoading,
    checkAuth,
    setUser,
    clearUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}