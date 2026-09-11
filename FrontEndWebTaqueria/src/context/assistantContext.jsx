// context/assistantContext.jsx
//
// Conecta el chat del asistente con el resto del panel.
//
// Hasta ahora el chat era una isla: vivía en su propio botón flotante y nadie
// más sabía si estaba abierto o trabajando. Eso dejaba dos cosas fuera:
//   - Abrirlo con el teclado desde cualquier pantalla (Ctrl/Cmd + K).
//   - Que el TopBar pueda avisar cuando el asistente está ejecutando algo.
//
// El estado de la CONVERSACIÓN sigue viviendo en useAssistantChat, dentro del
// widget: aquí solo se comparte lo que otras partes de la interfaz necesitan
// saber, que es si está abierto y si está ocupado.
import React, { createContext, useState, useCallback, useEffect, useMemo } from 'react';

export const AssistantContext = createContext(null);

export function AssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  // Lo reporta el widget cuando el asistente está pensando o ejecutando una
  // acción; el TopBar lo usa para mostrar su indicador.
  const [isBusy, setIsBusy] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Atajo global: Ctrl+K en Windows/Linux, Cmd+K en Mac.
  useEffect(() => {
    const handleKeyDown = (event) => {
      // metaKey es Cmd en Mac; ctrlKey, Control en el resto.
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key?.toLowerCase() === 'k';

      if (isShortcut) {
        // El navegador usa Ctrl+K para su propia barra de búsqueda, así que
        // hay que quedarse con la combinación explícitamente.
        event.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Escape cierra el chat, como cualquier otro panel del sistema. Se
      // comprueba el estado dentro del setter para no tener que rehacer el
      // listener cada vez que el chat se abre o se cierra.
      if (event.key === 'Escape') {
        setIsOpen((prev) => (prev ? false : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle, isBusy, setIsBusy }),
    [isOpen, open, close, toggle, isBusy]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}
