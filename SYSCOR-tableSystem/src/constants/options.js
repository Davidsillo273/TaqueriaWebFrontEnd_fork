// Opciones de las solicitudes. Las claves son las mismas que espera el
// backend (tableRequestModel: REQUEST_REASONS y PAY_METHODS).

export const PAY_METHODS = {
  cash: { label: 'Efectivo', hint: 'Tu mesero te lleva el cambio.', icon: 'ph-money' },
  card: { label: 'Tarjeta', hint: 'Tu mesero te lleva el POS.', icon: 'ph-credit-card' },
};

export const REASONS = {
  order_more: { label: 'Quiero ordenar algo más', short: 'Ordenar algo más', icon: 'ph-plus-circle' },
  question: { label: 'Tengo una consulta', short: 'Una consulta', icon: 'ph-question' },
  tip: { label: 'Quiero dejarle propina', short: 'Propina', icon: 'ph-coins' },
  other: { label: 'Otra cosa', short: 'Otra cosa', icon: 'ph-chat-circle-dots' },
};
