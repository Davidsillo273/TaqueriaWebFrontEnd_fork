import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import ExtraCard from '../components/extras/ExtraCard'
import ExtraStats from '../components/extras/ExtraStats'
import AddExtraModal from '../components/extras/AddExtraModal'
import FAIcon from '../components/commons/FAIcon'
import useExtras from '../hooks/useExtras'

export default function Extras() {
	const [activeMenu] = useState('extras')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingExtra, setEditingExtra] = useState(null)
	
	const { extras, loading, error, addExtra, updateExtra, deleteExtra } = useExtras();

	const handleAddOrUpdateExtra = async (formData) => {
		// Formateamos el precio para asegurarnos de enviar un Number puro al backend
		const cleanPrice = parseFloat(String(formData.price).replace(/[^0-9.]/g, ''));

		const payload = {
			name: formData.name,
			price: cleanPrice,
			status: formData.status
		};

		let result;
		if (editingExtra) {
			result = await updateExtra(editingExtra._id, payload);
		} else {
			result = await addExtra(payload);
		}

		if (result.success) {
			setIsModalOpen(false);
			setEditingExtra(null);
		} else {
			alert('Error: ' + result.message);
		}
	}

	const handleEditExtra = (extra) => {
		setEditingExtra(extra)
		setIsModalOpen(true)
	}

	const handleDelete = async (extraId) => {
		if (window.confirm('¿Estás seguro de eliminar este extra?')) {
			const result = await deleteExtra(extraId);
			if (!result.success) alert('No se pudo eliminar el extra');
		}
	}

	const handleOpenNewModal = () => {
		setEditingExtra(null)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setEditingExtra(null)
	}

	const totalExtras = extras.length
	const lowInventoryCount = extras.filter(e => e.status === 'AGOTADO').length

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
								<h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de extras</h1>
								<p className="text-gray-600">Controla los acompañamientos extras disponibles en el menú.</p>
							</div>
							<div className="flex gap-3">
								<button
									onClick={handleOpenNewModal}
									className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
								>
									<FAIcon icon="plus" size="sm" />
									Nuevo extra
								</button>
							</div>
						</div>

						{/* Estadísticas */}
						<ExtraStats
							totalExtras={totalExtras}
							mostRequestedExtra={extras[0]?.name || "N/A"}
							lowInventoryCount={lowInventoryCount}
						/>

						{/* Mensajes de error o carga */}
						{loading && <p className="text-center text-gray-600 font-medium py-4">Cargando extras...</p>}
						{error && <p className="text-center text-red-600 font-medium py-4">Error: {error}</p>}

						{/* Grilla de Extras */}
						{!loading && (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
								{extras.map(extra => (
									<ExtraCard
										key={extra._id}
										title={extra.name}
										price={`$${extra.price}`}
										status={extra.status}
										onEdit={() => handleEditExtra(extra)}
										onDelete={() => handleDelete(extra._id)}
									/>
								))}
							</div>
						)}

						{/* Estado Vacío */}
						{!loading && extras.length === 0 && (
							<div className="text-center py-12">
								<FAIcon icon="inbox" size="3xl" className="text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-600 mb-2">No hay extras disponibles</h3>
								<p className="text-gray-500 mb-6">Crea tu primer extra para empezar</p>
								<button
									onClick={handleOpenNewModal}
									className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
								>
									Crear extra
								</button>
							</div>
						)}
					</div>
				</main>
			</div>

			<AddExtraModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onAdd={handleAddOrUpdateExtra}
				editingExtra={editingExtra}
			/>
		</div>
	)
}