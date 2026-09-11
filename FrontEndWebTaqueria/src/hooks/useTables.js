import { useState, useEffect, useCallback } from "react";
import { useSocketEvent, useSocket } from "./useSocket";
import { SOCKET_EVENTS } from "../constants/socketEvents";

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function useTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { reconnectCount } = useSocket();

  // Trae la "foto" inicial de las mesas. Después de esto, cada cambio llega
  // por socket: una mesa que se desocupa aparece libre en el acto, aunque la
  // haya liberado otra persona desde otra computadora.
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

  // --- Tiempo real ---
  // Los eventos tocan solo la mesa afectada, sin recargar la cuadrícula entera.

  useSocketEvent(SOCKET_EVENTS.TABLE_CREATED, ({ table }) => {
    if (!table?._id) return;
    setTables((prev) => (prev.some((t) => t._id === table._id) ? prev : [...prev, table]));
  });

  useSocketEvent(SOCKET_EVENTS.TABLE_UPDATED, ({ table }) => {
    if (!table?._id) return;
    setTables((prev) => {
      const exists = prev.some((t) => t._id === table._id);
      if (!exists) return [...prev, table];
      return prev.map((t) => (t._id === table._id ? table : t));
    });
  });

  useSocketEvent(SOCKET_EVENTS.TABLE_DELETED, ({ tableId }) => {
    if (!tableId) return;
    setTables((prev) => prev.filter((t) => t._id !== tableId));
  });

  // El cambio masivo sí recarga: cambiaron todas las mesas de una vez, así que
  // pedir la lista completa es más barato que recibir una mesa por evento.
  useSocketEvent(SOCKET_EVENTS.TABLES_BULK_UPDATED, () => {
    fetchTables();
  });

  // Al reconectar se vuelve a pedir todo: los cambios ocurridos mientras el
  // cable estuvo caído no llegaron como eventos.
  useEffect(() => {
    if (reconnectCount > 0) fetchTables();
  }, [reconnectCount, fetchTables]);

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
      // El backend emite table:created y el listener de arriba la agrega.
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateTable = async (id, tableData) => {
    try {
      const res = await fetch(`${API_URL}/tables/${id}`, {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: Number(tableData.number), status: tableData.status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar mesa');
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Pone el mismo estado a todas las mesas de una vez (ej. "abrir el local"
  // dejando todo en libre, o mandar todas a limpieza al cerrar).
  const bulkUpdateStatus = async (status) => {
    try {
      const res = await fetch(`${API_URL}/tables/status-all`, {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar las mesas');
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
      // El backend emite table:deleted; el listener la quita de la lista.
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  useEffect(() => { fetchTables(); }, [fetchTables]);

  return { tables, loading, error, createTable, updateTable, bulkUpdateStatus, deleteTable, fetchTables };
}