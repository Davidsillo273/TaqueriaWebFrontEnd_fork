import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Rankings de "Clientes destacados": más activos, mayor gasto total y
// compras más caras. Las tres tarjetas comparten un solo período (antes cada
// una tenía el suyo fijo: 7 días, histórico completo y semana en curso; sin
// filtro explícito el backend sigue usando esos mismos valores por defecto,
// así que nada de lo que ya existía cambió de comportamiento).
export default function useCustomerLeaderboard() {
  const [data, setData] = useState({ mostActive: [], topSpenders: [], priciestWeek: [] });
  const [period, setPeriod] = useState(null);
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async (nextPeriod = null, range = null) => {
    setPeriod(nextPeriod);
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nextPeriod === 'custom' && range?.from && range?.to) {
        params.set('from', range.from);
        params.set('to', range.to);
      } else if (nextPeriod) {
        params.set('period', nextPeriod);
      }
      // Sin período: se omite el parámetro y el backend usa sus valores por
      // defecto de siempre en cada tarjeta.

      const query = params.toString();
      const res = await fetch(`${API_URL}/orders/leaderboard/customers${query ? `?${query}` : ''}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('No se pudo cargar el ranking de clientes');
      const json = await res.json();
      setData({
        mostActive: json.mostActive || [],
        topSpenders: json.topSpenders || [],
        priciestWeek: json.priciestWeek || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ...data, period, loading, error, fetchLeaderboard,
    customRange, setCustomRange,
  };
}
