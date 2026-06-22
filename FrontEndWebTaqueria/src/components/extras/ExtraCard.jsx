import React from 'react'
import FAIcon from '../commons/FAIcon'

const ExtraCard = ({ image, title, price, description, availability = 'DISPONIBLE', onEdit, onDelete }) => {
	const availabilityColor = availability === 'DISPONIBLE' 
		? 'bg-green-500 text-white' 
		: 'bg-red-600 text-white'

	return (
		<div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
			<div className="relative">
				<img src={image} alt={title} className="w-full h-48 object-cover" />
				<div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${availabilityColor}`}>
					{availability}
				</div>
			</div>

			<div className="p-4">
				<h3 className="font-bold text-gray-900 mb-1">{title}</h3>
				<p className="text-red-600 font-bold text-lg mb-2">{price}</p>
				<p className="text-sm text-gray-600 mb-4">{description}</p>

				<div className="flex gap-2">
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
					>
						<FAIcon icon="trash" size="sm" />
					</button>
				</div>
			</div>
		</div>
	)
}

export default ExtraCard
