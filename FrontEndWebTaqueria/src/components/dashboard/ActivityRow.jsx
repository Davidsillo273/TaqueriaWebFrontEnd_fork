// src/components/dashboard/ActivityRow.jsx
import React from 'react';

const ActivityRow = ({ id, mesa, cliente, monto, estado, hora }) => {
  const estadoStyles = {
    COMPLETADO: 'bg-green-100 text-green-700 border border-green-200',
    PREPARANDO: 'bg-orange-100 text-orange-700 border border-orange-200',
    PENDIENTE: 'bg-red-100 text-red-700 border border-red-200',
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-white/60 transition-colors">
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-display font-semibold text-gray-900">{id}</td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{mesa}</td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{cliente}</td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-display font-semibold text-gray-900">{monto}</td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <span className={`px-2 sm:px-3 py-1 text-xs font-display font-semibold rounded-full ${estadoStyles[estado]}`}>
          {estado}
        </span>
      </td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{hora}</td>
    </tr>
  );
};

export default ActivityRow;