import React from 'react'
import FAIcon from '../commons/FAIcon'

const ExtraStats = ({ totalExtras, mostRequestedExtra, lowInventoryCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Total Extras */}
      <div className="rounded-lg p-4 sm:p-6 border-l-4 border-l-red-600 bg-red-50 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs sm:text-sm font-semibold text-gray-700">TOTAL DE EXTRAS</p>
          <FAIcon icon="box" size="lg" className="text-red-600" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">{totalExtras}</h3>
        <p className="text-xs text-gray-500">Extras disponibles</p>
      </div>

      {/* Extra más pedido */}
      <div className="rounded-lg p-4 sm:p-6 border-l-4 border-l-red-600 bg-red-50 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs sm:text-sm font-semibold text-gray-700">EXTRA MÁS PEDIDO</p>
          <FAIcon icon="star" size="lg" className="text-red-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-1 text-gray-900">{mostRequestedExtra}</h3>
        <p className="text-xs text-gray-500">Favorito de clientes</p>
      </div>

      {/* Alertas de inventario */}
      <div className="rounded-lg p-4 sm:p-6 border-l-4 border-l-red-600 bg-red-50 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs sm:text-sm font-semibold text-gray-700">ALERTAS DE INVENTARIO</p>
          <FAIcon icon="exclamation-triangle" size="lg" className="text-red-600" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">{lowInventoryCount} bajos</h3>
        <p className="text-xs text-gray-500">Requieren reabastecimiento</p>
      </div>
    </div>
  )
}

export default ExtraStats