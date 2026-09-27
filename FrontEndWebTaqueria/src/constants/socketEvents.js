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
  // Mensaje del cliente para el repartidor (desde Panchita en la app)
  ORDER_DRIVER_MESSAGE: 'order:driver_message',
  // Campana de notificaciones
  NOTIFICATION_CREATED: 'notification:created',
  // Fotos del DUI tomadas con el teléfono (ver useDuiScan). Faltaba aquí: sin
  // él, la pantalla de invitación nunca se enteraba de que llegaron las fotos.
  DUI_CAPTURE_UPLOADED: 'dui:capture_uploaded',
};

export default SOCKET_EVENTS;
