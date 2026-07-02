import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://syscor.onrender.com/api';

export function useInventory() {
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInsumos = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/inventory`);
            if (!res.ok) throw new Error('Error al traer los insumos');
            const data = await res.json();
            setInsumos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveInsumo = async (insumoData, id = null) => {
        setLoading(true);
        try {
            const url = id ? `${API_URL}/inventory/${id}` : `${API_URL}/inventory`;
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(insumoData),
            });

            if (!res.ok) throw new Error('Error al guardar el insumo');
            await fetchInsumos();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteInsumo = async (id) => {
        if (!window.confirm('¿Seguro que querés eliminar este insumo?')) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar el insumo');
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

    return { insumos, loading, error, saveInsumo, deleteInsumo };
}