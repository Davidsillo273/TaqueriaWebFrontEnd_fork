// hooks/useSettings.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocketEvent } from '@syscor/web-shared/src/hooks/useSocket';
import { SOCKET_EVENTS } from '@syscor/web-shared/src/constants/socketEvents';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
  // Sistema de Cocina (pantalla SYSCOR-kitchenSystem)
  kitchen: {
    enabled: false,
    warningMinutes: 10,
    maxMinutes: 15,
    changedAt: null,
    changedBy: null,
  },
};

// Completa lo que el servidor no mande con los valores por defecto, para que
// la pantalla nunca lea un campo undefined (ej. un documento de ajustes
// creado antes de que existiera el Sistema de Cocina).
const normalizeSettings = (data = {}) => {
  const operation = data.operation || {};
  return {
    operation: {
      ...DEFAULT_SETTINGS.operation,
      ...operation,
      lowStockThresholds: {
        ...DEFAULT_SETTINGS.operation.lowStockThresholds,
        ...(operation.lowStockThresholds || {}),
      },
    },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(data.notifications || {}) },
    kitchen: { ...DEFAULT_SETTINGS.kitchen, ...(data.kitchen || {}) },
  };
};

// Maneja la configuración general del sistema (umbral de stock, refresco del
// panel, qué categorías generan notificaciones y el Sistema de Cocina).
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
      setSettings(normalizeSettings(response.data));
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
      setSettings(normalizeSettings(response.data.data));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo guardar la configuración';
      setError(message);
      return { success: false, message };
    } finally {
      setSaving(false);
    }
  }, []);

  // Si otro administrador enciende/apaga la cocina (o cambia sus tiempos)
  // desde otra pestaña, este panel lo refleja sin recargar.
  useSocketEvent(SOCKET_EVENTS.KITCHEN_STATUS_CHANGED, ({ kitchen } = {}) => {
    if (!kitchen) return;
    setSettings((prev) => ({ ...prev, kitchen: { ...DEFAULT_SETTINGS.kitchen, ...kitchen } }));
  });

  // Encender/apagar la cocina no pasa por PATCH /settings (ver
  // useKitchenDevices): con esto Ajustes refleja la respuesta de inmediato,
  // sin esperar al evento de socket.
  const setKitchenSettings = useCallback((kitchen) => {
    if (!kitchen) return;
    setSettings((prev) => ({ ...prev, kitchen: { ...DEFAULT_SETTINGS.kitchen, ...kitchen } }));
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, saving, error, saveSettings, fetchSettings, setKitchenSettings };
}

export default useSettings;
