import React from 'react'
import FAIcon from '../commons/FAIcon'

// Exportación directa por defecto para corregir el error de Vite
export default function DishCard({ image, name, price, status, isMostSold = false, onEdit, onDelete }) {
	return (
		<div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow flex flex-col h-full">
			<div className="relative">
				<img src={image} alt={name} className="w-full h-48 object-cover" />
				
				{isMostSold && (
					<div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
						<FAIcon icon="fire" size="xs" />
						MÁS VENDIDO
					</div>
				)}
				
				{status && (
					<div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
						status === 'Activo' ? 'bg-green-500 text-white' :
						status === 'Inactivo' ? 'bg-red-600 text-white' :
						'bg-gray-500 text-white'
					}`}>
						{status.toUpperCase()}
					</div>
				)}
			</div>

			<div className="p-4 flex flex-col flex-1 justify-between">
				<div>
					<h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{name}</h3>
					<p className="text-red-600 font-bold text-lg mb-4">{price}</p>
				</div>

				<div className="flex gap-2 mt-auto">
					<button 
						onClick={onEdit}
						className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
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