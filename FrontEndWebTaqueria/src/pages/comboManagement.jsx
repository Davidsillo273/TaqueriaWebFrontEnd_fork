import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import ComboCard from '../components/dashboard/ComboCard'
import ComboStats from '../components/dashboard/ComboStats'
import AddComboModal from '../components/dashboard/AddComboModal'
import FAIcon from '../components/commons/FAIcon'
import { useCombos } from '../hooks/useCombos'

export default function ComboManagement() {
  const [activeMenu] = useState('orders')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCombo, setSelectedCombo] = useState(null)
  
  const { combos, loading, error, addCombo, updateCombo, deleteCombo } = useCombos()

  const handleOpenAddModal = () => {
    setSelectedCombo(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (combo) => {
    setSelectedCombo(combo) 
    setIsModalOpen(true)
  }

  const handleSaveCombo = async (formData, id) => {
    try {
      if (id) {
        await updateCombo(id, formData)
      } else {
        await addCombo(formData)
      }
      setIsModalOpen(false)
      setSelectedCombo(null)
    } catch (err) {
      console.error('Error al guardar el combo:', err)
    }
  }

  const handleDeleteCombo = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este combo?')) {
      try {
        await deleteCombo(id)
      } catch (err) {
        console.error('Error al eliminar combo:', err)
      }
    }
  }

  const formatComboForDisplay = (combo) => ({
    id: combo._id,
    image: combo.image || 'https://via.placeholder.com/300x200?text=Combo',
    title: combo.name || 'Sin nombre',
    price: `$${(combo.price || 0).toFixed(2)}`,
    description: combo.description || 'Sin descripción',
    isMostSold: false,
    isAvailable: combo.status === 'available',
  })

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeMenu={activeMenu} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de combos</h1>
                <p className="text-gray-600">Administra el menú de la taqueria fusionando platillos y bebidas.</p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                disabled={loading}
              >
                <FAIcon icon="plus" />
                Nuevo combo
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <ComboStats icon="list" title="TOTAL COMBOS" value={loading ? '...' : combos.length} label={`${combos.length} combos registrados`} highlighted={true} />
              {/*<ComboStats icon="star" title="COMBO MÁS VENDIDO" value={combos[0]?.name || 'N/A'} label="Destacado" highlighted={true} />*/}
              <ComboStats icon="check-circle" title="COMBOS DISPONIBLES" value={loading ? '...' : combos.filter(c => c.status === 'available').length} label={`${combos.filter(c => c.status === 'available').length} combos disponibles`} highlighted={true} />
             {/* <ComboStats icon="chart-bar" title="MEJOR CLASIFICACIÓN" value="4.8 / 5.0" label="Basado en reseñas" highlighted={false} /> */}
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Cargando combos...</span>
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {combos.map((combo) => (
                  <ComboCard 
                    key={combo._id} 
                    {...formatComboForDisplay(combo)}
                    onEdit={() => handleOpenEditModal(combo)}
                    onDelete={() => handleDeleteCombo(combo._id)}
                  />
                ))}
              </div>
            )}

            {!loading && combos.length === 0 && !error && (
              <div className="text-center py-12">
                <FAIcon icon="inbox" size="3xl" className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No hay combos agregados</p>
                <p className="text-gray-400 text-sm mb-4">Haz click en "Nuevo combo" para crear uno</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <AddComboModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedCombo(null); }} 
        onSave={handleSaveCombo}
        loading={loading}
        comboToEdit={selectedCombo}
      />
    </div>
  )
}