// src/components/extras/ExtraCard.jsx
import React from 'react';
import FAIcon from '../commons/FAIcon';

const ExtraCard = ({ title, price, status = 'DISPONIBLE', onEdit, onDelete }) => {
  const isAvailable = status === 'DISPONIBLE';

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7),inset_-1px_-1px_3px_rgba(0,0,0,0.05)] border border-white/80 flex flex-col h-full transition-transform duration-200 hover:scale-[1.02]">
      {/* Cabecera decorativa con ícono (reemplaza la imagen) */}
      <div className="relative h-24 bg-gradient-to-br from-red-100 to-orange-50 flex items-center justify-center rounded-t-3xl">
        <FAIcon icon="star" size="3x" className="text-red-400" />
        
        {/* Badge de estado */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur-sm">
              <FAIcon icon="check-circle" size="xs" />
              <span>Disponible</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-gray-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur-sm">
              <FAIcon icon="ban" size="xs" />
              <span>Agotado</span>
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-gray-900 mb-1 text-sm sm:text-base line-clamp-1">
          {title}
        </h3>
        <p className="text-red-500 font-display font-bold text-lg sm:text-xl mb-2">
          {price}
        </p>
        <div className="flex-1" />

        {/* Botones con estilo clay */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium
              shadow-[0_4px_10px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)]
              active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]
            "
          >
            <FAIcon icon="edit" size="sm" />
            Editar
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors
              shadow-[0_4px_10px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)]
              active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]
            "
          >
            <FAIcon icon="trash" size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtraCard;