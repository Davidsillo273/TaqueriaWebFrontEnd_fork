// Estaciones de cocina y su color.
//
// El menú tiene muchas categorías de platillo (las mismas del backend,
// utils/saucers/saucerCategoriesUtils.js); a cocina le sirven agrupadas por
// quién las prepara. Cada estación tiene un color fijo (tokens --cat-* de
// index.css), que es el que lleva el borde del ticket.
//
// Si una comanda junta productos de varias estaciones es un "Pedido mixto":
// el borde se divide en franjas con el color de cada una y aparece la
// etiqueta MIXTO.
export const KITCHEN_CATEGORIES = {
  tacos: { key: 'tacos', label: 'Tacos y carnes', short: 'Tacos', color: 'var(--cat-tacos)' },
  antojitos: { key: 'antojitos', label: 'Antojitos y sopas', short: 'Antojitos', color: 'var(--cat-antojitos)' },
  postres: { key: 'postres', label: 'Postres', short: 'Postres', color: 'var(--cat-postres)' },
  bebidas: { key: 'bebidas', label: 'Bebidas', short: 'Bebidas', color: 'var(--cat-bebidas)' },
  extras: { key: 'extras', label: 'Extras', short: 'Extras', color: 'var(--cat-extras)' },
};

export const MIXED_CATEGORY = { key: 'mixto', label: 'Pedido mixto', short: 'Mixto', color: 'var(--cat-mixto)' };

// Orden en que se muestran las franjas y la leyenda
export const CATEGORY_ORDER = ['tacos', 'antojitos', 'postres', 'bebidas', 'extras'];

// Categoría de platillo (Saucers.category) -> estación
const SAUCER_CATEGORY_TO_STATION = {
  Tacos: 'tacos',
  Burritos: 'tacos',
  Tortas: 'tacos',
  Quesadillas: 'tacos',
  'A la plancha': 'tacos',
  Alitas: 'tacos',
  Especiales: 'tacos',
  Antojitos: 'antojitos',
  Nachos: 'antojitos',
  Sopas: 'antojitos',
  Postres: 'postres',
};

// Un platillo sin categoría conocida (o que ya no está activo en el menú) se
// trata como plato fuerte: es lo más común y lo que más tiempo toma.
export const stationForSaucerCategory = (category) => SAUCER_CATEGORY_TO_STATION[category] || 'tacos';
