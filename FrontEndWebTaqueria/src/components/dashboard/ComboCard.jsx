import React from 'react'
import FAIcon from '../commons/FAIcon'

// Tarjeta de combo con acciones de editar/eliminar
const ComboCard = ({ image, title, price, description, isMostSold = false, isAvailable = true, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-between h-full">
      <div>
        <div className="relative">
          <img src={image} alt={title} className="w-full h-40 sm:h-48 object-cover" />
          {isMostSold && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <FAIcon icon="star" size="xs" />
              <span className="hidden sm:inline">MÁS VENDIDO</span>
              <span className="sm:hidden">TOP</span>
            </div>
          )}
          {isAvailable ? (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <FAIcon icon="check-circle" size="xs" />
              <span className="hidden sm:inline">Disponible</span>
            </div>
          ) : (
            <div className="absolute top-3 right-3 bg-gray-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <FAIcon icon="ban" size="xs" />
              <span className="hidden sm:inline">No disponible</span>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base line-clamp-1">{title}</h3>
          <p className="text-red-600 font-bold text-base sm:text-lg mb-2">{price}</p>
          <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 text-justify">{description}</p>
        </div>
      </div>

      <div className="p-3 sm:p-4 pt-0 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
        >
          <FAIcon icon="edit" size="sm" />
          Editar
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <FAIcon icon="trash" size="sm" />
        </button>
      </div>
    </div>
  )
}

export default ComboCard