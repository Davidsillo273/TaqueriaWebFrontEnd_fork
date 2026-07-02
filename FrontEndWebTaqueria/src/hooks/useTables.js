import { useState, useEffect } from "react";
import axios from "axios"; // Traemos axios para pegarle al backend

export default function useTables() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para jalar todas las mesas de la base de datos
    const fetchTables = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/tables");
            setTables(response.data);
            setError(null);
        } catch (err) {
            console.error("Error jalando las mesas:", err);
            setError(err.response?.data?.message || "Error al cargar las mesas");
        } finally {
            setLoading(false);
        }
    };

    // Para guardar una mesa nuevita
    const createTable = async (tableData) => {
        try {
            const response = await axios.post("/api/tables", tableData);
            await fetchTables(); // Recargamos para ver los cambios en vivo
            return { success: true, message: response.data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Error al crear la mesa" };
        }
    };

    // Para actualizar el número o cambiarle el estado a la mesa
    const updateTable = async (id, tableData) => {
        try {
            const response = await axios.put(`/api/tables/${id}`, tableData);
            await fetchTables(); // Recargamos la lista
            return { success: true, message: response.data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Error al actualizar" };
        }
    };

    // Por si queremos borrar una mesa que ya no ocupemos
    const deleteTable = async (id) => {
        try {
            const response = await axios.delete(`/api/tables/${id}`);
            await fetchTables(); // Recargamos la lista
            return { success: true, message: response.data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Error al eliminar" };
        }
    };

    // Se ejecuta solito en cuanto carga la pantalla para traer los datos reales
    useEffect(() => {
        fetchTables();
    }, []);

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