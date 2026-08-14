import { useState, useEffect, useCallback } from "react";
const API_URL = 'http://localhost:4000/api';

export default function useTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // credentials: 'include' manda la cookie de sesión, para que el backend
      // sepa qué usuario realizó el movimiento y lo registre en notificaciones.
      const res = await fetch(`${API_URL}/tables`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTable = async (tableData) => {
    try {
      const res = await fetch(`${API_URL}/tables`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: Number(tableData.number), status: tableData.status || 'libre' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear mesa');
      await fetchTables();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateTable = async (id, tableData) => {
    try {
      const res = await fetch(`${API_URL}/tables/${id}`, {
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: Number(tableData.number), status: tableData.status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar mesa');
      await fetchTables();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteTable = async (id) => {
    try {
      const res = await fetch(`${API_URL}/tables/${id}`, { credentials: 'include', method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar mesa');
      setTables(prev => prev.filter(t => t._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  useEffect(() => { fetchTables(); }, [fetchTables]);

  return { tables, loading, error, createTable, updateTable, deleteTable, fetchTables };
}