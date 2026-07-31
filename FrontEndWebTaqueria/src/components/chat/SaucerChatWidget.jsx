// src/components/chat/SaucerChatWidget.jsx
// Botón flotante + chat flotante para registrar platillos por conversación
// con Gemini, en vez de llenar el formulario manual. Solo visible para quien
// tiene permiso de crear platillos (admin siempre; empleado con "menu:create").
import React, { useEffect, useRef, useState } from 'react';
import FAIcon from '../commons/FAIcon';
import useSaucerChat from '../../hooks/useSaucerChat';
import { useAuth } from '../../hooks/auth/useAuth';
import { useToast } from '../commons/ToastProvider';

const WELCOME_MESSAGE = '¡Hola! Decime qué platillo querés registrar (nombre, categoría y precio) y lo voy armando.';

const SaucerChatWidget = ({ onSaucerCreated }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { messages, loading, sendMessage, reset } = useSaucerChat();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const canUse =
    user?.role === 'admin' || (user?.role === 'employee' && (user?.permissions || []).includes('menu:create'));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  if (!canUse) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const message = input;
    setInput('');
    await sendMessage(message, {
      onSaucerCreated: (saucer) => {
        addToast(`Platillo "${saucer.name}" registrado por el asistente`, 'success');
        onSaucerCreated?.(saucer);
      },
    });
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Asistente de registro"
        className="fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center
          shadow-[0_10px_30px_rgba(220,38,38,0.4),inset_1px_1px_2px_rgba(255,255,255,0.3)]
          hover:bg-red-600 hover:scale-105 transition-all"
      >
        <FAIcon icon={isOpen ? 'times' : 'robot'} size="xl" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[70] w-[90vw] max-w-sm h-[28rem] max-h-[70vh] bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-red-500 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(220,38,38,0.3)]">
            <div className="flex items-center gap-2 min-w-0">
              <FAIcon icon="robot" size="sm" />
              <span className="font-display font-bold text-sm truncate">Asistente de Registro</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                title="Nueva conversación"
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"
              >
                <FAIcon icon="rotate-left" size="sm" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"
              >
                <FAIcon icon="times" size="lg" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-white rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-700 shadow-sm border border-white/80">
                {WELCOME_MESSAGE}
              </div>
            </div>

            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 text-sm rounded-2xl shadow-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-red-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-700 border border-white/80 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 border border-white/80 shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-white/60 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: Tacos al pastor, 3.50 dólares..."
              disabled={loading}
              className="flex-1 px-3 py-2 bg-white border border-white/80 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 shrink-0 flex items-center justify-center bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
            >
              <FAIcon icon="paper-plane" size="sm" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SaucerChatWidget;
