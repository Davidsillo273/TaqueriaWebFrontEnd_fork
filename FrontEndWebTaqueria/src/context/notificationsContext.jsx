// context/notificationsContext.jsx
import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/auth/useAuth';
import { useSocketEvent, useSocket } from '../hooks/useSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Cuántas notificaciones se mantienen en memoria para la campana. El servidor
// devuelve 10 por página; al ir llegando avisos nuevos por socket los vamos
// insertando al inicio, y este tope evita que la lista crezca sin control
// durante un turno largo con la pestaña abierta.
const BELL_MAX_ITEMS = 20;

export const NotificationsContext = createContext(null);

// Este provider vive una sola vez en toda la app (se monta en App.jsx), así la
// consulta al servidor ocurre una única vez y tanto la campana del TopBar como
// la página de notificaciones comparten exactamente los mismos datos.
//
// Antes preguntaba al servidor cada 30 segundos. Ahora hace una sola consulta
// inicial (la "foto" del estado actual) y a partir de ahí el servidor le manda
// cada aviso nuevo apenas ocurre, por Socket.IO.
export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { reconnectCount } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Arranca en true porque la primera consulta se dispara apenas monta el provider
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Evita que una consulta lenta pise el resultado de otra más reciente
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
      // Un fallo de consulta no debe romper la interfaz: guardamos el error y seguimos
      setError('No se pudieron cargar las notificaciones');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Carga inicial: la foto del estado actual al entrar.
  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  // Al reconectar sí se vuelve a consultar todo: mientras el cable estuvo
  // caído pudieron ocurrir avisos que nadie escuchó, y esos ya no se pueden
  // recuperar como eventos sueltos.
  useEffect(() => {
    if (reconnectCount > 0) fetchNotifications();
  }, [reconnectCount, fetchNotifications]);

  // Aviso nuevo en vivo: se agrega arriba de la lista sin volver a pedir nada.
  // El servidor solo lo manda a los roles que pueden verlo (el mismo filtro
  // "audience" que aplica la consulta paginada), así que no hace falta filtrar
  // aquí de nuevo.
  useSocketEvent(SOCKET_EVENTS.NOTIFICATION_CREATED, ({ notification }) => {
    if (!notification?._id) return;

    setNotifications((prev) => {
      // El servidor puede reenviar el mismo aviso si hubo un reintento de
      // conexión; comprobarlo evita que aparezca duplicado en la campana.
      if (prev.some((n) => n._id === notification._id)) return prev;
      return [notification, ...prev].slice(0, BELL_MAX_ITEMS);
    });

    setUnreadCount((prev) => prev + 1);
  });

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
  // entrar, la siguiente consulta lo repuebla con datos frescos.
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
