// src/components/chat/AssistantChatWidget.jsx
// Chef Panchita dentro del sistema: panel de chat con el asistente de IA
// general de SYSCOR, con el mismo aspecto que Panchita en el login.
// Reemplaza al viejo SaucerChatWidget (solo registraba platillos): ahora
// tiene herramientas en todo el sistema, puede adjuntar imágenes, se le
// puede dar contexto de qué pantalla se está hablando, y puede pedir
// formularios cortos dentro del chat cuando falta un dato (ver
// ChatDynamicForm). Se monta una sola vez, a nivel de App, y decide solo si
// mostrarse según la sesión activa.
import { useEffect, useRef, useState } from 'react';
import FAIcon from '@syscor/web-shared/src/components/FAIcon';
import Select from '../commons/Select';
import ChatDynamicForm from './ChatDynamicForm';
import PanchitaIcon from '@syscor/web-shared/src/components/PanchitaIcon';
import useAssistantChat from '../../hooks/useAssistantChat';
import { useAuth } from '@syscor/web-shared/src/hooks/useAuth';
import { useAssistant } from '../../hooks/useAssistant';
import { PERMISSIONS } from '../../constants/permissions';

const WELCOME_MESSAGE = '¡Hola! Soy Chef Panchita, tu asistente en SYSCOR. Puedo consultar información, hacer cálculos y ejecutar acciones en cualquier parte del sistema. ¿En qué te ayudo hoy?';

const CONTEXT_OPTIONS = PERMISSIONS.filter((p) => p.type === 'screen');

// Respuesta de Panchita, con el mismo formato que en el login: retrato
// realista a la izquierda y texto sin burbuja. Si una acción falló, el texto
// va en rojo para que no pase desapercibido.
const ModelMessage = ({ text, failed = false }) => (
  <div className="flex gap-2.5 max-w-[95%]">
    <PanchitaIcon variant="answered" className="w-7 h-12 self-start" />
    <p className={`text-[12.5px] leading-relaxed pt-0.5 whitespace-pre-wrap ${failed ? 'text-ac' : 'text-inkalt'}`}>
      {text}
    </p>
  </div>
);

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
      {/* Mismo panel que Chef Panchita en el login: lateral a toda la altura
          en escritorio y a pantalla completa en móvil, con el resto de la
          pantalla oscurecido detrás. Se abre con Ctrl+K (Cmd+K en Mac) o con
          el ícono de Panchita del TopBar. */}
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar asistente"
          onClick={close}
          className="fixed inset-0 z-[65] bg-black/25 cursor-default"
        />
      )}

      {isOpen && (
        <div className="fixed z-[70] inset-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[400px] flex flex-col bg-surface border-l border-line">
          {/* Encabezado */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-line">
            <PanchitaIcon variant="icon" className="w-6 h-6" />
            <p className="text-sm font-display text-ink truncate">Chef Panchita (Asistente inteligente)</p>
            <span className="kick text-muted border border-line px-1.5 py-0.5 shrink-0">Sistema</span>
            <div className="ml-auto flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={reset}
                title="Nueva conversación"
                aria-label="Nueva conversación"
                className="text-muted hover:text-ink transition-colors"
              >
                <FAIcon icon="rotate-left" size="sm" />
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar asistente"
                className="text-muted hover:text-ink transition-colors"
              >
                <FAIcon icon="times" size="sm" />
              </button>
            </div>
          </div>

          {/* Contexto: le dice a Panchita de qué pantalla se está hablando */}
          <div className="px-4 py-2.5 border-b border-line">
            <Select size="sm" value={context} onChange={(e) => setContext(e.target.value)}>
              <option value="">Sin contexto específico</option>
              {CONTEXT_OPTIONS.map((c) => (
                <option key={c.id} value={c.label}>Sobre: {c.label}</option>
              ))}
            </Select>
          </div>

          {/* Conversación */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            <ModelMessage text={WELCOME_MESSAGE} />

            {messages.map((m, idx) => {
              if (m.role === 'model' && m.formRequest) {
                return (
                  <div key={idx} className="flex gap-2.5 max-w-[95%]">
                    <PanchitaIcon variant="answered" className="w-7 h-12 self-start" />
                    <div className="min-w-0 flex-1">
                      <ChatDynamicForm formRequest={m.formRequest} onSubmit={handleFormSubmit} disabled={loading} />
                    </div>
                  </div>
                );
              }
              if (m.role === 'user') {
                return (
                  <div key={idx} className="self-end max-w-[85%] bg-acsoft border border-acline px-3 py-2">
                    <p className="text-[12.5px] leading-relaxed text-ink whitespace-pre-wrap">{m.text}</p>
                    {m.imageCount > 0 && (
                      <span className="block mt-1 text-[11px] text-muted">
                        <FAIcon icon="paperclip" size="xs" className="mr-1" />
                        <span className="num">{m.imageCount}</span> imagen{m.imageCount > 1 ? 'es' : ''} adjunta{m.imageCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                );
              }
              return <ModelMessage key={idx} text={m.text} failed={m.actionSuccess === false} />;
            })}

            {loading && (
              <div className="flex gap-2.5">
                <PanchitaIcon variant="avatar" className="w-7 h-12 self-start" />
                <p className="text-[12.5px] text-muted pt-0.5">Escribiendo…</p>
              </div>
            )}
          </div>

          {/* Entrada */}
          <div className="px-4 py-3 border-t border-line">
            {pendingFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {pendingFiles.map((f, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 border border-line text-[11px] text-inkalt">
                    <FAIcon icon="image" size="xs" />
                    {f.name.length > 16 ? `${f.name.slice(0, 16)}...` : f.name}
                    <button
                      type="button"
                      onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label="Quitar imagen"
                      className="text-muted hover:text-ac"
                    >
                      <FAIcon icon="times" size="xs" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2 border border-linealt bg-bg px-3 py-2">
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFilePick} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Adjuntar imagen"
                aria-label="Adjuntar imagen"
                className="text-muted hover:text-ac transition-colors disabled:opacity-40"
              >
                <FAIcon icon="paperclip" size="sm" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregúntale o pídele algo a Panchita…"
                disabled={loading}
                aria-label="Mensaje para Chef Panchita"
                className="flex-1 min-w-0 bg-transparent text-[12.5px] text-ink placeholder:text-muted focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || (!input.trim() && pendingFiles.length === 0)}
                aria-label="Enviar"
                className="text-muted hover:text-ac transition-colors disabled:opacity-40"
              >
                <FAIcon icon="paper-plane" size="sm" />
              </button>
            </form>
            <p className="text-[11px] text-muted mt-2 leading-relaxed">
              Panchita puede consultar y modificar datos del sistema. Revisa lo que te confirma antes de seguir.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantChatWidget;
