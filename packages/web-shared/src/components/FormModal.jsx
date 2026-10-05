// src/components/commons/FormModal.jsx
//
// Piezas compartidas de los formularios del catálogo (platillos, bebidas,
// combos, conjuntos, promociones), con el mismo lenguaje que la ficha del
// empleado: cabecera con ícono en cuadro rojo, secciones en tarjetas blancas
// y un pie fijo con Cancelar / Guardar siempre a la vista.
//
// La referencia es la ficha del empleado (EmployeeDetailModal): títulos en
// Archivo (font-display), el título de cada sección en versalitas
// monoespaciadas (.kick), los rótulos de campo en Inter semibold en
// mayúsculas, las cifras en IBM Plex Mono (.num) y los botones en Archivo.
//
// Además de FormModal (el contenedor completo) se exportan sus piezas
// (ModalShell, ModalHeader, ModalBody, ModalFooter y los estilos de botón)
// para los modales que tienen su propia lógica de pie o de formulario y aun
// así deben verse exactamente igual.
import FAIcon from './FAIcon';

export const FORM_INPUT =
  'w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-surface border border-line focus:border-ac focus:outline-none text-[13.5px] text-ink placeholder:text-muted transition-colors';
export const FORM_LABEL = 'text-[11px] font-semibold text-muted tracking-wide uppercase';
export const FORM_ERROR = 'text-ac text-xs mt-1 block font-medium';

// Etiquetas pequeñas para el lado derecho de una sección.
export const RequiredBadge = ({ label = 'Obligatoria' }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
    <span className="w-1 h-1 rounded-full bg-amber-500" />
    {label}
  </span>
);

export const CountBadge = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 bg-emerald-500/10">
    {children}
  </span>
);

export const OptionalBadge = () => <span className="text-[10.5px] font-medium text-muted">Opcional</span>;

// Tarjeta de sección con encabezado (ícono rojo + título + etiqueta opcional).
export const FormSection = ({ icon, title, badge, children, className = '' }) => (
  <div className={`bg-white dark:bg-surface rounded-xl border border-line p-4 shadow-2xs ${className}`}>
    <div className="flex items-center justify-between gap-2 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-7 h-7 rounded-lg bg-ac text-white flex items-center justify-center shadow-2xs shrink-0">
          <FAIcon icon={icon} size="xs" />
        </span>
        <h4 className="kick text-ink truncate">{title}</h4>
      </div>
      {badge}
    </div>
    {children}
  </div>
);

// Grupo de píldoras (una sola opción elegida), como los días de trabajo.
export const PillGroup = ({ options, value, onChange, columns }) => (
  <div
    className={columns ? 'grid gap-1.5' : 'flex flex-wrap gap-1.5'}
    style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
  >
    {options.map((opt) => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={active}
          className={`px-3 py-1.5 text-xs font-display font-semibold rounded-full border transition-all text-center cursor-pointer inline-flex items-center justify-center gap-1.5 ${
            active
              ? 'bg-ac text-white border-ac shadow-2xs'
              : 'bg-white dark:bg-surface text-inkalt border-line hover:border-ac hover:text-ac'
          }`}
        >
          {opt.icon && <FAIcon icon={opt.icon} size="xs" />}
          {opt.label}
        </button>
      );
    })}
  </div>
);

