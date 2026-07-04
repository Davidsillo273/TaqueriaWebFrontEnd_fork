import React, { useState, useEffect } from 'react'
import FAIcon from '../commons/FAIcon'

const AddDrinkModal = ({ isOpen, onClose, onSave, editData = null }) => {
	const [formData, setFormData] = useState({
		title: '',
		price: '',
		stock: '',
		status: 'Disponible',
		imageFile: null,
	})

	// Detectar si el modal se abre para editar o agregar nuevo
	useEffect(() => {
		if (editData) {
			setFormData({
				title: editData.title || '',
				price: editData.price || '',
				stock: editData.stock || '',
				status: editData.status || 'Disponible',
				imageFile: null, // Se deja vacío a menos que el usuario suba una nueva imagen
			})
		} else {
			setFormData({ title: '', price: '', stock: '', status: 'Disponible', imageFile: null })
		}
	}, [editData, isOpen])

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleFileChange = (e) => {
		setFormData((prev) => ({ ...prev, imageFile: e.target.files[0] }))
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		onSave(formData)
	}

	if (!isOpen) return null

	return (
		// Corrección fondo negro: Usamos back-drop o rgba manual seguro para asegurar transparencia
		<div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
			<div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
				<div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
					<h2 className="text-xl font-bold text-gray-900">
						{editData ? 'Editar Bebida' : 'Nueva Bebida'}
					</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
						<FAIcon icon="times" size="lg" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">
							Nombre de la Bebida
						</label>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							placeholder="Ej: Limonada Natural"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-gray-900"
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Precio ($)</label>
							<input
								type="number"
								name="price"
								value={formData.price}
								onChange={handleChange}
								placeholder="Ej: 3.50"
								step="0.01"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-gray-900"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Stock Inicial</label>
							<input
								type="number"
								name="stock"
								value={formData.stock}
								onChange={handleChange}
								placeholder="Ej: 50"
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-gray-900"
								required
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Estado (Status)</label>
						<select
							name="status"
							value={formData.status}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 bg-white text-gray-900"
						>
							<option value="Disponible">Disponible</option>
							<option value="Más Vendido">Más Vendido</option>
							<option value="Agotado">Agotado</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">
							{editData ? 'Cambiar Imagen (Opcional)' : 'Imagen de la Bebida'}
						</label>
						<input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="w-full px-2 py-1.5 border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 text-gray-600 text-sm"
							required={!editData} 
						/>
					</div>

					<div className="flex gap-3 pt-4 border-t border-gray-100">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
						>
							{editData ? 'Actualizar Cambios' : 'Guardar Bebida'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default AddDrinkModal