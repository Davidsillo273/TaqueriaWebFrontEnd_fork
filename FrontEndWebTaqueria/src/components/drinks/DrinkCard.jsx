import React from 'react'
import FAIcon from '../commons/FAIcon'

const DrinkCard = ({ id, image, title, price, stock, isMostSold, isAvailable, status, onEdit, onDelete }) => {
	return (
		<div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-between">
			<div>
				<div className="relative">
					<img src={image} alt={title} className="w-full h-48 object-cover" />
					{isMostSold && (
						<div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
							<FAIcon icon="fire" size="xs" />
							MÁS VENDIDO
						</div>
					)}
					{!isAvailable && (
						<div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-[1px]">
							<span className="text-white font-bold text-lg tracking-wide border-2 border-white px-4 py-1 rounded">SIN STOCK</span>
						</div>
					)}
				</div>

				<div className="p-4 pb-0">
					<h3 className="font-bold text-gray-900 text-base mb-1 truncate">{title}</h3>
					<p className="text-red-600 font-extrabold text-xl mb-2">${parseFloat(price).toFixed(2)}</p>
					<p className="text-gray-600 text-sm mb-3">
						<span className={`font-semibold ${stock > 10 ? 'text-green-600' : stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
							{status} ({stock} uds)
						</span>
					</p>
				</div>
			</div>

			<div className="p-4 pt-2">
				<div className="flex gap-2">
					<button 
						onClick={() => onEdit({ id, image, title, price, stock, status })}
						className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
					>
						<FAIcon icon="edit" size="sm" />
						Editar
					</button>
					<button 
						onClick={() => onDelete(id)}
						className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
					>
						<FAIcon icon="trash" size="sm" />
					</button>
				</div>
			</div>
		</div>
	)
}

export default DrinkCard