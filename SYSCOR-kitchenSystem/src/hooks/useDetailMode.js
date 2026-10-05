// hooks/useDetailMode.js
//
// Interruptor global "Sin detalles" / "Con detalles" de los tickets. Es una
// preferencia de la pantalla (por navegador), igual que el tema: la tablet de
// la plancha puede ir sin detalles mientras la del cocinero nuevo los muestra.
import { useState, useCallback } from 'react';
import { DETAIL_MODES } from '../constants/kitchenStatus';

const STORAGE_KEY = 'syscor-kitchen-detail-mode';

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === DETAIL_MODES.detailed ? DETAIL_MODES.detailed : DETAIL_MODES.simple;
  } catch {
    return DETAIL_MODES.simple;
  }
};

export default function useDetailMode() {
  const [mode, setModeState] = useState(readStored);

  const setMode = useCallback((next) => {
    const value = next === DETAIL_MODES.detailed ? DETAIL_MODES.detailed : DETAIL_MODES.simple;
    setModeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Sin almacenamiento (modo privado): la preferencia dura hasta recargar.
    }
  }, []);

  return { mode, detailed: mode === DETAIL_MODES.detailed, setMode };
}
