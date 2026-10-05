// Reloj único de la pantalla de cocina.
//
// Con 30 comandas en pantalla, darle a cada ticket su propio setInterval
// significaría 30 temporizadores desfasados entre sí, cada uno disparando su
// propio render en un momento distinto del segundo (30 repintados por
// segundo en vez de uno). Aquí hay UN solo temporizador para toda la app:
//
//   - Se reprograma alineado al cambio de segundo del reloj de pared, así
//     todos los cronómetros cambian en el mismo cuadro (un solo repintado) y
//     no acumula desfase con las horas, como sí le pasa a un setInterval.
//   - Solo corre mientras alguien lo escucha y la pestaña está visible: con
//     la pantalla oculta no gasta nada, y al volver se pone al día de golpe.
//   - No guarda estado de React: los componentes lo leen con
//     useSyncExternalStore (ver hooks/useKitchenClock.js), que solo
//     re-renderiza a quien le cambió el valor que pidió.

const TICK_MS = 1000;
// Pequeño margen para que, al disparar, Date.now() ya esté del otro lado del
// segundo (los navegadores redondean los temporizadores).
const ALIGN_SLACK_MS = 4;

let now = Date.now();
const listeners = new Set();
let timer = null;

const tick = () => {
  now = Date.now();
  listeners.forEach((listener) => listener());
};

const schedule = () => {
  timer = setTimeout(() => {
    tick();
    schedule();
  }, TICK_MS - (Date.now() % TICK_MS) + ALIGN_SLACK_MS);
};

const start = () => {
  if (timer === null) schedule();
};

const stop = () => {
  clearTimeout(timer);
  timer = null;
};

const handleVisibility = () => {
  if (document.hidden) {
    stop();
    return;
  }
  // Al volver a la pestaña, todos los cronómetros saltan a la hora real
  tick();
  start();
};

export const subscribeClock = (listener) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    now = Date.now();
    document.addEventListener('visibilitychange', handleVisibility);
    if (!document.hidden) start();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    }
  };
};

// Hora del último tic: entre tics devuelve siempre el mismo valor, que es lo
// que useSyncExternalStore necesita para no re-renderizar en falso. Sin nadie
// suscrito (el primer render de un ticket, ej. al salir del lobby) no hay
// tics, así que se usa la hora real para no pintar un tiempo viejo.
export const getClockNow = () => (listeners.size > 0 ? now : Date.now());
