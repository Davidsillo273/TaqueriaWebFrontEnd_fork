// components/kitchen/OrderTicket.jsx
//
// Ticket de una comanda en el tablero de cocina.
//
// Lo primero que se lee es el NÚMERO DE COCINA (1, 2, 3... del día): es corto,
// se ve de lejos y es el que se le dice a Chef Panchita. El código de la
// orden ("CL04-03") sigue al lado, más chico, porque es el que ven meseros,
// caja y clientes.
//
// Dos colores con significados distintos, a propósito en lugares distintos:
//   - La FRANJA de arriba es la estación (tacos, bebidas...). Si la comanda
//     es mixta, la franja se divide con el color de cada estación, y las
//     etiquetas de estación dicen cuáles son.
//   - El BORDE y el cronómetro son el tiempo: normal, ámbar al llegar a la
//     advertencia y rojo parpadeante al pasar el máximo (Ajustes → Sistema
//     de cocina, en el panel).
//
// Rendimiento: el ticket está memorizado y solo se vuelve a pintar cuando
// cambia su comanda, el modo de detalle o su NIVEL de tiempo (dos veces en
// toda su vida). El segundero vive aparte, en <TicketTimer>.
import { memo, useMemo, useRef, useLayoutEffect } from 'react';
import FAIcon from '@syscor/web-shared/src/components/FAIcon';
import { orderCode } from '@syscor/web-shared/src/utils/orderCode';
import TicketTimer from './TicketTimer';
import { useTimeLevel } from '../../hooks/useKitchenClock';
import { orderStations, itemDetails } from '../../utils/orderContent';
import { TIMED_PHASES } from '../../utils/orderPhase';
import { formatClock } from '../../utils/timeFormat';
import { PHASE_META } from '../../constants/kitchenStatus';

// Duración de un parpadeo (igual que @keyframes ticketBlink en index.css)
const BLINK_MS = 1600;

const shortName = (name, lastname) => {
  const first = String(name || '').trim().split(/\s+/)[0] || '';
  const initial = String(lastname || '').trim().charAt(0);
  return first ? `${first}${initial ? ` ${initial.toUpperCase()}.` : ''}` : '';
};

// De dónde viene la comanda: "Mesa 5 · 1er tiempo" y quién la tomó o pidió
const orderContext = (order) => {
  if (order.orderType === 'local') {
    const parts = [
      order.table?.number ? `Mesa ${order.table.number}` : 'Mesa sin asignar',
      order.round > 1 ? `Ronda ${order.round}` : null,
      order.course === 1 ? '1er tiempo' : order.course === 2 ? '2º tiempo' : null,
    ];
    return {
      text: parts.filter(Boolean).join(' · '),
      person: [order.localCustomerName, shortName(order.waiter?.name, order.waiter?.lastname)].filter(Boolean).join(' · '),
    };
  }

  const fulfillment = order.fulfillment || (order.isDelivery ? 'delivery' : 'pickup');
  const byFulfillment = { delivery: 'A domicilio', pickup: 'Para llevar', dine_in: 'Comer en el local' };
  return {
    text: byFulfillment[fulfillment] || byFulfillment.pickup,
    // La API de cocina ya lo manda recortado ("Lucía H."): nunca recibe el
    // contacto completo del cliente (ver kitchenOrderView en el backend).
    person: order.customerName || '',
  };
};

// Color del punto de estado: en cocina el acento, en cola ámbar, bloqueada gris
const PHASE_TONE = {
  cooking: { dot: 'bg-ac', text: 'text-ac' },
  queued: { dot: 'bg-warn', text: 'text-warn' },
  waiting: { dot: 'bg-muted', text: 'text-muted' },
  hold: { dot: 'bg-muted', text: 'text-muted' },
  scheduled: { dot: 'bg-muted', text: 'text-muted' },
};

