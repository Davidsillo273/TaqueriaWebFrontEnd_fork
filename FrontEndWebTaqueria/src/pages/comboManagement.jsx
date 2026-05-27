import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import ComboCard from '../components/dashboard/ComboCard'
import ComboStats from '../components/dashboard/ComboStats'
import AddComboModal from '../components/dashboard/AddComboModal'
import FAIcon from '../components/FAIcon'

// Página de gestión de combos
export default function ComboManagement() {
	const [activeMenu] = useState('orders')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [combos, setCombos] = useState([
		{
			id: 1,
			image: 'https://via.placeholder.com/300x200?text=Combo+Taquero',
			title: 'Combo Taquero',
			price: '$14.50',
			description: '5 Tacos al Pastor, Cebollitas y Refresco.',
			isMostSold: false,
			isAvailable: true,
		},
		{
			id: 2,
			image: 'https://via.placeholder.com/300x200?text=Fiesta+Mexicana',
			title: 'Fiesta Mexicana',
			price: '$38.00',
			description: '10 Tacos variados, Nachos con Queso y Jarra de Agua Fresca.',
			isMostSold: true,
			isAvailable: true,
		},
		{
			id: 3,
			image: 'https://via.placeholder.com/300x200?text=Burrito+Gigante',
			title: 'Burrito Gigante',
			price: '$16.25',
			description: 'Burrito de Carne Asada, Guacamole y Bebida.',
			isMostSold: false,
			isAvailable: true,
		},
	])

	const handleAddCombo = (formData) => {
		const newCombo = {
			id: combos.length + 1,
			image: formData.image,
			title: formData.title,
			price: `$${parseFloat(formData.price).toFixed(2)}`,
			description: formData.description,
			isMostSold: false,
			isAvailable: true,
		}
		setCombos([...combos, newCombo])
		setIsModalOpen(false)
	}

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar activeMenu={activeMenu} />

			<div className="flex-1 flex flex-col">
				<TopBar />

				<main className="flex-1 overflow-y-auto">
					<div className="p-8">
						{/* Encabezado */}
						<div className="flex items-center justify-between mb-8">
							<div>
								<h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Combos</h1>
								<p className="text-gray-600">Administra el menú de ofertas y paquetes especiales.</p>
							</div>
							<button
								onClick={() => setIsModalOpen(true)}
								className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
							>
								<FAIcon icon="plus" />
								Nuevo Combo
							</button>
						</div>

						{/* Estadísticas de Combos */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
							<ComboStats icon="ban" title="TOTAL COMBOS" value={combos.length} label={`+2 esta semana`} highlighted={false} />
							<ComboStats
								icon="star"
								title="COMBO MÁS VENDIDO"
								value="Combo Al Pastor"
								label="Destacado"
								highlighted={true}
							/>
							<ComboStats
								icon="check-circle"
								title="COMBOS ACTIVOS"
								value={combos.length}
								label="80% del menú"
								highlighted={false}
							/>
							<ComboStats
								icon="chart-bar"
								title="MEJOR CLASIFICACIÓN"
								value="4.8 / 5.0"
								label="Basado en 28 reseñas hoy"
								highlighted={false}
							/>
						</div>

						{/* Grid de Combos */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{combos.map((combo) => (
								<ComboCard key={combo.id} {...combo} />
							))}
						</div>

						{/* Mensaje cuando no hay combos */}
						{combos.length === 0 && (
							<div className="text-center py-12">
								<FAIcon icon="inbox" size="3xl" className="text-gray-400 mx-auto mb-3" />
								<p className="text-gray-500 text-lg">No hay combos agregados</p>
								<p className="text-gray-400 text-sm mb-4">Haz click en "Nuevo Combo" para crear uno</p>
							</div>
						)}
					</div>
				</main>
			</div>

			{/* Modal para agregar combo */}
			<AddComboModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddCombo} />
		</div>
	)
}
