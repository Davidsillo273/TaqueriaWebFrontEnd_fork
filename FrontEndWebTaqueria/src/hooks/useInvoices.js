import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/invoices` : '/api/invoices';

// Historial de facturación (ventas ya completadas) + el resumen numérico
// que arma el backend para el Dashboard (hoy vs ayer, tendencia de 14 días,
// ventas por tipo de pedido, top productos, ticket promedio...).
export default function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [invoicesRes, analyticsRes] = await Promise.all([
        fetch(API_URL, { credentials: 'include' }),
        fetch(`${API_URL}/analytics`, { credentials: 'include' }),
      ]);

      if (!invoicesRes.ok) throw new Error('Error al obtener la facturación');
      if (!analyticsRes.ok) throw new Error('Error al obtener el análisis de ventas');

      setInvoices(await invoicesRes.json());
      setAnalytics(await analyticsRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, analytics, loading, error, refetch: fetchInvoices };
}
