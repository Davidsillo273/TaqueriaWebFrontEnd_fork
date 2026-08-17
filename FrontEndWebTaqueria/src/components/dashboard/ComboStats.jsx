// src/components/dashboard/ComboStats.jsx
import React from 'react';
import FAIcon from '../commons/FAIcon';

const ComboStats = ({ icon, title, value, label, highlighted = false, onClick, active = false }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`
        w-full text-left rounded-3xl p-5 sm:p-6 bg-white text-gray-900
        shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7),inset_-1px_-1px_3px_rgba(0,0,0,0.05)]
        border-y border-r transition-all duration-200 hover:scale-[1.02]
        ${onClick ? 'cursor-pointer' : ''}
        ${active ? 'border-red-500 ring-2 ring-red-400/60 border-l-4' : highlighted ? 'border-l-4 border-l-red-500 border-white/80' : 'border-l border-l-white/80 border-white/80'}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <p className={`text-xs sm:text-sm font-display font-semibold uppercase tracking-wider ${highlighted ? 'text-red-500' : 'text-gray-500'}`}>
          {title}
        </p>
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.6)]
          ${highlighted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}
        `}>
          <FAIcon icon={icon} size="lg" />
        </div>
      </div>
      <h3 className={`text-3xl sm:text-4xl font-display font-bold mb-1 ${highlighted ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </h3>
      <p className="text-xs sm:text-sm font-medium text-gray-500">
        {label}
      </p>
    </Tag>
  );
};

export default ComboStats;