// components/kitchen/PairKitchenModal.jsx
//
// Emparejar una pantalla de cocina: el admin escribe el código de 6 dígitos
// que muestra la pantalla en su lobby. El servidor verifica que quien lo pide
// es un administrador, genera el token de dispositivo de ESA pantalla y se lo
// entrega por socket; la pantalla pasa sola a las comandas.
import { useState } from 'react';
import FAIcon from '@syscor/web-shared/src/components/FAIcon';
import {
  ModalShell,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FORM_LABEL,
  MODAL_BTN_PRIMARY,
  MODAL_BTN_SECONDARY,
} from '@syscor/web-shared/src/components/FormModal';

const CODE_LENGTH = 6;

export default function PairKitchenModal({ isOpen, onClose, onPair, busy, enablesSystem }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const close = () => {
    setCode('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (code.length !== CODE_LENGTH) {
      setError(`El código tiene ${CODE_LENGTH} dígitos.`);
      return;
    }
    const result = await onPair(code);
    if (result.success) {
      setCode('');
      setError(null);
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <ModalShell maxWidth="max-w-md">
      <ModalHeader
        icon="utensils"
        title={enablesSystem ? 'Habilitar sistema de cocina' : 'Emparejar otra pantalla'}
        subtitle="Escribe el código que muestra la pantalla de cocina en su lobby"
        onClose={busy ? undefined : close}
      />
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="bg-white dark:bg-surface rounded-xl border border-line p-4 shadow-2xs space-y-3">
            <label htmlFor="kitchen-pairing-code" className={FORM_LABEL}>Código de la pantalla</label>
            <input
              id="kitchen-pairing-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={CODE_LENGTH + 1}
              value={code.length > 3 ? `${code.slice(0, 3)} ${code.slice(3)}` : code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH));
                setError(null);
              }}
              placeholder="000 000"
              disabled={busy}
              className="w-full px-3 py-3 rounded-lg bg-white dark:bg-surface border border-line focus:border-ac focus:outline-none num text-3xl tracking-[0.2em] text-center text-ink placeholder:text-muted/50"
            />
            {error && (
              <p className="text-ac text-xs font-medium flex items-center gap-1.5" role="alert">
                <FAIcon icon="circle-exclamation" size="xs" />
                {error}
              </p>
            )}
            <p className="text-[12px] text-muted leading-relaxed">
              {enablesSystem
                ? 'Al emparejarla se habilita el sistema de cocina y la cola de comandas empieza a avanzar sola.'
                : 'La pantalla recibe su propio acceso; las que ya están emparejadas siguen igual.'}{' '}
              Ese acceso solo sirve para ver comandas y marcarlas en cocina o listas.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={close} disabled={busy} className={MODAL_BTN_SECONDARY}>
            Cancelar
          </button>
          <button type="submit" disabled={busy || code.length !== CODE_LENGTH} className={MODAL_BTN_PRIMARY}>
            {busy ? 'Emparejando...' : enablesSystem ? 'Habilitar' : 'Emparejar'}
          </button>
        </ModalFooter>
      </form>
    </ModalShell>
  );
}
