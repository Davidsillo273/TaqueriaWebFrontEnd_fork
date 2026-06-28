import React, { useState, useEffect } from 'react'
import FAIcon from '../commons/FAIcon'

export default function AddDishModal({ isOpen, onClose, onSave, dishToEdit }) {
	const [name, setName] = useState('')
	const [category, setCategory] = useState('')
	const [price, setPrice] = useState('')
	const [status, setStatus] = useState('Activo')
	const [imageFile, setImageFile] = useState(null)

	useEffect(() => {
		if (dishToEdit) {
			setName(dishToEdit.name || '')
			setCategory(dishToEdit.category || '')
			setPrice(dishToEdit.price || '')
			setStatus(dishToEdit.status || 'Activo')
			setImageFile(null) 
		} else {
			setName('')
			setCategory('')
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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			
			{/* CAPA DE FONDO OSCURO COMPLETA */}
			<div 
				className="fixed inset-0 " 
				onClick={onClose}
			></div>
			
			{/* CAJA DEL MODAL BLANCO  */}
			<div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all z-10 border border-gray-100">
				
				{/* HEADER DEL MODAL */}
				<div className="bg-red-600 px-6 py-4 flex items-center justify-between text-white">
					<h2 className="text-xl font-bold tracking-wide">
						{dishToEdit ? 'Editar Platillo' : 'Nuevo Platillo'}
					</h2>
					<button 
						type="button" 
						onClick={onClose} 
						className="text-white opacity-80 hover:opacity-100 transition-opacity p-1"
					>
						<FAIcon icon="times" size="lg" />
					</button>
				</div>

				{/* FORMULARIO */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Platillo</label>
						<input
							type="text"
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Ej. Tacos al Pastor"
						/>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
						<input
							type="text"
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							placeholder="Ej. Tacos, Bebidas, Combos"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Precio ($)</label>
							<input
								type="number"
								step="0.01"
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								placeholder="0.00"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
							<select
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
							>
								<option value="Activo">Activo</option>
								<option value="Inactivo">Inactivo</option>
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">
							Imagen del Platillo {dishToEdit && <span className="text-xs font-normal text-gray-400">(Opcional)</span>}
						</label>
						<input
							type="file"
							accept="image/*"
							required={!dishToEdit} 
							className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
							onChange={(e) => setImageFile(e.target.files[0])}
						/>
					</div>

					{/* BOTONES DE ACCIÓN */}
					<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
						>
							{dishToEdit ? 'Actualizar' : 'Guardar'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}