// src/components/dashboard/TopBar.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FAIcon from '../commons/FAIcon';
import NotificationsPanel from './NotificationsPanel';
import { useAuth } from '../../hooks/auth/useAuth';
import { useLogout } from '../../hooks/auth/useLogout';
import { useNotifications } from '../../hooks/useNotifications';
import { hasPermission } from '../../constants/permissions';

const ROLE_LABELS = {
  admin: 'Administrador',
  employee: 'Empleado',
  customer: 'Cliente',
};

// Secciones sobre las que puede buscar el usuario desde la barra superior.
// "Actividad" no lleva `permission`: siempre es visible (ver App.jsx).
const SEARCHABLE_SECTIONS = [
  { label: 'Actividad', path: '/dashboard', icon: 'chart-line', keywords: 'inicio panel dashboard resumen' },
  { label: 'Combos', path: '/combos', icon: 'shopping-bag', keywords: 'combo paquete promocion', permission: 'combos' },
  { label: 'Bebidas', path: '/drinks', icon: 'wine-glass', keywords: 'bebida refresco jugo agua', permission: 'drinks' },
  { label: 'Platillos', path: '/dishes', icon: 'utensils', keywords: 'platillo comida taco plato', permission: 'dishes' },
  { label: 'Extras', path: '/extras', icon: 'star', keywords: 'extra complemento adicional', permission: 'extras' },
  { label: 'Inventario', path: '/inventario', icon: 'box', keywords: 'insumo stock bodega existencias', permission: 'inventory' },
  { label: 'Mesas', path: '/mesas', icon: 'chair', keywords: 'mesa salon lugares', permission: 'tables' },
  { label: 'Clientes', path: '/clients', icon: 'users', keywords: 'cliente comensal', permission: 'clients' },
  { label: 'Empleados', path: '/employees', icon: 'user-tie', keywords: 'empleado personal staff planilla', permission: 'employees' },
  { label: 'Pedidos y Órdenes', path: '/pedidos', icon: 'list', keywords: 'pedido orden comanda factura invoice', permission: 'orders' },
  { label: 'Invitar staff', path: '/InviteStaff', icon: 'envelope', keywords: 'invitar invitacion nuevo empleado admin', permission: 'invite_staff' },
  { label: 'Notificaciones', path: '/notificaciones', icon: 'bell', keywords: 'notificacion aviso alerta movimiento', permission: 'notifications' },
  { label: 'Ajustes', path: '/ajustes', icon: 'cog', keywords: 'ajuste configuracion perfil contrasena preferencias', permission: 'settings' },
];

const getInitials = (name, lastname) => {
  const first = name?.trim()?.[0] || '';
  const second = lastname?.trim()?.[0] || '';
  return (first + second).toUpperCase() || '?';
};

