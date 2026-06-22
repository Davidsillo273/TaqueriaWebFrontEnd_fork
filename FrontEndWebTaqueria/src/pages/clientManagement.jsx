import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import PrimaryButton from '../components/commons/PrimaryButton'
import FAIcon from '../components/commons/FAIcon'

// RUTAS CORREGIDAS: Para entrar correctamente a la subcarpeta client desde pages
import ClientKpis from '../components/client/clientKpis'
import ClientTable from '../components/client/clientTable'
import ClientModal from '../components/client/clientModal'

export default function ClientManagement() {
    const [activeMenu] = useState('clients')
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeMenu={activeMenu} />

            <div className="flex-1 flex flex-col">
                <TopBar />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-8">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
                                <p className="text-gray-600">Administra la base de datos de tus comensales fieles</p>
                            </div>
                            
                            <div className="w-full sm:w-48 text-sm">
                                <PrimaryButton 
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center gap-2 rounded-lg text-white"
                                >
                                    <FAIcon icon="plus" /> Nuevo Cliente
                                </PrimaryButton>
                            </div>
                        </div>

                        <ClientKpis />

                        <ClientTable />

                        <ClientModal 
                            isOpen={isModalOpen} 
                            onClose={() => setIsModalOpen(false)} 
                        />

                    </div>
                </main>
            </div>
        </div>
    )
}