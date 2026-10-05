// context/KitchenDeviceProvider.jsx
//
// Identidad y conexión en tiempo real de esta pantalla de cocina.
//
// La pantalla no tiene login. Funciona así:
//   1. Al abrir, genera (o recupera) su UUID persistente: kds_device_id.
//   2. Sin token, se conecta al namespace "/kitchen" mandando solo ese
//      deviceId. El servidor le asigna un código de 6 dígitos que el lobby
//      muestra. En este modo no se pide ni se recibe ninguna comanda.
//   3. Un admin escribe el código en el panel (Ajustes → Sistema de cocina) y
//      el servidor le entrega a ESTE socket su token de dispositivo. Se guarda
//      (kds_device_token) y el socket se reconecta ya autenticado con él.
//   4. Si la API responde 401/403, si el servidor la desvincula (kill switch)
//      o si al reconectar rechaza el token, se borra y vuelve al paso 2.
//
// Además expone el mismo SocketContext que usa el panel, así los hooks
// compartidos (useSocket, useSocketEvent) funcionan igual con este socket.
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { SocketContext } from '@syscor/web-shared/src/context/socketContext';
import { KitchenDeviceContext } from './kitchenDeviceContext';
import { onDeviceUnauthorized } from '../services/kitchenApi';
import { getOrCreateDeviceId, readDeviceToken, saveDeviceToken, clearDeviceToken } from '../utils/deviceStorage';
import { DEVICE_EVENTS, DEVICE_UNAUTHORIZED } from '../constants/deviceEvents';

// Mismo criterio que el socket del panel: con VITE_API_URL absoluta se conecta
// a ese servidor; sin ella, al mismo origen (el proxy de Vite hace el resto).
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const KITCHEN_SOCKET_URL = /^https?:\/\//i.test(RAW_API_URL)
  ? `${RAW_API_URL.replace(/\/api\/?$/, '')}/kitchen`
  : '/kitchen';

export default function KitchenDeviceProvider({ children }) {
  const [deviceId] = useState(getOrCreateDeviceId);
  const [token, setToken] = useState(readDeviceToken);
  const [pairing, setPairing] = useState(null);
  const [pairingError, setPairingError] = useState(null);
  // Por qué volvió al lobby (desvinculada, cocina apagada...), para decírselo
  const [notice, setNotice] = useState(null);
  // Recién emparejada = empieza un turno: el tablero da la bienvenida una vez.
  // Vive solo en memoria, así que recargar no la repite.
  const [welcomePending, setWelcomePending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const socketRef = useRef(null);

  const dropToken = useCallback((message) => {
    clearDeviceToken();
    setToken(null);
    if (message) setNotice(message);
  }, []);

  // 401/403 de la API: el token ya no sirve
  useEffect(
    () => onDeviceUnauthorized((data) => dropToken(data?.message || 'Esta pantalla perdió su acceso.')),
    [dropToken]
  );

  // Un socket por identidad: el de emparejamiento (solo deviceId) o el de la
  // pantalla emparejada (token). Al cambiar el token se rehace.
  useEffect(() => {
    const socket = io(KITCHEN_SOCKET_URL, {
      auth: token ? { token } : { deviceId },
      // Sin cookies: la pantalla no se identifica con la sesión de nadie
      withCredentials: false,
      transports: ['websocket', 'polling'],
      // Socket propio (no compartir conexión con el anterior de otra identidad)
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      // El servidor cortó la conexión (ej. al desvincularla): socket.io no
      // reintenta solo en ese caso. Se reintenta: si el token ya no vale, el
      // handshake lo rechaza y la pantalla vuelve al lobby.
      if (reason === 'io server disconnect') setTimeout(() => socket.connect(), 1000);
    });
    socket.io.on('reconnect', () => setReconnectCount((count) => count + 1));
    socket.on('connect_error', (error) => {
      setIsConnected(false);
      if (token && error.message === DEVICE_UNAUTHORIZED) {
        socket.disconnect();
        dropToken(error.data?.message || 'Esta pantalla perdió su acceso.');
      }
    });

    if (token) {
      // Kill switch: un admin la desvinculó o apagó el sistema
      socket.on(DEVICE_EVENTS.DEVICE_REVOKED, (info) => {
        socket.disconnect();
        dropToken(info?.message || 'Un administrador desvinculó esta pantalla.');
      });
    } else {
      socket.on(DEVICE_EVENTS.PAIRING_CODE, (data) => {
        setPairing(data);
        setPairingError(null);
      });
      socket.on(DEVICE_EVENTS.PAIRING_UNAVAILABLE, (data) => setPairingError(data?.message || null));
      socket.on(DEVICE_EVENTS.DEVICE_PAIRED, ({ token: nextToken } = {}) => {
        if (!nextToken) return;
        saveDeviceToken(nextToken);
        setPairing(null);
        setNotice(null);
        setWelcomePending(true);
        setToken(nextToken);
      });
    }

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
      socket.io.removeAllListeners();
      socketRef.current = null;
    };
  }, [token, deviceId, dropToken]);

  const subscribe = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, []);

  const socketValue = useMemo(
    () => ({ socket: socketRef, isConnected, reconnectCount, subscribe }),
    [isConnected, reconnectCount, subscribe]
  );

  const consumeWelcome = useCallback(() => setWelcomePending(false), []);

  const deviceValue = useMemo(
    () => ({
      deviceId,
      shortId: deviceId.slice(0, 8).toUpperCase(),
      isPaired: Boolean(token),
      pairing,
      pairingError,
      notice,
      isConnected,
      welcomePending,
      consumeWelcome,
    }),
    [deviceId, token, pairing, pairingError, notice, isConnected, welcomePending, consumeWelcome]
  );

  return (
    <KitchenDeviceContext.Provider value={deviceValue}>
      <SocketContext.Provider value={socketValue}>{children}</SocketContext.Provider>
    </KitchenDeviceContext.Provider>
  );
}
