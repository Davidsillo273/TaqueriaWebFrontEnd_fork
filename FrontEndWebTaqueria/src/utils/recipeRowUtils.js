// src/utils/recipeRowUtils.js
// Helpers de datos para las filas de receta de RecipeBuilder. Viven en un
// archivo aparte (y no dentro de RecipeBuilder.jsx) para no mezclar
// exports de funciones con el export del componente, lo que rompe Fast Refresh.

// Fila vacía para agregar un nuevo ingrediente
export const createEmptyRecipeRow = () => ({
  key: crypto.randomUUID(),
  name: '',
  tracked: false,
  inventoryId: null,
  removable: false,
  quantity: '',
  unit: 'unidad',
  ingredientCategory: 'Otros',
  isNew: true,
});

// Resuelve una lista de filas de receta al shape que espera el backend,
// creando en Inventario (como pendientes) los ingredientes nuevos marcados
// "guardar en inventario". Se usa en el onSubmit de cada modal.
export const resolveRecipeRows = async ({ rows, quickCreateInsumo, addToast }) => {
  const resolved = [];
  for (const row of rows) {
    if (!row.name.trim()) continue;

    let inventoryId = row.inventoryId;
    if (row.tracked && !inventoryId) {
      const result = await quickCreateInsumo({
        name: row.name,
        unit: row.unit,
        type: row.ingredientCategory || 'Otros',
      });
      if (!result.success) {
        addToast?.(result.message || `No se pudo crear el insumo ${row.name}`, 'error');
        continue;
      }
      inventoryId = result.insumo._id;
    }

    resolved.push({
      name: row.name,
      tracked: row.tracked,
      inventoryId: row.tracked ? inventoryId : null,
      removable: Boolean(row.removable),
      quantity: row.quantity ? Number(row.quantity) : undefined,
      unit: row.unit,
    });
  }
  return resolved;
};

export default { createEmptyRecipeRow, resolveRecipeRows };
