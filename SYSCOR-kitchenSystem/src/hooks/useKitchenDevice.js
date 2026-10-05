// hooks/useKitchenDevice.js
import { useContext } from 'react';
import { KitchenDeviceContext } from '../context/kitchenDeviceContext';

// Identidad de esta pantalla de cocina: deviceId, si ya está emparejada y el
// código de emparejamiento que muestra el lobby.
export default function useKitchenDevice() {
  const context = useContext(KitchenDeviceContext);
  if (!context) {
    throw new Error('useKitchenDevice debe usarse dentro de un <KitchenDeviceProvider>');
  }
  return context;
}
