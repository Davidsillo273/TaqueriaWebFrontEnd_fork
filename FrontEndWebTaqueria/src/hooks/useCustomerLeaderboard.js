import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Rankings de "Clientes destacados": más activos en 7 días, mayor gasto total
// y las compras más caras de la semana. Se piden solo cuando el admin abre
// el modal (no en cada carga de la página de Clientes).
export default function useCustomerLeaderboard() {
  const [data, setData] = useState({ mostActive: [], topSpenders: [], priciestWeek: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/orders/leaderboard/customers`, { credentials: 'include' });
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

  return { ...data, loading, error, fetchLeaderboard };
}
