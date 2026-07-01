import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://syscor.onrender.com/api';

export default function useClients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null); // null = Crear, objeto = Editar

  // --- OBTENER CLIENTES (READ) ---
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
      
      // Manejar si viene directo el arreglo o envuelto en un objeto
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

  const handleOpenCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  // --- ELIMINAR CLIENTE (DELETE) ---
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este cliente, maje?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar');
      }

      await fetchClients();
    } catch (err) {
      console.error(err);
      alert(err.message || 'No se pudo eliminar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    isLoading,
    error,
    isModalOpen,
    editingClient,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleDelete,
    fetchClients, // Se lo pasaremos al modal para refrescar al guardar
  };
}