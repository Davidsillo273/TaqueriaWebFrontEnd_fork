import React from 'react'
import FAIcon from '../commons/FAIcon'

const ExtraStats = ({ totalExtras, mostRequestedExtra, lowInventoryCount }) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			{/* Total Extras */}
			<div className="rounded-lg p-6 border-l-4 border-l-blue-600 bg-blue-50 border border-gray-200">
				<div className="flex items-center justify-between mb-2">
					<p className="text-sm font-semibold text-gray-700">TOTAL DE EXTRAS</p>
					<FAIcon icon="box" size="lg" className="text-blue-600" />
				</div>
				<h3 className="text-3xl font-bold mb-1 text-blue-600">{totalExtras}</h3>
				<p className="text-xs text-gray-500">Extras disponibles</p>
			</div>

			{/* Most Requested Extra */}
			<div className="rounded-lg p-6 border-l-4 border-l-yellow-500 bg-yellow-50 border border-gray-200">
				<div className="flex items-center justify-between mb-2">
					<p className="text-sm font-semibold text-gray-700">EXTRA MAS PEDIDO</p>
					<FAIcon icon="star" size="lg" className="text-yellow-500" />
				</div>
				<h3 className="text-xl font-bold mb-1 text-gray-900">{mostRequestedExtra}</h3>
				<p className="text-xs text-gray-500">Favorito de clientes</p>
			</div>

			{/* Low Inventory Alert */}
			<div className="rounded-lg p-6 border-l-4 border-l-red-600 bg-red-50 border border-gray-200">
				<div className="flex items-center justify-between mb-2">
					<p className="text-sm font-semibold text-gray-700">ALERTAS DE INVENTARIO</p>
					<FAIcon icon="exclamation-triangle" size="lg" className="text-red-600" />
				</div>
				<h3 className="text-3xl font-bold mb-1 text-red-600">{lowInventoryCount} bajos</h3>
				<p className="text-xs text-gray-500">Requieren reorden</p>
			</div>
		</div>
	)
}

export default ExtraStats
