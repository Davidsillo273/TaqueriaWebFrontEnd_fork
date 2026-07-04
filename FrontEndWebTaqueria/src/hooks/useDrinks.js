import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:4000/api/drinks';

export default function useDrinks() {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. OBTENER BEBIDAS (GET)
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

      // Mapeo adaptando el formato de MongoDB al Frontend
      const adapted = data.map((drink) => ({
        id: drink._id,
        image: drink.image,
        title: drink.name,
        price: drink.price, 
        stock: drink.quantity,
        status: drink.status,
        isMostSold: drink.status === 'Más Vendido',
        isAvailable: drink.quantity > 0,
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

  // 2. CREAR BEBIDA (POST)
  const addDrink = async (formData) => {
    setLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.title);
      dataToSend.append('price', formData.price);
      dataToSend.append('quantity', formData.stock);
      dataToSend.append('status', formData.status);
      if (formData.imageFile) {
        dataToSend.append('image', formData.imageFile); // Archivo binario para Multer
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        body: dataToSend, // FormData define automáticamente el Content-Type multipart/form-data
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

  // 3. ACTUALIZAR BEBIDA (PUT)
  const updateDrink = async (id, formData) => {
    setLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.title);
      dataToSend.append('price', formData.price);
      dataToSend.append('quantity', formData.stock);
      dataToSend.append('status', formData.status);
      if (formData.imageFile) {
        dataToSend.append('image', formData.imageFile);
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
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

  // 4. ELIMINAR BEBIDA (DELETE)
  const deleteDrink = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta bebida?')) return;
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

  return { drinks, loading, error, addDrink, updateDrink, deleteDrink, refetch: fetchDrinks };
}