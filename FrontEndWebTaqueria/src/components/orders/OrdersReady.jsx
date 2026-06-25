import React from 'react'
import FAIcon from '../commons/FAIcon'

export default function OrdersReady() {
    // Datos quemados de ejemplo para los pedidos que ya están listos
    const listos = [
        { id: '#4579', cliente: 'Mesa 2', total: '$18.50', tipo: 'Para comer aquí', hora: 'Hace 2m' },
        { id: '#4578', cliente: 'Sofia L.', total: '$32.00', tipo: 'Para llevar', hora: 'Hace 5m' },
        { id: '#4577', cliente: 'Mesa 5', total: '$14.00', tipo: 'Para comer aquí', hora: 'Hace 10m' },
        { id: '#4576', cliente: 'Carlos M.', total: '$25.50', tipo: 'Entrega a Domicilio', hora: 'Hace 12m' }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {listos.map((pedido) => (
                <div key={pedido.id} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900">{pedido.id}</span>
                        <span className="bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                            <FAIcon icon="check" className="mr-1" /> Listo
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium mb-1">Cliente: {pedido.cliente}</div>
                    <div className="text-xs text-gray-400 mb-3">{pedido.tipo} • {pedido.hora}</div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-sm font-black text-gray-800">{pedido.total}</span>
                        <span className="text-[11px] text-gray-400 font-bold">Completado</span>
                    </div>
                </div>
            ))}
        </div>
    )
}