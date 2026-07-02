import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://syscor.onrender.com/api';

export default function useClients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al obtener clientes');
      
      setClients(Array.isArray(data) ? data : data.customers || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

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