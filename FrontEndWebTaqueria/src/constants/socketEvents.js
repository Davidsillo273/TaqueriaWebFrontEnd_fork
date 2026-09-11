// Nombres de los eventos de tiempo real. Debe coincidir EXACTO con
// backEnd/src/config/socket.js (SOCKET_EVENTS), igual que pasa con el
// catálogo de permisos: son dos archivos espejo, uno por proyecto.
export const SOCKET_EVENTS = {
  // Comandas
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_DELETED: 'order:deleted',
  // Mesas
  TABLE_CREATED: 'table:created',
  TABLE_UPDATED: 'table:updated',
  TABLE_DELETED: 'table:deleted',
  TABLES_BULK_UPDATED: 'table:bulk_updated',
  // Campana de notificaciones
  NOTIFICATION_CREATED: 'notification:created',
};

export default SOCKET_EVENTS;
