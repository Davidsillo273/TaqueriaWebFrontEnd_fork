import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// "Empleados destacados": quién vendió más, filtrable por día/semana/mes/año
// /todo el historial, o por un rango de fechas personalizado.
export default function useEmployeeLeaderboard() {
  const [topEmployees, setTopEmployees] = useState([]);
  const [period, setPeriod] = useState('week');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Con period="custom" hace falta también el rango; se pasa explícito en
  // vez de leerlo del estado para no arrastrar un valor viejo si el usuario
  // cambia las fechas justo antes de que la pantalla vuelva a consultar.
  const fetchLeaderboard = useCallback(async (nextPeriod = 'week', range = null) => {
    setPeriod(nextPeriod);
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nextPeriod === 'custom' && range?.from && range?.to) {
        params.set('from', range.from);
        params.set('to', range.to);
      } else {
        params.set('period', nextPeriod);
      }

      const res = await fetch(`${API_URL}/orders/leaderboard/employees?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('No se pudo cargar el ranking de empleados');
      const json = await res.json();
      setTopEmployees(json.topEmployees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    topEmployees, period, loading, error, fetchLeaderboard,
    customRange, setCustomRange,
  };
}
