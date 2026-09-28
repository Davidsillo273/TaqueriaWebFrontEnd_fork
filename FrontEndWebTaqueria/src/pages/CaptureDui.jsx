// src/pages/CaptureDui.jsx
//
// Pantalla que abre el TELÉFONO al escanear el QR que muestra la
// computadora. Es pública a propósito: el teléfono del admin no tiene por
// qué tener la sesión de SYSCOR iniciada, y pedírselo ahí haría inútil todo
// el flujo. El control de acceso lo da el token del enlace, que es aleatorio,
// de un solo uso y caduca a los 10 minutos.
//
// Deliberadamente mínima: dos fotos, confirmar, listo. Quien la usa está de
// pie con un documento en la mano, no navegando el panel.
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import FAIcon from '../components/commons/FAIcon';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Slot = ({ step, label, hint, file, onPick, onClear }) => {
  // El preview se crea una sola vez por archivo (no en cada render) y se
  // libera al cambiarlo, para no acumular memoria en el teléfono.
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div className="bg-surface border border-line">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`num w-6 h-6 shrink-0 flex items-center justify-center border text-[11px] ${file ? 'border-ok bg-ok text-white' : 'border-line text-ink'}`}>
            {file ? <FAIcon icon="check" size="xs" /> : step}
          </span>
          <div className="min-w-0">
            <p className="font-display text-ink text-sm">{label}</p>
            <p className="text-[11px] text-muted truncate">{hint}</p>
          </div>
        </div>
        {file && (
          <button type="button" onClick={onClear} className="text-xs text-ac font-display font-medium shrink-0">
            Repetir
          </button>
        )}
      </div>

      <div className="p-3">
        {preview ? (
          <img src={preview} alt={label} className="w-full aspect-[1.586] object-cover bg-surfalt" />
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 w-full aspect-[1.586] border border-dashed border-linealt bg-surfalt cursor-pointer active:bg-acsoft transition-colors">
            <FAIcon icon="camera" size="2xl" className="text-ac" />
            <span className="text-sm font-display text-ink">Tomar foto</span>
            <span className="text-[11px] text-muted px-6 text-center">Con buena luz y sin reflejos</span>
            {/* capture="environment" abre directo la cámara trasera. */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => onPick(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

// Pantalla centrada para los estados de cargando, error y listo.
const Message = ({ icon, tone, title, children }) => (
  <div className="fixed inset-0 overflow-y-auto bg-bg flex items-center justify-center p-6">
    <div className="bg-surface border border-line p-6 max-w-sm w-full text-center">
      {icon && (
        <div className={`w-14 h-14 mx-auto mb-4 flex items-center justify-center border ${tone}`}>
          <FAIcon icon={icon} size="xl" />
        </div>
      )}
      <h1 className="font-display text-ink text-lg mb-1">{title}</h1>
      {children}
    </div>
  </div>
);

export default function CaptureDui() {
  const { token } = useParams();

  const [checking, setChecking] = useState(true);
  const [sessionError, setSessionError] = useState(null);
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  // Al abrir, se comprueba que el enlace siga vigente antes de pedir fotos.
  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/users/dui-scan/capture/${token}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) setSessionError(data.message || 'Este enlace ya no es válido.');
        else if (data.alreadyUploaded) setSessionError('Las fotos de esta sesión ya se enviaron.');
        setChecking(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSessionError('No se pudo verificar el enlace. Revisa tu conexión.');
        setChecking(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  const handleSend = async () => {
    if (!front) {
      setError('Falta la foto del frente del DUI.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('front', front);
      if (back) formData.append('back', back);

      const res = await fetch(`${API_URL}/users/dui-scan/capture/${token}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'No se pudieron enviar las fotos.');
        return;
      }

      setSent(true);
    } catch (err) {
      console.error('Error al enviar las fotos:', err);
      setError('Error de conexión. Revisa tu señal e intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  if (checking) {
    return (
      <Message title="Verificando enlace…">
        <span className="inline-block w-5 h-5 mt-2 rounded-full border-2 border-acline border-t-ac animate-spin" />
      </Message>
    );
  }

  if (sessionError) {
    return (
      <Message icon="triangle-exclamation" tone="border-acline bg-acsoft text-ac" title="Enlace no válido">
        <p className="text-sm text-inkalt">{sessionError}</p>
        <p className="text-xs text-muted mt-3">Genera un código nuevo desde la computadora.</p>
      </Message>
    );
  }

  if (sent) {
    return (
      <Message icon="check" tone="border-ok/40 bg-oksoft text-ok" title="¡Fotos enviadas!">
        <p className="text-sm text-inkalt">Ya aparecen en la computadora. Vuelve a ella para revisar los datos.</p>
        <p className="text-xs text-muted mt-4">Puedes cerrar esta página.</p>
      </Message>
    );
  }

  // El index.css global bloquea el scroll de html/body (lo necesita el panel),
  // así que esta pantalla hace scroll por su cuenta: si no, en el teléfono el
  // botón de enviar quedaba debajo de las fotos, fuera de la vista.
  return (
    <div className="fixed inset-0 overflow-y-auto overscroll-contain bg-bg px-4 pt-6">
      <div className="max-w-md mx-auto">
        <p className="kick text-muted">Taquería El Corral · SYSCOR</p>
        <h1 className="font-display text-ink text-xl mt-1">Fotos del DUI</h1>
        <p className="text-sm text-inkalt mt-1 mb-5">
          Toma las dos caras del documento sobre una superficie lisa, que se lea bien el texto.
        </p>

        <div className="space-y-3 mb-5">
          <Slot step={1} label="Frente del DUI" hint="El lado con la foto y el número" file={front} onPick={setFront} onClear={() => setFront(null)} />
          <Slot step={2} label="Reverso del DUI" hint="El lado con la dirección" file={back} onPick={setBack} onClear={() => setBack(null)} />
        </div>

        {error && <div className="mb-4 px-4 py-3 border border-acline bg-acsoft text-sm text-ac">{error}</div>}

        {/* Pegado abajo: siempre a la vista, aunque las fotos llenen la pantalla. */}
        <div className="sticky bottom-0 -mx-4 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-bg border-t border-line">
          <button
            type="button"
            onClick={handleSend}
            disabled={!front || sending}
            className="w-full py-3.5 border border-ac bg-ac text-white font-display disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Enviando…
              </>
            ) : front ? (
              'Enviar fotos'
            ) : (
              'Toma la foto del frente para enviar'
            )}
          </button>

          <p className="text-[11px] text-muted text-center mt-2">Este enlace es temporal y solo sirve para enviar estas fotos.</p>
        </div>
      </div>
    </div>
  );
}
