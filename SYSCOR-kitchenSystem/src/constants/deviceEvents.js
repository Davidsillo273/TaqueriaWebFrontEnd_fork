// Eventos del namespace "/kitchen" (pantallas de cocina). Espejo de
// KITCHEN_SOCKET_EVENTS en backEnd/src/config/kitchenSocket.js.
export const DEVICE_EVENTS = {
  // El servidor asignó el código que muestra el lobby
  PAIRING_CODE: 'kitchen:pairing_code',
  // Demasiadas pantallas esperando código a la vez
  PAIRING_UNAVAILABLE: 'kitchen:pairing_unavailable',
  // Un admin escribió el código: aquí viene el token de esta pantalla
  DEVICE_PAIRED: 'kitchen:device_paired',
  // Un admin la desvinculó o apagó el sistema (kill switch)
  DEVICE_REVOKED: 'kitchen:device_revoked',
};

// Mensaje de error del handshake cuando el token ya no sirve
export const DEVICE_UNAUTHORIZED = 'DEVICE_UNAUTHORIZED';
