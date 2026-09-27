// src/components/employee/DuiScanStep.jsx
//
// Primer paso de la invitación de un empleado: conseguir la foto del DUI y
// leerla, para no tener que teclear nombre, número de documento, fecha de
// nacimiento y dirección (que es justo donde más errores de captura hay).
//
// Dos caminos, porque el admin puede estar en cualquiera de los dos lados:
//   - Desde esta computadora (o el celular): elegir o tomar las fotos aquí.
//   - Con el teléfono: se muestra un QR, el admin lo escanea, toma las fotos
//     ahí y llegan solas a esta pantalla (socket, con consulta de respaldo;
//     ver useDuiScan).
import { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import FAIcon from '../commons/FAIcon';

// Proporción de una tarjeta de identidad (85.6 × 54 mm).
const CARD_RATIO = 'aspect-[1.586]';

// Una cara del documento: vacía (para elegir foto), con archivo local o con
// una URL ya guardada.
const PhotoSlot = ({ label, hint, file, url, onPick, onClear, disabled }) => {
  // La URL del preview se deriva del archivo y se libera al cambiarlo.
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const src = preview || url || null;

  return (
    <div className="min-w-0">
      <div className="flex items-end justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <p className="kick text-ink">{label}</p>
          {hint && <p className="text-[11px] text-muted truncate">{hint}</p>}
        </div>
        {file && !disabled && onClear && (
          <button type="button" onClick={onClear} className="text-[11px] text-ac font-display font-medium shrink-0 cursor-pointer">
            Cambiar
          </button>
        )}
      </div>

      {src ? (
        <img src={src} alt={label} className={`w-full ${CARD_RATIO} object-cover border border-line bg-surfalt`} />
      ) : (
        <label
          className={`flex flex-col items-center justify-center gap-2 w-full ${CARD_RATIO} border border-dashed border-linealt bg-surfalt transition-colors ${
            disabled ? 'opacity-50' : 'cursor-pointer hover:border-ac hover:bg-acsoft'
          }`}
        >
          <FAIcon icon="camera" size="lg" className="text-muted" />
          <span className="text-[12px] font-display font-medium text-inkalt">Elegir o tomar foto</span>
          {/* En un teléfono, "capture" abre la cámara; en una computadora
              abre el explorador de archivos. */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            disabled={disabled}
            onChange={(e) => onPick(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};

// Cuenta regresiva del código QR (la sesión vence en el servidor a los 10 min).
const useCountdown = (seconds, key) => {
  // Se guarda de qué sesión es cada lectura: con una sesión nueva se muestra
  // el tiempo completo hasta el primer tic.
  const [tick, setTick] = useState({ key: null, left: 0 });
  useEffect(() => {
    if (!seconds) return undefined;
    const end = Date.now() + seconds * 1000;
    const timer = setInterval(() => setTick({ key, left: Math.max(0, Math.round((end - Date.now()) / 1000)) }), 1000);
    return () => clearInterval(timer);
  }, [seconds, key]);
  const left = tick.key === key ? tick.left : seconds;
  return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
};

const PHONE_STEPS = [
  'Abre la cámara del teléfono y apunta a este código.',
  'Toma la foto del frente y del reverso del DUI.',
  'Toca "Enviar fotos": aparecerán aquí solas.',
];

const DuiScanStep = ({
  scanning,
  error,
  ocrFailed,
  scanFiles,
  startPhoneCapture,
  cancelPhoneCapture,
  retryScanFromSession,
  captureSession,
  waitingForPhone,
  receivedPhotos,
  documents,
  onSkip,
}) => {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const canvasRef = useRef(null);
  const countdown = useCountdown(captureSession?.expiresInSeconds || 0, captureSession?.token);

  // Dibuja el QR en el navegador (sin mandar la URL a ningún servicio
  // externo): el enlace es un token de acceso temporal.
  useEffect(() => {
    if (!captureSession?.captureUrl || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, captureSession.captureUrl, {
      width: 208,
      margin: 1,
      color: { dark: '#292b31', light: '#ffffff' },
    }).catch((err) => console.error('No se pudo generar el QR:', err));
  }, [captureSession, waitingForPhone]);

  // Fotos ya guardadas (del teléfono o de un escaneo anterior).
  const savedFront = receivedPhotos?.front?.url || documents?.duiFront?.url || null;
  const savedBack = receivedPhotos?.back?.url || documents?.duiBack?.url || null;

  const handleConfirmAndScan = async () => {
    setConfirming(false);
    await scanFiles(front, back);
  };

  const header = (
    <div className="mb-5">
      <p className="kick text-muted">Documento de identidad</p>
      <h3 className="font-display text-lg text-ink mt-0.5">Escanea el DUI del empleado</h3>
      <p className="text-sm text-muted mt-1">
        Leemos el nombre, el número, la fecha de nacimiento y la dirección para llenar el formulario. Tú revisas antes de enviar.
      </p>
    </div>
  );

  // --- Esperando al teléfono ---
  if (waitingForPhone && captureSession) {
    return (
      <div>
        {header}
        <div className="grid gap-0 md:grid-cols-[auto_1fr] border border-line bg-surface">
          <div className="p-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-line bg-white">
            <canvas ref={canvasRef} />
            <p className="kick text-muted mt-3">
              Vence en <span className="num text-ink">{countdown}</span>
            </p>
          </div>
          <div className="p-5 flex flex-col">
            <div className="inline-flex items-center gap-2 kick text-warn mb-4">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-warn opacity-60 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-warn" />
              </span>
              Esperando las fotos del teléfono
            </div>
            <ol className="space-y-3 flex-1">
              {PHONE_STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-inkalt">
                  <span className="num w-6 h-6 shrink-0 flex items-center justify-center border border-line text-[11px] text-ink">{i + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={cancelPhoneCapture}
              className="mt-5 self-start text-[12px] font-display font-medium text-muted hover:text-ac transition-colors cursor-pointer"
            >
              ← Cancelar y subir desde esta computadora
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Leyendo el documento ---
  if (scanning) {
    return (
      <div>
        {header}
        <div className="border border-line bg-surface p-5">
          {(savedFront || front) && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <PhotoSlot label="Frente" file={savedFront ? null : front} url={savedFront} disabled />
              <PhotoSlot label="Reverso" file={savedBack ? null : back} url={savedBack} disabled />
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full border-2 border-acline border-t-ac animate-spin shrink-0" />
            <div>
              <p className="font-display text-ink text-sm">Leyendo el documento…</p>
              <p className="text-xs text-muted">Esto toma unos segundos.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Confirmar antes de procesar ---
  if (confirming) {
    return (
      <div>
        {header}
        <div className="border border-line bg-surface p-5">
          <p className="font-display text-ink text-sm">¿Se leen bien los datos?</p>
          <p className="text-xs text-muted mb-4">Revisa que el texto no salga borroso ni con reflejos antes de continuar.</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <PhotoSlot label="Frente" file={front} disabled />
            <PhotoSlot label="Reverso" file={back} disabled />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 py-2.5 border border-line bg-surface text-inkalt font-display text-sm hover:border-linealt transition-colors cursor-pointer"
            >
              Cambiar fotos
            </button>
            <button
              type="button"
              onClick={handleConfirmAndScan}
              className="flex-1 py-2.5 border border-ac bg-ac text-white font-display text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              Sí, leer el DUI
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}

      {/* Si la lectura falló, se ofrece reintentar: normalmente es porque el
          servicio de IA estaba saturado, no porque la foto esté mal. */}
      {ocrFailed && (
        <div className="mb-4 border border-warn/40 bg-warnsoft p-4">
          <p className="kick text-warn mb-1">No se pudieron leer los datos</p>
          <p className="text-xs text-inkalt mb-3">
            Las fotos sí se guardaron. Puedes intentar leerlas de nuevo o escribir los datos a mano.
          </p>
          {(savedFront || savedBack) && (
            <div className="grid grid-cols-2 gap-3 mb-3 max-w-md">
              <PhotoSlot label="Frente" url={savedFront} disabled />
              <PhotoSlot label="Reverso" url={savedBack} disabled />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {captureSession && (
              <button
                type="button"
                onClick={retryScanFromSession}
                className="px-3 py-1.5 border border-warn bg-warn text-white text-xs font-display cursor-pointer"
              >
                Reintentar lectura
              </button>
            )}
            <button
              type="button"
              onClick={onSkip}
              className="px-3 py-1.5 border border-warn text-warn bg-surface text-xs font-display cursor-pointer"
            >
              Escribir los datos a mano
            </button>
          </div>
        </div>
      )}

      {error && <div className="mb-4 border border-acline bg-acsoft px-4 py-3 text-sm text-ac">{error}</div>}

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        {/* Subir desde aquí */}
        <div className="border border-line bg-surface p-5">
          <p className="kick text-muted mb-3">Desde esta computadora</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <PhotoSlot label="Frente" hint="El lado con la foto y el número" file={front} onPick={setFront} onClear={() => setFront(null)} />
            <PhotoSlot label="Reverso" hint="El lado con la dirección" file={back} onPick={setBack} onClear={() => setBack(null)} />
          </div>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={!front}
            className="w-full py-2.5 border border-ac bg-ac text-white font-display text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Continuar con estas fotos
          </button>
        </div>

        {/* Con el teléfono */}
        <div className="border border-line bg-surface p-5 flex flex-col">
          <p className="kick text-muted mb-3">Con tu teléfono</p>
          <div className="w-10 h-10 flex items-center justify-center border border-line text-ac mb-3">
            <FAIcon icon="qrcode" />
          </div>
          <p className="text-sm text-inkalt flex-1">
            ¿La computadora no tiene cámara? Escanea un código con tu teléfono, toma las fotos ahí y llegan aquí solas.
          </p>
          <button
            type="button"
            onClick={startPhoneCapture}
            className="mt-4 w-full py-2.5 border border-line bg-surface text-ink font-display text-sm hover:border-ac hover:text-ac transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <FAIcon icon="mobile-screen" size="xs" />
            Mostrar código QR
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mt-4 text-[12px] font-display font-medium text-muted hover:text-ac transition-colors cursor-pointer"
      >
        Prefiero escribir los datos a mano →
      </button>
    </div>
  );
};

export default DuiScanStep;
