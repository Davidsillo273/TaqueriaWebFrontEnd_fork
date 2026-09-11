// src/components/commons/PeriodSelector.jsx
//
// Selector de período reutilizable: día/semana/mes/año/todo, más un rango
// personalizado con dos fechas. Mismo vocabulario que el backend acepta en
// los endpoints de leaderboard (ver backEnd/src/utils/orders/periodUtils.js),
// para que este componente sirva sin traducir nada entre ambos.
import React, { useState } from 'react';
import FAIcon from './FAIcon';

const PRESETS = [
  { id: 'day', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'year', label: 'Año' },
  { id: 'all', label: 'Todo' },
];

/**
 * @param {string} value          Período activo ('day'|'week'|'month'|'year'|'all'|'custom')
 * @param {Function} onChange     (period) => void — para los presets
 * @param {{from,to}} customRange Fechas del rango personalizado (formato "AAAA-MM-DD")
 * @param {Function} onCustomRangeChange  ({from, to}) => void
 */
const PeriodSelector = ({ value, onChange, customRange, onCustomRangeChange }) => {
  // El panel de fechas personalizadas solo se despliega cuando el usuario lo
  // pide explícitamente, para no ocupar espacio de más en el caso normal
  // (que es usar uno de los presets).
  const [showCustom, setShowCustom] = useState(value === 'custom');

  const handlePresetClick = (id) => {
    setShowCustom(false);
    onChange(id);
  };

  const handleCustomToggle = () => {
    setShowCustom((prev) => !prev);
  };

  const handleDateChange = (field, dateValue) => {
    const next = { ...customRange, [field]: dateValue };
    onCustomRangeChange(next);
    // Solo se aplica el filtro cuando ambas fechas están completas: un rango
    // a medias no significa nada para el backend.
    if (next.from && next.to) onChange('custom');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handlePresetClick(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-colors ${
              value === p.id ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCustomToggle}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-colors ${
            value === 'custom' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FAIcon icon="calendar" size="xs" />
          Rango
        </button>
      </div>

      {showCustom && (
        <div className="flex flex-wrap items-center gap-2 mt-2.5 p-3 bg-white/70 rounded-2xl border border-white/80">
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            Desde
            <input
              type="date"
              value={customRange?.from || ''}
              onChange={(e) => handleDateChange('from', e.target.value)}
              className="px-2.5 py-1.5 bg-[#f3f0eb] border border-white/80 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            Hasta
            <input
              type="date"
              value={customRange?.to || ''}
              onChange={(e) => handleDateChange('to', e.target.value)}
              className="px-2.5 py-1.5 bg-[#f3f0eb] border border-white/80 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;
