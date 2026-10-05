import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Devuelve el período (AAAA-MM) del mes en curso, que es lo que la pantalla
// muestra por defecto al entrar.
export const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Convierte "2026-09" en "Septiembre 2026", para títulos y para el PDF.
export const formatPeriodLabel = (period) => {
  if (!period) return '';
  const [year, month] = period.split('-').map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString('es-SV', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/**
 * Planilla del período: el backend calcula los descuentos de ley con
 * payrollUtils (la misma fuente de verdad que usa el alta de empleados), así
 * que aquí no se recalcula nada — solo se consulta y se muestra.
 */
export default function usePayroll(initialPeriod = getCurrentPeriod()) {
  const [period, setPeriod] = useState(initialPeriod);
  // Por defecto solo el personal activo: una planilla lista a quien se le paga.
  const [status, setStatus] = useState('active');

  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ period, status });
      const res = await fetch(`${API_URL}/users/payroll?${params}`, {
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'No se pudo cargar la planilla');

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
    fetchPayroll();
  }, [fetchPayroll]);

  // Boleta de pago individual. No se guarda en el estado del hook porque
  // solo la necesita el modal mientras esta abierto, igual que hace
  // useClients con el historial de pedidos de un cliente.
  const fetchPayslip = useCallback(async (employeeId, periodOverride) => {
    try {
      const params = new URLSearchParams({ period: periodOverride || period });
      const res = await fetch(`${API_URL}/users/payroll/employee/${employeeId}?${params}`, {
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, message: data.message || 'No se pudo generar la boleta' };
      }

      return { success: true, payslip: data };
    } catch (err) {
      console.error('Error al obtener la boleta de pago:', err);
      return { success: false, message: 'Error de conexion' };
    }
  }, [period]);

  return {
    rows,
    totals,
    loading,
    error,
    period,
    setPeriod,
    status,
    setStatus,
    refetch: fetchPayroll,
    fetchPayslip,
  };
}
