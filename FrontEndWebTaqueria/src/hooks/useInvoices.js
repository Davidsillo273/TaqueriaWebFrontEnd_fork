import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocketEvent } from './useSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

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

  // El resumen de ventas lo calcula el backend con agregaciones sobre TODAS
  // las facturas, así que no se puede actualizar sumando un delta: hay que
  // volver a pedirlo. Solo se hace cuando una comanda llega a "delivered",
  // que es el único momento en que nace una factura (ver generateInvoice).
  //
  // El aviso se agrupa en una pequeña espera porque al cerrar varias mesas
  // seguidas llegan varios eventos casi a la vez, y sería absurdo recalcular
  // el análisis completo una vez por cada uno.
  const refreshTimerRef = useRef(null);

  useSocketEvent(SOCKET_EVENTS.ORDER_UPDATED, ({ order }) => {
    if (order?.status !== 'delivered') return;

    clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(fetchInvoices, 800);
  });

  // Si el componente se desmonta con un refresco pendiente, se cancela para
  // no dejar una consulta huérfana actualizando estado que ya no existe.
  useEffect(() => () => clearTimeout(refreshTimerRef.current), []);

  return { invoices, analytics, loading, error, refetch: fetchInvoices };
}
