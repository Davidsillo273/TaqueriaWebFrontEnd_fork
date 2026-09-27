// src/components/menu/MenuPageShell.jsx
//
// Esqueleto común de las pantallas del catálogo (Platillos, Bebidas,
// Conjuntos de bebidas, Combos, Promociones...). Todas comparten el mismo
// encabezado "Menú" con sus acciones a la derecha y una fila de pestañas que
// salta entre secciones, así que se ven como una sola pantalla con varias
// vistas en vez de cinco pantallas sueltas.
import React from 'react';
import { useLocation } from 'react-router-dom';
import PageShell, { PRIMARY_BUTTON } from '../commons/PageShell';
import { useAuth } from '../../hooks/auth/useAuth';
import { hasPermission } from '../../constants/permissions';

// Mismas rutas y permisos que el desplegable "Menú" de NavMenu.
const MENU_TABS = [
  { label: 'Platillos', path: '/dishes', permission: 'dishes' },
  { label: 'Bebidas', path: '/drinks', permission: 'drinks' },
  { label: 'Conjuntos de bebidas', path: '/drink-sets', permission: 'drink_sets' },
  { label: 'Combos', path: '/combos', permission: 'combos' },
  { label: 'Extras', path: '/extras', permission: 'extras' },
  { label: 'Recetas', path: '/recetas', permission: 'recipes' },
  { label: 'Promociones', path: '/promociones', permission: 'promotions' },
];

// Se mantiene el nombre de antes: las pantallas del menú ya lo importan así.
export const MENU_PRIMARY_BUTTON = PRIMARY_BUTTON;

const MenuPageShell = ({ activeMenu, subtitle, actions, children, modals }) => {
  const { user } = useAuth();
  const location = useLocation();

  const current = location.pathname.toLowerCase();
  const tabs = MENU_TABS
    .filter((t) => hasPermission(user, t.permission))
    .map((t) => ({ key: t.path, label: t.label, to: t.path, active: current === t.path.toLowerCase() }));

  return (
    <PageShell
      activeMenu={activeMenu}
      title="Menú"
      subtitle={subtitle}
      actions={actions}
      tabs={tabs}
      tabsLabel="Secciones del menú"
      modals={modals}
    >
      {children}
    </PageShell>
  );
};

export default MenuPageShell;
