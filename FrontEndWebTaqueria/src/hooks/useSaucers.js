import { useState, useEffect } from 'react';

// Cambia esta URL por la dirección real de tu servidor backend si es diferente
const API_URL = 'http://localhost:4000/api/saucers'; 

export default function useSaucers() {
  const [saucers, setSaucers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. OBTENER TODOS LOS PLATILLOS (GET)
  const fetchSaucers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.isMostSold && !response.ok) throw new Error('Error al obtener platillos');
      const data = await response.json();
      setSaucers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. CREAR UN PLATILLO (POST - multipart/form-data)
  const createSaucer = async (formData) => {
    try {
      // Nota: Cuando enviamos un objeto FormData, NO debemos definir el 'Content-Type' manualmente,
      // el navegador añadirá automáticamente el boundary correcto.
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el platillo');
      }
      await fetchSaucers(); // Recargar la lista
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 3. ACTUALIZAR UN PLATILLO (PUT - multipart/form-data)
  const updateSaucer = async (id, formData) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el platillo');
      }
      await fetchSaucers(); // Recargar la lista
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 4. ELIMINAR UN PLATILLO (DELETE)
  const deleteSaucer = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar el platillo');
      await fetchSaucers(); // Recargar la lista
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchSaucers();
  }, []);

  return {
    saucers,
    loading,
    error,
    createSaucer,
    updateSaucer,
    deleteSaucer,
    refetch: fetchSaucers
  };
}