import React, { useState } from 'react'
import FAIcon from '../commons/FAIcon'

// Modal para agregar nuevo combo
const AddComboModal = ({ isOpen, onClose, onSave }) => {
	const [formData, setFormData] = useState({
		title: '',
		price: '',
		description: '',
		image: '',
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
		setFormData({ title: '', price: '', description: '', image: '' })
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
				{/* Encabezado del modal */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-bold text-gray-900">Nuevo Combo</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 transition-colors"
					>
						<FAIcon icon="times" size="lg" />
					</button>
				</div>

				{/* Formulario */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nombre del Combo
						</label>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							placeholder="Ej: Combo Taquero"
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
							placeholder="Ej: 14.50"
							step="0.01"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Descripción
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Describe los componentes del combo..."
							rows="3"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
							required
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

					{/* Botones */}
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
							Guardar Combo
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default AddComboModal
