import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import StatCard from '../components/dashboard/StatCard'
import DishCard from '../components/dishes/DishCard'
import AddDishModal from '../components/dishes/AddDishModal'
import FAIcon from '../components/FAIcon'

export default function Dishes() {
	const [activeMenu] = useState('dishes')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [dishes, setDishes] = useState([
		{
			id: 1,
			image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
			title: 'Corte Tomahawk',
			price: '$1,250.00',
			isMostSold: true,
			status: 'DISPONIBLE',
		},
		{
			id: 2,
			image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=300&h=300&fit=crop',
			title: 'Parrillada Mixta',
			price: '$890.00',
			isMostSold: false,
			status: 'DISPONIBLE',
		},
		{
			id: 3,
			image: 'https://images.unsplash.com/photo-1596504335112-f6e0ad7771d7?w=300&h=300&fit=crop',
			title: 'Costillas BBQ',
			price: '$450.00',
			isMostSold: false,
			status: 'DISPONIBLE',
		},
		{
			id: 4,
			image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=300&h=300&fit=crop',
			title: 'Solomillo al Grill',
			price: '$560.00',
			isMostSold: false,
			status: 'AGOTADO',
		},
	])

	const [dishStats] = useState({
		totalDishes: 28,
		criticalAlerts: 4,
		starDish: 'Corte Tomahawk',
		monthlyIncrease: '+2 este mes',
	})

	const handleAddDish = (formData) => {
		const newDish = {
			id: dishes.length + 1,
			...formData,
			price: `$${parseFloat(formData.price).toFixed(2)}`,
			isMostSold: false,
			status: 'DISPONIBLE',
		}
		setDishes([...dishes, newDish])
		setIsModalOpen(false)
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
								onClick={() => setIsModalOpen(true)}
								className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
							>
								<FAIcon icon="plus" />
								Nuevo Platillo
							</button>
						</div>

						{/* Statistics */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<div className="bg-white rounded-lg p-6 border-l-4 border-red-600">
								<div className="flex items-start justify-between mb-3">
									<FAIcon icon="utensils" size="2xl" className="text-red-600" />
									<span className="text-xs font-semibold text-red-600">11</span>
								</div>
								<p className="text-gray-600 text-sm mb-2">TOTAL PLATILLOS DE CARNE</p>
								<h3 className="text-3xl font-bold text-gray-900">{dishStats.totalDishes}</h3>
								<p className="text-xs text-green-600 mt-2">+2 este mes</p>
							</div>

							<div className="bg-white rounded-lg p-6 border-l-4 border-red-600">
								<div className="flex items-start justify-between mb-3">
									<FAIcon icon="star" size="2xl" className="text-red-600" />
									<span className="text-xs font-semibold text-red-600">⭐</span>
								</div>
								<p className="text-gray-600 text-sm mb-2">PLATO ESTRELLA</p>
								<h3 className="text-2xl font-bold text-gray-900">{dishStats.starDish}</h3>
								<p className="text-xs text-gray-600 mt-2">124 órdenes esta semana</p>
							</div>

							<div className="bg-white rounded-lg p-6 border-l-4 border-red-600">
								<div className="flex items-start justify-between mb-3">
									<FAIcon icon="exclamation-triangle" size="2xl" className="text-red-600" />
									<span className="text-xs font-semibold text-red-600">⚠️</span>
								</div>
								<p className="text-gray-600 text-sm mb-2">ALERTAS DE STOCK</p>
								<h3 className="text-3xl font-bold text-red-600">{dishStats.criticalAlerts}</h3>
								<p className="text-xs text-red-600 mt-2">Requiere acción inmediata</p>
							</div>
						</div>

						{/* Dishes Grid */}
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-lg font-bold text-gray-900 mb-6">Todos los Platillos</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
								{dishes.map((dish) => (
									<DishCard key={dish.id} {...dish} />
								))}
							</div>
						</div>
					</div>
				</main>
			</div>

			<AddDishModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddDish} />
		</div>
	)
}
