import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://syscor.onrender.com/api';

export function useEmployees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Obtiene la lista completa de empleados desde el backend
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/employees`);
            if (!res.ok) throw new Error('Error al obtener la lista de empleados');
            const data = await res.json();
            setEmployees(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Actualiza los permisos o el estado del empleado mediante PUT
    const updateEmployee = async (id, updatedData) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) throw new Error('Error al actualizar los datos del empleado');
            await fetchEmployees(); // Sincroniza la vista reflejando los cambios
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    return { employees, loading, error, updateEmployee };
}