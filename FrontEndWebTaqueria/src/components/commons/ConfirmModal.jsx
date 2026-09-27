import { ModalShell, ModalHeader, ModalBody, ModalFooter, MODAL_BTN_SECONDARY, MODAL_BTN_PRIMARY } from './FormModal';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  icon = 'exclamation-triangle',
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  // "warning" pinta el ícono y el botón en ámbar; "danger" (por defecto), en rojo.
  const isWarning = variant === 'warning';

  return (
    <ModalShell maxWidth="max-w-md">
      <ModalHeader icon={icon} title={title} tone={isWarning ? 'warn' : 'ac'} onClose={loading ? undefined : onClose} />

      <ModalBody>
        <div className="bg-white dark:bg-surface rounded-xl border border-line p-4 shadow-2xs">
          <p className="text-[13px] text-inkalt leading-relaxed">{message}</p>
        </div>
      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={onClose} disabled={loading} className={MODAL_BTN_SECONDARY}>
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`${MODAL_BTN_PRIMARY} ${isWarning ? '!bg-warn hover:!bg-warn/90' : ''}`}
        >
          {loading ? 'Procesando...' : confirmText}
        </button>
      </ModalFooter>
    </ModalShell>
  );
};

export default ConfirmModal;
