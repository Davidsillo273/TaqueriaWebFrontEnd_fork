// hooks/useNotifications.js
import { useContext } from 'react';
import { NotificationsContext } from '../context/notificationsContext';

// Hook de conveniencia para no importar useContext + NotificationsContext en cada archivo
export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de un <NotificationsProvider>');
  }
  return context;
}

// Indica si el usuario actual ya leyó una notificación.
// El backend guarda en readBy los ids de quienes la marcaron; además tomamos en
// cuenta isReadLocally, que se activa apenas el usuario hace clic (antes de que
// el servidor confirme) para que la interfaz responda de inmediato.
export function isNotificationRead(notification, userId) {
  if (notification?.isReadLocally) return true;
  if (!userId || !Array.isArray(notification?.readBy)) return false;
  return notification.readBy.some((id) => id?.toString() === userId.toString());
}

// Convierte una fecha en un texto tipo "hace 5 min".
// Se hace a mano porque el proyecto no tiene ninguna librería de fechas instalada.
export function formatRelativeTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace un momento';

  const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

  const units = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ];

  for (const { unit, seconds } of units) {
    const value = Math.floor(diffInSeconds / seconds);
    if (value >= 1) return formatter.format(-value, unit);
  }

  return 'hace un momento';
}

// Etiquetas y colores por categoría, compartidos entre la campana y la página de notificaciones
export const CATEGORY_LABELS = {
  orders: 'Órdenes',
  staff: 'Personal',
  inventory: 'Inventario',
  tables: 'Mesas',
  menu: 'Menú',
  clients: 'Clientes',
  settings: 'Ajustes',
};

// Cada nivel de importancia se pinta distinto para que la vista se lea de un vistazo
export const SEVERITY_STYLES = {
  info: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-600',
};

export default useNotifications;
