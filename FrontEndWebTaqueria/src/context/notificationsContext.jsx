// context/notificationsContext.jsx
import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/auth/useAuth';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://syscor-mll9.onrender.com/api';

// Cada cuánto se vuelve a preguntar al servidor si hay movimientos nuevos
const POLLING_INTERVAL_MS = 30000;

export const NotificationsContext = createContext(null);

// Este provider vive una sola vez en toda la app (se monta en App.jsx), así el
// sondeo al servidor ocurre una única vez y tanto la campana del TopBar como la
// página de notificaciones comparten exactamente los mismos datos.
export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Arranca en true porque la primera consulta se dispara apenas monta el provider
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Evita que un sondeo lento pise el resultado de otro más reciente
  const isFetchingRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    // Sin sesión no hay nada que consultar (y el endpoint respondería 403)
    if (!isAuthenticated) return;

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const response = await axios.get(`${BASE_URL}/notifications`, {
        withCredentials: true,
      });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
      setError(null);
    } catch {
      // Un fallo de sondeo no debe romper la interfaz: guardamos el error y seguimos
      setError('No se pudieron cargar las notificaciones');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Carga inicial + sondeo periódico mientras haya sesión activa
  useEffect(() => {
    fetchNotifications();

    if (!isAuthenticated) return;

    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchNotifications]);

  // Marca una notificación como leída. Actualizamos primero la pantalla y
  // después el servidor, para que la campana responda al instante.
  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isReadLocally: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await axios.patch(`${BASE_URL}/notifications/${id}/read`, {}, { withCredentials: true });
    } catch {
      // Si falló, recargamos para volver al estado real del servidor
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isReadLocally: true })));
    setUnreadCount(0);

    try {
      await axios.patch(`${BASE_URL}/notifications/read-all`, {}, { withCredentials: true });
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Consulta una página específica del historial (usada por /notificaciones).
  // A diferencia de fetchNotifications, esta NO toca el estado compartido de
  // la campana — cada página que la llama guarda el resultado donde quiera,
  // así el paginado del historial completo no interfiere con el badge del TopBar.
  const fetchPage = useCallback(async ({ page = 1, limit = 10, category } = {}) => {
    const params = { page, limit };
    if (category && category !== 'all') params.category = category;

    const response = await axios.get(`${BASE_URL}/notifications`, {
      params,
      withCredentials: true,
    });
    return response.data;
  }, []);

  // Al cerrar sesión no borramos el estado con un efecto: simplemente dejamos de
  // exponerlo. Así la campana queda vacía al instante y, si el usuario vuelve a
  // entrar, el siguiente sondeo lo repuebla con datos frescos.
  const value = {
    notifications: isAuthenticated ? notifications : [],
    unreadCount: isAuthenticated ? unreadCount : 0,
    // Sin sesión nunca estamos "cargando": no hay nada que traer
    isLoading: isAuthenticated && isLoading,
    error,
    markRead,
    markAllRead,
    refetch: fetchNotifications,
    fetchPage,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
