import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import DishCard from '../components/dishes/DishCard'
import AddDishModal from '../components/dishes/AddDishModal'
import FAIcon from '../components/commons/FAIcon'
import useSaucers from '../hooks/useSaucers' // Importación del hook personalizado

export default function Dishes() {
	const [activeMenu] = useState('dishes')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingDish, setEditingDish] = useState(null) // Controla si se está editando un platillo

	// Integración del hook personalizado para interactuar con la API del Backend
	const { saucers, loading, error, createSaucer, updateSaucer, deleteSaucer } = useSaucers()

	// Estadísticas calculadas dinámicamente según la información real de la base de datos
	const totalDishes = saucers.length
	const outOfStockDishes = saucers.filter(dish => dish.status === 'AGOTADO').length

	const handleSaveDish = async (formData) => {
		let result;
		if (editingDish) {
			// Si existe un platillo en edición, se envía la petición PUT
			result = await updateSaucer(editingDish._id, formData)
		} else {
			// Si no, se procesa una petición POST para un nuevo platillo
			result = await createSaucer(formData)
		}

		if (result.success) {
			setIsModalOpen(false)
			setEditingDish(null)
		} else {
			alert('Hubo un error al procesar la operación: ' + result.error)
		}
	}

	const handleDelete = async (id) => {
		if (window.confirm('¿Estás seguro de que deseas eliminar este platillo?')) {
			const result = await deleteSaucer(id)
			if (!result.success) {
				alert('No se pudo eliminar el platillo: ' + result.error)
			}
		}
	}

	const handleEditClick = (dish) => {
		setEditingDish(dish)
		setIsModalOpen(true)
	}

	const handleOpenNewModal = () => {
		setEditingDish(null)
		setIsModalOpen(true)
	}

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar activeMenu={activeMenu} />

			<div className="flex-1 flex flex-col">
				<TopBar />

				<main className="flex-1 overflow-y-auto">
					<div className="p-8">
						{/* Header */}
						<div className="mb-8 flex items-center justify-between">
							<div>
								<h1 className="text-3xl font-bold text-gray-900 mb-2">GESTIÓN DE PLATILLOS</h1>
								<p className="text-gray-600">Administra el menú de carnes y disponibilidad en tiempo real.</p>
							</div>
							<button
								onClick={handleOpenNewModal}
								className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
							>
								<FAIcon icon="plus" />
								Nuevo Platillo
							</button>
						</div>

						{/* Mensaje de error si la API falla */}
						{error && (
							<div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg font-medium">
								Error de conexión: {error}
							</div>
						)}

						{/* Statistics */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<div className="bg-white rounded-lg p-6 border-l-4 border-red-600 shadow-sm">
								<div className="flex items-start justify-between mb-3">
									<FAIcon icon="utensils" size="2xl" className="text-red-600" />
								</div>
								<p className="text-gray-600 text-sm mb-2">TOTAL PLATILLOS</p>
								<h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : totalDishes}</h3>
							</div>

							<div className="bg-white rounded-lg p-6 border-l-4 border-red-600 shadow-sm">
								<div className="flex items-start justify-between mb-3">
									<FAIcon icon="star" size="2xl" className="text-red-600" />
								</div>
								<p className="text-gray-600 text-sm mb-2">PLATO ESTRELLA</p>
								<h3 className="text-2xl font-bold text-gray-900">Corte Tomahawk</h3>
							</div>

							<div className="bg-white rounded-lg p-6 border-l-4 border-red-600 shadow-sm">
								<div className="flex items-start justify-between mb-3">
									<FAIcon icon="exclamation-triangle" size="2xl" className="text-red-600" />
								</div>
								<p className="text-gray-600 text-sm mb-2">PLATILLOS AGOTADOS</p>
								<h3 className="text-3xl font-bold text-red-600">{loading ? '...' : outOfStockDishes}</h3>
							</div>
						</div>

						{/* Dishes Grid */}
						<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
							<h2 className="text-lg font-bold text-gray-900 mb-6">Todos los Platillos</h2>
							
							{loading ? (
								<div className="flex items-center gap-2 text-gray-500 py-4">
									<span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></span>
									Cargando menú desde el servidor...
								</div>
							) : saucers.length === 0 ? (
								<p className="text-gray-500 py-4">No hay platillos registrados en el sistema.</p>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									{saucers.map((dish) => (
										<DishCard 
											key={dish._id}
											image={dish.image} 
											name={dish.name} 
											price={`$${parseFloat(dish.price).toFixed(2)}`} 
											status={dish.status}
											onEdit={() => handleEditClick(dish)}
											onDelete={() => handleDelete(dish._id)}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</main>
			</div>

			{/* Modal de Agregar / Editar */}
			<AddDishModal 
				isOpen={isModalOpen} 
				onClose={() => { setIsModalOpen(false); setEditingDish(null); }} 
				onSave={handleSaveDish}
				dishToEdit={editingDish}
			/>
		</div>
	)
}