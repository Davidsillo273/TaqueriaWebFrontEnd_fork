import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/chat/assistant` : 'https://syscor-mll9.onrender.com/api/chat/assistant';
const FALLBACK_REPLY = 'El asistente no está disponible en este momento. Intenta de nuevo en unos minutos.';

// Asistente de IA general del sistema. El historial en formato Gemini
// (`history`) se guarda acá y se manda completo en cada request: el backend
// es stateless, no guarda sesiones de chat.
//
// Cada mensaje del asistente puede ser:
//   - texto normal ({ role:'model', text })
//   - una acción ya ejecutada ({ role:'model', text, actionSuccess })
//   - un formulario corto porque faltó un dato ({ role:'model', formRequest })
export default function useAssistantChat() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message, { files = [], context } = {}) => {
    const trimmed = (message || '').trim();
    if (!trimmed && files.length === 0) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed, imageCount: files.length || 0 },
    ]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', trimmed);
      formData.append('history', JSON.stringify(history));
      if (context) formData.append('context', context);
      files.forEach((file) => formData.append('files', file));

      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'model', text: data.message || FALLBACK_REPLY }]);
        return;
      }

      setHistory(Array.isArray(data.history) ? data.history : []);

      if (data.kind === 'form') {
        setMessages((prev) => [...prev, { role: 'model', formRequest: data.form }]);
      } else {
        setMessages((prev) => [...prev, { role: 'model', text: data.reply || FALLBACK_REPLY, actionSuccess: data.actionSuccess }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'model', text: FALLBACK_REPLY }]);
    } finally {
      setLoading(false);
    }
  };

  // Se llama cuando el admin llena el formulario corto que generó el chat
  // por falta de datos. Ejecuta la acción directo, sin volver a pasar por
  // Gemini para reinterpretar texto.
  const submitForm = async (tool, args) => {
    const summary = Object.entries(args || {}).map(([k, v]) => `${k}: ${v}`).join(', ');
    setMessages((prev) => [...prev, { role: 'user', text: summary }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/form`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, args, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'model', text: data.message || FALLBACK_REPLY }]);
        return;
      }

      setHistory(Array.isArray(data.history) ? data.history : []);
      setMessages((prev) => [...prev, { role: 'model', text: data.reply || FALLBACK_REPLY, actionSuccess: data.actionSuccess }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'model', text: FALLBACK_REPLY }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setHistory([]);
  };

  return { messages, loading, sendMessage, submitForm, reset };
}
