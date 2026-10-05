import { useState, useEffect, useCallback } from 'react';
import { getCurrentPeriod } from './usePayroll';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Categorías de gasto, espejo del enum de purchaseInvoiceModel.
export const PURCHASE_CATEGORIES = [
  { value: 'insumos', label: 'Insumos' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'equipo', label: 'Equipo' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'otros', label: 'Otros' },
];

export const CATEGORY_LABELS = PURCHASE_CATEGORIES.reduce((acc, c) => {
  acc[c.value] = c.label;
  return acc;
}, {});

/**
 * Facturas de compra + el reporte de IVA del período.
 *
 * Ambas cosas viven en el mismo hook porque siempre se muestran juntas: al
 * registrar o procesar una factura, el reporte cambia, y tenerlos separados
 * obligaría a coordinar dos recargas desde la pantalla.
 */
export default function usePurchaseInvoices(initialPeriod = getCurrentPeriod()) {
  const [period, setPeriod] = useState(initialPeriod);

  const [invoices, setInvoices] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [invoicesRes, reportRes] = await Promise.all([
        fetch(`${API_URL}/purchase-invoices?period=${period}`, { credentials: 'include' }),
        fetch(`${API_URL}/purchase-invoices/tax-report?period=${period}`, { credentials: 'include' }),
      ]);

      if (!invoicesRes.ok) throw new Error('No se pudieron cargar las facturas de compra');
      if (!reportRes.ok) throw new Error('No se pudo generar el reporte de IVA');

      setInvoices(await invoicesRes.json());
      setReport(await reportRes.json());
    } catch (err) {
      setError(err.message);
      setInvoices([]);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Registra una factura de compra. Va como FormData (no JSON) porque puede
   * llevar adjunto el PDF del comprobante, igual que el resto de formularios
   * del proyecto que suben archivos a Cloudinary.
   */
  const createInvoice = async (formValues, file) => {
    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        // Los campos vacíos no se mandan: el backend ya tiene sus defaults y
        // así no se guardan cadenas vacías donde debería ir null.
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });
      if (file) formData.append('file', file);

      const res = await fetch(`${API_URL}/purchase-invoices`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, message: data.message || 'No se pudo registrar la factura' };
      }

      await fetchData();
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Error al registrar la factura de compra:', err);
      return { success: false, message: 'Error de conexión al registrar la factura' };
    }
  };

  // Marca/desmarca una factura como ya incluida en la declaración de IVA.
  const toggleProcessed = async (id, processedForTax) => {
    try {
      const res = await fetch(`${API_URL}/purchase-invoices/${id}/processed`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processedForTax }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, message: data.message || 'No se pudo actualizar la factura' };
      }

      await fetchData();
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Error al marcar la factura:', err);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const deleteInvoice = async (id) => {
    try {
      const res = await fetch(`${API_URL}/purchase-invoices/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, message: data.message || 'No se pudo eliminar la factura' };
      }

      await fetchData();
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Error al eliminar la factura:', err);
      return { success: false, message: 'Error de conexión' };
    }
  };

  return {
    invoices,
    report,
    loading,
    error,
    period,
    setPeriod,
    createInvoice,
    toggleProcessed,
    deleteInvoice,
    refetch: fetchData,
  };
}
