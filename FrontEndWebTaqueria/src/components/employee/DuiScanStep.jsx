// src/components/employee/DuiScanStep.jsx
//
// Primer paso de la invitación de un empleado: conseguir la foto del DUI y
// leerla, para no tener que teclear nombre, número de documento, fecha de
// nacimiento y dirección (que es justo donde más errores de captura hay).
//
// Dos caminos, porque el admin puede estar en cualquiera de los dos lados:
//   - Desde el celular: el <input capture> abre la cámara directamente.
//   - Desde la computadora: se muestra un QR, el admin lo escanea con su
//     teléfono, toma las fotos ahí, y llegan a esta pantalla por socket.
import { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import FAIcon from '../commons/FAIcon';

// Vista previa de una de las caras del documento, con su selector de archivo.
const PhotoSlot = ({ label, hint, file, onPick, onClear, disabled }) => {
  // La URL del preview se deriva del archivo (no hace falta estado) y se
  // libera al cambiar de archivo para no dejar blobs colgando en memoria.
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="min-w-0">
          <p className="text-xs font-display font-bold text-gray-700">{label}</p>
          <p className="text-[10px] text-gray-400 truncate">{hint}</p>
        </div>
        {file && !disabled && (
          <button type="button" onClick={onClear} className="text-[11px] text-red-500 font-display font-semibold shrink-0">
            Quitar
          </button>
        )}
      </div>

      {preview ? (
        <img src={preview} alt={label} className="w-full h-32 object-cover rounded-2xl border border-white/80" />
      ) : (
        <label className={`flex flex-col items-center justify-center gap-1.5 h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-[#f3f0eb] transition-colors ${disabled ? 'opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}>
          <FAIcon icon="camera" size="lg" className="text-gray-400" />
          <span className="text-[11px] font-display font-semibold text-gray-500">Elegir foto</span>
          {/* En un teléfono, "capture" abre la cámara; en una computadora
              simplemente abre el explorador de archivos. */}
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
  onSkip,
}) => {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const canvasRef = useRef(null);

  // Dibuja el QR cuando se abre una sesión de captura. Se genera en el
  // navegador (sin mandar la URL a ningún servicio externo), porque ese
  // enlace es un token de acceso temporal.
  useEffect(() => {
    if (!captureSession?.captureUrl || !canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, captureSession.captureUrl, {
      width: 220,
      margin: 1,
      color: { dark: '#1f2937', light: '#ffffff' },
    }).catch((err) => console.error('No se pudo generar el QR:', err));
  }, [captureSession]);

  const handleConfirmAndScan = async () => {
    setConfirming(false);
    await scanFiles(front, back);
  };

  // --- Esperando al teléfono ---
  if (waitingForPhone && captureSession) {
    return (
      <div className="text-center py-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-display font-semibold mb-4">
          <FAIcon icon="mobile-screen" size="xs" />
          Esperando las fotos del teléfono
        </div>

        <div className="bg-white rounded-3xl border border-white/80 shadow-sm p-5 inline-block">
          <canvas ref={canvasRef} className="rounded-xl" />
        </div>

        <p className="text-sm text-gray-600 mt-4 max-w-sm mx-auto">
          Escanea este código con la cámara de tu teléfono. Ahí podrás tomar las
          fotos del DUI y llegarán solas a esta pantalla.
        </p>
        <p className="text-[11px] text-gray-400 mt-1">El código vence en 10 minutos.</p>

        <button
          type="button"
          onClick={cancelPhoneCapture}
          className="mt-5 text-xs font-display font-semibold text-gray-500 hover:text-gray-700"
        >
          Cancelar y subir desde esta computadora
        </button>
      </div>
    );
  }

  // --- Leyendo el documento ---
  if (scanning) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-red-200 border-t-red-500 animate-spin" />
        <p className="font-display font-bold text-gray-900">Leyendo el documento...</p>
        <p className="text-sm text-gray-500 mt-1">Esto toma unos segundos.</p>
      </div>
    );
  }

  // --- Confirmar antes de procesar ---
  if (confirming) {
    return (
      <div>
        <p className="text-sm text-gray-700 font-display font-semibold mb-1">
          ¿Se ven bien las fotos?
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Revisa que los datos del documento se lean con claridad antes de continuar.
        </p>

        <div className="flex gap-3 mb-5">
          <PhotoSlot label="Frente" hint="" file={front} disabled />
          <PhotoSlot label="Reverso" hint="" file={back} disabled />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-display font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Cambiar fotos
          </button>
          <button
            type="button"
            onClick={handleConfirmAndScan}
            className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white font-display font-semibold text-sm shadow-[0_4px_12px_rgba(220,38,38,0.3)] hover:bg-red-600 transition-colors"
          >
            Sí, leer el DUI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Si la lectura falló, se ofrece reintentar: normalmente es porque el
          servicio de IA estaba saturado, no porque la foto esté mal. */}
      {ocrFailed && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-sm text-amber-800 font-display font-semibold mb-1">
            No se pudieron leer los datos automáticamente
          </p>
          <p className="text-xs text-amber-700 mb-2">
            Las fotos sí se guardaron. Puedes intentar leerlas de nuevo o escribir los datos a mano.
          </p>
          <div className="flex flex-wrap gap-2">
            {captureSession && (
              <button
                type="button"
                onClick={retryScanFromSession}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-display font-semibold hover:bg-amber-600 transition-colors"
              >
                Reintentar lectura
              </button>
            )}
            <button
              type="button"
              onClick={onSkip}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-700 text-xs font-display font-semibold hover:bg-amber-100 transition-colors"
            >
              Escribir los datos a mano
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <PhotoSlot
          label="Frente del DUI"
          hint="El lado con la foto"
          file={front}
          onPick={setFront}
          onClear={() => setFront(null)}
        />
        <PhotoSlot
          label="Reverso del DUI"
          hint="El lado con la dirección"
          file={back}
          onPick={setBack}
          onClear={() => setBack(null)}
        />
      </div>

      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={!front}
        className="w-full py-2.5 rounded-2xl bg-red-500 text-white font-display font-semibold text-sm shadow-[0_4px_12px_rgba(220,38,38,0.3)] hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
      >
        Continuar con estas fotos
      </button>

      {/* Alternativa para quien está en una computadora sin cámara decente */}
      <div className="flex items-center gap-3 my-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[11px] text-gray-400 font-display font-semibold uppercase tracking-wider">o</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={startPhoneCapture}
        className="w-full py-2.5 rounded-2xl bg-white border border-white/80 text-gray-700 font-display font-semibold text-sm shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
      >
        <FAIcon icon="qrcode" />
        Tomar las fotos con mi teléfono
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="w-full mt-3 text-xs font-display font-semibold text-gray-500 hover:text-gray-700"
      >
        Prefiero escribir los datos a mano
      </button>
    </div>
  );
};

export default DuiScanStep;
