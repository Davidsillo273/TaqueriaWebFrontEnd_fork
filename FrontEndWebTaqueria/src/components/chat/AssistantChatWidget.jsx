// src/components/chat/AssistantChatWidget.jsx
// Botón flotante + panel de chat con el asistente de IA general de SYSCOR.
// Reemplaza al viejo SaucerChatWidget (solo registraba platillos): ahora
// tiene herramientas en todo el sistema, puede adjuntar imágenes, se le
// puede dar contexto de qué pantalla se está hablando, y puede pedir
// formularios cortos dentro del chat cuando falta un dato (ver
// ChatDynamicForm). Se monta una sola vez, a nivel de App, y decide solo si
// mostrarse según la sesión activa.
import React, { useEffect, useRef, useState } from 'react';
import FAIcon from '../commons/FAIcon';
import ChatDynamicForm from './ChatDynamicForm';
import useAssistantChat from '../../hooks/useAssistantChat';
import { useAuth } from '../../hooks/auth/useAuth';
import { useAssistant } from '../../hooks/useAssistant';
import { PERMISSIONS } from '../../constants/permissions';

const WELCOME_MESSAGE = '¡Hola! Soy el asistente de SYSCOR. Puedo consultar información, hacer cálculos y ejecutar acciones en cualquier parte del sistema. ¿En qué te ayudo?';

const CONTEXT_OPTIONS = PERMISSIONS.filter((p) => p.type === 'screen');

const AssistantChatWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const { messages, loading, sendMessage, submitForm, reset } = useAssistantChat();
  // Abrir/cerrar ya no es estado local: vive en el contexto para que el atajo
  // de teclado (Ctrl/Cmd + K) y el indicador del TopBar puedan usarlo.
  const { isOpen, close, setIsBusy } = useAssistant();
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  // Le avisamos al resto del panel cuando el asistente está trabajando, para
  // que el TopBar pueda mostrar su indicador aunque el chat esté cerrado.
  useEffect(() => {
    setIsBusy(loading);
  }, [loading, setIsBusy]);

  // Si el widget se desmonta (ej. al cerrar sesión) el indicador no debe
  // quedarse encendido para siempre.
  useEffect(() => () => setIsBusy(false), [setIsBusy]);

  // Solo admins y empleados con sesión ven el asistente (clientes/visitantes no)
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'employee')) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && pendingFiles.length === 0) || loading) return;
    const message = input;
    const files = pendingFiles;
    setInput('');
    setPendingFiles([]);
    await sendMessage(message, { files, context: context || undefined });
  };

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setPendingFiles(files);
    e.target.value = '';
  };

  const handleFormSubmit = (tool, values) => submitForm(tool, values);

  return (
    <>
      {/* El botón flotante se quitó: el chat ahora se abre con Ctrl+K (o
          Cmd+K en Mac) desde cualquier pantalla, o con el ícono de robot en
          el TopBar (que además muestra cuando el asistente está trabajando).
          Ver context/assistantContext.jsx y components/dashboard/TopBar.jsx. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[65] bg-black/40 sm:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[70] w-[92vw] max-w-md h-[32rem] max-h-[75vh] bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-red-500 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(220,38,38,0.3)]">
            <div className="flex items-center gap-2 min-w-0">
              <FAIcon icon="robot" size="sm" />
              <span className="font-display font-bold text-sm truncate">Asistente SYSCOR</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={reset}
                title="Nueva conversación"
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"
              >
                <FAIcon icon="rotate-left" size="sm" />
              </button>
              <button
                type="button"
                onClick={close}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"
              >
                <FAIcon icon="times" size="lg" />
              </button>
            </div>
          </div>

          {/* Selector de contexto: le dice al asistente de qué pantalla habla el admin */}
          <div className="px-3 pt-2.5 pb-1.5 border-b border-white/60 bg-white/40">
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-white/80 text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="">Sin contexto específico</option>
              {CONTEXT_OPTIONS.map((c) => (
                <option key={c.id} value={c.label}>Sobre: {c.label}</option>
              ))}
            </select>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-white rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-700 shadow-sm border border-white/80">
                {WELCOME_MESSAGE}
              </div>
            </div>

            {messages.map((m, idx) => {
              if (m.role === 'model' && m.formRequest) {
                return (
                  <div key={idx} className="flex justify-start">
                    <ChatDynamicForm formRequest={m.formRequest} onSubmit={handleFormSubmit} disabled={loading} />
                  </div>
                );
              }
              return (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 text-sm rounded-2xl shadow-sm whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-red-500 text-white rounded-br-sm'
                        : m.actionSuccess === false
                        ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                        : 'bg-white text-gray-700 border border-white/80 rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                    {m.imageCount > 0 && (
                      <span className="block mt-1 text-[11px] opacity-80">
                        <FAIcon icon="paperclip" size="xs" className="mr-1" />
                        {m.imageCount} imagen{m.imageCount > 1 ? 'es' : ''} adjunta{m.imageCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

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

          {pendingFiles.length > 0 && (
            <div className="px-3 pb-1 flex flex-wrap gap-1.5">
              {pendingFiles.map((f, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-white/80 rounded-lg text-[11px] text-gray-600">
                  <FAIcon icon="image" size="xs" />
                  {f.name.length > 16 ? `${f.name.slice(0, 16)}...` : f.name}
                  <button type="button" onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                    <FAIcon icon="times" size="xs" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="p-3 border-t border-white/60 flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFilePick} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="Adjuntar imagen"
              className="w-9 h-9 shrink-0 flex items-center justify-center bg-white border border-white/80 text-gray-500 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <FAIcon icon="paperclip" size="sm" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame o pídeme algo..."
              disabled={loading}
              className="flex-1 min-w-0 px-3 py-2 bg-white border border-white/80 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && pendingFiles.length === 0)}
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

export default AssistantChatWidget;
