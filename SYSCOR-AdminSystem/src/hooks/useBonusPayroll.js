import { useState, useEffect, useCallback } from 'react';
import { getCurrentPeriod } from './usePayroll';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Planilla de BONOS del período: nombre, puesto y el bono asignado a cada
 * empleado, sin descuentos de ley. Es un listado aparte de la planilla
 * general (ver usePayroll) porque el bono es un pago discrecional que no
 * forma parte del salario cotizable.
 */
export default function useBonusPayroll(initialPeriod = getCurrentPeriod()) {
  const [period, setPeriod] = useState(initialPeriod);
  const [status, setStatus] = useState('active');

  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBonusPayroll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ period, status });
      const res = await fetch(`${API_URL}/users/payroll/bonuses?${params}`, {
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'No se pudo cargar la planilla de bonos');

      setRows(data.rows || []);
      setTotals(data.totals || null);
    } catch (err) {
      setError(err.message);
      setRows([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  }, [period, status]);

  useEffect(() => {
    fetchBonusPayroll();
  }, [fetchBonusPayroll]);

  return {
    rows,
    totals,
    loading,
    error,
    period,
    setPeriod,
    status,
    setStatus,
    refetch: fetchBonusPayroll,
  };
}
