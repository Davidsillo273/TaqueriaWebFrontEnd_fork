import { useCallback, useEffect, useRef, useState } from 'react';
import { apiError, cancelRequest, createRequest, getTable } from '../services/tableApi';

// Cada cuánto se revisa la mesa. Con una solicitud en curso, seguido, para
// que "David ya viene" aparezca casi al instante.
const FAST_POLL_MS = 3000;
const SLOW_POLL_MS = 20000;

// Token de la mesa a partir de la URL: /mesa/<token>.
export const tokenFromPath = (pathname = window.location.pathname) => {
  const match = pathname.match(/\/mesa\/([A-Za-z0-9_-]{6,64})\/?$/);
  return match ? match[1] : null;
};

// Estado de la página: la mesa, su cuenta y la solicitud en curso.
export default function useTablePage(token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState(token ? null : { status: 404 });
  const [sending, setSending] = useState(false);
  // Segundos de espera antes de poder pedir otra cosa (cuenta regresiva local).
  const [cooldown, setCooldown] = useState(0);
  const loadingRef = useRef(false);
  const hasDataRef = useRef(false);

  // Los cambios de estado van en los callbacks de la promesa: así se puede
  // llamar desde el efecto de la revisión periódica.
  const load = useCallback(() => {
    if (!token || loadingRef.current) return Promise.resolve();
    loadingRef.current = true;
    return getTable(token)
      .then((next) => {
        hasDataRef.current = true;
        setData(next);
        setCooldown((current) => Math.max(current, next.cooldownSeconds || 0));
        setError(null);
      })
      .catch((err) => {
        const parsed = apiError(err);
        // Si ya se veía la mesa, un fallo de red no borra la pantalla.
        if (parsed.status === 404 || !hasDataRef.current) setError(parsed);
      })
      .finally(() => {
        loadingRef.current = false;
        setLoading(false);
      });
  }, [token]);

  const active = data?.request && ['pending', 'escalated', 'acknowledged'].includes(data.request.status);

  // Revisión periódica; más seguido con una solicitud en curso. Se pausa con
  // la pestaña oculta y se refresca al volver.
  useEffect(() => {
    if (!token) return undefined;
    load();
    const every = active ? FAST_POLL_MS : SLOW_POLL_MS;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, every);
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [token, active, load]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Devuelve null si salió bien, o el error para mostrarlo.
  const send = useCallback(
    async (body) => {
      setSending(true);
      try {
        const result = await createRequest(token, body);
        setData((prev) => (prev ? { ...prev, request: result.request } : prev));
        setCooldown(result.cooldownSeconds || 0);
        return null;
      } catch (err) {
        const parsed = apiError(err, 'No pudimos avisar. Inténtalo de nuevo.');
        if (parsed.data?.request) setData((prev) => (prev ? { ...prev, request: parsed.data.request } : prev));
        if (parsed.data?.cooldownSeconds) setCooldown(parsed.data.cooldownSeconds);
        return parsed;
      } finally {
        setSending(false);
        load();
      }
    },
    [token, load],
  );

  const cancel = useCallback(async () => {
    if (!data?.request?.id) return null;
    try {
      await cancelRequest(token, data.request.id);
      setData((prev) => (prev ? { ...prev, request: null } : prev));
      return null;
    } catch (err) {
      return apiError(err, 'No se pudo cancelar.');
    } finally {
      load();
    }
  }, [token, data, load]);

  return { data, loading, error, sending, cooldown, active, send, cancel, reload: load };
}
