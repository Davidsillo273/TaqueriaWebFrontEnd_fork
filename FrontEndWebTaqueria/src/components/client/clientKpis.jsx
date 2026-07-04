import React from 'react'
import FAIcon from '../commons/FAIcon'

const ClientKpis = ({ clients = [] }) => {
  const totalClients = clients.length
  const verifiedClients = clients.filter(c => c.loginInfo?.isVerified).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="bg-white rounded-xl p-4 sm:p-6 border-l-4 border-l-red-600 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase">
            Clientes Totales
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{totalClients}</h3>
          <span className="text-xs text-red-600 font-medium flex items-center gap-1 mt-2">
            Registrados de forma independiente
          </span>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 text-red-600 rounded-xl flex items-center justify-center text-xl">
          <FAIcon icon="users" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 border-l-4 border-l-red-600 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase">
            Cuentas Verificadas
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{verifiedClients}</h3>
          <span className="text-xs text-red-900 font-medium flex items-center gap-1 mt-2">
            Usuarios validados vía email
          </span>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-xl">
          <FAIcon icon="user-check" />
        </div>
      </div>
    </div>
  )
}

export default ClientKpis