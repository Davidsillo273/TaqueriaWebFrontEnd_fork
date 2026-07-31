import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export const useCombos = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCombos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/menu/combos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('user');
          navigate('/');
          throw new Error('Sesión expirada. Inicia sesión nuevamente.');
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setCombos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching combos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const addCombo = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/menu/combos`, {
        method: 'POST',
        credentials: 'include',
        body: formData, // Pasa directamente el FormData construido en el modal
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/');
          throw new Error('Sesión expirada');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear combo');
      }
      await fetchCombos();
    } catch (err) {
      console.error('Error adding combo:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // NUEVA FUNCIONALIDAD: ACTUALIZAR COMBO EXISTENTE
  const updateCombo = async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/menu/combos/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/');
          throw new Error('Sesión expirada');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar combo');
      }
      await fetchCombos();
    } catch (err) {
      console.error('Error updating combo:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCombo = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/menu/combos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/');
          throw new Error('Sesión expirada');
        }
        throw new Error('Error al eliminar combo');
      }
      setCombos(prev => prev.filter(combo => combo._id !== id));
    } catch (err) {
      console.error('Error deleting combo:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  // Busca si ya existe un combo con ese nombre (sugerencia, no bloqueo)
  const checkName = async (name) => {
    try {
      const res = await fetch(`${API_URL}/menu/combos/check-name?name=${encodeURIComponent(name)}`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.existing || null;
    } catch {
      return null;
    }
  };

  return {
    combos,
    loading,
    error,
    fetchCombos,
    addCombo,
    updateCombo,
    deleteCombo,
    checkName,
    setError,
  };
};