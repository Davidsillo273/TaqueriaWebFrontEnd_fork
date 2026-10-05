// Contexto de la identidad de esta pantalla de cocina (ver KitchenDeviceProvider).
// Va en su propio archivo para que el provider solo exporte su componente.
import { createContext } from 'react';

export const KitchenDeviceContext = createContext(null);
