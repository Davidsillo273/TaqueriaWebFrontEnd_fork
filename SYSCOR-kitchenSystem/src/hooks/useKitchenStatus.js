// hooks/useKitchenStatus.js
//
// Estado del Sistema de Cocina para esta pantalla ya emparejada: sus tiempos
// de alerta. Se consulta una vez (GET /kitchen/status, con el token de
// dispositivo) y después el servidor avisa por socket (kitchen:status_changed)
// si el admin cambia los tiempos. Si la apagan, el token deja de valer y la
// pantalla vuelve al lobby (ver KitchenDeviceProvider).
import { useState, useEffect, useCallback } from 'react';
import { useSocket, useSocketEvent } from '@syscor/web-shared/src/hooks/useSocket';
import { SOCKET_EVENTS } from '@syscor/web-shared/src/constants/socketEvents';
import { DEFAULT_KITCHEN_SETTINGS } from '../constants/kitchenStatus';
import kitchenApi from '../services/kitchenApi';

const normalizeKitchen = (kitchen) => ({ ...DEFAULT_KITCHEN_SETTINGS, ...(kitchen || {}) });

const fetchKitchenStatus = async () => {
  const response = await kitchenApi.get('/kitchen/status');
  return normalizeKitchen(response.data?.kitchen);
};

export default function useKitchenStatus() {
  const { reconnectCount } = useSocket();
  const [kitchen, setKitchen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Se consulta al abrir, al pedir "Reintentar" y cada vez que el socket se
  // reconecta: mientras estuvo caído el admin pudo cambiarlo, y ese evento
  // se perdió. "ignore" descarta una respuesta vieja si llega otra después.
  useEffect(() => {
    let ignore = false;
    fetchKitchenStatus()
      .then((next) => {
        if (ignore) return;
        setKitchen(next);
        setError(null);
      })
      .catch((err) => {
        if (ignore) return;
        console.error('No se pudo consultar el Sistema de Cocina:', err);
        setError('No se pudo consultar si la cocina está habilitada.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [reconnectCount, reloadKey]);

  useSocketEvent(SOCKET_EVENTS.KITCHEN_STATUS_CHANGED, ({ kitchen: next } = {}) => {
    if (!next) return;
    setKitchen(normalizeKitchen(next));
    setError(null);
    setLoading(false);
  });

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { kitchen, loading, error, refetch };
}
