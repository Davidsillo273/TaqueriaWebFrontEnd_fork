// src/constants/tables.js
export const STATUS_LABELS = {
  libre: 'Disponible',
  ocupada: 'Ocupada',
  reservada: 'Reservada',
};

export const STATUS_CONFIG = {
  libre: {
    label: 'Disponible',
    dot: 'bg-ok',
    badge: 'text-ok bg-oksoft border-ok/30',
    border: 'hover:border-ok',
    nextAction: 'ocupada',
    actionText: 'Asignar Mesa',
    actionStyle: 'border-line text-ink hover:border-ok hover:text-ok hover:bg-oksoft/20',
  },
  ocupada: {
    label: 'Ocupada',
    dot: 'bg-ac',
    badge: 'text-ac bg-acsoft border-acline',
    border: 'hover:border-ac',
    nextAction: 'libre',
    actionText: 'Liberar Mesa',
    actionStyle: 'border-acline text-ac bg-acsoft/30 hover:bg-ac hover:text-white',
  },
  reservada: {
    label: 'Reservada',
    dot: 'bg-warn',
    badge: 'text-warn bg-warnsoft border-warn/30',
    border: 'hover:border-warn',
    nextAction: 'ocupada',
    actionText: 'Registrar Ocupación',
    actionStyle: 'border-warn/40 text-warn bg-warnsoft/30 hover:bg-warn hover:text-white',
  },
};

// Ubicaciones del comedor (las mismas claves que el backend en
// tablesModel.TABLE_ZONES). La planta sale de la zona.
export const TABLE_ZONES = {
  ventanal: { label: 'Junto al ventanal', floor: 'Planta baja' },
  salon_central: { label: 'Salón central', floor: 'Planta baja' },
  terraza: { label: 'Terraza', floor: 'Planta alta' },
};
