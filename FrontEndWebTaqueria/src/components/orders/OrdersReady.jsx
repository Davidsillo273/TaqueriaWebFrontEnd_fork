import React from 'react'
import FAIcon from '../commons/FAIcon'

export default function OrdersReady({ ordenesListas, alEntregar, onDeleteRequest }) {
  if (ordenesListas.length === 0) {
    return (
      <div className="text-center py-10 font-bold text-gray-400 text-xs uppercase">
        No hay comandas listas para despacho.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {ordenesListas.map((pedido) => (
        <div key={pedido._id} className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-gray-900">#{pedido._id.slice(-4).toUpperCase()}</span>
            <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
              <FAIcon icon="check" className="mr-1" /> Listo
            </span>
          </div>
          <div className="text-xs text-gray-600 font-medium mb-1">Cliente: {pedido.idCustomer?.name || 'Cliente'}</div>
          <div className="text-xs text-gray-500 mb-3">
            Método Pago: <span className="font-bold text-green-600">{pedido.status === 'paid' ? 'Wompi Pasarela' : 'Efectivo / Pendiente'}</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-900">${Number(pedido.total).toFixed(2)}</span>
            <div className="flex gap-2">
              <button
                onClick={() => onDeleteRequest(pedido._id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Remover"
              >
                <FAIcon icon="trash-alt" />
              </button>
              <button
                onClick={() => alEntregar(pedido._id, pedido.status)}
                className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors"
              >
                Entregar Pedido
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}