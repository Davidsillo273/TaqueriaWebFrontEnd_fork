import { useState, useEffect, useCallback } from "react";

const API_URL = 'http://localhost:4000/api';

// Historial de facturación (colección "invoices"): son registros de solo
// lectura, el backend los genera solo cuando un pedido pasa a "delivered".
export default function useInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/invoices`, { credentials: 'include' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setInvoices(data);
        } catch (err) {
            console.error("Error al obtener el historial de facturación:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    return { invoices, loading, fetchInvoices };
}
