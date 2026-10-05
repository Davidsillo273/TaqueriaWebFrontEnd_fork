// hooks/useKitchenClock.js
//
// Lectura del reloj único de cocina (utils/kitchenClock.js).
//
// La clave de rendimiento está en QUÉ se le pide al reloj: useSyncExternalStore
// compara el valor devuelto con el anterior y, si es igual, NO re-renderiza.
// Por eso cada hook devuelve un valor ya derivado, no la hora cruda:
//
//   - useElapsedLabel → el texto "12:34". Cambia cada segundo, pero solo lo
//     usa el pequeño <TicketTimer>, nunca el ticket completo.
//   - useTimeLevel    → 'ok' | 'warn' | 'late'. Cambia DOS veces en la vida
//     de una comanda, así que el ticket (con todos sus platillos) solo se
//     vuelve a pintar cuando de verdad cambia de color.
//
// Con 30 comandas, cada segundo se actualizan 30 textos cortos y nada más.
import { useSyncExternalStore } from 'react';
import { subscribeClock, getClockNow } from '../utils/kitchenClock';
import { formatElapsed } from '../utils/timeFormat';

const MINUTE_MS = 60 * 1000;

// Lee del reloj solo el valor que calcula `select`
export function useClockValue(select) {
  return useSyncExternalStore(subscribeClock, () => select(getClockNow()));
}

// Texto del cronómetro desde `since` (ms). null = la comanda no corre tiempo.
export function useElapsedLabel(since) {
  return useClockValue((now) => (since == null ? null : formatElapsed(now - since)));
}

// Nivel de alerta según los minutos del Sistema de Cocina. `forceLate` es
// para el "atrasado" que marca el propio backend.
export function useTimeLevel(since, warningMinutes, maxMinutes, forceLate = false) {
  return useClockValue((now) => {
    if (since == null) return 'idle';
    if (forceLate) return 'late';
    const elapsed = now - since;
    if (elapsed >= maxMinutes * MINUTE_MS) return 'late';
    if (elapsed >= warningMinutes * MINUTE_MS) return 'warn';
    return 'ok';
  });
}

// Minuto actual (para lo que depende de la hora pero no del segundo, como un
// pedido programado que entra a la cola). Re-renderiza una vez por minuto.
export function useClockMinute() {
  return useClockValue((now) => Math.floor(now / MINUTE_MS));
}
