import { useState, useEffect, useCallback } from "react";

const API_URL = 'http://localhost:4000/api';

export default function useTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todas las mesas
  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/tables`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      const tablesArray = Array.isArray(data) ? data : [];
      setTables(tablesArray);
      
    } catch (err) {
      console.error("Error cargando mesas:", err);
      setError(err.message || "Error al cargar las mesas");
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva mesa
  const createTable = useCallback(async (tableData) => {
    try {
      const response = await fetch(`${API_URL}/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          number: Number(tableData.number),
          status: tableData.status || 'Disponible'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear mesa');
      }

      await fetchTables();
      return { success: true, message: 'Mesa creada exitosamente' };
      
    } catch (err) {
      console.error("Error creando mesa:", err);
      return { success: false, message: err.message };
    }
  }, [fetchTables]);

  // Actualizar mesa
  const updateTable = useCallback(async (id, tableData) => {
    try {
      const response = await fetch(`${API_URL}/tables/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          number: Number(tableData.number),
          status: tableData.status
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar mesa');
      }

      await fetchTables();
      return { success: true, message: 'Mesa actualizada exitosamente' };
      
    } catch (err) {
      console.error("Error actualizando mesa:", err);
      return { success: false, message: err.message };
    }
  }, [fetchTables]);

  // Eliminar mesa
  const deleteTable = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/tables/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar mesa');
      }

      await fetchTables();
      return { success: true, message: 'Mesa eliminada exitosamente' };
      
    } catch (err) {
      console.error("Error eliminando mesa:", err);
      return { success: false, message: err.message };
    }
  }, [fetchTables]);

  // Cargar mesas al montar el componente
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    loading,
    error,
    fetchTables,
    createTable,
    updateTable,
    deleteTable
  };
}