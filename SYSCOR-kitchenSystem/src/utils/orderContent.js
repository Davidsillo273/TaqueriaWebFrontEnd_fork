// Qué lleva una comanda, visto desde cocina: a qué estación va cada
// producto, cuánto trabajo representa y su receta (modo "con detalles").
//
// Los productos del pedido solo traen nombre, tipo y cantidad (así quedan
// "congelados" en el backend). La categoría y la receta salen del catálogo
// del menú que carga hooks/useMenuCatalog.js.
import {
  KITCHEN_CATEGORIES,
  CATEGORY_ORDER,
  MIXED_CATEGORY,
  stationForSaucerCategory,
} from '../constants/kitchenCategories';

const idOf = (value) => String(value?._id || value || '');

const unique = (list) => [...new Set(list)];

// Estaciones de los platillos que componen un combo. Si el combo es "a
// elegir", se usan las opciones: el cliente eligió una de ellas.
const comboStations = (combo) => {
  if (!combo) return ['tacos'];
  const saucers = combo.saucers.length ? combo.saucers : combo.options;
  const stations = unique(saucers.map((saucer) => stationForSaucerCategory(saucer.category)));
  return stations.length ? stations : ['tacos'];
};

export const itemStations = (item, catalog) => {
  switch (item.itemType) {
    case 'drink':
      return ['bebidas'];
    case 'extra':
      return ['extras'];
    case 'saucer':
      return [stationForSaucerCategory(catalog.saucers.get(idOf(item.itemId))?.category)];
    case 'combo':
      return comboStations(catalog.combos.get(idOf(item.itemId)));
    default:
      return ['tacos'];
  }
};

/**
 * Estaciones de toda la comanda.
 * @returns {{ stations: object[], isMixed: boolean, primary: object }}
 *   primary es la estación única, o "Pedido mixto" si hay más de una.
 */
export const orderStations = (order, catalog) => {
  const found = new Set();
  for (const item of order.items || []) {
    for (const station of itemStations(item, catalog)) found.add(station);
  }
  const stations = CATEGORY_ORDER.filter((key) => found.has(key)).map((key) => KITCHEN_CATEGORIES[key]);
  const isMixed = stations.length > 1;
  return {
    stations,
    isMixed,
    primary: isMixed ? MIXED_CATEGORY : stations[0] || KITCHEN_CATEGORIES.tacos,
  };
};

// Carga de trabajo de una comanda, para "¿cuál es la orden más pesada?". Un
// combo pesa lo que sus platillos; las bebidas y los extras pesan poco
// porque casi no ocupan la plancha.
export const orderWorkload = (order, catalog) => {
  let dishes = 0;
  let drinks = 0;
  let extras = 0;
  for (const item of order.items || []) {
    const quantity = Number(item.quantity) || 1;
    if (item.itemType === 'drink') drinks += quantity;
    else if (item.itemType === 'extra') extras += quantity;
    else if (item.itemType === 'combo') {
      const combo = catalog.combos.get(idOf(item.itemId));
      const perCombo = combo ? Math.max(1, combo.saucers.length || Math.min(combo.maxPicks || 1, combo.options.length) || 1) : 1;
      dishes += quantity * perCombo;
    } else dishes += quantity;
  }
  return { dishes, drinks, extras, score: dishes * 3 + extras + drinks };
};

// --- Receta (modo "con detalles") ---

const PLURAL_UNITS = { unidad: 'unidades', manojo: 'manojos', pizca: 'pizcas', rebanada: 'rebanadas' };

export const formatAmount = (quantity, unit) => {
  if (quantity === undefined || quantity === null || quantity === '') return unit || '';
  const value = Number(quantity);
  const shown = Number.isInteger(value) ? value : Number(value.toFixed(2));
  const unitLabel = shown !== 1 && PLURAL_UNITS[unit] ? PLURAL_UNITS[unit] : unit || '';
  return `${shown} ${unitLabel}`.trim();
};

const recipeLines = (recipe = []) =>
  recipe
    .filter((ingredient) => ingredient?.name)
    .map((ingredient) => ({ name: ingredient.name, amount: formatAmount(ingredient.quantity, ingredient.unit) }));

const saucerSummary = (saucer) =>
  saucer.category === 'Tacos' && saucer.quantity ? `Orden de ${saucer.quantity} tacos` : null;

/**
 * Desglose para un cocinero nuevo. Devuelve bloques:
 *   [{ title?, note?, lines: [{ name, amount }] }]
 * Un platillo o bebida es un bloque; un combo, un bloque por platillo.
 */
export const itemDetails = (item, catalog) => {
  const id = idOf(item.itemId);

  if (item.itemType === 'saucer') {
    const saucer = catalog.saucers.get(id);
    if (!saucer) return [];
    return [{ note: saucerSummary(saucer), lines: recipeLines(saucer.recipe) }];
  }

  if (item.itemType === 'drink') {
    const drink = catalog.drinks.get(id);
    return drink ? [{ lines: recipeLines(drink.recipe) }] : [];
  }

  if (item.itemType === 'extra') {
    const extra = catalog.extras.get(id);
    return extra ? [{ lines: recipeLines(extra.ingredients) }] : [];
  }

  if (item.itemType === 'combo') {
    const combo = catalog.combos.get(id);
    if (!combo) return [];
    if (combo.saucers.length) {
      return combo.saucers.map((saucer) => ({
        title: saucer.name,
        note: saucerSummary(saucer),
        lines: recipeLines(saucer.recipe),
      }));
    }
    // Combo "a elegir": la elección del cliente viene en las notas del producto
    return [{
      note: `A elegir ${combo.maxPicks || 1} entre: ${combo.options.map((saucer) => saucer.name).join(', ')}`,
      lines: [],
    }];
  }

  return [];
};
