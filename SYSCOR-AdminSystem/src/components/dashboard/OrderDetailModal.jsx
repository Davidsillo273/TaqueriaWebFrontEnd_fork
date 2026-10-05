// src/components/dashboard/OrderDetailModal.jsx
import React from 'react';
import FAIcon from '@syscor/web-shared/src/components/FAIcon';
import { ModalShell, ModalHeader, ModalBody, ModalFooter, FormSection, MODAL_BTN_PRIMARY } from '@syscor/web-shared/src/components/FormModal';
import { orderCode } from '@syscor/web-shared/src/utils/orderCode';

const STATUS_CONFIG = {
  delivered: {
    label: 'Completado',
    bg: 'bg-oksoft text-ok border-ok/30',
    icon: 'circle-check',
  },
  ready: {
    label: 'Listo',
    bg: 'bg-infosoft text-info border-info/40',
    icon: 'bell',
  },
  preparing: {
    label: 'Preparando',
    bg: 'bg-warnsoft text-warn border-warn/30',
    icon: 'fire-burner',
  },
  atrasado: {
    label: 'Atrasado',
    bg: 'bg-acsoft text-ac border-acline animate-pulse',
    icon: 'triangle-exclamation',
  },
  pending: {
    label: 'Pendiente',
    bg: 'bg-warnsoft text-warn border-warn/30',
    icon: 'clock',
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'bg-page text-muted border-line',
    icon: 'ban',
  },
};

const PAYMENT_METHOD_LABELS = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  card_on_delivery: 'Tarjeta contraentrega',
  online: 'Pagado en línea',
};

const PAYMENT_STATUS_CONFIG = {
  paid: {
    label: 'Pagado',
    bg: 'bg-oksoft text-ok border-ok/30',
    icon: 'circle-check',
  },
  pending: {
    label: 'Pendiente',
    bg: 'bg-warnsoft text-warn border-warn/30',
    icon: 'clock',
  },
};

