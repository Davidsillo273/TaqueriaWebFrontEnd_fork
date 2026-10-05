import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/menu/saucers` : '/api/menu/saucers';

export default function useSaucers() {
  const [saucers, setSaucers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSaucers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al obtener los platillos');
      const data = await response.json();
      setSaucers(data); // Asume que la API devuelve el array directamente
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaucers();
  }, [fetchSaucers]);

  // Crear platillo (POST)
  const createSaucer = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        body: formData, // FormData con campos: name, category, price, status, image
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al crear el platillo');
      }
      await fetchSaucers();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar platillo (PUT)
  const updateSaucer = async (id, formData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al actualizar el platillo');
      }
      await fetchSaucers();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar platillo (DELETE)
  const deleteSaucer = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al eliminar el platillo');
      }
      // Actualiza la lista local sin necesidad de refetch completo
      setSaucers(prev => prev.filter(s => s._id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Busca si ya existe un platillo con ese nombre (sugerencia, no bloqueo)
  const checkName = async (name) => {
    try {
      const res = await fetch(`${API_URL}/check-name?name=${encodeURIComponent(name)}`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.existing || null;
    } catch {
      return null;
    }
  };

  return { saucers, loading, error, createSaucer, updateSaucer, deleteSaucer, checkName, refetch: fetchSaucers };
}