// src/components/commons/ViewDetailsModal.jsx
// Modal de solo lectura para ver el detalle completo de un registro (platillo,
// bebida, combo, extra...). El contenido se organiza en secciones navegables
// ("Sección 1", "Sección 2"...) en vez de un único bloque largo.
import { useState } from 'react';
import FAIcon from './FAIcon';
import { ModalShell, ModalHeader, ModalBody, ModalFooter, PillGroup, FormSection, MODAL_BTN_SECONDARY, MODAL_BTN_PRIMARY } from './FormModal';

const ViewDetailsModal = ({ isOpen, onClose, title, subtitle, image, sections = [] }) => {
  const [activeSection, setActiveSection] = useState(0);

  if (!isOpen) return null;

  const total = sections.length;
  const current = sections[Math.min(activeSection, total - 1)];

  return (
    <ModalShell maxWidth="max-w-lg">
      <ModalHeader icon="eye" title={title} badge="Detalle" subtitle={subtitle} onClose={onClose} />

      {image && (
        <img src={image} alt={title} className="w-full h-40 sm:h-48 object-cover shrink-0" />
      )}

      <ModalBody>
        {total > 1 && (
          <PillGroup
            value={activeSection}
            onChange={setActiveSection}
            options={sections.map((s, i) => ({ value: i, label: `Sección ${i + 1}` }))}
          />
        )}

        <FormSection icon="circle-info" title={current?.title || 'Información'}>
          {current?.content}
        </FormSection>
      </ModalBody>

      <ModalFooter
        note={total > 1 ? <span><span className="num">{activeSection + 1}</span> de <span className="num">{total}</span></span> : null}
      >
        {total > 1 && (
          <>
            <button
              type="button"
              disabled={activeSection === 0}
              onClick={() => setActiveSection((a) => Math.max(0, a - 1))}
              className={MODAL_BTN_SECONDARY}
            >
              <FAIcon icon="chevron-left" size="xs" />
              Anterior
            </button>
            <button
              type="button"
              disabled={activeSection === total - 1}
              onClick={() => setActiveSection((a) => Math.min(total - 1, a + 1))}
              className={MODAL_BTN_SECONDARY}
            >
              Siguiente
              <FAIcon icon="chevron-right" size="xs" />
            </button>
          </>
        )}
        <button type="button" onClick={onClose} className={MODAL_BTN_PRIMARY}>
          Cerrar
        </button>
      </ModalFooter>
    </ModalShell>
  );
};

export default ViewDetailsModal;
