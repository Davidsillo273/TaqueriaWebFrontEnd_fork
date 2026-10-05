// Encontrar la comanda de la que habla el cocinero, y nombrarla en voz alta.
import { orderCode } from '@syscor/web-shared/src/utils/orderCode';

const CODE_RE = /^(AD|CL|PL)(\d{2})-(\d{2,3})$/;

export const codeParts = (order) => {
  const match = CODE_RE.exec(orderCode(order));
  return match ? { prefix: match[1], day: Number(match[2]), seq: Number(match[3]) } : null;
};

const tableNumber = (order) => (order.table && typeof order.table === 'object' ? order.table.number : null);

/**
 * Comandas que coinciden con lo que se dijo.
 *
 * "La orden 3" es primero el NÚMERO DE COCINA 3 (el apodo del día que se ve
 * en grande en el ticket, único en el día). Si no hay ninguna con ese
 * número, se busca por el código: ahí sí puede haber varias (CL..-03, AD..-03
 * y PL..-03, cada tipo tiene su contador) y quien llama pide que se aclare.
 */
export const findOrdersByRef = (ref, orders) => {
  if (!ref) return [];
  if (ref.code) return orders.filter((order) => orderCode(order) === ref.code);
  if (ref.table != null) return orders.filter((order) => tableNumber(order) === ref.table);
  if (ref.seq == null) return [];

  if (!ref.prefix) {
    const byKitchenNumber = orders.filter((order) => order.kitchenNumber === ref.seq);
    if (byKitchenNumber.length > 0) return byKitchenNumber;
  }

  const bySeq = orders.filter((order) => {
    const parts = codeParts(order);
    return parts && parts.seq === ref.seq && (!ref.prefix || parts.prefix === ref.prefix);
  });
  if (bySeq.length > 0 || ref.prefix) return bySeq;

  // "La 5" sin más: si no hay orden 5, quizá hablaba de la mesa 5.
  return orders.filter((order) => tableNumber(order) === ref.seq);
};

// Cómo decir una orden: por su número de cocina ("la orden 3"), que es lo que
// se ve en grande en el ticket. Si no tiene (pedidos anteriores a esa
// función), por su código: "la C L 3" (letras separadas para que la voz las
// deletree, y el número sin ceros a la izquierda).
export const spokenCode = (order) => {
  if (order.kitchenNumber) return `la orden ${order.kitchenNumber}`;
  const parts = codeParts(order);
  if (!parts) return `la orden ${orderCode(order)}`;
  return `la ${parts.prefix.split('').join(' ')} ${parts.seq}`;
};

// Y de dónde es, para no confundirla con otra del mismo número
export const spokenContext = (order) => {
  const table = tableNumber(order);
  if (order.orderType === 'local' || table) return table ? `de la mesa ${table}` : 'del local';
  if (order.fulfillment === 'delivery' || (!order.fulfillment && order.isDelivery)) return 'a domicilio';
  if (order.fulfillment === 'dine_in') return 'para comer en el local';
  return 'para llevar';
};

export const spokenOrder = (order) => `${spokenCode(order)} ${spokenContext(order)}`;

// "3 de Taco al pastor, 1 de Horchata"
// --- Lo que lleva una orden, dicho como lo diría una persona ---
//
// Las notas de los productos traen datos que arma el sistema al pagar
// ("Elegido: …", "Bebida: …", "Para: …", "Sin …", separados por " · "). Leídos
// tal cual suenan a robot y repiten todo; aquí se ordenan:
//   "Lleva 5 productos: una Dupla Burritera, con burrito especial y burrito
//    gobernador, y Coca-Cola sin azúcar; una Fiesta Nachera… Extras: 2 de
//    aderezo y 1 de aguacate. Nota: sin hielo."

const joinList = (parts) =>
  parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`;

// "Bebida: Coca-Cola (+$0.50)" -> "Coca-Cola"
const cleanDetail = (text) => text.replace(/\s*\(\+\$[\d.]+\)\s*$/, '').trim();

// Separa las notas de un producto en lo que importa decir
// Devuelve { withParts, withoutParts }: lo que lleva (elegido, bebida, notas
// a mano) y lo que va sin ("sin cebolla", "Taco: sin cilantro").
const describeNotes = (notes = '') => {
  const picks = [];
  const drinks = [];
  const other = [];
  const without = [];
  for (const part of String(notes).split(/\s*·\s*|\s*\.\s+/).map((p) => p.trim()).filter(Boolean)) {
    const [label, ...rest] = part.split(':');
    const value = rest.join(':').trim();
    if (/^elegido$/i.test(label) && value) picks.push(cleanDetail(value).replace(/,\s*/g, ' y '));
    else if (/^bebida$/i.test(label) && value) drinks.push(cleanDetail(value));
    else if (/^para$/i.test(label)) continue; // a qué producto va un extra: ya se dice junto
    else if (/^sin\b|:\s*sin\b/i.test(part)) without.push(part.replace(/^sin\b/i, 'sin'));
    else other.push(part); // notas a mano
  }
  // Primero lo que eligió, luego la bebida y las notas
  return { withParts: [...picks, ...drinks, ...other], withoutParts: without };
};

const amount = (quantity, name) => (quantity === 1 ? name : `${quantity} ${name}`);

export const spokenContents = (order) => {
  const products = [];
  const extras = new Map();

  for (const item of order.items || []) {
    const quantity = Number(item.quantity) || 1;
    if (item.itemType === 'extra') {
      // Los extras se suman por nombre: "Extra aderezo" ×2 -> "2 de aderezo"
      const name = String(item.name || 'extra').replace(/^extra\s+/i, '');
      extras.set(name, (extras.get(name) || 0) + quantity);
      continue;
    }
    const { withParts, withoutParts } = describeNotes(item.notes);
    let line = amount(quantity, item.name || 'producto');
    if (withParts.length) line += `, con ${joinList(withParts)}`;
    if (withoutParts.length) line += `, ${withoutParts.join(', ')}`;
    products.push(line);
  }

  const sentences = [];
  if (products.length) {
    sentences.push(`${products.length === 1 ? 'Lleva' : `Lleva ${products.length} productos:`} ${products.join('; ')}.`);
  }
  if (extras.size) {
    sentences.push(`Extras: ${joinList([...extras].map(([name, count]) => `${count} de ${name}`))}.`);
  }
  if (order.notes?.trim()) sentences.push(`Nota: ${order.notes.trim()}.`);
  return sentences.join(' ') || 'No tiene productos.';
};

// Compatibilidad: lista corta "3 de Taco, 1 de Horchata"
export const spokenItems = (order) =>
  (order.items || []).map((item) => `${Number(item.quantity) || 1} de ${item.name || 'producto'}`).join(', ');
