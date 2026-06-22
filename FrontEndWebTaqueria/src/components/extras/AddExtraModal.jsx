import React, { useState, useEffect } from 'react'
import FAIcon from '../commons/FAIcon'

const AddExtraModal = ({ isOpen, onClose, onAdd, editingExtra = null }) => {
	const [formData, setFormData] = useState({
		name: '',
		price: '',
		description: '',
		image: '',
		availability: 'DISPONIBLE'
	})

	useEffect(() => {
		if (editingExtra) {
			setFormData(editingExtra)
		} else {
			setFormData({
				name: '',
				price: '',
				description: '',
				image: '',
				availability: 'DISPONIBLE'
			})
		}
	}, [editingExtra, isOpen])

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleImageChange = (e) => {
		const file = e.target.files[0]
		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setFormData(prev => ({
					...prev,
					image: reader.result
				}))
			}
			reader.readAsDataURL(file)
		}
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		if (formData.name && formData.price && formData.image) {
			onAdd(formData)
			setFormData({
				name: '',
				price: '',
				description: '',
				image: '',
				availability: 'DISPONIBLE'
			})
			onClose()
		} else {
			alert('Por favor completa todos los campos requeridos (Nombre, Precio e Imagen)')
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
					<h2 className="text-xl font-bold text-gray-900">
						{editingExtra ? 'Editar Extra' : 'Nuevo Extra'}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 transition-colors"
					>
						<FAIcon icon="times" size="lg" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					{/* Image Upload */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Imagen del Extra
						</label>
						<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
							<input
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								className="hidden"
								id="imageInput"
							/>
							<label htmlFor="imageInput" className="cursor-pointer block">
								{formData.image ? (
									<div className="space-y-2">
										<img 
											src={formData.image} 
											alt="Preview" 
											className="w-full h-32 object-cover rounded"
										/>
										<p className="text-xs text-gray-500">Click para cambiar imagen</p>
									</div>
								) : (
									<div className="space-y-2">
										<FAIcon icon="cloud-upload-alt" size="lg" className="text-gray-400 mx-auto" />
										<p className="text-sm text-gray-600">Selecciona una imagen</p>
									</div>
								)}
							</label>
						</div>
					</div>

					{/* Name */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nombre del Extra
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Ej: Queso Cheddar"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
							required
						/>
					</div>

					{/* Price */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Precio
						</label>
						<input
							type="text"
							name="price"
							value={formData.price}
							onChange={handleChange}
							placeholder="Ej: $1.50"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
							required
						/>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Descripción
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Describe el extra..."
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
							rows="3"
						/>
					</div>

					{/* Availability */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Disponibilidad
						</label>
						<select
							name="availability"
							value={formData.availability}
							onChange={handleChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
						>
							<option value="DISPONIBLE">Disponible</option>
							<option value="AGOTADO">Agotado</option>
						</select>
					</div>

					{/* Buttons */}
					<div className="pt-4 space-y-2">
						<button
							type="submit"
							className="w-full text-white font-semibold py-3 rounded-md shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
							style={{ background: 'linear-gradient(180deg,#c71b1b,#b10f0f)' }}
						>
							{editingExtra ? 'Actualizar Extra' : 'Agregar Extra'}
						</button>
						<button
							type="button"
							onClick={onClose}
							className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition-colors"
						>
							Cancelar
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default AddExtraModal
