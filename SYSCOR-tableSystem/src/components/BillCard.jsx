import { useState } from 'react';

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
const COLLAPSED_LINES = 4;

// Cuenta de la mesa, solo de lectura: lo pedido hasta ahora y el total.
export default function BillCard({ bill }) {
  const [expanded, setExpanded] = useState(false);
  if (!bill || bill.items.length === 0) {
    return (
      <section className="border border-line bg-surface p-4 rounded-md">
        <p className="kick text-muted">Tu cuenta</p>
        <p className="mt-2 text-sm text-muted">Todavía no hay nada en tu cuenta.</p>
      </section>
    );
  }

  const lines = expanded ? bill.items : bill.items.slice(0, COLLAPSED_LINES);
  const hidden = bill.items.length - lines.length;

  return (
    <section className="border border-line bg-surface rounded-md">
      <div className="flex items-baseline justify-between px-4 pt-4">
        <p className="kick text-muted">Tu cuenta hasta ahora</p>
        <p className="kick text-muted">
          {bill.orderCount} {bill.orderCount === 1 ? 'comanda' : 'comandas'}
        </p>
      </div>
      <ul className="mt-2 divide-y divide-line px-4">
        {lines.map((item) => (
          <li key={`${item.name}-${item.price}`} className="flex items-baseline gap-3 py-2 text-sm">
            <span className="num w-7 shrink-0 text-muted">{item.quantity}×</span>
            <span className="min-w-0 flex-1 text-ink">{item.name}</span>
            <span className="num text-inkalt">{money(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      {hidden > 0 || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="px-4 pb-1 text-sm text-ac"
        >
          {expanded ? 'Ver menos' : `Ver ${hidden} más`}
        </button>
      ) : null}
      <div className="mt-2 flex items-baseline justify-between border-t border-line px-4 py-3">
        <span className="font-medium text-ink">Total</span>
        <span className="num text-2xl text-ink">{money(bill.total)}</span>
      </div>
    </section>
  );
}