// Quita tildes para que "menu" encuentre "Menú" y "configuracion" encuentre "configuración"
const normalize = (text) =>
  (text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

const TopBar = ({ onMenuClick }) => {
  const { user, isLoading } = useAuth();
  const { logout, loading: loggingOut } = useLogout();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [openPanel, setOpenPanel] = useState(null); // 'notifications' | 'user' | null
  const [searchTerm, setSearchTerm] = useState('');

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const fullName = user ? `${user.name || ''} ${user.lastname || ''}`.trim() : '';
  const roleLabel = user ? (ROLE_LABELS[user.role] || user.role) : '';

  const canSeeNotifications = hasPermission(user, 'notifications');
  const canSeeSettings = hasPermission(user, 'settings');

  // Resultados del buscador: coinciden por nombre visible o por palabras clave,
  // y solo entre las secciones que este usuario puede ver
  const searchResults = useMemo(() => {
    const term = normalize(searchTerm.trim());
    if (!term) return [];
    return SEARCHABLE_SECTIONS.filter(
      (section) =>
        (!section.permission || hasPermission(user, section.permission)) &&
        (normalize(section.label).includes(term) || normalize(section.keywords).includes(term))
    ).slice(0, 6);
  }, [searchTerm, user]);

  // Cierra los desplegables al hacer clic fuera o al presionar Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchTerm('');
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setOpenPanel((prev) => (prev === 'user' ? null : prev));
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenPanel(null);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const goToSection = (path) => {
    setSearchTerm('');
    navigate(path);
  };

  // Al presionar Enter se navega directo al primer resultado
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchResults.length > 0) goToSection(searchResults[0].path);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setOpenPanel(null);
    await logout();
  };

  return (
    <div className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
      <button
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-colors mr-2"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <FAIcon icon="bars" size="lg" />
      </button>

      {/* Buscador de secciones: tarjeta propia, ya no comparte el fondo con el resto de la barra */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="bg-white/90 border border-white/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06),inset_1px_1px_2px_rgba(255,255,255,0.6)]">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <FAIcon icon="magnifying-glass" size="sm" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar sección..."
                aria-label="Buscar sección"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-transparent rounded-2xl text-gray-700 placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-red-200 transition-all"
              />
            </div>
          </form>
        </div>

        {searchTerm.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-white/80 overflow-hidden
            shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)]">
            {searchResults.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">Sin resultados para "{searchTerm}"</p>
            ) : (
              searchResults.map((section) => (
                <button
                  key={section.path}
                  onClick={() => goToSection(section.path)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <FAIcon icon={section.icon} className="text-gray-400" size="sm" />
                  <span className="text-sm font-display font-medium text-gray-800">{section.label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notificaciones: tarjeta propia. Un empleado sin el permiso
            "notifications" ni siquiera ve la campanita. */}
        {canSeeNotifications && (
          <div className="relative bg-white/90 border border-white/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06),inset_1px_1px_2px_rgba(255,255,255,0.6)]">
            <button
              onClick={() => setOpenPanel((prev) => (prev === 'notifications' ? null : 'notifications'))}
              aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
              aria-expanded={openPanel === 'notifications'}
              className="relative p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white/60 rounded-2xl transition-colors"
            >
              <FAIcon icon="bell" size="lg" />
              {/* El contador solo aparece si de verdad hay algo sin leer */}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center
                  bg-red-500 text-white text-[10px] font-display font-bold rounded-full shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationsPanel
              isOpen={openPanel === 'notifications'}
              onClose={() => setOpenPanel(null)}
            />
          </div>
        )}

        {/* Perfil: los ajustes ahora se acceden solo desde la opción "Ajustes" de este menú */}
        <div className="flex items-center bg-white/90 border border-white/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06),inset_1px_1px_2px_rgba(255,255,255,0.6)] p-1">
          {/* Menú del usuario */}
          <div className="relative hidden sm:block" ref={userMenuRef}>
            <button
              onClick={() => setOpenPanel((prev) => (prev === 'user' ? null : 'user'))}
              aria-label="Menú de usuario"
              aria-expanded={openPanel === 'user'}
              disabled={isLoading}
              className="flex items-center gap-3 pl-2 pr-3 py-1 rounded-xl hover:bg-white/60 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-col text-xs sm:text-sm hidden sm:flex gap-1">
                    <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-14 h-2 bg-gray-200 rounded animate-pulse" />
                  </div>
                </>
              ) : (
                <>
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={fullName}
                      className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/80 shadow-sm"
                    />
                  ) : (
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-display font-semibold text-xs sm:text-sm ring-2 ring-white/80 shadow-sm">
                      {getInitials(user?.name, user?.lastname)}
                    </div>
                  )}
                  <div className="relative flex-col text-xs sm:text-sm hidden sm:flex text-left">
                    <span className="font-display font-semibold text-gray-900 leading-tight">{fullName || 'Usuario'}</span>
                    <span className="text-xs text-gray-500 font-sans">{roleLabel}</span>
                  </div>
                  <FAIcon
                    icon="chevron-down"
                    size="xs"
                    className={`text-gray-400 transition-transform ${openPanel === 'user' ? 'rotate-180' : ''}`}
                  />
                </>
              )}
            </button>

            {openPanel === 'user' && (
            <div className="absolute right-0 top-full mt-2 w-56 z-50 bg-white rounded-2xl border border-white/80 overflow-hidden
              shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)]">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-display font-semibold text-gray-900 text-sm truncate">{fullName || 'Usuario'}</p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>

              {canSeeSettings && (
                <Link
                  to="/ajustes"
                  onClick={() => setOpenPanel(null)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FAIcon icon="cog" className="text-gray-400" size="sm" />
                  <span className="font-display font-medium">Ajustes</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 disabled:opacity-60"
              >
                <FAIcon icon="sign-out-alt" size="sm" />
                <span className="font-display font-medium">
                  {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </span>
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
