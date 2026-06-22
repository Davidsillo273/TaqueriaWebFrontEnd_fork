import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import ExtraCard from '../components/extras/ExtraCard'
import ExtraStats from '../components/extras/ExtraStats'
import AddExtraModal from '../components/extras/AddExtraModal'
import FAIcon from '../components/commons/FAIcon'
import PrimaryButton from '../components/commons/PrimaryButton'

export default function Extras() {
	const [activeMenu] = useState('extras')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingExtra, setEditingExtra] = useState(null)
	const [extras, setExtras] = useState([
		{
			id: 1,
			image: 'https://images.unsplash.com/photo-1589985643453-d5eaa7e62eac?w=300&h=300&fit=crop',
			name: 'Queso Cheddar',
			price: '$1.50',
			description: 'Queso Cheddar madurado tipo gourmet.',
			availability: 'DISPONIBLE',
		},
		{
			id: 2,
			image: 'https://images.unsplash.com/photo-1585238341710-4913001fd63d?w=300&h=300&fit=crop',
			name: 'Tocineta Ahumada',
			price: '$2.00',
			description: 'Dos tiras crujientes de tocineta ahumada al manzano.',
			availability: 'DISPONIBLE',
		},
		{
			id: 3,
			image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
			name: 'Salsa Especial',
			price: '$0.75',
			description: 'Nuestra receta secreta de la casa con especias naturales.',
			availability: 'DISPONIBLE',
		},
		{
			id: 4,
			image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd33fbe?w=300&h=300&fit=crop',
			name: 'Jalapenos',
			price: '$1.00',
			description: 'Rodajas de jalapeno fresco encurtido con un toque picante.',
			availability: 'AGOTADO',
		},
	])

	const handleAddExtra = (formData) => {
		if (editingExtra) {
			setExtras(extras.map(extra =>
				extra.id === editingExtra.id ? { ...extra, ...formData } : extra
			))
			setEditingExtra(null)
		} else {
			const newExtra = {
				id: Math.max(...extras.map(e => e.id), 0) + 1,
				...formData,
			}
			setExtras([...extras, newExtra])
		}
		setIsModalOpen(false)
	}

	const handleEditExtra = (extra) => {
		setEditingExtra(extra)
		setIsModalOpen(true)
	}

	const handleDeleteExtra = (extraId) => {
		setExtras(extras.filter(extra => extra.id !== extraId))
	}

	const handleOpenNewModal = () => {
		setEditingExtra(null)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setEditingExtra(null)
	}

	// Stats calculations
	const totalExtras = extras.length
	const mostRequestedExtra = 'Queso Cheddar'
	const lowInventoryCount = extras.filter(e => e.availability === 'AGOTADO').length

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
								<h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Extras</h1>
								<p className="text-gray-600">Controla los complementos y adicionales disponibles en el menu.</p>
							</div>
							<div className="flex gap-3">
								<button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
									<FAIcon icon="download" size="sm" />
									Descargar Reporte
								</button>
								<button
									onClick={handleOpenNewModal}
									className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
								>
									<FAIcon icon="plus" size="sm" />
									Nuevo Extra
								</button>
							</div>
						</div>

						{/* Stats Cards */}
						<ExtraStats
							totalExtras={totalExtras}
							mostRequestedExtra={mostRequestedExtra}
							lowInventoryCount={lowInventoryCount}
						/>

						{/* Extras Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{extras.map(extra => (
								<ExtraCard
									key={extra.id}
									image={extra.image}
									title={extra.name}
									price={extra.price}
									description={extra.description}
									availability={extra.availability}
									onEdit={() => handleEditExtra(extra)}
									onDelete={() => handleDeleteExtra(extra.id)}
								/>
							))}
						</div>

						{/* Empty State */}
						{extras.length === 0 && (
							<div className="text-center py-12">
								<FAIcon icon="inbox" size="3xl" className="text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-600 mb-2">No hay extras disponibles</h3>
								<p className="text-gray-500 mb-6">Crea tu primer extra para empezar</p>
								<button
									onClick={handleOpenNewModal}
									className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
								>
									Crear Extra
								</button>
							</div>
						)}
					</div>
				</main>
			</div>

			{/* Modal */}
			<AddExtraModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onAdd={handleAddExtra}
				editingExtra={editingExtra}
			/>
		</div>
	)
}
