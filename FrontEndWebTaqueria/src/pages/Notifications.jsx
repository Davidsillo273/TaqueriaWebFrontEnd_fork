// src/pages/notifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import Card from '../components/commons/Card';
import FAIcon from '../components/commons/FAIcon';
import { ToastProvider, useToast } from '../components/commons/ToastProvider';
import { useAuth } from '../hooks/auth/useAuth';
import {
  useNotifications,
  isNotificationRead,
  formatRelativeTime,
  CATEGORY_LABELS,
  SEVERITY_STYLES,
} from '../hooks/useNotifications';

// Cuántas notificaciones se muestran por página
const PAGE_SIZE = 10;

// Pestañas de filtrado. "all" muestra todo lo que el usuario tiene permitido ver.
const FILTERS = [
  { id: 'all', label: 'Todas', icon: 'inbox' },
  { id: 'orders', label: 'Órdenes', icon: 'receipt' },
  { id: 'inventory', label: 'Inventario', icon: 'box' },
  { id: 'tables', label: 'Mesas', icon: 'chair' },
  { id: 'menu', label: 'Menú', icon: 'utensils' },
  { id: 'staff', label: 'Personal', icon: 'user-tie' },
  { id: 'clients', label: 'Clientes', icon: 'users' },
];

function NotificationsContent() {
  const { user } = useAuth();
  // unreadCount viene del contexto global (cuenta TODO lo no leído de los
  // últimos 3 días, sin importar la página o el filtro que se esté viendo)
  const { unreadCount, markRead: markReadGlobal, markAllRead: markAllReadGlobal, fetchPage } =
    useNotifications();
  const { addToast } = useToast();

  const [activeFilter, setActiveFilter] = useState('all');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [page, setPage] = useState(1);

  // El servidor ya solo devuelve movimientos de los últimos 3 días (más
  // viejo que eso se borra automáticamente), así que aquí solo paginamos
  // y filtramos por categoría lo que llega.
  const [pageData, setPageData] = useState({ notifications: [], total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPage({ page, limit: PAGE_SIZE, category: activeFilter });
      setPageData({
        notifications: data.notifications || [],
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      });
    } catch {
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, page, activeFilter]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // Al cambiar de filtro regresamos a la página 1: la página 3 de "Órdenes"
  // no tiene por qué existir dentro de "Inventario"
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setPage(1);
  };

  const visibleNotifications = onlyUnread
    ? pageData.notifications.filter((n) => !isNotificationRead(n, user?.id))
    : pageData.notifications;

  const handleMarkRead = async (id) => {
    await markReadGlobal(id);
    setPageData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n._id === id ? { ...n, isReadLocally: true } : n
      ),
    }));
  };

  const handleMarkAll = async () => {
    await markAllReadGlobal();
    addToast('Todas las notificaciones fueron marcadas como leídas', 'success');
    await loadPage();
  };

  const handleRefresh = async () => {
    await loadPage();
    addToast('Notificaciones actualizadas', 'info');
  };

  const goToPreviousPage = () => setPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPage((p) => Math.min(pageData.totalPages, p + 1));

  return (
    <div className="p-6 sm:p-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1 sm:mb-2">
            Notificaciones
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {unreadCount > 0
              ? `Tienes ${unreadCount} ${unreadCount === 1 ? 'aviso sin leer' : 'avisos sin leer'}`
              : 'Historial de movimientos del sistema'}
            <span className="text-gray-400"> · se muestran los últimos 3 días</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-2xl font-display font-semibold text-sm border border-white/80 transition-all
              shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_1px_1px_2px_rgba(255,255,255,0.6)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
          >
            <FAIcon icon="rotate-right" size="sm" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-2xl font-display font-semibold text-sm transition-all
                shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)] hover:bg-red-600"
            >
              <FAIcon icon="check-double" size="sm" />
              <span className="hidden sm:inline">Marcar todas</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 bg-yellow-100/80 backdrop-blur-sm border border-yellow-200 text-yellow-800 text-xs sm:text-sm rounded-2xl p-3">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-display font-medium transition-all ${
                isActive
                  ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3),inset_1px_1px_2px_rgba(255,255,255,0.3)]'
                  : 'bg-white/70 text-gray-600 hover:bg-white hover:text-gray-900 border border-white/80'
              }`}
            >
              <FAIcon icon={filter.icon} size="sm" />
              <span>{filter.label}</span>
            </button>
          );
        })}

        <label className="flex items-center gap-2 ml-auto px-4 py-2 bg-white/70 border border-white/80 rounded-2xl cursor-pointer">
          <input
            type="checkbox"
            checked={onlyUnread}
            onChange={(e) => setOnlyUnread(e.target.checked)}
            className="w-4 h-4 accent-red-500"
          />
          <span className="text-sm font-display font-medium text-gray-700">Solo sin leer</span>
        </label>
      </div>

      {/* Listado */}
      <Card className="overflow-hidden">
        {isLoading && pageData.notifications.length === 0 ? (
          <p className="px-4 sm:px-6 py-10 text-center text-sm text-gray-500">
            Cargando notificaciones...
          </p>
        ) : visibleNotifications.length === 0 ? (
          <div className="px-4 sm:px-6 py-16 text-center">
            <FAIcon icon="bell-slash" size="3xl" className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              {pageData.total === 0
                ? 'No hay movimientos registrados en los últimos 3 días'
                : 'No hay notificaciones que coincidan con este filtro'}
            </p>
          </div>
        ) : (
          visibleNotifications.map((notification) => {
            const isRead = isNotificationRead(notification, user?.id);

            return (
              <div
                key={notification._id}
                className={`flex gap-4 px-4 sm:px-6 py-4 border-b border-gray-50 last:border-b-0 transition-colors ${
                  isRead ? 'opacity-60' : 'bg-red-50/30'
                }`}
              >
                <span
                  className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                    SEVERITY_STYLES[notification.severity] || SEVERITY_STYLES.info
                  }`}
                >
                  <FAIcon icon={notification.icon || 'bell'} />
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-gray-900 text-sm">
                      {notification.title}
                    </h3>
                    <span className="text-[10px] font-display font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                      {CATEGORY_LABELS[notification.category] || notification.category}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 break-words">{notification.message}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <FAIcon icon="user" size="xs" />
                      {notification.actor?.name || 'Sistema'}
                    </span>
                    <span>{formatRelativeTime(notification.createdAt)}</span>
                  </div>
                </div>

                {!isRead && (
                  <button
                    onClick={() => handleMarkRead(notification._id)}
                    aria-label="Marcar como leída"
                    title="Marcar como leída"
                    className="shrink-0 self-start p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <FAIcon icon="check" size="sm" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </Card>

      {/* Paginado: 10 notificaciones por página */}
      {pageData.total > 0 && (
        <div className="flex items-center justify-between mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-gray-500">
            Página {page} de {pageData.totalPages} · {pageData.total} en total
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={page <= 1 || isLoading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-gray-700 rounded-xl font-display font-medium text-sm border border-white/80 transition-all
                shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            >
              <FAIcon icon="chevron-left" size="xs" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            <button
              onClick={goToNextPage}
              disabled={page >= pageData.totalPages || isLoading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-gray-700 rounded-xl font-display font-medium text-sm border border-white/80 transition-all
                shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <FAIcon icon="chevron-right" size="xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Notifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
        <Sidebar
          activeMenu="notifications"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <NotificationsContent />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
