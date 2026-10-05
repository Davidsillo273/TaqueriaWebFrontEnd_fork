import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function useClients(enabled = true) {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/users/customers`, {
        // credentials: 'include' manda la cookie de sesión, para que el backend
        // sepa qué usuario realizó el movimiento y lo registre en notificaciones.
        credentials: 'include',
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      // Intentamos parsear la respuesta como JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // Si no es JSON válido, obtenemos el texto
        const textResponse = await response.text();
        throw new Error(textResponse || 'Respuesta del servidor no válida');
      }

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Aseguramos que siempre tengamos un array
      let clientsArray = [];
      if (Array.isArray(data)) {
        clientsArray = data;
      } else if (data.customers && Array.isArray(data.customers)) {
        clientsArray = data.customers;
      } else if (data.data && Array.isArray(data.data)) {
        clientsArray = data.data;
      } else {
        // Si la respuesta tiene otra estructura, intentamos extraer lo que podamos
        console.warn('Estructura de respuesta inesperada:', data);
        clientsArray = [];
      }

      setClients(clientsArray);
    } catch (err) {
      console.error('Error en fetchClients:', err);
      setError(err.message || 'Error de conexión con el servidor');
      // En caso de error, limpiamos la lista de clientes
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // "enabled" evita pedir /users/customers (admin-only en el backend) a
    // quienes de entrada no van a poder verlo, ej. el Dashboard para un
    // empleado sin el permiso "clients".
    if (enabled) fetchClients();
  }, [enabled, fetchClients]);

  // Activa o desactiva la cuenta de un cliente. Desactivarlo le impide
  // iniciar sesión, pero conserva su historial (lo necesita la contabilidad).
  const toggleClientStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/users/customers/${id}/status`, {
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, message: data.message || 'No se pudo actualizar el estado del cliente' };
      }

      // Se actualiza solo la fila afectada en vez de recargar toda la lista:
      // es un cambio de un campo y así la tabla no parpadea.
      setClients((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: data.data?.status || status } : c))
      );

      return { success: true, message: data.message };
    } catch (err) {
      console.error('Error al cambiar el estado del cliente:', err);
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Historial de pedidos de un cliente. No se guarda en el estado del hook
  // porque solo lo necesita el modal de detalle mientras está abierto.
  const fetchClientOrders = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/customers/${id}/orders`, {
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, message: data.message || 'No se pudo cargar el historial' };
      }

      return { success: true, orders: data.orders || [], summary: data.summary || null };
    } catch (err) {
      console.error('Error al cargar el historial del cliente:', err);
      return { success: false, message: 'Error de conexión' };
    }
  }, []);

  return {
    clients,
    isLoading,
    error,
    fetchClients,
    toggleClientStatus,
    fetchClientOrders,
  };
}