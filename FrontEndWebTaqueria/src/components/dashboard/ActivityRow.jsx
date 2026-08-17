// src/components/dashboard/ActivityRow.jsx
import React from 'react';
import FAIcon from '../commons/FAIcon';

const ActivityRow = ({ id, tipo, orderType, mesa, cliente, monto, estado, hora, showType, onView }) => {
  const estadoStyles = {
    COMPLETADO: 'bg-green-100 text-green-700 border border-green-200',
    LISTO: 'bg-blue-100 text-blue-700 border border-blue-200',
    PREPARANDO: 'bg-orange-100 text-orange-700 border border-orange-200',
    PENDIENTE: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    ATRASADO: 'bg-red-100 text-red-700 border border-red-200',
    CANCELADO: 'bg-gray-200 text-gray-600 border border-gray-300',
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-white/60 transition-colors">
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-display font-semibold text-gray-900 whitespace-nowrap">{id}</td>
      {showType && (
        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-1 rounded-full text-xs font-display font-semibold ${orderType === 'online' ? 'bg-purple-100 text-purple-600' : 'bg-sky-100 text-sky-600'}`}>
            <FAIcon icon={orderType === 'online' ? 'globe' : 'store'} size="xs" />
            <span>{tipo}</span>
          </span>
        </td>
      )}
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{mesa}</td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{cliente}</td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-display font-semibold text-gray-900 whitespace-nowrap">{monto}</td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span className={`px-2 sm:px-3 py-1 text-xs font-display font-semibold rounded-full ${estadoStyles[estado] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
          {estado}
        </span>
      </td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{hora}</td>
      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={onView}
          className="w-7 h-7 rounded-full inline-flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Ver pedido"
        >
          <FAIcon icon="eye" size="xs" />
        </button>
      </td>
    </tr>
  );
};

export default ActivityRow;
