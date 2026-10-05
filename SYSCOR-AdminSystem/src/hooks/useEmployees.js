import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function useEmployees(enabled = true) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            // credentials: 'include' manda la cookie de sesión, necesaria además
            // porque la ruta de actualizar empleado exige estar autenticado.
            const res = await fetch(`${API_URL}/users/employees`, { credentials: 'include' });
            if (!res.ok) throw new Error('Error al obtener la lista de empleados');
            const data = await res.json();
            setEmployees(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const updateEmployee = async (id, updatedData) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/users/employees/${id}`, {
                credentials: 'include',
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Error al actualizar los datos del empleado');
            }
            await fetchEmployees();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Manda al empleado un enlace por correo para que él mismo defina su nueva
    // contraseña; el admin nunca la escribe ni la ve.
    const sendPasswordResetInvitation = async (id) => {
        try {
            const res = await fetch(`${API_URL}/users/employees/${id}/send-password-reset`, {
                credentials: 'include',
                method: 'POST',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { success: false, message: data.message || 'No se pudo enviar la invitación' };
            }
            return { success: true, message: data.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    useEffect(() => {
        // "enabled" evita pedir /users/employees (admin-only en el backend) a
        // quienes de entrada no van a poder verla, ej. el Dashboard para un
        // empleado sin el permiso "employees".
        if (enabled) fetchEmployees();
    }, [enabled]);

    return { employees, loading, error, updateEmployee, sendPasswordResetInvitation };
}