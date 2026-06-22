import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import StatCard from '../components/dashboard/StatCard'
import DrinkCard from '../components/drinks/DrinkCard'
import AddDrinkModal from '../components/drinks/AddDrinkModal'
import FAIcon from '../components/commons/FAIcon'

export default function Drinks() {
	const [activeMenu] = useState('drinks')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [drinks, setDrinks] = useState([
		{
			id: 1,
			image: 'https://images.unsplash.com/photo-1578270996793-267b8971e738?w=300&h=300&fit=crop',
			title: 'Limonada Natural',
			price: '$3.50',
			stock: 45,
			isMostSold: true,
			isAvailable: true,
		},
		{
			id: 2,
			image: 'https://images.unsplash.com/photo-1622281273982-a69f2f1d504b?w=300&h=300&fit=crop',
			title: 'Refresco 500ml',
			price: '$5.20',
			stock: 12,
			isMostSold: false,
			isAvailable: true,
		},
		{
			id: 3,
			image: 'https://images.unsplash.com/photo-1611689260988-c80e73385dd8?w=300&h=300&fit=crop',
			title: 'Batido de Fresa',
			price: '$12.00',
			stock: 18,
			isMostSold: false,
			isAvailable: true,
		},
		{
			id: 4,
			image: 'https://images.unsplash.com/photo-1592534407126-bf86235e4f0e?w=300&h=300&fit=crop',
			title: 'Cerveza Nacional',
			price: '$9.90',
			stock: 0,
			isMostSold: false,
			isAvailable: false,
		},
	])

	const [salesSummary] = useState({
		totalDrinks: 124,
		criticalStock: 8,
		mostSold: 'Limonada Natural',
		totalSales: '$51,450,000',
		salesPercentage: '65% de las ventas diarias',
	})

	const handleAddDrink = (formData) => {
		const newDrink = {
			id: drinks.length + 1,
			...formData,
			price: `$${parseFloat(formData.price).toFixed(2)}`,
			stock: parseInt(formData.stock),
			isMostSold: false,
			isAvailable: parseInt(formData.stock) > 0,
		}
		setDrinks([...drinks, newDrink])
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
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Categoría: Bebidas</h1>
							<p className="text-gray-600">Gestión de inventario y disponibilidad del catálogo</p>
						</div>
						<button
							onClick={() => setIsModalOpen(true)}
							className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
						>
							<FAIcon icon="plus" />
							Nueva Bebida
						</button>
					</div>						{/* Statistics */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<StatCard icon="wine-glass" title="Total de Bebidas" value="124" change="+14% vs ayer" />
							<StatCard icon="exclamation-triangle" title="Stock Crítico" value="08" change="" alert={true} />
							<StatCard icon="chart-line" title="Más Vendida" value="Limonada Natural" change="" />
						</div>

						{/* Main Content */}
						<div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
							{/* Drinks Grid */}
							<div className="lg:col-span-3">
								<div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
									<h2 className="text-lg font-bold text-gray-900 mb-6">Todas las Bebidas</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{drinks.map((drink) => (
											<DrinkCard key={drink.id} {...drink} />
										))}
									</div>
								</div>
							</div>

							{/* Sales Summary Sidebar */}
							<div className="lg:col-span-1">
								<div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
									<h2 className="text-lg font-bold text-gray-900 mb-6">Resumen de Ventas</h2>

									<div className="space-y-6">
										<div>
											<div className="flex items-center gap-3 mb-2">
												<FAIcon icon="wine-glass" className="text-red-600 text-2xl" />
												<span className="text-gray-600 text-sm font-medium">Ventas Hoy</span>
											</div>
											<p className="text-2xl font-bold text-gray-900">{salesSummary.totalSales}</p>
											<p className="text-xs text-gray-500 mt-1">{salesSummary.salesPercentage}</p>
										</div>

										<div className="border-t border-gray-200 pt-4">
											<div className="flex items-center gap-2 mb-3">
												<FAIcon icon="fire" className="text-orange-500" />
												<span className="text-gray-600 text-sm font-medium">Más Vendida</span>
											</div>
											<p className="text-gray-900 font-semibold">{salesSummary.mostSold}</p>
										</div>

										<div className="border-t border-gray-200 pt-4">
											<div className="flex items-center gap-2 mb-3">
												<FAIcon icon="box" className="text-yellow-600" />
												<span className="text-gray-600 text-sm font-medium">Artículos en Stock Crítico</span>
											</div>
											<p className="text-2xl font-bold text-red-600">{salesSummary.criticalStock}</p>
											<p className="text-xs text-gray-500 mt-1">Artículos por debajo de 10 unidades</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>

			<AddDrinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddDrink} />
		</div>
	)
}
