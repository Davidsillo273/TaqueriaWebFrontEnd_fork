// context/socketContext.jsx
//
// Una sola conexión de tiempo real para todo el panel.
//
// Antes cada pantalla preguntaba al servidor cada cierto tiempo si había
// novedades. Ahora el servidor avisa, y este provider es el único que
// mantiene el cable abierto: los hooks (useOrders, useTables, la campana)
// se suscriben a los eventos que les interesan con useSocketEvent.
//
// Se monta una única vez en App.jsx, dentro del AuthProvider, porque la
// conexión solo tiene sentido con una sesión iniciada.
import React, { createContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/auth/useAuth';

// El socket vive en el mismo servidor que la API. VITE_API_URL normalmente
// apunta a ".../api" (URL absoluta en producción), así que le quitamos ese
// sufijo para quedarnos con la raíz del backend, que es donde escucha
// Socket.IO (ruta /socket.io).
//
// En este proyecto VITE_API_URL suele NO estar definida en local (el .env
// viene vacío) y el resto del código usa entonces '/api' como ruta RELATIVA,
// que el proxy de Vite reescribe hacia el backend real (ver vite.config.js,
// que ahora también proxea '/socket.io' con el mismo destino). Por eso aquí
// se sigue el mismo criterio: sin VITE_API_URL, se deja io() sin URL absoluta
// (undefined) para que socket.io-client conecte al MISMO ORIGEN que sirve la
// página (localhost:5173 en dev), y el proxy de Vite hace el resto — igual
// que ya pasa con fetch/axios contra '/api'.
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const SOCKET_URL = /^https?:\/\//i.test(RAW_API_URL)
  ? RAW_API_URL.replace(/\/api\/?$/, '')
  : undefined;

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  // La instancia del socket se guarda en una ref, no en estado: cambiarla no
  // debe provocar renders, y los hooks que se suscriben necesitan leerla
  // siempre actualizada.
  const socketRef = useRef(null);

  // Sí exponemos el estado de conexión como estado de React, porque la
  // interfaz sí lo muestra (y porque al reconectar hay que resincronizar).
  const [isConnected, setIsConnected] = useState(false);

  // Cada vez que el socket se REconecta (no la primera conexión), este número
  // aumenta. Los hooks lo usan como señal de "estuviste desconectado, pediste
  // el snapshot completo de nuevo": mientras el cable estaba caído pudieron
  // pasar cosas que nadie escuchó, y los deltas de esos eventos se perdieron.
  const [reconnectCount, setReconnectCount] = useState(0);

  useEffect(() => {
    // Sin sesión no hay a qué conectarse: el handshake exige la cookie.
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Si ya hay una conexión viva (ej. el usuario solo actualizó su perfil),
    // no se abre otra.
    if (socketRef.current) return;

    const socket = io(SOCKET_URL, {
      // Manda la cookie de sesión en el handshake. Es la MISMA cookie
      // httpOnly que usa la API: el navegador la adjunta solo, el JS no
      // puede leerla, y el backend la valida con el mismo secreto.
      withCredentials: true,
      // WebSocket primero; si la red de la feria bloquea el upgrade, cae a
      // polling largo y el tiempo real sigue funcionando igual.
      transports: ['websocket', 'polling'],
      // Render duerme los servicios del plan gratuito: al despertar, los
      // primeros intentos fallan. Reintentar con espera creciente evita
      // machacar el servidor mientras arranca.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // "reconnect" solo dispara en reconexiones, nunca en la primera conexión:
    // justo la distinción que necesitamos para no refrescar de más al entrar.
    socket.io.on('reconnect', () => setReconnectCount((count) => count + 1));

    socket.on('connect_error', (error) => {
      // Un fallo de conexión no rompe nada: el panel sigue funcionando con
      // los datos que ya trajo y con lo que devuelvan las acciones del usuario.
      console.warn('Tiempo real no disponible:', error.message);
      setIsConnected(false);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
    // user?.id entra en las dependencias para que, si se cierra sesión y entra
    // otra persona, se rehaga la conexión y quede en las rooms de su rol.
  }, [isAuthenticated, user?.id]);

  // Suscribe un listener y devuelve la función para quitarlo. La usan los
  // hooks a través de useSocketEvent; se expone aquí para que nadie tenga que
  // tocar la instancia directamente.
  const subscribe = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, []);

  const value = {
    socket: socketRef,
    isConnected,
    reconnectCount,
    subscribe,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
