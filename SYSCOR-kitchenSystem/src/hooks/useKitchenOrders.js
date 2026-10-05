// hooks/useKitchenOrders.js
//
// Comandas del tablero de cocina, en tiempo real.
//
// Mismo patrón que useOrders del panel: una consulta inicial (la "foto") y a
// partir de ahí cada evento de socket toca SOLO la comanda afectada. Las
// comandas se guardan por id: un cambio reemplaza un único objeto y el resto
// conserva su identidad, así los tickets memorizados que no cambiaron ni
// siquiera se vuelven a renderizar.
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket, useSocketEvent } from '@syscor/web-shared/src/hooks/useSocket';
import { SOCKET_EVENTS } from '@syscor/web-shared/src/constants/socketEvents';
import { ACTIVE_ORDER_STATUSES, RECENT_READY_MS } from '../constants/kitchenStatus';
import { readyAt } from '../utils/orderPhase';
import kitchenApi from '../services/kitchenApi';
import { playKitchenSound, primeKitchenSounds, soundForChange } from '../utils/kitchenSounds';

const KEEP_STATUSES = [...ACTIVE_ORDER_STATUSES, 'ready'];

// ¿Se queda en memoria? Las activas siempre; las listas solo mientras se
// muestran en "Listas recientes".
const isRelevant = (order, now = Date.now()) =>
  ACTIVE_ORDER_STATUSES.includes(order.status) ||
  (order.status === 'ready' && now - readyAt(order) < RECENT_READY_MS);

const errorMessage = (err, fallback) => ({
  title: err?.response?.data?.title || 'No se pudo actualizar la comanda',
  message: err?.response?.data?.message || fallback,
});

// La "foto" del tablero: GET /kitchen/orders devuelve las activas y las que
// se marcaron listas hace poco, ya sin totales, pagos ni datos de contacto.
const fetchKitchenOrders = async () => {
  const { data } = await kitchenApi.get('/kitchen/orders');
  const now = Date.now();
  const byId = {};
  for (const order of data?.orders || []) {
    if (order?._id && isRelevant(order, now)) byId[order._id] = order;
  }
  return byId;
};

export default function useKitchenOrders() {
  const { reconnectCount } = useSocket();
  const [ordersById, setOrdersById] = useState({});
  // Lo último que se sabe de cada comanda, para saber qué sonido toca
  // cuando llega un cambio (pedido nuevo, pasó a cocina, lista...)
  const ordersRef = useRef(ordersById);
  useEffect(() => {
    ordersRef.current = ordersById;
  }, [ordersById]);
  useEffect(() => {
    primeKitchenSounds();
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [reloadKey, setReloadKey] = useState(0);

  // Al abrir, al reintentar y al reconectar: los eventos de mientras el cable
  // estuvo caído se perdieron, así que se pide la foto completa otra vez.
  useEffect(() => {
    let ignore = false;
    fetchKitchenOrders()
      .then((byId) => {
        if (ignore) return;
        setOrdersById(byId);
        setError(null);
      })
      .catch((err) => {
        if (ignore) return;
        console.error('Error al cargar las comandas de cocina:', err);
        setError('No se pudieron cargar las comandas. Revisa la conexión.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [reconnectCount, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  // Mete, reemplaza o saca una comanda según su estado actual
  const applyOrder = useCallback((order) => {
    if (!order?._id) return;
    setOrdersById((prev) => {
      const keep = KEEP_STATUSES.includes(order.status) && isRelevant(order);
      if (!keep) {
        if (!prev[order._id]) return prev;
        const next = { ...prev };
        delete next[order._id];
        return next;
      }
      return { ...prev, [order._id]: order };
    });
  }, []);

  // Cada cambio que llega suena distinto. Si el cambio lo hizo esta misma
  // pantalla, ya sonó al tocar el botón y aquí llega igual: no se repite.
  const applyWithSound = (order) => {
    if (!order?._id) return;
    const sound = soundForChange(ordersRef.current[order._id], order);
    if (sound) playKitchenSound(sound);
    applyOrder(order);
  };
  useSocketEvent(SOCKET_EVENTS.ORDER_CREATED, ({ order } = {}) => applyWithSound(order));
  useSocketEvent(SOCKET_EVENTS.ORDER_UPDATED, ({ order } = {}) => applyWithSound(order));
  useSocketEvent(SOCKET_EVENTS.ORDER_DELETED, ({ orderId } = {}) => {
    if (!orderId) return;
    if (ordersRef.current[orderId]) playKitchenSound('cancelled');
    setOrdersById((prev) => {
      if (!prev[orderId]) return prev;
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  });

  const setBusy = useCallback((id, busy) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  // Cambia el estado con respuesta inmediata en pantalla. Si el servidor lo
  // rechaza (ej. el cliente justo empezó a agregar productos), se regresa la
  // comanda a como estaba y se devuelve el motivo para mostrarlo/decirlo.
  const changeStatus = useCallback(async (order, status, fallback) => {
    const id = order._id;
    setBusy(id, true);
    const sound = soundForChange(order, { ...order, status });
    if (sound) playKitchenSound(sound);
    applyOrder({
      ...order,
      status,
      statusHistory: [...(order.statusHistory || []), { status, changedAt: new Date().toISOString() }],
    });

    try {
      const response = await kitchenApi.patch(`/kitchen/orders/${id}/status`, { status });
      if (response.data?.data?._id) applyOrder(response.data.data);
      return { success: true };
    } catch (err) {
      console.error('Error al cambiar el estado de la comanda:', err);
      applyOrder(order);
      return { success: false, ...errorMessage(err, fallback) };
    } finally {
      setBusy(id, false);
    }
  }, [applyOrder, setBusy]);

  const markReady = useCallback(
    (order) => changeStatus(order, 'ready', 'No se pudo marcar como lista.'),
    [changeStatus]
  );
  const startOrder = useCallback(
    (order) => changeStatus(order, 'preparing', 'No se pudo pasar a cocina.'),
    [changeStatus]
  );
  // "Regresar": una comanda marcada como lista por error vuelve a cocina
  const undoReady = useCallback(
    (order) => changeStatus(order, 'preparing', 'No se pudo regresar a cocina.'),
    [changeStatus]
  );

  return {
    ordersById,
    loading,
    error,
    busyIds,
    refetch,
    markReady,
    startOrder,
    undoReady,
  };
}
