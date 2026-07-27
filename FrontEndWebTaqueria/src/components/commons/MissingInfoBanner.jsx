// src/components/commons/MissingInfoBanner.jsx
import React from 'react';
import FAIcon from './FAIcon';

const MAX_NAMES = 5;

// Banner de aviso que, además de contar cuántos registros les falta algo,
// lista sus nombres (cortando con "+N más" si son demasiados).
const MissingInfoBanner = ({ message, names }) => {
  if (!names || names.length === 0) return null;

  const visible = names.slice(0, MAX_NAMES);
  const remaining = names.length - visible.length;

  return (
    <div className="mb-4 bg-amber-100/80 border border-amber-300 text-amber-800 px-4 py-3 rounded-2xl text-sm shadow-sm flex items-start gap-2">
      <FAIcon icon="triangle-exclamation" size="sm" className="mt-0.5" />
      <span>
        {message} ({names.length}): {visible.join(', ')}
        {remaining > 0 ? ` y ${remaining} más` : ''}
      </span>
    </div>
  );
};

export default MissingInfoBanner;
