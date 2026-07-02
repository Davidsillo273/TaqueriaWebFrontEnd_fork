import { useState, useEffect } from 'react';

const API_URL ='http://localhost:4000/api';

export function useInventory() {
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInsumos = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/inventory`);
            if (!res.ok) throw new Error('Error al traer los insumos');
            const data = await res.json();
            setInsumos(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveInsumo = async (insumoData, id = null) => {
        setLoading(true);
        setError(null);
        try {
            const url = id ? `${API_URL}/inventory/${id}` : `${API_URL}/inventory`;
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(insumoData),
            });

            const resData = await res.json();

            if (!res.ok) {
                // Captura el mensaje exacto de validationsInventoryUtils.js
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

    const deleteInsumo = async (id) => {
        if (!window.confirm('¿Seguro que querés eliminar este insumo?')) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const resData = await res.json();
                throw new Error(resData.message || 'Error al eliminar el insumo');
            }
            await fetchInsumos();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsumos();
    }, []);

    return { insumos, loading, error, setError, saveInsumo, deleteInsumo };
}