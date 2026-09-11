// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import FAIcon from '../commons/FAIcon';
import { useLogout } from '../../hooks/auth/useLogout';
import { useTheme } from '../../context/themeContext';
import { useAuth } from '../../hooks/auth/useAuth';
import { hasPermission } from '../../constants/permissions';

const Sidebar = ({ activeMenu, isOpen, onClose }) => {
  const { logout, loading } = useLogout();
  const { theme } = useTheme();
  const { user } = useAuth();
  // Dentro del sistema el logo es el PNG plano, sin la animación del chile
  // (esa solo aplica en las pantallas de login, ver components/commons/Logo.jsx)
  const logoSrc = theme === 'dark' ? '/logos/nav-dark-plain.png' : '/logos/nav-light-plain.png';

  // Agrupamos los items por categorías para un mejor orden visual. "Actividad"
  // no lleva `permission`: es la pantalla de aterrizaje, siempre visible para
  // cualquiera con sesión (ver App.jsx, /dashboard no exige permiso).
  const menuCategories = [
    {
      title: 'Principal',
      items: [
        { id: 'activity', label: 'Actividad', icon: 'chart-line', path: '/dashboard' },
      ],
    },
    {
      title: 'Menú',
      items: [
        { id: 'combos', label: 'Combos', icon: 'shopping-bag', path: '/combos', permission: 'combos' },
        { id: 'drinks', label: 'Bebidas', icon: 'wine-glass', path: '/drinks', permission: 'drinks' },
        { id: 'drink-sets', label: 'Conjuntos de bebidas', icon: 'layer-group', path: '/drink-sets', permission: 'drink_sets' },
        { id: 'dishes', label: 'Platillos', icon: 'utensils', path: '/dishes', permission: 'dishes' },
        { id: 'extras', label: 'Extras', icon: 'star', path: '/extras', permission: 'extras' },
        { id: 'recipes', label: 'Recetas', icon: 'flask', path: '/recetas', permission: 'recipes' },
      ],
    },
    {
      title: 'Operaciones',
      items: [
        { id: 'orders-list', label: 'Pedidos y Órdenes', icon: 'list', path: '/pedidos', permission: 'orders' },
        { id: 'tables', label: 'Mesas', icon: 'chair', path: '/mesas', permission: 'tables' },
        { id: 'inventory', label: 'Inventario', icon: 'box', path: '/inventario', permission: 'inventory' },
      ],
    },
    {
      title: 'Administración',
      items: [
        { id: 'clients', label: 'Clientes', icon: 'users', path: '/clients', permission: 'clients' },
        { id: 'staff', label: 'Empleados', icon: 'user-tie', path: '/employees', permission: 'employees' },
        { id: 'invite-staff', label: 'Invitar staff', icon: 'user-plus', path: '/InviteStaff', permission: 'invite_staff' },
        { id: 'payroll', label: 'Planilla', icon: 'sack-dollar', path: '/payroll', permission: 'payroll' },
        { id: 'reports', label: 'Reportes (IVA)', icon: 'file-invoice-dollar', path: '/reports', permission: 'reports' },
      ],
    },
  ]
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => !item.permission || hasPermission(user, item.permission)),
    }))
    .filter((category) => category.items.length > 0);

  const handleLogout = async (e) => {
    e.preventDefault();
    if (loading) return;
    await logout();
  };

  const renderNavItem = (item, onItemClick) => {
    const isActive = activeMenu === item.id;
    return (
      <Link
        key={item.id}
        to={item.path}
        onClick={onItemClick}
        className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-display font-medium transition-all duration-200 ${isActive
            ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3),inset_1px_1px_2px_rgba(255,255,255,0.3)]'
            : 'text-gray-600 hover:bg-white/20 hover:text-gray-900'
          }`}
      >
        <FAIcon
          icon={item.icon}
          className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}
        />
        <span>{item.label}</span>
        {isActive && (
          <span className="ml-auto w-2 h-2 rounded-full bg-white shadow-sm" />
        )}
      </Link>
    );
  };

  // Cada categoría vive en su propia "tarjeta", con un fondo apenas distinto
  // al de la sidebar para separarlas visualmente sin romper el tema oscuro.
  const renderNavigation = (onItemClick = undefined) => (
    <div className="space-y-4">
      {menuCategories.map((category, idx) => (
        <div key={idx} className="bg-gray-50 border border-white/60 rounded-2xl p-3">
          <h3 className="px-1 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {category.title}
          </h3>
          <div className="space-y-1">
            {category.items.map((item) => renderNavItem(item, onItemClick))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="hidden lg:flex lg:flex-col relative w-64 bg-white/90 backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/60 h-screen sticky top-0">
        <div className="relative p-4 border-b border-white/80 shrink-0">
          <div className="w-full flex items-center justify-center py-4">
            <img src={logoSrc} alt="SYSCOR" className="h-14 w-auto object-contain" draggable={false} />
          </div>
        </div>

        <nav className="relative p-4 flex-1 overflow-y-auto custom-scrollbar">
          {renderNavigation()}
        </nav>

      </aside>

      {/* Móvil */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-sm shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          <div className="relative flex items-center justify-between p-4 border-b border-white/80 shrink-0">
            <div className="flex items-center justify-center">
              <img src={logoSrc} alt="SYSCOR" className="h-10 w-auto object-contain" draggable={false} />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-colors"
              aria-label="Cerrar menú"
            >
              <FAIcon icon="times" size="lg" />
            </button>
          </div>

          <nav className="relative p-4 flex-1 overflow-y-auto custom-scrollbar">
            {renderNavigation(onClose)}
          </nav>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
