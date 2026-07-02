import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:4000/api';

export default function useClients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/customers`, {
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
    fetchClients();
  }, [fetchClients]);

  const handleOpenEdit = useCallback((client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingClient(null);
  }, []);

  return {
    clients,
    isLoading,
    error,
    isModalOpen,
    editingClient,
    handleOpenEdit,
    handleCloseModal,
    fetchClients,
  };
}