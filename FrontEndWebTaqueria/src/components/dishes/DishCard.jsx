import React from 'react'
import FAIcon from '../commons/FAIcon'

// Tarjeta de platillo con imagen, nombre, precio, estado y acciones
export default function DishCard({ image, name, price, status, isMostSold = false, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="relative">
        <img src={image} alt={name} className="w-full h-40 sm:h-48 object-cover" />

        {isMostSold && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <FAIcon icon="fire" size="xs" />
            <span className="hidden sm:inline">MÁS VENDIDO</span>
            <span className="sm:hidden">TOP</span>
          </div>
        )}

        {status && (
          <div
            className={`absolute top-3 right-3 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
              status === 'Activo' ? 'bg-green-500 text-white' :
              status === 'Inactivo' ? 'bg-red-600 text-white' :
              'bg-gray-500 text-white'
            }`}
          >
            {status.toUpperCase()}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">{name}</h3>
          <p className="text-red-600 font-bold text-base sm:text-lg mb-3 sm:mb-4">{price}</p>
        </div>

        <div className="flex gap-2 mt-auto">
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
            title="Eliminar Platillo"
          >
            <FAIcon icon="trash" size="sm" />
          </button>
        </div>
      </div>
    </div>
  )
}