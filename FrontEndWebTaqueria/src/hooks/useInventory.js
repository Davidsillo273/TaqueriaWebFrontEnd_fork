import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function useInventory(enabled = true) {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsumos = async () => {
    setLoading(true);
    setError(null);
    try {
      // credentials: 'include' manda la cookie de sesión, para que el backend
      // sepa qué usuario realizó el movimiento y lo registre en notificaciones.
      const res = await fetch(`${API_URL}/inventory`, { credentials: 'include' });
      if (!res.ok) throw new Error('Error al traer los insumos');
      const data = await res.json();
      setInsumos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Recibe un FormData (soporta imagen opcional), igual que el resto de
  // modales de menú (bebidas, platillos, extras, combos)
  const saveInsumo = async (formData, id = null) => {
    setLoading(true);
    setError(null);
    try {
      const url = id ? `${API_URL}/inventory/${id}` : `${API_URL}/inventory`;
      const method = id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        credentials: 'include',
        method,
        body: formData,
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || 'Error al procesar el insumo');
      }

      await fetchInsumos();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Crea un insumo mínimo (nombre + unidad + categoría) desde el builder de
  // receta de una bebida/platillo/compuesto/extra. Queda "pendiente" hasta
  // que el admin lo complete desde Inventario.
  const quickCreateInsumo = async ({ name, unit, type }) => {
    try {
      const res = await fetch(`${API_URL}/inventory/quick`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, unit, type }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, message: resData.message || 'No se pudo crear el insumo' };
      }
      await fetchInsumos();
      return { success: true, insumo: resData.newInventory };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Busca si ya existe un insumo con ese nombre (sugerencia, no bloqueo)
  const checkName = async (name) => {
    try {
      const res = await fetch(`${API_URL}/inventory/check-name?name=${encodeURIComponent(name)}`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.existing || null;
    } catch {
      return null;
    }
  };

  // Revisa si el stock actual alcanza para una receta, sin descontar nada todavía
  const checkRecipeStock = async (recipe) => {
    try {
      const res = await fetch(`${API_URL}/inventory/check-recipe-stock`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.missing || [];
    } catch {
      return [];
    }
  };

  const deleteInsumo = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/inventory/${id}`, { credentials: 'include', method: 'DELETE' });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Error al eliminar el insumo');
      }
      setInsumos(prev => prev.filter(item => item._id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // "enabled" evita pedir /inventory (admin-only en el backend) a quienes
    // de entrada no van a poder verlo, ej. el Dashboard para un empleado sin
    // el permiso "inventory".
    if (enabled) fetchInsumos();
  }, [enabled]);

  return { insumos, loading, error, saveInsumo, deleteInsumo, quickCreateInsumo, checkName, checkRecipeStock };
}