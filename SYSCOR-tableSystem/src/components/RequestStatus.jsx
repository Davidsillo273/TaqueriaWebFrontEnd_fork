import { useEffect, useState } from 'react';
import { PAY_METHODS, REASONS } from '../constants/options';

const ESCALATE_SECONDS = 30;

// La solicitud en curso, en vivo: "Le avisamos a David" → "David ya viene".
// Con eso el cliente sabe que alguien viene y no vuelve a presionar.
export default function RequestStatus({ request, onCancel, canceling }) {
  const [now, setNow] = useState(() => Date.now());
  const counting = request.status === 'pending' && request.escalateAt;
  useEffect(() => {
    if (!counting) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [counting]);

  const isBill = request.type === 'bill';
  const name = request.waiterName;
  const what = isBill
    ? `Pediste la cuenta · ${PAY_METHODS[request.payMethod]?.label || ''}`
    : `Llamaste a tu mesero · ${REASONS[request.reason]?.short || ''}`;

  if (request.acknowledged) {
    return (
      <section className="border border-ok bg-oksoft p-4 rounded-md" aria-live="polite">
        <p className="kick text-ok">{what}</p>
        <div className="mt-2 flex items-center gap-3">
          <i className="ph-fill ph-check-circle text-3xl text-ok" aria-hidden="true" />
          <div>
            <h2 className="text-xl text-ink">{name ? `${name} ya viene` : 'Tu mesero ya viene'}</h2>
            <p className="text-sm text-inkalt">
              {isBill
                ? request.payMethod === 'card'
                  ? 'Te lleva la cuenta y el POS para pagar con tarjeta.'
                  : 'Te lleva la cuenta. Ten a la mano tu efectivo.'
                : 'Va en camino a tu mesa.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const secondsLeft = counting
    ? Math.max(0, Math.ceil((new Date(request.escalateAt).getTime() - now) / 1000))
    : 0;
  const progress = counting ? Math.min(100, ((ESCALATE_SECONDS - secondsLeft) / ESCALATE_SECONDS) * 100) : 100;

  let title;
  let detail;
  if (request.escalated) {
    title = 'Avisamos a todos los meseros';
    detail = 'El primero que esté libre viene a tu mesa.';
  } else if (request.reason === 'tip') {
    title = name ? `Le avisamos a ${name}` : 'Le avisamos a tu mesero';
    detail = 'Solo a tu mesero: vendrá en cuanto pueda.';
  } else {
    title = name ? `Le avisamos a ${name}` : 'Le avisamos a tu mesero';
    detail = counting
      ? secondsLeft > 0
        ? `Si no responde en ${secondsLeft} s, avisamos a todos los meseros.`
        : 'Avisando a todos los meseros…'
      : 'Vendrá en un momento.';
  }

  return (
    <section className="border border-acline bg-acsoft p-4 rounded-md" aria-live="polite">
      <p className="kick text-ac">{what}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="relative flex h-3 w-3 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ac opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-ac" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl text-ink">{title}</h2>
          <p className="text-sm text-inkalt">{detail}</p>
        </div>
      </div>
      {counting ? (
        <div className="mt-3 h-1 w-full bg-line overflow-hidden" aria-hidden="true">
          <div className="h-full bg-ac transition-[width] duration-500 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      <button
        type="button"
        onClick={onCancel}
        disabled={canceling}
        className="mt-3 text-sm text-muted underline underline-offset-4 disabled:opacity-50"
      >
        {canceling ? 'Cancelando…' : 'Ya no lo necesito'}
      </button>
    </section>
  );
}
