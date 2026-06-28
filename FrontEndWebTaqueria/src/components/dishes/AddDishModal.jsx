import React, { useState, useEffect } from 'react'
import FAIcon from '../commons/FAIcon'

export default function AddDishModal({ isOpen, onClose, onSave, dishToEdit }) {
	const [name, setName] = useState('')
	const [category, setCategory] = useState('Carnes')
	const [price, setPrice] = useState('')
	const [status, setStatus] = useState('Activo')
	const [imageFile, setImageFile] = useState(null) // <--- ESTA ES LA LÍNEA QUE FALTABA

	useEffect(() => {
		if (dishToEdit) {
			setName(dishToEdit.name || '')
			setCategory(dishToEdit.category || 'Carnes')
			setPrice(dishToEdit.price || '')
			setStatus(dishToEdit.status || 'Activo')
			setImageFile(null) 
		} else {
			setName('')
			setCategory('Carnes')
			setPrice('')
			setStatus('Activo')
			setImageFile(null)
		}
	}, [dishToEdit, isOpen])

	if (!isOpen) return null

	const handleSubmit = (e) => {
		e.preventDefault()

		const formData = new FormData()
		formData.append('name', name)
		formData.append('category', category)
		formData.append('price', price)
		formData.append('status', status)
		
		if (imageFile) {
			formData.append('image', imageFile)
		}

		onSave(formData)
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
			<div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
			
			<div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all z-10">
				<div className="bg-gray-900 px-6 py-4 flex items-center justify-between text-white">
					<h2 className="text-xl font-bold">
						{dishToEdit ? 'Editar Platillo' : 'Nuevo Platillo'}
					</h2>
					<button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
						<FAIcon icon="times" size="lg" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Platillo</label>
						<input
							type="text"
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Ej. Corte Tomahawk"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
						<select
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						>
							<option value="Carnes">Carnes</option>
							<option value="Bebidas">Bebidas</option>
							<option value="Combos">Combos</option>
							<option value="Extras">Extras</option>
						</select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
							<input
								type="number"
								step="0.01"
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								placeholder="0.00"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
							<select
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
							>
								<option value="Activo">Activo</option>
								<option value="Inactivo">Inactivo</option>
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Imagen del Platillo {dishToEdit && <span className="text-xs text-gray-400">(Opcional)</span>}
						</label>
						<input
							type="file"
							accept="image/*"
							required={!dishToEdit} 
							className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
							onChange={(e) => setImageFile(e.target.files[0])}
						/>
					</div>

					<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
						>
							{dishToEdit ? 'Actualizar' : 'Guardar'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}