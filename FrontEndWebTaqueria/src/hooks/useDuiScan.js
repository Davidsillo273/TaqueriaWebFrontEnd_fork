import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocketEvent } from './useSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Escaneo del DUI al invitar a un empleado.
 *
 * Cubre los dos caminos para conseguir las fotos:
 *   - Subida directa (el admin elige archivos, o toma la foto si está en el
 *     celular).
 *   - Captura desde el teléfono: se abre una sesión, la pantalla muestra su
 *     QR, y cuando el teléfono sube las fotos llegan por socket.
 *
 * El OCR puede fallar (Gemini se satura de vez en cuando): en ese caso los
 * datos vienen en null y el admin llena los campos a mano. Las fotos quedan
 * guardadas igual, así que nunca se pierde el trabajo.
 */
export default function useDuiScan({ onExtracted } = {}) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  // Datos leídos del documento (los que el admin va a revisar/corregir)
  const [extracted, setExtracted] = useState(null);
  // URLs de las fotos ya subidas a Cloudinary
  const [documents, setDocuments] = useState(null);
  // true cuando se subieron las fotos pero la lectura no dio resultado
  const [ocrFailed, setOcrFailed] = useState(false);

  // --- Captura desde el teléfono ---
  const [captureSession, setCaptureSession] = useState(null);
  const [waitingForPhone, setWaitingForPhone] = useState(false);

  // Se guarda en ref además del estado porque el listener del socket se
  // registra una sola vez y necesita leer el token vigente sin re-suscribirse.
  const captureTokenRef = useRef(null);

  // Mismo motivo para el callback: quien lo pasa suele definirlo en línea, y
  // meterlo en las dependencias volvería a crear las funciones en cada render.
  const onExtractedRef = useRef(onExtracted);
  useEffect(() => {
    onExtractedRef.current = onExtracted;
  }, [onExtracted]);

  const scanFiles = useCallback(async (frontFile, backFile) => {
    if (!frontFile) {
      setError('Se necesita al menos la foto del frente del DUI.');
      return { success: false };
    }

    setScanning(true);
    setError(null);
    setOcrFailed(false);

    try {
      const formData = new FormData();
      formData.append('front', frontFile);
      if (backFile) formData.append('back', backFile);

      const res = await fetch(`${API_URL}/users/dui-scan`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'No se pudo procesar el documento.');
        return { success: false };
      }

      setDocuments(data.documents || null);

      if (data.data) {
        setExtracted(data.data);
        onExtractedRef.current?.(data.data);
        return { success: true, data: data.data };
      }

      // Las fotos se guardaron pero la IA no pudo leerlas: se avisa para
      // ofrecer reintentar o llenar a mano.
      setOcrFailed(true);
      return { success: true, data: null };
    } catch (err) {
      console.error('Error al escanear el DUI:', err);
      setError('Error de conexión al procesar el documento.');
      return { success: false };
    } finally {
      setScanning(false);
    }
  }, []);

  // Abre la sesión que la pantalla convierte en QR.
  const startPhoneCapture = useCallback(async () => {
    setError(null);
    setOcrFailed(false);

    try {
      const res = await fetch(`${API_URL}/users/dui-scan/session`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'No se pudo iniciar la captura desde el teléfono.');
        return { success: false };
      }

      captureTokenRef.current = data.token;
      setCaptureSession(data);
      setWaitingForPhone(true);
      return { success: true, session: data };
    } catch (err) {
      console.error('Error al iniciar la captura móvil:', err);
      setError('Error de conexión al iniciar la captura.');
      return { success: false };
    }
  }, []);

  const cancelPhoneCapture = useCallback(() => {
    captureTokenRef.current = null;
    setCaptureSession(null);
    setWaitingForPhone(false);
  }, []);

  // Lee el DUI de las fotos que mandó el teléfono. Se llama solo cuando el
  // socket avisa que ya llegaron.
  const scanFromSession = useCallback(async (token) => {
    setScanning(true);
    setError(null);
    setOcrFailed(false);

    try {
      const res = await fetch(`${API_URL}/users/dui-scan/session/${token}/scan`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'No se pudo procesar el documento.');
        return { success: false };
      }

      setDocuments(data.documents || null);

      if (data.data) {
        setExtracted(data.data);
        onExtractedRef.current?.(data.data);
      } else {
        setOcrFailed(true);
      }

      return { success: true, data: data.data };
    } catch (err) {
      console.error('Error al leer el DUI de la sesión:', err);
      setError('Error de conexión al procesar el documento.');
      return { success: false };
    } finally {
      setScanning(false);
      setWaitingForPhone(false);
    }
  }, []);

  // El teléfono terminó de subir: la pantalla avanza sola, sin que el admin
  // tenga que refrescar ni volver a tocar nada.
  useSocketEvent(SOCKET_EVENTS.DUI_CAPTURE_UPLOADED, ({ token }) => {
    if (!token || token !== captureTokenRef.current) return;
    scanFromSession(token);
  });

  // Reintenta la lectura con las mismas fotos ya subidas (para el caso de
  // que Gemini estuviera saturado el primer intento).
  const retryScanFromSession = useCallback(() => {
    const token = captureTokenRef.current;
    if (token) return scanFromSession(token);
    return Promise.resolve({ success: false });
  }, [scanFromSession]);

  const reset = useCallback(() => {
    setExtracted(null);
    setDocuments(null);
    setOcrFailed(false);
    setError(null);
    cancelPhoneCapture();
  }, [cancelPhoneCapture]);

  return {
    scanning,
    error,
    extracted,
    setExtracted,
    documents,
    ocrFailed,
    scanFiles,
    startPhoneCapture,
    cancelPhoneCapture,
    retryScanFromSession,
    captureSession,
    waitingForPhone,
    reset,
  };
}
