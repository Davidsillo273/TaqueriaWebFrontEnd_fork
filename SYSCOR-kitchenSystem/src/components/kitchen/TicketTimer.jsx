// components/kitchen/TicketTimer.jsx
//
// Cronómetro de un ticket. Es lo ÚNICO del ticket que se actualiza cada
// segundo: lee el reloj único de cocina (useElapsedLabel) y vuelve a pintar
// solo su propio texto, no el ticket con sus platillos.
import { memo } from 'react';
import FAIcon from '@syscor/web-shared/src/components/FAIcon';
import { useElapsedLabel } from '../../hooks/useKitchenClock';

// Normal: texto sin caja. Demora: ámbar. Superó el máximo: en rojo sólido.
// En rojo el texto toma el color de la superficie (blanco en claro, oscuro en
// modo oscuro, donde el rojo es más claro y el blanco casi no se leería).
const LEVEL_CLASS = {
  ok: 'text-ink',
  warn: 'text-warn bg-warnsoft px-2 rounded-md',
  late: 'text-surface px-2 rounded-md',
};

const LATE_STYLE = { backgroundColor: 'var(--kds-late)' };

function TicketTimer({ since, level }) {
  const label = useElapsedLabel(since);

  return (
    <span
      role="timer"
      title="Tiempo desde que se pidió"
      className={`num inline-flex items-center gap-1.5 py-0.5 text-[15px] font-semibold leading-none shrink-0 ${LEVEL_CLASS[level] || LEVEL_CLASS.ok}`}
      style={level === 'late' ? LATE_STYLE : undefined}
    >
      <FAIcon icon="clock" size="sm" weight={level === 'late' ? 'fill' : 'regular'} />
      {label}
    </span>
  );
}

export default memo(TicketTimer);
