import React, { useState } from 'react'
import FAIcon from '../commons/FAIcon'
const AddDishModal = ({ isOpen, onClose, onSave }) => {
	const [formData, setFormData] = useState({
		title: '',
		price: '',
		image: '',
		category: 'meat',
		description: '',
	})

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		onSave(formData)
		setFormData({ title: '', price: '', image: '', category: 'meat', description: '' })
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-bold text-gray-900">Nuevo Platillo</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 transition-colors"
					>
						<FAIcon icon="times" size="lg" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nombre del Platillo
						</label>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							placeholder="Ej: Corte Tomahawk"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Precio
						</label>
						<input
							type="number"
							name="price"
							value={formData.price}
							onChange={handleChange}
							placeholder="Ej: 1250.00"
							step="0.01"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Categoría
						</label>
						<select
							name="category"
							value={formData.category}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
						>
							<option value="meat">Carnes</option>
							<option value="poultry">Aves</option>
							<option value="seafood">Mariscos</option>
							<option value="pasta">Pastas</option>
							<option value="vegetables">Vegetariano</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Descripción
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Describe el platillo..."
							rows="2"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							URL de Imagen
						</label>
						<input
							type="url"
							name="image"
							value={formData.image}
							onChange={handleChange}
							placeholder="Ej: https://..."
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
							required
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
						>
							Guardar Platillo
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default AddDishModal
