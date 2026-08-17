import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:4000/api';

// "Empleados destacados": quién vendió más, filtrable por día/semana/mes.
export default function useEmployeeLeaderboard() {
  const [topEmployees, setTopEmployees] = useState([]);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async (nextPeriod = 'week') => {
    setPeriod(nextPeriod);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/orders/leaderboard/employees?period=${nextPeriod}`, { credentials: 'include' });
      if (!res.ok) throw new Error('No se pudo cargar el ranking de empleados');
      const json = await res.json();
      setTopEmployees(json.topEmployees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { topEmployees, period, loading, error, fetchLeaderboard };
}
