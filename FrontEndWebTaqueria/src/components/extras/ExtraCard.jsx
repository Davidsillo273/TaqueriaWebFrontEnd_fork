import React from 'react'
import FAIcon from '../commons/FAIcon'

const ExtraCard = ({ title, price, status = 'DISPONIBLE', onEdit, onDelete }) => {
  const statusColor =
    status === 'DISPONIBLE'
      ? 'bg-green-500 text-white'
      : 'bg-red-600 text-white'

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-between p-4 sm:p-5">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">{title}</h3>
          <p className="text-red-600 font-bold text-xl sm:text-2xl">{price}</p>
        </div>
        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {status}
        </span>
      </div>

      <div className="flex gap-2 mt-2">
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

export default ExtraCard