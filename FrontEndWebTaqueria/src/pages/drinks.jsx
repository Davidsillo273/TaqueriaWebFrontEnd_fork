import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import StatCard from '../components/dashboard/StatCard'
import DrinkCard from '../components/drinks/DrinkCard'
import AddDrinkModal from '../components/drinks/AddDrinkModal'
import FAIcon from '../components/commons/FAIcon'
import useDrinks from '../hooks/useDrinks'

export default function Drinks() {
	const [activeMenu] = useState('drinks')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedDrink, setSelectedDrink] = useState(null) // Si tiene datos, es modo Edición
	
	const { drinks, loading, error, addDrink, updateDrink, deleteDrink } = useDrinks()

	// Cálculos en tiempo real basados en MongoDB
	const totalDrinksInCatalog = drinks.length
	const criticalStockCount = drinks.filter(drink => drink.stock < 10).length
	const currentMostSold = drinks.find(drink => drink.isMostSold)?.title || 'Ninguna'

	{/* Resumen de Ventas 
	const [salesSummary] = useState({
		totalSales: '$51,450,000',
		salesPercentage: '65% de las ventas diarias',
	})
*/}

	const handleOpenCreateModal = () => {
		setSelectedDrink(null)
		setIsModalOpen(true)
	}

	const handleOpenEditModal = (drink) => {
		setSelectedDrink(drink)
		setIsModalOpen(true)
	}

	const handleSaveDrink = async (formData) => {
		let success = false
		if (selectedDrink) {
			// Si estábamos editando, llamamos al PUT
			success = await updateDrink(selectedDrink.id, formData)
		} else {
			// Si era nuevo, llamamos al POST
			success = await addDrink(formData)
		}

		if (success) {
			setIsModalOpen(false)
			setSelectedDrink(null)
		}
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
								<p className="text-gray-600">Gestión de inventario en tiempo real</p>
							</div>
							<button
								onClick={handleOpenCreateModal}
								className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
							>
								<FAIcon icon="plus" />
								Nueva Bebida
							</button>
						</div>

						{/* Estados Async */}
						{loading && <p className="text-red-600 font-semibold animate-pulse mb-4">Sincronizando con el servidor...</p>}
						{error && <p className="text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg mb-4">Aviso: {error}</p>}

						{/* Estadísticas Dinámicas */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<StatCard icon="wine-glass" title="Total de Bebidas" value={totalDrinksInCatalog.toString()} change="En catálogo" />
							<StatCard 
								icon="exclamation-triangle" 
								title="Stock Crítico" 
								value={criticalStockCount < 10 ? `0${criticalStockCount}` : criticalStockCount.toString()} 
								change="Menos de 10 uds" 
								alert={criticalStockCount > 0} 
							/>
							<StatCard icon="chart-line" title="Más Vendida" value={currentMostSold} change="Destacado" />
						</div>

						{/* Catálogo */}
						<div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
							<div className="lg:col-span-3">
								<div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 min-h-[400px]">
									<h2 className="text-lg font-bold text-gray-900 mb-6">Todas las Bebidas</h2>
									{drinks.length === 0 && !loading ? (
										<p className="text-gray-400 text-center py-12">No hay bebidas registradas en este momento.</p>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{drinks.map((drink) => (
												<DrinkCard 
													key={drink.id} 
													{...drink} 
													onEdit={handleOpenEditModal} 
													onDelete={deleteDrink} 
												/>
											))}
										</div>
									)}
								</div>
							</div>

							{/* Sidebar de Resumen 
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
											<p className="text-gray-900 font-semibold">{currentMostSold}</p>
										</div>
									</div>
								</div>
							</div>
							*/}
						</div>
					</div>
				</main>
			</div>

			<AddDrinkModal 
				isOpen={isModalOpen} 
				onClose={() => { setIsModalOpen(false); setSelectedDrink(null); }} 
				onSave={handleSaveDrink}
				editData={selectedDrink}
			/>
		</div>
	)
}