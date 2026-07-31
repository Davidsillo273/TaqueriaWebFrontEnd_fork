// src/components/commons/DetailRow.jsx
// Fila simple label/valor reutilizada dentro de las secciones de ViewDetailsModal
import React from 'react';

const DetailRow = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;

  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-display font-semibold text-gray-500 uppercase tracking-wider shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-800 text-right">{value}</span>
    </div>
  );
};

export default DetailRow;
