// hooks/useSocket.js
import { useContext, useEffect, useRef } from 'react';
import { SocketContext } from '../context/socketContext';

// Hook de conveniencia para no importar useContext + SocketContext en cada archivo
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de un <SocketProvider>');
  }
  return context;
}

/**
 * Escucha un evento de tiempo real mientras el componente esté montado.
 *
 * El handler se guarda en una ref para que quien lo use no tenga que
 * memorizarlo con useCallback: si se pasa una función nueva en cada render
 * (lo normal), la suscripción NO se rehace, solo se actualiza a qué función
 * apunta. Sin esto, cada render desuscribiría y volvería a suscribir.
 *
 * @param {string} event   Nombre del evento (ver constants/socketEvents.js)
 * @param {Function} handler  Qué hacer con el payload que manda el servidor
 */
export function useSocketEvent(event, handler) {
  const { subscribe, isConnected } = useSocket();

  const handlerRef = useRef(handler);

  // La ref se actualiza en un efecto, no durante el render: escribir en una
  // ref mientras React renderiza es un efecto secundario y React lo desaconseja.
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!event) return;

    // isConnected está en las dependencias a propósito: la suscripción se
    // rehace cuando el socket se vuelve a crear tras una reconexión, porque
    // los listeners viven en la instancia vieja y esa ya no recibe nada.
    return subscribe(event, (...args) => handlerRef.current?.(...args));
  }, [event, subscribe, isConnected]);
}

export default useSocket;
