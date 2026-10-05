// src/components/dashboard/TopBar.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FAIcon from '@syscor/web-shared/src/components/FAIcon';
import NotificationsPanel from './NotificationsPanel';
import NavMenu from './NavMenu';
import PanchitaIcon from '@syscor/web-shared/src/components/PanchitaIcon';
import { useTheme } from '@syscor/web-shared/src/context/themeContext';
import { useAuth } from '@syscor/web-shared/src/hooks/useAuth';
import { useLogout } from '@syscor/web-shared/src/hooks/useLogout';
import { useNotifications } from '../../hooks/useNotifications';
import { useAssistant } from '../../hooks/useAssistant';
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
  // Sin "permission": /ajustes es accesible a cualquier sesión (editar el propio perfil).
  { label: 'Ajustes', path: '/ajustes', icon: 'cog', keywords: 'ajuste configuracion perfil contrasena preferencias' },
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
  const { theme } = useTheme();
  const { logout, loading: loggingOut } = useLogout();
  const { unreadCount } = useNotifications();
  // El asistente de IA: se puede abrir desde aquí y, cuando está ejecutando
  // una acción, este botón lo muestra aunque el chat esté cerrado.
  const { isOpen: assistantOpen, toggle: toggleAssistant, isBusy: assistantBusy } = useAssistant();
  const navigate = useNavigate();

  const [openPanel, setOpenPanel] = useState(null); // 'notifications' | 'user' | null
  const [searchTerm, setSearchTerm] = useState('');

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const fullName = user ? `${user.name || ''} ${user.lastname || ''}`.trim() : '';
  const roleLabel = user ? (ROLE_LABELS[user.role] || user.role) : '';

  const canSeeNotifications = hasPermission(user, 'notifications');

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

  // Dentro del sistema el logo es el PNG plano, sin la animación del chile
  // (esa solo aplica en el login, ver components/commons/Logo.jsx).
  const logoSrc = theme === 'dark' ? '/logos/nav-dark-plain.png' : '/logos/nav-light-plain.png';

  return (
    <div className="sticky top-0 z-30 px-3 sm:px-6 lg:px-8 h-[58px] border-b border-line bg-bg flex items-center gap-2 sm:gap-3 lg:gap-5">
      {/* El menú lateral solo sobrevive en móvil: en pantallas grandes la
          navegación vive en la barra (ver NavMenu). */}
      <button
        className="lg:hidden p-2 -ml-1 text-inkalt hover:text-ink transition-colors shrink-0"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <FAIcon icon="bars" size="lg" />
      </button>

      <Link to="/dashboard" className="shrink-0">
        <img src={logoSrc} alt="SYSCOR" className="h-7 sm:h-9 w-auto object-contain" />
      </Link>

      <NavMenu />

      {/* Buscador de secciones: tarjeta propia, ya no comparte el fondo con el resto de la barra.
          En móvil no cabe junto al resto de la barra, así que se oculta ahí (igual que NavMenu). */}
      <div className="hidden md:block flex-1 max-w-[200px] relative ml-auto" ref={searchRef}>
        <div className="bg-white dark:bg-surface border border-line rounded-lg">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <FAIcon icon="magnifying-glass" size="sm" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar sección..."
                aria-label="Buscar sección"
                className="w-full pl-9 pr-3 py-2 text-[13px] bg-transparent rounded-lg text-inkalt placeholder:text-muted
                  focus:outline-none focus:ring-2 focus:ring-acline transition-all"
              />
            </div>
          </form>
        </div>

        {searchTerm.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-surface rounded-lg border border-line shadow-lg overflow-hidden">
            {searchResults.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted">Sin resultados para "{searchTerm}"</p>
            ) : (
              searchResults.map((section) => (
                <button
                  key={section.path}
                  onClick={() => goToSection(section.path)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surfalt transition-colors"
                >
                  <FAIcon icon={section.icon} className="text-muted" size="sm" />
                  <span className="text-sm font-display font-medium text-ink">{section.label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 ml-auto md:ml-0 shrink-0">
        {/* Asistente de IA: mismo trato visual que la campana. Antes solo
            existía el botón flotante de la esquina, que pasaba desapercibido;
            aquí queda a la vista y, sobre todo, avisa cuando está trabajando.
            Solo lo ve quien puede usarlo (el widget se oculta a los clientes). */}
        {(user?.role === 'admin' || user?.role === 'employee') && (
          <div className="relative">
            <button
              onClick={toggleAssistant}
              aria-label={assistantBusy ? 'Chef Panchita, ejecutando una acción' : 'Chef Panchita (Ctrl+K)'}
              aria-expanded={assistantOpen}
              title="Chef Panchita · Ctrl+K"
              className={`relative p-2 rounded-lg transition-colors ${
                assistantBusy
                  ? 'text-ac'
                  : assistantOpen
                    ? 'text-ink'
                    : 'text-inkalt hover:text-ink'
              }`}
            >
              {/* Retrato de Chef Panchita (cambia con el tema). Mientras
                  trabaja, late: es la señal de que está haciendo algo, no de
                  que haya un error. */}
              <PanchitaIcon variant="icon" className={`w-6 h-6 ${assistantBusy ? 'animate-pulse' : ''}`} />

              {assistantBusy && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3" aria-hidden="true">
                  {/* Halo que se expande: se nota de reojo sin robar atención */}
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ac opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-ac" />
                </span>
              )}
            </button>
          </div>
        )}

        {/* Notificaciones: tarjeta propia. Un empleado sin el permiso
            "notifications" ni siquiera ve la campanita. */}
        {canSeeNotifications && (
          <div className="relative">
            <button
              onClick={() => setOpenPanel((prev) => (prev === 'notifications' ? null : 'notifications'))}
              aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
              aria-expanded={openPanel === 'notifications'}
              className="relative p-2 text-inkalt hover:text-ink rounded-lg transition-colors"
            >
              <FAIcon icon="bell" size="lg" />
              {/* El contador solo aparece si de verdad hay algo sin leer */}
              {unreadCount > 0 && (
                <span className="num absolute top-0.5 right-0 text-[10px] leading-none text-ac">
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
        <div className="flex items-center pl-2 sm:pl-4 ml-1 sm:ml-2 border-l border-line">
          {/* Menú del usuario */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setOpenPanel((prev) => (prev === 'user' ? null : 'user'))}
              aria-label="Menú de usuario"
              aria-expanded={openPanel === 'user'}
              disabled={isLoading}
              className="flex items-center gap-1.5 sm:gap-3 px-1.5 py-1 rounded-lg hover:bg-surfalt/60 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-line rounded-full animate-pulse" />
                  <div className="flex-col text-xs sm:text-sm hidden sm:flex gap-1">
                    <div className="w-20 h-3 bg-line rounded animate-pulse" />
                    <div className="w-14 h-2 bg-line rounded animate-pulse" />
                  </div>
                </>
              ) : (
                <>
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={fullName}
                      className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-acline"
                    />
                  ) : (
                    <div className="num relative w-8 h-8 sm:w-9 sm:h-9 bg-acsoft text-ac border border-acline rounded-full flex items-center justify-center text-[11px]">
                      {getInitials(user?.name, user?.lastname)}
                    </div>
                  )}
                  <div className="relative flex-col text-xs sm:text-sm hidden sm:flex text-left">
                    <span className="font-display font-medium text-[14px] text-ink leading-tight">{fullName || 'Usuario'}</span>
                    <span className="kick text-muted mt-0.5">{roleLabel}</span>
                  </div>
                  <FAIcon
                    icon="chevron-down"
                    size="xs"
                    className={`hidden sm:inline text-muted transition-transform ${openPanel === 'user' ? 'rotate-180' : ''}`}
                  />
                </>
              )}
            </button>

            {openPanel === 'user' && (
            <div className="absolute right-0 top-full mt-2 w-56 z-50 bg-surface rounded-lg border border-line shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-line">
                <p className="font-display font-medium text-ink text-sm truncate">{fullName || 'Usuario'}</p>
                <p className="kick text-muted mt-0.5">{roleLabel}</p>
              </div>

              {/* "/ajustes" ya no exige el permiso "settings": cualquier sesión
                  puede entrar a editar su propio perfil desde ahí; la
                  configuración general del sistema queda oculta dentro de esa
                  pantalla si no se tiene el permiso. */}
              <Link
                to="/ajustes"
                onClick={() => setOpenPanel(null)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-inkalt hover:bg-surfalt transition-colors"
              >
                <FAIcon icon="cog" className="text-muted" size="sm" />
                <span className="font-display font-medium">Ajustes</span>
              </Link>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ac hover:bg-acsoft transition-colors border-t border-line disabled:opacity-60"
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
