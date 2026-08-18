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

  return {
    clients,
    isLoading,
    error,
    fetchClients,
  };
}