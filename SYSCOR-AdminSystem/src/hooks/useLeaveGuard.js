// src/hooks/useLeaveGuard.js
//
// Avisa antes de salir de una pantalla con trabajo a medias.
//
// La app usa <BrowserRouter> (no un router de datos), así que useBlocker de
// React Router no está disponible. En su lugar se escuchan, en fase de
// captura, los clics sobre enlaces internos: un <Link> no navega si el clic
// ya viene con preventDefault, así que basta con frenarlo aquí y pedir
// confirmación. Cubre la barra superior, las pestañas de sección y el menú
// lateral, que son enlaces. Para cerrar o recargar la pestaña del navegador
// se usa el aviso nativo de beforeunload (el navegador no deja personalizar
// su texto).
import { useEffect, useRef } from 'react';

export default function useLeaveGuard(active, onAttempt) {
  const onAttemptRef = useRef(onAttempt);
  useEffect(() => {
    onAttemptRef.current = onAttempt;
  }, [onAttempt]);

  useEffect(() => {
    if (!active) return undefined;

    const handleClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest?.('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const destination = `${url.pathname}${url.search}${url.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (destination === current) return;

      event.preventDefault();
      onAttemptRef.current?.(destination);
    };

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [active]);
}
