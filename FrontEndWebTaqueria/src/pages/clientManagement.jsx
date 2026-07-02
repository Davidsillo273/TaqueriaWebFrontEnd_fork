import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import ClientKpis from '../components/client/clientKpis'
import ClientTable from '../components/client/clientTable'
import ClientModal from '../components/client/clientModal'
import useClients from '../hooks/useClients'

export default function ClientManagement() {
    const [activeMenu] = useState('clients')
    
    const {
        clients,
        isLoading,
        isModalOpen,
        editingClient,
        handleOpenEdit,
        handleCloseModal,
        fetchClients
    } = useClients()

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeMenu={activeMenu} />

            <div className="flex-1 flex flex-col">
                <TopBar />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-8">
                        
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
                            <p className="text-gray-600">Base de datos de comensales registrados en la plataforma</p>
                        </div>

                        <ClientKpis clients={clients} />

                        <ClientTable 
                            clients={clients}
                            onEdit={handleOpenEdit}
                            isLoading={isLoading}
                        />

                        <ClientModal 
                            isOpen={isModalOpen} 
                            onClose={handleCloseModal} 
                            editingClient={editingClient}
                            onSuccess={fetchClients}
                        />

                    </div>
                </main>
            </div>
        </div>
    )
}