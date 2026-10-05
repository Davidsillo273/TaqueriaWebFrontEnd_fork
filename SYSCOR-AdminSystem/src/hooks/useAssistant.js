// hooks/useAssistant.js
import { useContext } from 'react';
import { AssistantContext } from '../context/assistantContext';

// Hook de conveniencia para no importar useContext + AssistantContext en cada archivo
export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant debe usarse dentro de un <AssistantProvider>');
  }
  return context;
}

export default useAssistant;
