import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Detectar si estamos en desarrollo
const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = IS_DEV 
  ? '/api' 
  : (import.meta.env?.VITE_API_BASE_URL || 'https://syscor.onrender.com/api');

export const useCombos = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCombos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/combos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const formDataToSend = formData instanceof FormData ? formData : new FormData();
      
      if (!(formData instanceof FormData)) {
        Object.keys(formData).forEach(key => {
          if (formData[key] !== undefined && formData[key] !== null) {
            formDataToSend.append(key, formData[key]);
          }
        });
      }

      const response = await fetch(`${API_URL}/combos`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
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

  const deleteCombo = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/combos/${id}`, {
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
    const user = localStorage.getItem('user');
    if (user) {
      fetchCombos();
    } else {
      navigate('/');
    }
  }, []);

  return {
    combos,
    loading,
    error,
    fetchCombos,
    addCombo,
    deleteCombo,
    setError,
  };
};