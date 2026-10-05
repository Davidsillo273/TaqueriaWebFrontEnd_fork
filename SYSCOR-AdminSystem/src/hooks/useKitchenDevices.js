// hooks/useKitchenDevices.js
//
// Pantallas de cocina (KDS) desde el panel: emparejar con el código que
// muestra la pantalla, desvincular una y apagar el sistema completo.
//
// La pantalla de cocina no tiene login: el servidor le entrega su token de
// dispositivo en tiempo real cuando el admin escribe aquí su código, y se lo
// quita (kill switch) al desvincularla o apagar el sistema.
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket, useSocketEvent } from '@syscor/web-shared/src/hooks/useSocket';
import { SOCKET_EVENTS } from '@syscor/web-shared/src/constants/socketEvents';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const errorMessage = (err, fallback) => err.response?.data?.message || fallback;

const fetchDevices = async () => {
  const response = await axios.get(`${BASE_URL}/kitchen/devices`, { withCredentials: true });
  return response.data?.devices || [];
};

/**
 * @param {{ enabled: boolean }} options Solo el admin puede ver/emparejar
 *   pantallas: con enabled=false el hook no consulta nada.
 */
export default function useKitchenDevices({ enabled = true } = {}) {
  const { reconnectCount } = useSocket();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Al abrir, al reconectar y cada vez que alguien empareja o desvincula una
  // pantalla (kitchen:devices_changed, ver abajo)
  useEffect(() => {
    if (!enabled) return undefined;
    let ignore = false;
    fetchDevices()
      .then((list) => {
        if (!ignore) setDevices(list);
      })
      .catch((err) => console.error('No se pudieron cargar las pantallas de cocina:', err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [enabled, reconnectCount, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useSocketEvent(SOCKET_EVENTS.KITCHEN_DEVICES_CHANGED, refetch);

  // Empareja la pantalla que muestra ese código (y habilita el sistema si
  // estaba apagado). Devuelve el estado nuevo del sistema para Ajustes.
  const pairDevice = useCallback(async (code) => {
    setBusy(true);
    try {
      const response = await axios.post(`${BASE_URL}/kitchen/devices/pair`, { code }, { withCredentials: true });
      refetch();
      return { success: true, kitchen: response.data?.data?.kitchen };
    } catch (err) {
      return { success: false, message: errorMessage(err, 'No se pudo emparejar la pantalla.') };
    } finally {
      setBusy(false);
    }
  }, [refetch]);

  const unpairDevice = useCallback(async (deviceId) => {
    setBusy(true);
    try {
      await axios.delete(`${BASE_URL}/kitchen/devices/${deviceId}`, { withCredentials: true });
      refetch();
      return { success: true };
    } catch (err) {
      return { success: false, message: errorMessage(err, 'No se pudo desvincular la pantalla.') };
    } finally {
      setBusy(false);
    }
  }, [refetch]);

  // Kill switch general: apaga el sistema y desvincula todas las pantallas
  const disableKitchen = useCallback(async () => {
    setBusy(true);
    try {
      const response = await axios.post(`${BASE_URL}/kitchen/disable`, {}, { withCredentials: true });
      refetch();
      return { success: true, kitchen: response.data?.data?.kitchen };
    } catch (err) {
      return { success: false, message: errorMessage(err, 'No se pudo deshabilitar el sistema de cocina.') };
    } finally {
      setBusy(false);
    }
  }, [refetch]);

  return {
    devices,
    activeDevices: devices.filter((device) => device.active),
    loading,
    busy,
    refetch,
    pairDevice,
    unpairDevice,
    disableKitchen,
  };
}
