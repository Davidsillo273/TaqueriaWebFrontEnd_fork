// hooks/useSettings.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://syscor-mll9.onrender.com/api';

// Valores de respaldo: si el servidor no responde, la interfaz sigue funcionando
// con los mismos valores por defecto que define el backend.
const DEFAULT_SETTINGS = {
  operation: {
    lowStockThresholds: {
      drinks: 10,
      saucers: 10,
      extras: 10,
      combos: 10,
    },
    autoRefreshDashboard: true,
    dashboardRefreshSeconds: 60,
  },
  notifications: {
    orders: true,
    staff: true,
    inventory: true,
    tables: true,
    menu: true,
    clients: true,
  },
};

// Maneja la configuración general del sistema (umbral de stock, refresco del
// panel y qué categorías generan notificaciones).
export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/settings`, { withCredentials: true });
      const operation = response.data.operation || {};
      setSettings({
        operation: {
          ...DEFAULT_SETTINGS.operation,
          ...operation,
          lowStockThresholds: {
            ...DEFAULT_SETTINGS.operation.lowStockThresholds,
            ...(operation.lowStockThresholds || {}),
          },
        },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...(response.data.notifications || {}) },
      });
    } catch (err) {
      setError('No se pudo cargar la configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  // Guarda cambios parciales: solo se manda lo que el usuario tocó
  const saveSettings = useCallback(async (partialSettings) => {
    setSaving(true);
    setError(null);
    try {
      const response = await axios.patch(`${BASE_URL}/settings`, partialSettings, {
        withCredentials: true,
      });
      const updated = response.data.data || {};
      const operation = updated.operation || {};
      setSettings({
        operation: {
          ...DEFAULT_SETTINGS.operation,
          ...operation,
          lowStockThresholds: {
            ...DEFAULT_SETTINGS.operation.lowStockThresholds,
            ...(operation.lowStockThresholds || {}),
          },
        },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...(updated.notifications || {}) },
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo guardar la configuración';
      setError(message);
      return { success: false, message };
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, saving, error, saveSettings, fetchSettings };
}

export default useSettings;
