import React from 'react'
import FAIcon from '../commons/FAIcon'

export default function OrdersReady({ ordenesListas, alEntregar, onDeleteRequest }) {
  if (ordenesListas.length === 0) {
    return (
      <div className="text-center py-10 font-display font-bold text-gray-400 text-xs uppercase tracking-wider">
        No hay comandas listas para despacho.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {ordenesListas.map((pedido) => (
        <div key={pedido._id} className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 flex flex-col justify-between min-h-[140px] hover:scale-[1.01] transition-transform">
          <div className="flex justify-between items-center mb-2">
            <span className="font-display font-bold text-gray-900">#{pedido._id.slice(-4).toUpperCase()}</span>
            <span className="bg-green-100 text-green-700 text-xs font-display font-bold px-3 py-1 rounded-full border border-green-200 inline-flex items-center gap-1">
              <FAIcon icon="check" size="xs" /> Listo
            </span>
          </div>
          <div className="text-xs text-gray-600 font-medium mb-1">Cliente: {pedido.idCustomer?.name || 'Cliente'}</div>
          <div className="text-xs text-gray-500 mb-3">
            Método Pago: <span className="font-display font-bold text-green-600">{pedido.status === 'paid' ? 'Wompi Pasarela' : 'Efectivo / Pendiente'}</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="text-sm font-display font-bold text-gray-900">${Number(pedido.total).toFixed(2)}</span>
            <div className="flex gap-2">
              <button
                onClick={() => onDeleteRequest(pedido._id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Remover"
              >
                <FAIcon icon="trash-alt" size="sm" />
              </button>
              <button
                onClick={() => alEntregar(pedido._id, pedido.status)}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-display font-semibold rounded-xl hover:bg-black transition-colors
                  shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1)]
                "
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