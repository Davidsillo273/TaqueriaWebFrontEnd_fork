import React from 'react'
import FAIcon from '../commons/FAIcon'

const ClientKpis = ({ clients = [] }) => {
  const totalClients = clients.length;
  // Calculamos cuántos tienen sus cuentas ya verificadas por sí mismos en el backend
  const verifiedClients = clients.filter(c => c.loginInfo?.isVerified).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase">Clientes Totales</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalClients}</h3>
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-2">
            Registrados de forma independiente
          </span>
        </div>
        <div className="w-12 h-12 bg-red-50 text-[#AF101A] rounded-xl flex items-center justify-center text-xl">
          <FAIcon icon="users" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase">Cuentas Verificadas</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{verifiedClients}</h3>
          <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-2">
            Usuarios validados vía email
          </span>
        </div>
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
          <FAIcon icon="user-check" />
        </div>
      </div>
    </div>
  )
}

export default ClientKpis;