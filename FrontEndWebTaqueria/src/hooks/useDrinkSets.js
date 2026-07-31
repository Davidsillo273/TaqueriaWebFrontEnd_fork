import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:4000/api/menu/drink-sets';

// Conjuntos de bebidas: agrupaciones de conveniencia (ej. "La clásica" =
// Coca-Cola + Fanta) que el admin arma una vez y reutiliza al crear combos.
// Se pueden deshabilitar pero nunca eliminar (por si un combo ya los usa).
export default function useDrinkSets({ activeOnly = false } = {}) {
  const [drinkSets, setDrinkSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDrinkSets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(activeOnly ? `${API_URL}/active` : API_URL, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al obtener los conjuntos de bebidas');
      const data = await response.json();
      setDrinkSets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchDrinkSets();
  }, [fetchDrinkSets]);

  const createDrinkSet = async ({ name, drinkIds }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, drinkIds }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Error al crear el conjunto' };
      await fetchDrinkSets();
      return { success: true, set: data.newSet };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateDrinkSet = async (id, { name, drinkIds }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, drinkIds }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Error al actualizar el conjunto' };
      await fetchDrinkSets();
      return { success: true, set: data.updatedSet };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const toggleDrinkSetStatus = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) return { success: false };
      await fetchDrinkSets();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  return { drinkSets, loading, error, createDrinkSet, updateDrinkSet, toggleDrinkSetStatus, refetch: fetchDrinkSets };
}