const phaseLabel = (phase, order) => {
  const { label } = PHASE_META[phase];
  if (phase === 'hold' && order.hold?.until) return `${label} · hasta ${formatClock(order.hold.until)}`;
  if (phase === 'scheduled' && order.scheduledFor) return `${label} · ${formatClock(order.scheduledFor)}`;
  return label;
};

// Franja superior de estación: un color, o franjas iguales si es mixta
const StationStripe = ({ stations, primary }) => (
  <div className="absolute left-0 right-0 top-0 h-[3px] flex" aria-hidden="true">
    {(stations.length ? stations : [primary]).map((station) => (
      <span key={station.key} className="flex-1" style={{ backgroundColor: station.color }} />
    ))}
  </div>
);

// Receta de un producto (modo "con detalles")
const ItemRecipe = ({ blocks }) => {
  if (!blocks.length) {
    return <p className="mt-1 text-[12.5px] text-muted italic">Sin receta registrada en el menú.</p>;
  }
  return (
    <div className="mt-1.5 space-y-2">
      {blocks.map((block, index) => (
        <div key={block.title || index}>
          {block.title && <p className="text-[13px] font-semibold text-inkalt">{block.title}</p>}
          {block.note && <p className="text-[13px] text-inkalt">{block.note}</p>}
          {block.lines.length > 0 && (
            <ul className="text-[13px] text-inkalt leading-relaxed mt-0.5">
              {block.lines.map((line, lineIndex) => (
                <li key={`${line.name}-${lineIndex}`} className="flex justify-between gap-3">
                  <span className="min-w-0">{line.name}</span>
                  {line.amount && <span className="num shrink-0 text-muted">{line.amount}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 py-2 rounded-md border font-medium text-[14px] transition-colors disabled:opacity-60 cursor-pointer';

function OrderTicket({ order, phase, since, catalog, detailed, warningMinutes, maxMinutes, busy, onReady, onStart }) {
  const timed = TIMED_PHASES.includes(phase);
  const level = useTimeLevel(timed ? since : null, warningMinutes, maxMinutes, order.status === 'atrasado');
  const { stations, primary } = useMemo(() => orderStations(order, catalog), [order, catalog]);
  const context = orderContext(order);
  const code = orderCode(order);
  const tone = PHASE_TONE[phase];

  // Todos los tickets atrasados parpadean al mismo compás, aunque se hayan
  // vuelto rojos en momentos distintos: al entrar en rojo, el parpadeo se
  // desfasa según la hora del reloj. Va en un efecto (antes de pintar) y no
  // en el render, y solo corre cuando cambia el nivel.
  const ticketRef = useRef(null);
  useLayoutEffect(() => {
    if (level === 'late') {
      ticketRef.current?.style.setProperty('--blink-delay', `-${Date.now() % BLINK_MS}ms`);
    }
  }, [level]);

  const border = {
    ok: 'border-line',
    warn: 'border-warn',
    late: 'ticket-late',
    idle: 'border-line border-dashed opacity-80',
  }[level];

  return (
    <article
      ref={ticketRef}
      className={`kds-ticket relative bg-surface border rounded-lg shadow-sm overflow-hidden flex flex-col ${border}`}
      style={level === 'late' ? { borderColor: 'var(--kds-late)' } : undefined}
      aria-label={`Orden ${order.kitchenNumber ?? ''} (${code})`}
    >
      {level === 'late' && <span className="sr-only">Superó el tiempo máximo</span>}
      <StationStripe stations={stations} primary={primary} />

      <header className="px-4 pt-4 pb-3 border-b border-line">
        {/* Número de cocina a la izquierda; a su lado, el código con el
            cronómetro en la misma línea y debajo de dónde viene la comanda. */}
        <div className="flex items-start gap-3">
          {order.kitchenNumber != null && (
            <span
              className="num shrink-0 min-w-11 h-11 px-2 rounded-md bg-surfalt border border-line flex items-center justify-center text-2xl font-semibold text-ink leading-none"
              title="Número de cocina del día (el que se le dice a Panchita)"
            >
              {order.kitchenNumber}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`num font-semibold text-ink leading-none tracking-tight ${order.kitchenNumber != null ? 'text-base' : 'text-xl'}`}>
                {code}
              </p>
              {timed && <TicketTimer since={since} level={level} />}
            </div>
            <p className="text-[13.5px] text-ink mt-1.5 leading-snug">
              {context.text}
              {context.person && <span className="text-muted"> · {context.person}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
          <span className={`kick inline-flex items-center gap-1.5 ${tone.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
            {phaseLabel(phase, order)}
          </span>
          {order.status === 'atrasado' && (
            <span className="kick" style={{ color: 'var(--kds-late)' }}>ATRASADA</span>
          )}
          {/* Reserva de la app: el cliente escaneó el QR de su mesa */}
          {order.arrivedAt && order.status === 'pending' && (
            <span className="kick text-ok">CLIENTE LLEGÓ</span>
          )}
          {stations.map((station) => (
            <span key={station.key} className="kick inline-flex items-center gap-1.5 text-inkalt">
              <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: station.color }} aria-hidden="true" />
              {station.label}
            </span>
          ))}
        </div>
      </header>

      <ul className="px-4 py-3 space-y-3 flex-1">
        {(order.items || []).map((item, index) => (
          <li key={item._id || index} className="flex items-start gap-3">
            <span className="num text-[13px] text-muted w-6 shrink-0 pt-0.5">{Number(item.quantity) || 1}×</span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-medium text-ink leading-snug">
                {item.name || 'Producto'}
                {item.addedAt && <span className="kick text-info ml-2 align-middle">AGREGADO</span>}
              </p>
              {item.notes?.trim() && <p className="text-[13px] text-inkalt mt-0.5">{item.notes.trim()}</p>}
              {detailed && <ItemRecipe blocks={itemDetails(item, catalog)} />}
            </div>
          </li>
        ))}
      </ul>

      {order.notes?.trim() && (
        <div className="mx-4 mb-3 rounded-md border border-warn bg-warnsoft px-3 py-2 text-[13px] text-warn flex gap-2">
          <FAIcon icon="pen" size="sm" className="mt-0.5 shrink-0" />
          <span><strong className="font-semibold">Nota:</strong> {order.notes.trim()}</span>
        </div>
      )}

      {timed && (
        <footer className="px-4 pb-4">
          {phase === 'cooking' ? (
            <button
              type="button"
              onClick={() => onReady(order)}
              disabled={busy}
              className={`${BUTTON_BASE} w-full border-ac text-ac hover:bg-ac hover:text-surface`}
            >
              <FAIcon icon="check" size="sm" />
              {busy ? 'Guardando…' : 'Marcar lista'}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onStart(order)}
                disabled={busy}
                className={`${BUTTON_BASE} border-linealt text-ink hover:border-ink`}
              >
                <FAIcon icon="bolt" size="sm" />
                Empezar
              </button>
              <button
                type="button"
                onClick={() => onReady(order)}
                disabled={busy}
                className={`${BUTTON_BASE} border-ac text-ac hover:bg-ac hover:text-surface`}
              >
                <FAIcon icon="check" size="sm" />
                Marcar lista
              </button>
            </div>
          )}
        </footer>
      )}

      {/* Pedido programado (reserva de la app): no entra solo a la cola hasta
          su hora, pero si el cliente llegó antes y no escaneó el QR de su
          mesa, cocina lo puede adelantar. */}
      {phase === 'scheduled' && (
        <footer className="px-4 pb-4">
          <button
            type="button"
            onClick={() => onStart(order)}
            disabled={busy}
            title="El cliente ya llegó: empezar sin esperar la hora de la reserva"
            className={`${BUTTON_BASE} w-full border-linealt text-ink hover:border-ink`}
          >
            <FAIcon icon="bolt" size="sm" />
            {busy ? 'Guardando…' : 'Empezar ahora'}
          </button>
        </footer>
      )}
    </article>
  );
}

export default memo(OrderTicket);
