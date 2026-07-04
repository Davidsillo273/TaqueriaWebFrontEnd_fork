// context/authContext.jsx
import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/auth/me`, {
        withCredentials: true,
      });
      setUser(response.data);
      return response.data;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const clearUser = useCallback(() => setUser(null), []);

  const value = {
    user,
    isAuthenticated: !!user, // 👈 corregido: antes era `!user`
    isLoading,
    checkAuth,
    setUser,
    clearUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}