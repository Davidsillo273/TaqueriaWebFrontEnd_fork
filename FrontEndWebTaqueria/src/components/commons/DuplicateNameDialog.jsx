// src/components/commons/DuplicateNameDialog.jsx
// Aviso (no bloqueante) de que ya existe un ítem con el nombre que se está
// por crear. El admin decide: editar el existente o crear de todas formas.
import { ModalShell, ModalHeader, ModalBody, ModalFooter, FormSection, MODAL_BTN_SECONDARY, MODAL_BTN_PRIMARY } from './FormModal';

const DuplicateNameDialog = ({ existing, onEditExisting, onCreateAnyway, onCancel }) => {
  if (!existing) return null;

  return (
    <ModalShell maxWidth="max-w-md" zIndex="z-[60]">
      <ModalHeader
        icon="triangle-exclamation"
        tone="warn"
        title="Ya existe un ítem con este nombre"
        subtitle="Puedes editar el existente o crear uno nuevo igualmente"
        onClose={onCancel}
      />

      <ModalBody>
        <FormSection icon="list" title="Ítem existente">
          <div className="flex items-center gap-3">
            {existing.image && (
              <img src={existing.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-display font-medium text-ink text-sm truncate">{existing.name}</p>
              {existing.price !== undefined && (
                <p className="num text-xs text-muted mt-0.5">${Number(existing.price).toFixed(2)}</p>
              )}
              {existing.status && (
                <p className="text-xs text-muted mt-0.5">Estado: {existing.status}</p>
              )}
            </div>
          </div>
        </FormSection>
      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={onCancel} className={MODAL_BTN_SECONDARY}>
          Cancelar
        </button>
        <button type="button" onClick={onCreateAnyway} className={MODAL_BTN_SECONDARY}>
          Crear de todas formas
        </button>
        <button type="button" onClick={onEditExisting} className={MODAL_BTN_PRIMARY}>
          Editar el existente
        </button>
      </ModalFooter>
    </ModalShell>
  );
};

export default DuplicateNameDialog;
