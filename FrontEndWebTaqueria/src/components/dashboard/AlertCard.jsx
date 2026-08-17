// src/components/dashboard/AlertCard.jsx
import React from 'react';
import FAIcon from '../commons/FAIcon';
import Card from '../commons/Card';

// Tarjeta de indicador operativo (mesas, stock, clientes...). A diferencia
// de un StatCard normal, siempre trae una barra de progreso/ocupación para
// que el admin capte el número de un vistazo, sin tener que leer el texto.
const AlertCard = ({ type = 'dark', icon, title, value, subtitle, percent }) => {
  const palette = {
    dark: { badge: 'bg-gray-800 text-white', bar: 'bg-gray-800', text: 'text-gray-900' },
    warning: { badge: 'bg-red-500 text-white', bar: 'bg-red-500', text: 'text-red-600' },
    success: { badge: 'bg-green-500 text-white', bar: 'bg-green-500', text: 'text-green-600' },
  };
  const colors = palette[type] || palette.dark;
  const clampedPercent = percent === undefined || percent === null ? null : Math.max(0, Math.min(100, percent));

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.25)] ${colors.badge}`}>
          <FAIcon icon={icon} size="sm" />
        </div>
        <h4 className="font-display font-bold text-xs sm:text-sm text-gray-500 uppercase tracking-wide">{title}</h4>
      </div>

      <p className={`text-2xl sm:text-3xl font-display font-bold mb-1 ${colors.text}`}>{value}</p>
      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{subtitle}</p>

      {clampedPercent !== null && (
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${clampedPercent}%` }} />
        </div>
      )}
    </Card>
  );
};

export default AlertCard;
