import { useEffect } from 'react';

// Hoja inferior con opciones grandes, fáciles de tocar con el pulgar.
// `options`: [{ key, label, hint, icon }]. Tocar una la manda de inmediato.
export default function ChoiceSheet({ open, title, subtitle, options, note, sending, onChoose, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-black/50 sheet-fade" aria-label="Cerrar" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border-t border-line px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sheet-up">
        <div className="mx-auto mb-4 h-1 w-10 bg-linealt" aria-hidden="true" />
        <h2 className="text-xl text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}

        <div className="mt-4 grid gap-2">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              disabled={sending}
              onClick={() => onChoose(option.key)}
              className="flex w-full items-center gap-3 border border-line bg-bg px-4 py-4 text-left rounded-md transition-colors hover:border-ac active:bg-acsoft disabled:opacity-50"
            >
              <i className={`ph ${option.icon} text-2xl text-ac`} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">{option.label}</span>
                {option.hint ? <span className="block text-sm text-muted">{option.hint}</span> : null}
              </span>
              <i className="ph ph-caret-right text-muted" aria-hidden="true" />
            </button>
          ))}
        </div>

        {note ? <p className="mt-3 text-xs text-muted">{note}</p> : null}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-3 text-sm text-muted"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
