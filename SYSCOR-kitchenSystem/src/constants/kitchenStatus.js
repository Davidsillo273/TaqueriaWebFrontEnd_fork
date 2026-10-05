// Estados de una comanda tal como los ve cocina.
//
// El backend maneja 'pending', 'preparing', 'ready' y 'atrasado' (este último
// lo pone solo cuando una comanda pasa 1 hora en preparación). Cocina los
// agrupa en lo que importa frente a la plancha:
//   - En cocina: 'preparing' o 'atrasado'.
//   - Pendiente: 'pending' que ya se puede empezar (en la cola).
//   - Bloqueada: 'pending' que todavía NO se puede empezar: un 2º tiempo que
//     el mesero no ha marchado, un cliente que está agregando productos o un
//     pedido programado para más tarde.
//   - Lista: 'ready'. Sale del tablero y queda unos minutos en "Listas
//     recientes" por si hay que regresarla.

// Valores de respaldo del Sistema de Cocina, iguales a los del backend
// (settingsModel.kitchen): si el servidor no los manda, se usan estos.
export const DEFAULT_KITCHEN_SETTINGS = {
  enabled: false,
  warningMinutes: 10,
  maxMinutes: 15,
  changedAt: null,
  changedBy: null,
};

// Lo que se pide al servidor como "comandas del tablero"
export const ACTIVE_ORDER_STATUSES = ['pending', 'preparing', 'atrasado'];
export const IN_KITCHEN_STATUSES = ['preparing', 'atrasado'];

// Un pedido programado entra a la cola este tiempo antes de su hora. Mismo
// valor que el backend (kitchenQueueUtils.SCHEDULED_LEAD_MS).
export const SCHEDULED_LEAD_MS = 20 * 60 * 1000;

// Cuánto tiempo sigue visible una comanda en "Listas recientes"
export const RECENT_READY_MS = 15 * 60 * 1000;

// Etiquetas por fase (ver utils/orderPhase.js)
export const PHASE_META = {
  cooking: { label: 'En cocina', icon: 'bolt' },
  queued: { label: 'Pendiente', icon: 'clock' },
  waiting: { label: 'Espera al mesero', icon: 'user' },
  hold: { label: 'Cliente agregando', icon: 'shopping-bag' },
  scheduled: { label: 'Programado', icon: 'calendar' },
};

// Filtros del tablero
export const BOARD_FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'cooking', label: 'En cocina' },
  { key: 'queued', label: 'Pendientes' },
];

// Modo de detalle de los tickets (interruptor global)
export const DETAIL_MODES = {
  simple: 'simple',
  detailed: 'detailed',
};