const InfoRow = ({ label, value, icon, iconColor = 'text-muted' }) => (
  <div className="flex items-start gap-3 py-2.5">
    {icon && (
      <span className={`w-4 text-center mt-0.5 shrink-0 ${iconColor}`}>
        <FAIcon icon={icon} size="sm" />
      </span>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold text-muted tracking-wide uppercase mb-0.5">{label}</p>
      <p className="text-[13.5px] font-medium text-ink break-words">{value || '—'}</p>
    </div>
  </div>
);

// Cada bloque del detalle es una tarjeta de sección igual a las de la ficha
// del empleado; el ícono sale del título para no repetirlo en cada llamada.
const SECTION_ICONS = {
  'ESTADO DEL PEDIDO': 'clock',
  'INFORMACIÓN DE CONTACTO': 'user',
  'TIPO DE ENTREGA': 'truck',
  'INFORMACIÓN ADICIONAL': 'circle-info',
  'DETALLE DEL PEDIDO': 'list',
  'PRODUCTOS': 'utensils',
  'INFORMACIÓN DE PAGO': 'receipt',
};

const Section = ({ title, children }) => (
  <FormSection icon={SECTION_ICONS[title] || 'list'} title={title}>
    <div className="divide-y divide-line -mt-1.5">{children}</div>
  </FormSection>
);

const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const isOnline = order.orderType === 'online';
  const orderShortId = orderCode(order);
  const customerName = order.customer?.personalInfo
    ? `${order.customer.personalInfo.name || ''} ${order.customer.personalInfo.lastname || ''}`.trim()
    : (order.localCustomerName || order.customerName || '');
  const contactName = order.contact?.name || customerName;
  const contactLastname = order.contact?.lastname || '';
  const contactEmail = order.contact?.email || order.customer?.loginInfo?.email;
  const waiterName = order.waiter ? `${order.waiter.name || ''} ${order.waiter.lastname || ''}`.trim() : '';

  const status = STATUS_CONFIG[order.status] || {
    label: (order.status || 'Pendiente').toUpperCase(),
    bg: 'bg-warnsoft text-warn border-warn/30',
    icon: 'clock',
  };

  const isPaid = order.paymentStatus === 'paid';
  const paymentStatus = PAYMENT_STATUS_CONFIG[order.paymentStatus] || {
    label: order.paymentStatus || 'Pendiente',
    bg: isPaid ? 'bg-oksoft text-ok border-ok/30' : 'bg-warnsoft text-warn border-warn/30',
    icon: isPaid ? 'circle-check' : 'clock',
  };
  const isCard = order.paymentMethod?.includes('card');
  // Los pedidos que toma el mesero en la app quedan sin método hasta que se
  // cobra la cuenta de la mesa: el método está "por definir".
  const methodPending = !order.paymentMethod;

  return (
    <ModalShell maxWidth="max-w-lg">
      <ModalHeader
        icon="receipt"
        title={`Pedido ${orderShortId}`}
        badge={isOnline ? 'En línea' : 'En local'}
        subtitle={isOnline ? 'Pedido en línea' : 'Pedido en local'}
        onClose={onClose}
      />

      <ModalBody>
          
          {/* 1. Estado del pedido */}
          <Section title="ESTADO DEL PEDIDO">
            <div className="flex items-center justify-between gap-3 py-1 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border ${status.bg}`}>
                <FAIcon icon={status.icon} size="xs" />
                {status.label}
              </span>
              {order.createdAt && (
                <span className="num text-xs text-muted">
                  {new Date(order.createdAt).toLocaleString('es-SV', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              )}
            </div>
          </Section>

          {/* 2. Detalle del pedido */}
          {isOnline ? (
            <>
              <Section title="INFORMACIÓN DE CONTACTO">
                <InfoRow icon="user" iconColor="text-info" label="CLIENTE" value={`${contactName} ${contactLastname}`.trim()} />
                <InfoRow icon="envelope" iconColor="text-info" label="CORREO ELECTRÓNICO" value={contactEmail} />
              </Section>

              <Section title="TIPO DE ENTREGA">
                <InfoRow
                  icon={order.isDelivery ? 'motorcycle' : order.fulfillment === 'dine_in' ? 'chair' : 'store'}
                  iconColor="text-warn"
                  label="MODALIDAD"
                  value={
                    order.isDelivery
                      ? 'Entrega a domicilio'
                      : order.fulfillment === 'dine_in'
                        ? `Comer en el local${order.table?.number ? ` · Mesa ${order.table.number}` : ' · mesa reservada desde la app'}`
                        : 'Para recoger en el local'
                  }
                />
                {order.isDelivery && (
                  <InfoRow icon="location-dot" iconColor="text-ac" label="DIRECCIÓN" value={order.deliveryAddress} />
                )}
                {order.scheduledFor && (
                  <InfoRow
                    icon="calendar-clock"
                    iconColor="text-info"
                    label="PROGRAMADO PARA"
                    value={new Date(order.scheduledFor).toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' })}
                  />
                )}
              </Section>

              {order.receivedBy?.name && (
                <Section title="INFORMACIÓN ADICIONAL">
                  <InfoRow
                    icon="user-group"
                    iconColor="text-ok"
                    label="RECIBE EL PEDIDO"
                    value={`${order.receivedBy.name} ${order.receivedBy.lastname || ''}`.trim()}
                  />
                </Section>
              )}
            </>
          ) : (
            <Section title="DETALLE DEL PEDIDO">
              <InfoRow icon="user" iconColor="text-info" label="CLIENTE / FAMILIA" value={customerName || order.localCustomerName || 'Cliente general'} />
              <InfoRow icon="user-tie" iconColor="text-warn" label="MESERO" value={waiterName || 'Sin asignar'} />
              <InfoRow icon="chair" iconColor="text-ok" label="MESA" value={order.table?.number ? `Mesa ${order.table.number}` : 'Para llevar / Sin mesa'} />
            </Section>
          )}

          {/* 3. Productos */}
          <Section title="PRODUCTOS">
            {(order.items || []).length === 0 ? (
              <p className="text-sm text-muted py-2">Sin productos registrados</p>
            ) : (
              order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 text-[13.5px]">
                  <span className="text-ink font-medium">
                    <span className="num font-bold text-ac mr-1.5">{item.quantity}×</span>
                    {item.name}
                  </span>
                  <span className="num font-semibold text-ink">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))
            )}
            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-acline/70">
              <span className="kick text-ac">TOTAL</span>
              <span className="num text-lg font-bold text-ac">
                ${(Number(order.total) || 0).toFixed(2)}
              </span>
            </div>
          </Section>

          {/* 4. Información de pago */}
          <Section title="INFORMACIÓN DE PAGO">
            {/* Método */}
            <div className="flex items-start gap-3 py-2.5">
              <span className="w-4 text-center mt-0.5 shrink-0 text-info">
                <FAIcon
                  icon={methodPending ? 'hourglass' : isCard ? 'credit-card' : order.paymentMethod === 'online' ? 'globe' : 'money-bill-wave'}
                  size="sm"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-muted tracking-wide uppercase mb-0.5">MÉTODO DE PAGO</p>
                <p className="text-[13.5px] font-medium text-ink">
                  {methodPending ? 'Por definir' : PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-start gap-3">
                <span className={`w-4 text-center mt-0.5 shrink-0 ${isPaid ? 'text-ok' : 'text-warn'}`}>
                  <FAIcon icon={isPaid ? 'circle-check' : 'clock'} size="sm" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-muted tracking-wide uppercase mb-0.5">ESTADO DEL PAGO</p>
                  <p className={`text-[13.5px] font-semibold ${isPaid ? 'text-ok' : 'text-warn'}`}>
                    {paymentStatus.label}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${paymentStatus.bg}`}>
                {paymentStatus.label}
              </span>
            </div>
          </Section>

      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={onClose} className={MODAL_BTN_PRIMARY}>
          Cerrar
        </button>
      </ModalFooter>
    </ModalShell>
  );
};

export default OrderDetailModal;
