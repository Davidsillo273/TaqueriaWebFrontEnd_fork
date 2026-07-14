// src/components/dashboard/AlertCard.jsx
import React from 'react';
import FAIcon from '../commons/FAIcon';

const AlertCard = ({ type, title, subtitle, icon }) => {
  const typeStyles = {
    warning: 'bg-red-500 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3),inset_1px_1px_3px_rgba(255,255,255,0.3)] border border-red-400',
    success: 'bg-green-500 text-white shadow-[0_10px_30px_rgba(34,197,94,0.3),inset_1px_1px_3px_rgba(255,255,255,0.3)] border border-green-400',
    dark: 'bg-gray-800 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.1)] border border-gray-700',
  };

  return (
    <div className={`rounded-3xl p-4 sm:p-6 backdrop-blur-sm ${typeStyles[type]}`}>
      <div className="flex items-start gap-3">
        <FAIcon icon={icon} size="2xl" />
        <div>
          <h4 className="font-display font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs opacity-90">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;