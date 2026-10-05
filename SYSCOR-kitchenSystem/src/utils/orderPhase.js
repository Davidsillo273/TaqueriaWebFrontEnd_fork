// En qué fase está una comanda para cocina y desde cuándo corre su tiempo.
// Ver la explicación de las fases en constants/kitchenStatus.js.
import { IN_KITCHEN_STATUSES, SCHEDULED_LEAD_MS } from '../constants/kitchenStatus';

const toTime = (date) => {
  const time = date ? new Date(date).getTime() : NaN;
  return Number.isNaN(time) ? null : time;
};

// Desde cuándo cuenta el cronómetro de una comanda: desde que se pidió. Un 2º
// tiempo cuenta desde que el mesero lo marchó (antes no se podía empezar) y
// un pedido programado desde que entró a la cola. Mismo criterio que la cola
// del backend (kitchenQueueUtils.kitchenReadyAt), para que "la que más
// espera" sea la misma en el servidor y en pantalla.
export const kitchenSince = (order) => {
  const created = toTime(order.createdAt) ?? Date.now();
  // Cliente con reserva que llegó a su mesa: cuenta desde que llegó
  const arrived = toTime(order.arrivedAt);
  if (arrived !== null) return arrived;
  const scheduled = toTime(order.scheduledFor);
  if (scheduled !== null) return Math.max(created, scheduled - SCHEDULED_LEAD_MS);
  return toTime(order.firedAt) ?? created;
};

// Fase de la comanda. null = no va en el tablero (lista, entregada, cancelada).
export const orderPhase = (order, now = Date.now()) => {
  if (IN_KITCHEN_STATUSES.includes(order.status)) return 'cooking';
  if (order.status !== 'pending') return null;
  if (order.waiting) return 'waiting';
  if (order.hold?.active) return 'hold';
  const scheduled = toTime(order.scheduledFor);
  // Programado para más tarde, salvo que el cliente ya haya llegado
  if (scheduled !== null && !order.arrivedAt && scheduled - SCHEDULED_LEAD_MS > now) return 'scheduled';
  return 'queued';
};

// Las fases que corren cronómetro y alertas (las bloqueadas no: todavía no
// le toca a cocina).
export const TIMED_PHASES = ['cooking', 'queued'];

const PHASE_RANK = { cooking: 0, queued: 1, hold: 2, waiting: 3, scheduled: 4 };

/**
 * Arma el tablero: cada comanda con su fase, su "desde" y su lugar en la
 * cola. Primero lo que está en cocina, luego la cola (la que más espera
 * primero) y al final lo que todavía no se puede empezar.
 */
export const buildBoard = (orders, now = Date.now()) => {
  const entries = [];
  for (const order of orders) {
    const phase = orderPhase(order, now);
    if (!phase) continue;
    entries.push({ order, phase, since: kitchenSince(order), queuePosition: null });
  }

  entries.sort((a, b) => PHASE_RANK[a.phase] - PHASE_RANK[b.phase] || a.since - b.since);

  let position = 0;
  for (const entry of entries) {
    if (entry.phase === 'queued') entry.queuePosition = ++position;
  }
  return entries;
};

// Cuándo se marcó como lista (última vez que pasó a "ready")
export const readyAt = (order) => {
  const entry = [...(order.statusHistory || [])].reverse().find((h) => h.status === 'ready');
  return toTime(entry?.changedAt) ?? toTime(order.updatedAt) ?? Date.now();
};
