// src/components/dashboard/NotificationsPanel.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import FAIcon from '../commons/FAIcon';
import { useAuth } from '../../hooks/auth/useAuth';
import {
  useNotifications,
  isNotificationRead,
  formatRelativeTime,
  SEVERITY_STYLES,
} from '../../hooks/useNotifications';

// Panel desplegable que se abre al hacer clic en la campana del TopBar.
// Muestra los últimos movimientos del sistema; el historial completo está en /notificaciones.
const NotificationsPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, error, markRead, markAllRead } = useNotifications();

  if (!isOpen) return null;

  // Solo las primeras del listado: el resto se consulta en la página completa
  const visibleNotifications = notifications.slice(0, 8);

  const handleItemClick = (notification) => {
    if (!isNotificationRead(notification, user?.id)) {
      markRead(notification._id);
    }
  };

  return (
    <>
      {/* Capa invisible que cierra el panel al hacer clic en cualquier otro lado */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      <div
        className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm z-50 bg-white rounded-3xl border border-white/80 overflow-hidden
          shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)]"
        role="dialog"
        aria-label="Notificaciones"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-gray-900 text-sm">Notificaciones</h3>
            <p className="text-xs text-gray-500">
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-display font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              Marcar todas
            </button>
          )}
        </div>

        {/* Listado */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">Cargando notificaciones...</p>
          ) : error ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">{error}</p>
          ) : visibleNotifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <FAIcon icon="bell-slash" size="2xl" className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No hay movimientos todavía</p>
            </div>
          ) : (
            visibleNotifications.map((notification) => {
              const isRead = isNotificationRead(notification, user?.id);

              return (
                <button
                  key={notification._id}
                  onClick={() => handleItemClick(notification)}
                  className={`w-full text-left flex gap-3 px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                    isRead ? 'opacity-60' : 'bg-red-50/40'
                  }`}
                >
                  <span
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                      SEVERITY_STYLES[notification.severity] || SEVERITY_STYLES.info
                    }`}
                  >
                    <FAIcon icon={notification.icon || 'bell'} size="sm" />
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block font-display font-semibold text-gray-900 text-xs mb-0.5">
                      {notification.title}
                    </span>
                    <span className="block text-xs text-gray-600 leading-snug break-words">
                      {notification.message}
                    </span>
                    <span className="block text-[11px] text-gray-400 mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </span>

                  {!isRead && (
                    <span className="shrink-0 w-2 h-2 mt-1 rounded-full bg-red-500" aria-label="Sin leer" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Pie con enlace al historial completo */}
        <Link
          to="/notificaciones"
          onClick={onClose}
          className="block px-4 py-3 text-center text-xs font-display font-semibold text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-colors"
        >
          Ver todas las notificaciones
        </Link>
      </div>
    </>
  );
};

export default NotificationsPanel;
