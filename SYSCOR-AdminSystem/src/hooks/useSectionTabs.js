// src/hooks/useSectionTabs.js
//
// Pestañas de las secciones con sub navbar (Operaciones y Administración).
// Las mismas listas alimentan la barra superior (NavMenu), que lleva a la
// primera pestaña permitida y se marca activa en cualquiera de ellas.
import { useLocation } from 'react-router-dom';
import { useAuth } from '@syscor/web-shared/src/hooks/useAuth';
import { hasPermission } from '../constants/permissions';

export const OPERATIONS_TABS = [
  { id: 'orders', label: 'Pedidos y Órdenes', path: '/pedidos', permission: 'orders' },
  { id: 'tables', label: 'Mesas', path: '/mesas', permission: 'tables' },
  { id: 'inventory', label: 'Inventario', path: '/inventario', permission: 'inventory' },
];

export const ADMIN_TABS = [
  { id: 'employees', label: 'Empleados', path: '/employees', permission: 'employees' },
  { id: 'invitations', label: 'Invitaciones', path: '/InviteStaff', permission: 'invite_staff' },
  { id: 'payroll_general', label: 'Planilla general', path: '/payroll', permission: 'payroll' },
  { id: 'payroll_bonuses', label: 'Planilla de bonos', path: '/payroll?tab=bonuses', permission: 'payroll' },
  { id: 'clients', label: 'Clientes', path: '/clients', permission: 'clients' },
  { id: 'reports', label: 'Reportes (IVA)', path: '/reports', permission: 'reports' },
];

const toShellTabs = (list, user, activeId) =>
  list
    .filter((t) => !t.permission || hasPermission(user, t.permission))
    .map((t) => ({ key: t.id, label: t.label, to: t.path, active: t.id === activeId }));

// activeId: id de la pestaña de la pantalla actual. Se pasa explícito porque
// Planilla general y Planilla de bonos comparten ruta y solo cambia el ?tab=.
export function useOperationsTabs(activeId) {
  const { user } = useAuth();
  return toShellTabs(OPERATIONS_TABS, user, activeId);
}

export function useAdminTabs(activeId) {
  const { user } = useAuth();
  const location = useLocation();
  // Sin id explícito se deduce de la ruta (útil para Planilla, que cambia de
  // pestaña con el query string).
  const id = activeId || ADMIN_TABS.find((t) => {
    const [base, search] = t.path.split('?');
    if (location.pathname.toLowerCase() !== base.toLowerCase()) return false;
    return search ? location.search.includes(search) : !location.search.includes('tab=bonuses');
  })?.id;
  return toShellTabs(ADMIN_TABS, user, id);
}
