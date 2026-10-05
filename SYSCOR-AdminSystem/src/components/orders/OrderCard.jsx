import React, { useEffect, useState } from 'react'
import FAIcon from '@syscor/web-shared/src/components/FAIcon'
import { orderCode } from '@syscor/web-shared/src/utils/orderCode'

// Milisegundos que le quedan al cliente para agregar productos a su pedido
// ("Agregar más productos" en la app; mientras, el pedido está en pausa).
// 0 si no está agregando o ya se le acabó el tiempo: el backend lo devuelve
// solo a la cola y avisa por socket.
const holdRemaining = (pedido, now) =>
  pedido.hold?.active && pedido.hold?.until ? Math.max(0, new Date(pedido.hold.until).getTime() - now) : 0

// Cuenta regresiva de la espera, se actualiza cada segundo solo mientras dura.
const useHoldCountdown = (pedido) => {
  const [now, setNow] = useState(() => Date.now())
  const remaining = holdRemaining(pedido, now)
  useEffect(() => {
    if (remaining <= 0) return undefined
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [remaining > 0]) // eslint-disable-line react-hooks/exhaustive-deps
  return remaining
}

// Etiquetas del botón en formato exacto a la imagen de referencia: "Pasar a cocina"
const getAction = (pedido) => {
  if (pedido.status === 'pending') return { label: 'Pasar a cocina' }
  if (pedido.status === 'preparing' || pedido.status === 'atrasado') return { label: 'Marcar como listo' }
  if (pedido.status === 'ready') {
    if (pedido.orderType === 'local' || pedido.fulfillment === 'dine_in') return { label: 'Servir en mesa' }
    if (pedido.isDelivery) return { label: 'Marcar entregado' }
    return { label: 'Marcar recogido' }
  }
  return { label: 'Avanzar' }
}

export default function OrderCard({ pedido, onAdvance, onCancelRequest, onDeleteRequest }) {
  const esFinal = pedido.status === 'delivered' || pedido.status === 'cancelled'
  const codigo = orderCode(pedido)
  const action = getAction(pedido)
  const holdLeft = useHoldCountdown(pedido)
  const enEspera = pedido.status === 'pending' && holdLeft > 0
  // 2º tiempo de una mesa: el mesero lo "marcha" desde su app cuando la mesa
  // termina el 1º. Hasta entonces cocina no lo empieza (el backend lo impide).
  const esperaMesero = pedido.status === 'pending' && !!pedido.waiting
  const bloqueado = enEspera || esperaMesero
  const holdLabel = `${Math.floor(holdLeft / 60000)}:${String(Math.floor((holdLeft % 60000) / 1000)).padStart(2, '0')}`

  const customerName = pedido.customer?.personalInfo
    ? `${pedido.customer.personalInfo.name || ''} ${pedido.customer.personalInfo.lastname || ''}`.trim()
    : (pedido.customerName || 'Cliente')

  // Detalle derecho: "LOCAL · MESA 2" o "EN LÍNEA · SOFÍA MENA"
  // Un pedido en línea para comer en el local lleva mesa cuando el cliente
  // escanea el QR al llegar (ver reservationController en el backend).
  // Ronda 2 = lo que la mesa pidió después; tiempo = sale antes o después.
  const etapa = [
    pedido.round > 1 ? `RONDA ${pedido.round}` : null,
    pedido.course === 1 ? '1ER TIEMPO' : pedido.course === 2 ? '2º TIEMPO' : null,
  ].filter(Boolean).join(' · ')
  const headerDetail = pedido.orderType === 'local'
    ? `LOCAL · MESA ${pedido.table?.number || (pedido.tableNumber ? pedido.tableNumber : '—')}${etapa ? ` · ${etapa}` : ''}`
    : pedido.fulfillment === 'dine_in'
      ? `COMER AQUÍ · ${pedido.table?.number ? `MESA ${pedido.table.number}` : 'POR LLEGAR'} · ${customerName.toUpperCase()}`
      : `EN LÍNEA · ${customerName.toUpperCase()}`

  // Resumen de productos separados por punto medio: "3 quesadillas · 1 horchata"
  const itemsSummary = (pedido.items || []).length > 0
    ? pedido.items.map((item) => {
        const qty = item.quantity ? `${item.quantity} ` : ''
        const name = item.name || item.product?.name || 'Producto'
        // Sumado después con "Agregar más productos" en la app.
        return `${qty}${name}${item.addedAt ? ' (agregado)' : ''}`.trim()
      }).join(' · ')
    : 'Sin productos'

  return (
    <div className={`bg-surface border border-line rounded-none p-5 sm:p-6 flex flex-col justify-between transition-colors hover:border-linealt group w-full ${bloqueado ? 'opacity-60' : ''}`}>
      {esperaMesero && (
        <div className="kick mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 border border-info/40 text-info bg-surfalt w-fit" title="Segundo tiempo: se prepara cuando el mesero lo marche desde su app.">
          <FAIcon icon="pause" size="xs" />
          2º TIEMPO · ESPERA AL MESERO
        </div>
      )}
      {enEspera && (
        <div className="kick mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 border border-warn/40 text-warn bg-warnsoft w-fit" title="El cliente está agregando productos desde la app. Sigue con el siguiente; este vuelve solo a la cola.">
          <FAIcon icon="pause" size="xs" />
          CLIENTE AGREGANDO · <span className="num">{holdLabel}</span>
        </div>
      )}
      <div>
        {/* Cabecera: Código a la izquierda (#D7E1), Detalle a la derecha (LOCAL · MESA 2) */}
        <div className="flex items-center justify-between gap-3">
          <span className="num text-sm sm:text-base text-ink">
            {codigo}
          </span>
          <span className="kick font-normal text-muted">
            {headerDetail}
          </span>
        </div>

        {/* Listado de productos: "3 quesadillas · 1 horchata" */}
        <div className="mt-3.5 mb-6">
          <p className="text-sm font-sans text-inkalt leading-relaxed">
            {itemsSummary}
          </p>

          {pedido.orderType === 'online' && pedido.isDelivery && pedido.deliveryAddress && (
            <p className="text-xs text-muted italic mt-1.5 truncate">
              <FAIcon icon="map-marker-alt" size="xs" className="mr-1" />
              {pedido.deliveryAddress}
            </p>
          )}
        </div>
      </div>

      {/* Línea inferior: separador horizontal, precio ($11.25) y botón [Pasar a cocina] */}
      <div className="pt-4 border-t border-line flex items-center justify-between">
        <span className="num text-base sm:text-lg text-ink">
          ${Number(pedido.total || 0).toFixed(2)}
        </span>

        <div className="flex items-center gap-2">
          {!esFinal && (
            <>
              {/* Botón sutil de cancelar visible al hacer hover */}
              {onCancelRequest && (
                <button
                  type="button"
                  onClick={() => onCancelRequest(pedido)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-muted hover:text-ac transition-opacity"
                  title="Cancelar pedido"
                >
                  <FAIcon icon="times" size="xs" />
                </button>
              )}

              {/* Botón idéntico a la imagen de referencia */}
              <button
                type="button"
                onClick={() => onAdvance(pedido._id, pedido.status)}
                disabled={bloqueado}
                title={enEspera ? 'El cliente está agregando productos a este pedido' : esperaMesero ? 'Se prepara cuando el mesero lo marche' : undefined}
                className="border border-ac text-ac hover:bg-ac hover:text-white px-5 py-2 text-xs sm:text-[13px] font-normal rounded-none transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ac"
              >
                {bloqueado ? 'En espera' : action.label}
              </button>
            </>
          )}

          {esFinal && (
            <button
              type="button"
              onClick={() => onDeleteRequest(pedido._id)}
              className="border border-line text-muted hover:border-ac hover:text-ac px-4 py-2 text-xs sm:text-[13px] font-normal rounded-none transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
