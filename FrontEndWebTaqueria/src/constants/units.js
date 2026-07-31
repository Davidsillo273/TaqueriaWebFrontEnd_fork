// Catálogo de unidades de medida del sistema, espejo exacto del backend
// (src/utils/units/unitsUtils.js). Se usa en todos los <select> de unidad
// para que el front nunca ofrezca una unidad que el backend no reconozca.
export const UNITS_BY_GROUP = {
  peso: ['g', 'kg', 'oz', 'lb'],
  volumen: ['ml', 'l'],
  conteo: ['unidad', 'manojo', 'pizca', 'rebanada'],
};

export const UNIT_LIST = Object.values(UNITS_BY_GROUP).flat();

export const UNIT_LABELS = {
  g: 'g', kg: 'kg', oz: 'oz', lb: 'lb',
  ml: 'ml', l: 'l',
  unidad: 'unidad', manojo: 'manojo', pizca: 'pizca', rebanada: 'rebanada',
};

export const GROUP_LABELS = {
  peso: 'Peso',
  volumen: 'Volumen',
  conteo: 'Conteo',
};

// Categorías fijas para insumos creados al vuelo desde una receta de bebida
export const INGREDIENT_CATEGORIES_DRINKS = ['Frutas', 'Minerales'];
// ...y desde una receta de platillo (todas las categorías de Inventario)
export const INGREDIENT_CATEGORIES_DISHES = ['Aves', 'Carnes', 'Verduras', 'Frutas', 'Minerales', 'Otros'];

// Categorías de materia prima (Inventario > Productos)
export const INVENTORY_CATEGORIES = ['Aves', 'Carnes', 'Verduras', 'Frutas', 'Minerales', 'Otros'];

// Categorías y estados de Activos fijos (Inventario > Activos fijos)
export const ASSET_CATEGORIES = ['Mobiliario', 'Equipo de cocina', 'Electrónica', 'Utensilios', 'Otros'];
export const ASSET_CONDITIONS = ['Nuevo', 'Bueno', 'Regular', 'Dañado', 'De baja'];

export default {
  UNITS_BY_GROUP,
  UNIT_LIST,
  UNIT_LABELS,
  GROUP_LABELS,
  INGREDIENT_CATEGORIES_DRINKS,
  INGREDIENT_CATEGORIES_DISHES,
  INVENTORY_CATEGORIES,
  ASSET_CATEGORIES,
  ASSET_CONDITIONS,
};