// Selector de imagen: vista previa con Ajustar/Quitar, o zona para elegir.
export const ImagePickerField = ({ imageFile, currentImage, onPick, onAdjust, onRemove }) => {
  if (imageFile) {
    return (
      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-line bg-surfalt/40">
        <img
          src={URL.createObjectURL(imageFile)}
          alt="Vista previa"
          className="w-14 h-14 rounded-lg object-cover border-2 border-ac shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-ink truncate">{imageFile.name}</p>
          <p className="text-[11px] text-muted">Nueva imagen lista para guardar</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {onAdjust && (
            <button
              type="button"
              onClick={onAdjust}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-line text-inkalt hover:border-ac hover:text-ac transition-colors cursor-pointer"
            >
              Ajustar
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-line text-muted hover:border-ac hover:text-ac transition-colors cursor-pointer"
          >
            Quitar
          </button>
        </div>
      </div>
    );
  }

  return (
    <label className="group/img flex items-center gap-3 p-3 rounded-lg border border-dashed border-linealt hover:border-ac hover:bg-ac/5 transition-colors cursor-pointer">
      {currentImage ? (
        <img src={currentImage} alt="Actual" className="w-14 h-14 rounded-lg object-cover border border-line shrink-0" />
      ) : (
        <span className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center bg-ac/10 text-ac border border-ac/20">
          <FAIcon icon="camera" size="lg" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-ink group-hover/img:text-ac transition-colors">
          {currentImage ? 'Reemplazar imagen actual' : 'Seleccionar imagen'}
        </p>
        <p className="text-[11px] text-muted">
          {currentImage
            ? 'Se conserva la actual si no eliges otra'
            : 'PNG o JPG, máximo 5 MB. Sin imagen se usa un diseño por defecto'}
        </p>
      </div>
      <span className="shrink-0 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ac text-white text-xs font-medium shadow-2xs">
        <FAIcon icon="image" size="xs" />
        Examinar
      </span>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const selected = e.target.files?.[0] || null;
          if (selected) onPick(selected);
          e.target.value = '';
        }}
        className="hidden"
      />
    </label>
  );
};

const BADGE_TONES = {
  ac: 'text-ac border-ac/30 bg-ac/10',
  ok: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  warn: 'text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10',
  muted: 'text-muted border-line bg-surfalt',
};

// Avatar de la cabecera: foto si hay, si no iniciales sobre rojo sólido.
export const ModalAvatar = ({ image, name = '' }) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length === 0 ? '?' : parts.length === 1
      ? parts[0].substring(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

  return image ? (
    <img src={image} alt={name} className="w-10 h-10 rounded-lg object-cover border border-line shrink-0 shadow-2xs" />
  ) : (
    <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-display font-medium text-xs bg-ac text-white select-none shadow-2xs">
      {initials}
    </div>
  );
};

// Campo de solo lectura con el mismo aspecto que un input deshabilitado.
export const ReadField = ({ label, value, mono = false, className = '' }) => (
  <div className={className}>
    <p className={FORM_LABEL}>{label}</p>
    <div
      className={`mt-1 px-3 py-2 rounded-lg bg-white dark:bg-surface border border-line text-[13.5px] text-ink break-words min-h-[38px] ${
        mono ? 'num text-[12.5px]' : ''
      }`}
    >
      {value === undefined || value === null || value === '' ? <span className="text-muted">—</span> : value}
    </div>
  </div>
);

// Botones del pie: secundario (Cancelar / Cerrar) y principal (Guardar).
export const MODAL_BTN_SECONDARY =
  'px-4 py-2 text-xs font-display font-medium text-inkalt hover:text-ac bg-surface border border-line hover:border-ac/40 rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60';
export const MODAL_BTN_PRIMARY =
  'px-4 py-2 text-xs font-display font-medium text-white bg-ac hover:bg-ac/90 disabled:opacity-60 rounded-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95';

// Fondo oscurecido + tarjeta redondeada.
export const ModalShell = ({ children, maxWidth = 'max-w-xl', zIndex = 'z-50' }) => (
  <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150`}>
    <div className={`bg-surface rounded-2xl border border-line w-full ${maxWidth} max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl`}>
      {children}
    </div>
  </div>
);

// Cabecera: ícono en cuadro rojo (o avatar), título, etiqueta y subtítulo.
// `leading` va antes del ícono (ej. un botón de volver) y `extra` junto al
// botón de cerrar.
export const ModalHeader = ({
  icon,
  title,
  badge,
  badgeTone = 'ac',
  subtitle,
  onClose,
  avatar,
  leading,
  extra,
  tone = 'ac',
}) => (
  <div className="px-5 pt-5 pb-4 border-b border-line bg-surface flex items-center justify-between shrink-0">
    <div className="flex items-center gap-3 min-w-0">
      {leading}
      {avatar || (icon && (
        <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-white shadow-2xs ${tone === 'warn' ? 'bg-warn' : 'bg-ac'}`}>
          <FAIcon icon={icon} />
        </div>
      ))}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-display font-medium text-ink leading-tight truncate">{title}</h2>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${BADGE_TONES[badgeTone] || BADGE_TONES.ac}`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>

    <div className="flex items-center gap-1 shrink-0 ml-2">
      {extra}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg text-muted hover:text-ac hover:bg-ac/10 flex items-center justify-center transition-colors cursor-pointer"
          title="Cerrar ventana"
        >
          <FAIcon icon="times" size="sm" />
        </button>
      )}
    </div>
  </div>
);

// Cuerpo con scroll propio: la cabecera y el pie quedan fijos.
export const ModalBody = ({ children, className = '' }) => (
  <div className={`p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4 bg-surfalt/30 ${className}`}>{children}</div>
);

// Pie: nota a la izquierda y acciones a la derecha.
export const ModalFooter = ({ note, children }) => (
  <div className="px-5 py-3.5 border-t border-line bg-surface flex items-center justify-between gap-3 shrink-0">
    {note ? <span className="text-xs text-muted hidden sm:inline min-w-0 truncate">{note}</span> : <span />}
    <div className="flex items-center gap-2 ml-auto shrink-0">{children}</div>
  </div>
);

// Contenedor del modal. Si recibe `onSubmit`, el cuerpo y el pie van dentro
// de un <form> para que Enter y el botón Guardar envíen el formulario.
const FormModal = ({
  icon,
  title,
  badge,
  subtitle,
  onClose,
  onSubmit,
  children,
  footerNote,
  submitLabel = 'Guardar',
  submitIcon = 'check',
  submitting = false,
  submitDisabled = false,
  cancelLabel = 'Cancelar',
  maxWidth = 'max-w-xl',
  footerExtra,
  zIndex = 'z-50',
  avatar,
  badgeTone = 'ac',
}) => {
  const Body = onSubmit ? 'form' : 'div';

  return (
    <ModalShell maxWidth={maxWidth} zIndex={zIndex}>
      <ModalHeader
        icon={icon}
        title={title}
        badge={badge}
        badgeTone={badgeTone}
        subtitle={subtitle}
        onClose={onClose}
        avatar={avatar}
      />

      <Body onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
        <ModalBody>{children}</ModalBody>

        <ModalFooter note={footerNote}>
          {footerExtra}
          <button type="button" onClick={onClose} className={MODAL_BTN_SECONDARY}>
            {cancelLabel}
          </button>
          {onSubmit && (
            <button type="submit" disabled={submitting || submitDisabled} className={MODAL_BTN_PRIMARY}>
              <FAIcon
                icon={submitting ? 'spinner' : submitIcon}
                size="xs"
                className={submitting ? 'animate-spin' : ''}
              />
              <span>{submitLabel}</span>
            </button>
          )}
        </ModalFooter>
      </Body>
    </ModalShell>
  );
};

export default FormModal;
