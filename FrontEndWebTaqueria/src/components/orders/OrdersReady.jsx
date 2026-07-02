import React from 'react'
import FAIcon from '../commons/FAIcon'

export default function OrdersReady({ ordenesListas, alEntregar, alBorrar }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ordenesListas.length === 0 ? (
                <div className="col-span-2 text-center py-10 font-bold text-gray-400 text-xs uppercase">No hay comandas listas para despacho.</div>
            ) : (
                ordenesListas.map((pedido) => (
                    <div key={pedido._id} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm flex flex-col justify-between min-h-[140px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-900">#{pedido._id.slice(-4).toUpperCase()}</span>
                            <span className="bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                                <FAIcon icon="check" className="mr-1" /> Listo
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium mb-1">Cliente: {pedido.idCustomer?.name || 'Cliente'}</div>
                        
                        {/* Validamos si el estatus viene pagado desde el controlador de Wompi */}
                        <div className="text-xs text-gray-400 mb-3">
                            Metodo Pago: <span className="font-bold text-green-600">{pedido.status === 'paid' ? 'Wompi Pasarela' : 'Efectivo / Pendiente'}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <span className="text-sm font-black text-gray-800">${Number(pedido.total).toFixed(2)}</span>
                            <div className="flex gap-2">
                                {/* Delete por si quieren limpiar el historial */}
                                <button 
                                    onClick={() => {
                                        if (window.confirm("¿Querés remover esta orden del panel?")) {
                                            alBorrar(pedido._id)
                                        }
                                    }}
                                    className="p-1 text-gray-300 hover:text-red-600 bg-transparent border-0 cursor-pointer transition-colors"
                                    title="Remover"
                                >
                                    <FAIcon icon="trash-alt" />
                                </button>
                                
                                {/* Update a delivered */}
                                <button 
                                    onClick={() => alEntregar(pedido._id, pedido.status)}
                                    className="px-3 py-1 bg-gray-900 text-white border-0 font-bold rounded-lg text-[11px] cursor-pointer hover:bg-black transition-colors"
                                >
                                    Entregar Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}