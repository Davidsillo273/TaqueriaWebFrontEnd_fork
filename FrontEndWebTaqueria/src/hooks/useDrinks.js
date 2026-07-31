import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:4000/api/menu/drinks';

export default function useDrinks() {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener bebidas (GET)
  const fetchDrinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al obtener el catálogo');
      const data = await response.json();

      const adapted = data.map((drink) => ({
        id: drink._id,
        image: drink.image || null,
        title: drink.name,
        price: drink.price,
        category: drink.category,
        subcategory: drink.subcategory || '',
        description: drink.description || '',
        // Solo las de tercero llevan stock propio
        stock: drink.category === 'tercero' ? drink.quantity : null,
        status: drink.status,
        recipe: Array.isArray(drink.recipe) ? drink.recipe : [],
        isMostSold: false,
        isAvailable: drink.status === 'disponible',
      }));

      setDrinks(adapted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrinks();
  }, [fetchDrinks]);

  // Crear bebida (POST) - recibe directamente FormData
  const addDrink = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        body: formData, // El FormData ya incluye todos los campos
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al guardar la bebida');
      }

      await fetchDrinks();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar bebida (PUT) - recibe directamente FormData
  const updateDrink = async (id, formData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al actualizar');
      }

      await fetchDrinks();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar bebida (DELETE)
  const deleteDrink = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('No se pudo eliminar el registro');

      setDrinks((prev) => prev.filter((d) => d.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Busca si ya existe una bebida con ese nombre (sugerencia, no bloqueo)
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

  return { drinks, loading, error, addDrink, updateDrink, deleteDrink, checkName, refetch: fetchDrinks };
}
