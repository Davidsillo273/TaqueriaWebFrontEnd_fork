// src/pages/ClientManagement.jsx
import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import ClientKpis from '../components/client/ClientKpis'
import ClientTable from '../components/client/ClientTable'
import ClientDetailModal from '../components/client/ClientDetailModal'
import ClientLeaderboardModal from '../components/client/ClientLeaderboardModal'
import useClients from '../hooks/useClients'
import useCustomerLeaderboard from '../hooks/useCustomerLeaderboard'
import { ToastProvider } from '../components/commons/ToastProvider'

function ClientManagementContent() {
  const [activeMenu] = useState('clients')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewingClient, setViewingClient] = useState(null)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)

  const { clients, isLoading } = useClients()
  const { mostActive, topSpenders, priciestWeek, loading: loadingLeaderboard, fetchLeaderboard } = useCustomerLeaderboard()

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar activeMenu={activeMenu} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1 sm:mb-2">
                Gestión de Clientes
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Base de datos de comensales registrados en la plataforma
              </p>
            </div>

            <ClientKpis clients={clients} onOpenLeaderboard={() => setLeaderboardOpen(true)} />

            <ClientTable
              clients={clients}
              onView={setViewingClient}
              isLoading={isLoading}
            />

            <ClientDetailModal
              isOpen={!!viewingClient}
              onClose={() => setViewingClient(null)}
              client={viewingClient}
            />

            <ClientLeaderboardModal
              isOpen={leaderboardOpen}
              onClose={() => setLeaderboardOpen(false)}
              mostActive={mostActive}
              topSpenders={topSpenders}
              priciestWeek={priciestWeek}
              loading={loadingLeaderboard}
              onOpen={fetchLeaderboard}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ClientManagement() {
  return (
    <ToastProvider>
      <ClientManagementContent />
    </ToastProvider>
  )
}
