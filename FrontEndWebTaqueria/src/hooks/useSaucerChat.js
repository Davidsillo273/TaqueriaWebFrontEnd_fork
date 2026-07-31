import { useState } from 'react';

const API_URL = 'http://localhost:4000/api/chat/saucer';
const FALLBACK_REPLY = 'El asistente no está disponible en este momento. Podés registrar el platillo desde el formulario manual.';

// Chat de registro de platillos por conversación. El historial en formato
// Gemini (`history`) se guarda acá y se manda completo en cada request: el
// backend es stateless, no guarda sesiones de chat.
export default function useSaucerChat() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message, { onSaucerCreated } = {}) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'model', text: data.message || FALLBACK_REPLY }]);
        return;
      }

      setHistory(Array.isArray(data.history) ? data.history : []);
      setMessages((prev) => [...prev, { role: 'model', text: data.reply || FALLBACK_REPLY }]);

      if (data.saucerCreated) {
        onSaucerCreated?.(data.saucerCreated);
      }
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

  return { messages, loading, sendMessage, reset };
}
