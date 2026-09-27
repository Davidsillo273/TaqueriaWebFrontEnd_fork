// Código de orden de un pedido ("AD27-01", "CL27-01", "PL27-01"). Lo asigna
// el backend al crear el pedido (utils/orders/orderCodeUtils.js) y es el
// mismo que ven la app de clientes y Panchita. El recorte del id es solo
// respaldo para un pedido que por alguna razón no lo traiga.
export const orderCode = (order) =>
  order?.code || order?.orderCode || String(order?._id || order || '').slice(-6).toUpperCase()

export default orderCode
