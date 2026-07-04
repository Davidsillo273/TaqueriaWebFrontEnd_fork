import React, { useState, useEffect } from 'react'
import FAIcon from '../commons/FAIcon'

const AddExtraModal = ({ isOpen, onClose, onAdd, editingExtra = null }) => {
	const [formData, setFormData] = useState({
		name: '',
		price: '',
		status: 'DISPONIBLE'
	})

	useEffect(() => {
		if (editingExtra) {
			setFormData({
				name: editingExtra.name || '',
				price: editingExtra.price || '',
				status: editingExtra.status || 'DISPONIBLE'
			})
		} else {
			setFormData({
				name: '',
				price: '',
				status: 'DISPONIBLE'
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

	const handleSubmit = (e) => {
		e.preventDefault()
		if (formData.name && formData.price) {
			onAdd(formData)
		} else {
			alert('Por favor completa todos los campos requeridos (Nombre, precio y estado).')
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 border border-gray-400 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-6 border-b sticky top-0 bg-red-600">
					<h2 className="text-xl font-bold text-white">
						{editingExtra ? 'Editar extra' : 'Nuevo extra'}
					</h2>
					<button
						onClick={onClose}
						className="text-white hover:text-gray-200 transition-colors"
					>
						<FAIcon icon="times" size="lg" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					{/* Nombre */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nombre del extra
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

					{/* precio */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Precio ($)
						</label>
						<input
							type="number"
							step="0.01"
							name="price"
							value={formData.price}
							onChange={handleChange}
							placeholder="Ej: 1.50"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
							required
						/>
					</div>

					{/* Status */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Estado
						</label>
						<select
							name="status"
							value={formData.status}
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
							className="w-full text-white font-semibold py-3 rounded-md shadow-sm transition-opacity hover:opacity-90"
							style={{ background: 'linear-gradient(180deg,#c71b1b,#b10f0f)' }}
						>
							{editingExtra ? 'Actualizar extra' : 'Agregar extra'}
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