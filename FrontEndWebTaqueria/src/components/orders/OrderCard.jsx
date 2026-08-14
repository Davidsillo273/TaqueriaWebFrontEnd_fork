import React from 'react'
import FAIcon from '../commons/FAIcon'

// Colores/etiquetas de cada estado de un pedido (debe coincidir con el enum
// del backend en orderModel.js). Aplican igual para pedidos locales y online:
// "ready" = listo para salir de cocina (a la mesa o para despacho/recoger),
// "delivered" = ya llegó a su destino final (servido en mesa, entregado a
// domicilio, o recogido por el cliente).
const STATUS_META = {
  pending: { label: 'Pendiente', accent: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 border border-gray-200' },
  preparing: { label: 'En Cocina', accent: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border border-orange-200' },
  atrasado: { label: 'Atrasado', accent: 'bg-red-600', badge: 'bg-red-100 text-red-700 border border-red-200 animate-pulse' },
  ready: { label: 'Listo', accent: 'bg-green-500', badge: 'bg-green-100 text-green-700 border border-green-200' },
  delivered: { label: 'Entregado', accent: 'bg-gray-800', badge: 'bg-gray-200 text-gray-700 border border-gray-300' },
  cancelled: { label: 'Cancelado', accent: 'bg-red-900', badge: 'bg-red-50 text-red-800 border border-red-200' },
}

// Cómo se ve/llama cada tipo de pedido
const ORDER_TYPE_META = {
  local: { label: 'Local', icon: 'utensils', badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  online: { label: 'En línea', icon: 'globe', badge: 'bg-purple-50 text-purple-700 border border-purple-200' },
}

// El texto/ícono del botón de acción cambia no solo por estado, sino también
// por tipo de pedido: pasar de "ready" a "delivered" significa cosas
// distintas según sea local (servir en mesa), a domicilio o para recoger.
const getAction = (pedido) => {
  if (pedido.status === 'pending') return { label: 'Mandar a Cocina', icon: 'utensils' }
  if (pedido.status === 'preparing' || pedido.status === 'atrasado') return { label: 'Marcar como Listo', icon: 'check-circle' }
  if (pedido.status === 'ready') {
    if (pedido.orderType === 'local') return { label: 'Servir en Mesa', icon: 'hand-holding' }
    if (pedido.isDelivery) return { label: 'Marcar Entregado a Domicilio', icon: 'truck' }
    return { label: 'Marcar Recogido por Cliente', icon: 'shopping-bag' }
  }
  return { label: 'Avanzar', icon: 'arrow-right' }
}

// Tarjeta con estilo "recibo de cocina": franja de color por estado, división
// punteada tipo perforación y borde inferior dentado, en vez de un simple
// rectángulo plano.
export default function OrderCard({ pedido, onAdvance, onCancelRequest, onDeleteRequest }) {
  const meta = STATUS_META[pedido.status] || STATUS_META.pending
  const typeMeta = ORDER_TYPE_META[pedido.orderType] || ORDER_TYPE_META.local
  const esFinal = pedido.status === 'delivered' || pedido.status === 'cancelled'
  const codigo = `#${(pedido._id || '').slice(-4).toUpperCase()}`
  const action = getAction(pedido)

  const customerName = pedido.customer?.personalInfo
    ? `${pedido.customer.personalInfo.name || ''} ${pedido.customer.personalInfo.lastname || ''}`.trim()
    : 'Cliente'

  return (
    <div className="relative rounded-t-3xl overflow-hidden bg-white border border-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] hover:scale-[1.01] transition-transform flex flex-col">
      <div className={`h-1.5 w-full ${meta.accent}`} />

      <div className="p-4 sm:p-5 pb-3 flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-gray-900">{codigo}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wide ${typeMeta.badge}`}>
                <FAIcon icon={typeMeta.icon} size="xs" /> {typeMeta.label}
              </span>
            </div>

            {pedido.orderType === 'local' ? (
              <div className="text-xs text-gray-500 font-medium mt-1">
                <FAIcon icon="chair" size="xs" /> {pedido.table?.number ? `Mesa ${pedido.table.number}` : 'Mesa —'}
                {pedido.waiter?.name && (
                  <span className="ml-2"><FAIcon icon="user" size="xs" /> {pedido.waiter.name}</span>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 font-medium mt-1">
                <FAIcon icon="user" size="xs" /> {customerName}
                <span className="ml-2">
                  <FAIcon icon={pedido.isDelivery ? 'truck' : 'shopping-bag'} size="xs" /> {pedido.isDelivery ? 'A domicilio' : 'Para recoger'}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-display font-bold text-sm text-gray-900">${Number(pedido.total).toFixed(2)}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wide ${meta.badge}`}>
              {meta.label}
            </span>
          </div>
        </div>

        {pedido.orderType === 'online' && pedido.isDelivery && pedido.deliveryAddress && (
          <div className="text-[11px] text-gray-400 italic mb-1 truncate">
            <FAIcon icon="map-marker-alt" size="xs" /> {pedido.deliveryAddress}
          </div>
        )}

        {/* Perforación tipo recibo */}
        <div className="border-t-2 border-dashed border-gray-200 my-2" />

        <div className="flex flex-col gap-1 font-mono text-xs text-gray-600">
          {(pedido.items || []).length === 0 ? (
            <span className="text-gray-400 italic">Sin productos</span>
          ) : (
            pedido.items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-0.5">
                <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                {item.notes && <span className="text-gray-400 italic truncate">{item.notes}</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {!esFinal && (
        <div className="px-4 sm:px-5 pb-4 flex gap-2">
          <button
            onClick={() => onAdvance(pedido._id, pedido.status)}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-display font-semibold rounded-xl flex items-center justify-center gap-2 transition-all
              shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
              active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]
            "
          >
            <FAIcon icon={action.icon} />
            {action.label}
          </button>
          <button
            onClick={() => onCancelRequest(pedido)}
            className="px-3 py-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-gray-200"
            title="Cancelar pedido"
          >
            <FAIcon icon="ban" size="sm" />
          </button>
        </div>
      )}

      {esFinal && (
        <div className="px-4 sm:px-5 pb-4">
          <button
            onClick={() => onDeleteRequest(pedido._id)}
            className="w-full py-2 text-xs font-display font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-gray-200"
          >
            <FAIcon icon="trash-alt" size="sm" className="mr-1" /> Eliminar registro
          </button>
        </div>
      )}

      {/* Borde inferior dentado, efecto de recibo cortado */}
      <div
        className="h-3 w-full"
        style={{
          backgroundColor: 'white',
          backgroundImage:
            'linear-gradient(135deg, #f3f0eb 25%, transparent 25%), linear-gradient(225deg, #f3f0eb 25%, transparent 25%)',
          backgroundSize: '16px 16px',
          backgroundPosition: 'bottom left',
        }}
      />
    </div>
  )
}
