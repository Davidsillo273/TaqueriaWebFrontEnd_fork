// src/components/dishes/DishCard.jsx
import React from 'react';
import FAIcon from '../commons/FAIcon';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x300/f3f0eb/9ca3af?text=Platillo';

export default function DishCard({ image, name, category, subcategory, price, status, isMostSold = false, onEdit, onDelete, onView }) {
  const isAvailable = status === 'Activo';

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7),inset_-1px_-1px_3px_rgba(0,0,0,0.05)] border border-white/80 flex flex-col h-full transition-transform duration-200 hover:scale-[1.02]">
      {/* Imagen con overlay y badges */}
      <div className="relative h-44 sm:h-48">
        <img src={image || PLACEHOLDER_IMAGE} alt={name} className="w-full h-full object-cover rounded-t-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-3xl" />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {isMostSold && (
            <span className="inline-flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur-sm">
              <FAIcon icon="star" size="xs" />
              <span>Estrella</span>
            </span>
          )}
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.15)] ml-auto backdrop-blur-sm">
              <FAIcon icon="check-circle" size="xs" />
              <span className="hidden sm:inline">Disponible</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-gray-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.15)] ml-auto backdrop-blur-sm">
              <FAIcon icon="ban" size="xs" />
              <span className="hidden sm:inline">No disponible</span>
            </span>
          )}
        </div>

        {/* Overlay de "SIN STOCK" si no está disponible */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center rounded-t-3xl">
            <span className="text-white font-display font-bold text-base sm:text-lg tracking-wide border-2 border-white px-4 py-1 rounded-xl shadow-lg">
              SIN STOCK
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-gray-900 mb-1 text-sm sm:text-base line-clamp-2">
          {name}
        </h3>
        {(category || subcategory) && (
          <div className="flex gap-1 flex-wrap mb-1">
            {category && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold uppercase w-fit">
                {category}
              </span>
            )}
            {subcategory && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[11px] font-semibold w-fit">
                {subcategory}
              </span>
            )}
          </div>
        )}
        <p className="text-red-500 font-display font-bold text-lg sm:text-xl mb-2">
          {price}
        </p>
        {/* Espacio flexible */}
        <div className="flex-1" />

        {/* Botones */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          {onView && (
            <button
              onClick={onView}
              className="px-3 py-2.5 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-colors
                shadow-[0_4px_10px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)]
                active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]
              "
              aria-label="Ver detalles"
            >
              <FAIcon icon="eye" size="sm" />
            </button>
          )}
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
}