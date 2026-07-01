import React from 'react'
import FAIcon from '../commons/FAIcon'

const ClientKpis = ({ clients = [] }) => {
  const totalClients = clients.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      {/* Caja 1: Totales Reales */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase">Clientes Totales</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalClients}</h3>
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-2">
            <FAIcon icon="arrow-up" /> Activos en Sistema
          </span>
        </div>
        <div className="w-12 h-12 bg-red-50 text-[#AF101A] rounded-xl flex items-center justify-center text-xl">
          <FAIcon icon="users" />
        </div>
      </div>

      {/* Caja 2: Frecuentes (Dato Estático) */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase">Frecuentes (Mes)</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">412</h3>
          <span className="text-xs text-gray-500 flex items-center gap-1 mt-2">
            Mínimo 2 compras
          </span>
        </div>
        <div className="w-12 h-12 bg-red-50 text-[#AF101A] rounded-xl flex items-center justify-center text-xl">
          <FAIcon icon="star" />
        </div>
      </div>

      {/* Caja 3: Nuevos (Dato Estático) */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase">Nuevos Registros</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">86</h3>
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-2">
            <FAIcon icon="user-plus" /> +12% vs ayer
          </span>
        </div>
        <div className="w-12 h-12 bg-red-50 text-[#AF101A] rounded-xl flex items-center justify-center text-xl">
          <FAIcon icon="user-check" />
        </div>
      </div>

    </div>
  )
}

export default ClientKpis;