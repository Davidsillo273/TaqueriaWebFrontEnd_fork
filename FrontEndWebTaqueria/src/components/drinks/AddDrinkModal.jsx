// src/components/drinks/AddDrinkModal.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FAIcon from '../commons/FAIcon';
import ImageCropModal from '../commons/ImageCropModal';
import { useToast } from '../commons/ToastProvider';
import { useInventory } from '../../hooks/useInventory';

const RECIPE_UNITS = ['unidad', 'g', 'kg', 'ml', 'l', 'cucharadita', 'cucharada', 'taza', 'vaso', 'pizca'];
const SUBCATEGORY_SUGGESTIONS = ['Gaseosa', 'Natural', 'Alcohólica', 'Lite', 'Cítrica', 'Caliente', 'Fría'];
// En bebidas los ingredientes nuevos solo se clasifican como Frutas o Minerales
const INGREDIENT_CATEGORIES_DRINKS = ['Frutas', 'Minerales'];

const emptyRecipeRow = () => ({
  key: crypto.randomUUID(),
  name: '',
  tracked: false,
  inventoryId: null,
  quantity: '',
  unit: 'unidad',
  isNew: true,
});

const AddDrinkModal = ({ isOpen, onClose, onSave, editData = null }) => {
  const { addToast } = useToast();
  const { insumos } = useInventory();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      price: '',
      category: 'tercero',
      subcategory: '',
      quantity: '',
      status: 'disponible',
    },
  });

  const category = watch('category');

  const [rawImageFile, setRawImageFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [keepExistingImage, setKeepExistingImage] = useState(true);
  const [recipeRows, setRecipeRows] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (editData) {
      setValue('name', editData.title || '');
      setValue('price', editData.price || '');
      setValue('category', editData.category || 'tercero');
      setValue('subcategory', editData.subcategory || '');
      setValue('quantity', editData.stock ?? '');
      setValue('status', editData.status || 'disponible');
      setRecipeRows(
        (editData.recipe || []).map((item) => ({
          key: crypto.randomUUID(),
          name: item.name || '',
          tracked: Boolean(item.tracked),
          inventoryId: item.inventoryId?._id || item.inventoryId || null,
          quantity: item.quantity ?? '',
          unit: item.unit || 'unidad',
          isNew: false,
        }))
      );
      setKeepExistingImage(true);
    } else {
      reset({ name: '', price: '', category: 'tercero', subcategory: '', quantity: '' });
      setRecipeRows([]);
      setKeepExistingImage(true);
    }
    setImageFile(null);
    setRawImageFile(null);
    setIngredientSearch('');
  }, [editData, isOpen, setValue, reset]);

  if (!isOpen) return null;

  const matchingInsumos = ingredientSearch.trim()
    ? insumos.filter((i) => i.name.toLowerCase().includes(ingredientSearch.trim().toLowerCase()))
    : [];

  const addRow = () => setRecipeRows((rows) => [...rows, emptyRecipeRow()]);
  const removeRow = (key) => setRecipeRows((rows) => rows.filter((r) => r.key !== key));
  const updateRow = (key, patch) =>
    setRecipeRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const pickExistingInsumo = (rowKey, insumo) => {
    updateRow(rowKey, { name: insumo.name, tracked: true, inventoryId: insumo._id, isNew: false });
  };

  const onSubmit = async (data) => {
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      addToast('La imagen no debe superar los 5MB', 'error');
      return;
    }

    // Crea en Inventario (como pendiente) los ingredientes marcados "guardar en
    // inventario" que todavía no tienen un insumo existente asociado
    const resolvedRecipe = [];
    for (const row of recipeRows) {
      if (!row.name.trim()) continue;

      let inventoryId = row.inventoryId;
      if (row.tracked && !inventoryId) {
        const result = await fetch('http://localhost:4000/api/inventory/quick', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: row.name, unit: row.unit, type: row.ingredientCategory || 'Frutas' }),
        });
        const resData = await result.json();
        if (!result.ok) {
          addToast(resData.message || `No se pudo crear el insumo ${row.name}`, 'error');
          continue;
        }
        inventoryId = resData.newInventory._id;
      }

      resolvedRecipe.push({
        name: row.name,
        tracked: row.tracked,
        inventoryId: row.tracked ? inventoryId : null,
        quantity: row.quantity || undefined,
        unit: row.unit,
      });
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', parseFloat(data.price));
    formData.append('category', data.category);
    formData.append('subcategory', data.subcategory || '');
    if (data.category === 'tercero') {
      formData.append('quantity', parseInt(data.quantity));
    }
    // Nace 'disponible' al crear (el select de estado solo se muestra al editar)
    formData.append('status', editData ? data.status : 'disponible');
    if (data.category === 'casa') {
      formData.append('recipe', JSON.stringify(resolvedRecipe));
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

    await onSave(formData);
  };

  const inputClasses =
    'w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 placeholder:text-gray-400 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]';
  const selectClasses = inputClasses + ' appearance-none';
  const labelClasses = 'block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/80">
        <div className="flex items-center justify-between p-4 sm:p-5 bg-red-500 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(220,38,38,0.3)]">
          <h2 className="text-base sm:text-lg font-display font-bold">
            {editData ? 'Editar Bebida' : 'Nueva Bebida'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"
          >
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          <div>
            <label className={labelClasses}>Nombre de la Bebida</label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              })}
              placeholder="Ej: Limonada Natural"
              className={inputClasses}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClasses}>Precio ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', {
                  required: 'El precio es obligatorio',
                  min: { value: 0.01, message: 'Debe ser mayor a 0' },
                  valueAsNumber: true,
                })}
                placeholder="Ej: 3.50"
                className={inputClasses}
              />
              {errors.price && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.price.message}</span>}
            </div>
            <div>
              <label className={labelClasses}>Categoría</label>
              <select {...register('category', { required: true })} className={selectClasses}>
                <option value="tercero">De Tercero</option>
                <option value="casa">De Casa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClasses}>Subcategoría</label>
              <input
                type="text"
                list="subcategory-suggestions"
                {...register('subcategory')}
                placeholder="Ej: Gaseosa, Lite..."
                className={inputClasses}
              />
              <datalist id="subcategory-suggestions">
                {SUBCATEGORY_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>

            {editData && (
              <div>
                <label className={labelClasses}>Estado</label>
                <select {...register('status', { required: true })} className={selectClasses}>
                  <option value="disponible">Disponible</option>
                  <option value="no disponible">No disponible</option>
                </select>
              </div>
            )}

            {category === 'tercero' && (
              <div>
                <label className={labelClasses}>Stock</label>
                <input
                  type="number"
                  min="0"
                  {...register('quantity', {
                    required: category === 'tercero' ? 'El stock es obligatorio' : false,
                    min: { value: 0, message: 'No puede ser negativo' },
                  })}
                  placeholder="Ej: 50"
                  className={inputClasses}
                />
                {errors.quantity && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.quantity.message}</span>}
              </div>
            )}
          </div>

          {category === 'casa' && (
            <div className="border-t border-white/60 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-display font-semibold text-gray-800 text-sm">Receta (opcional)</p>
                  <p className="text-xs text-gray-500">Solo informativo: no descuenta nada del inventario</p>
                </div>
                <button
                  type="button"
                  onClick={addRow}
                  className="text-xs font-display font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <FAIcon icon="plus" size="xs" /> Agregar ingrediente
                </button>
              </div>

              <div className="space-y-3">
                {recipeRows.map((row) => (
                  <div key={row.key} className="p-3 bg-white/70 rounded-2xl border border-white/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => {
                            updateRow(row.key, { name: e.target.value, inventoryId: null, tracked: false });
                            setIngredientSearch(e.target.value);
                          }}
                          placeholder="Nombre del ingrediente (ej: Agua, Azúcar...)"
                          className={inputClasses}
                        />
                        {ingredientSearch && row.name === ingredientSearch && matchingInsumos.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-32 overflow-y-auto">
                            {matchingInsumos.map((insumo) => (
                              <button
                                type="button"
                                key={insumo._id}
                                onClick={() => {
                                  pickExistingInsumo(row.key, insumo);
                                  setIngredientSearch('');
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                              >
                                {insumo.name} {insumo.pending ? '(pendiente)' : ''}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        className="p-2 text-gray-400 hover:text-red-500"
                        aria-label="Quitar ingrediente"
                      >
                        <FAIcon icon="trash" size="sm" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <input
                        type="text"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                        placeholder='Ej: 1/2, 2, una pizca'
                        className={inputClasses}
                      />
                      <select
                        value={row.unit}
                        onChange={(e) => updateRow(row.key, { unit: e.target.value })}
                        className={selectClasses}
                      >
                        {RECIPE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <input
                          type="checkbox"
                          checked={row.tracked}
                          disabled={!row.isNew && Boolean(row.inventoryId)}
                          onChange={(e) => updateRow(row.key, { tracked: e.target.checked, inventoryId: e.target.checked ? row.inventoryId : null })}
                          className="accent-red-500"
                        />
                        Guardar en inventario
                      </label>
                    </div>
                    {row.tracked && !row.inventoryId && (
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-amber-600 flex-1">
                          Se creará como insumo pendiente en Inventario al guardar
                        </p>
                        <select
                          value={row.ingredientCategory || 'Frutas'}
                          onChange={(e) => updateRow(row.key, { ingredientCategory: e.target.value })}
                          className="text-xs px-2 py-1 rounded-lg bg-white border border-white/80"
                        >
                          {INGREDIENT_CATEGORIES_DRINKS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
                {recipeRows.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">Sin ingredientes agregados todavía</p>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-white/60 pt-4">
            <label className={labelClasses}>Imagen (opcional)</label>
            {editData?.image && keepExistingImage && !imageFile && (
              <div className="flex items-center gap-3 mb-2">
                <img src={editData.image} alt="Imagen actual" className="w-12 h-12 rounded-xl object-cover" />
                <span className="text-xs text-gray-500">Conservar imagen actual</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                if (selected) {
                  setRawImageFile(selected);
                  setKeepExistingImage(false);
                }
                e.target.value = '';
              }}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 file:transition-colors file:shadow-[0_4px_12px_rgba(220,38,38,0.3)] cursor-pointer"
            />
            {imageFile && (
              <div className="flex items-center gap-3 mt-2">
                <img src={URL.createObjectURL(imageFile)} alt="Vista previa" className="w-12 h-12 rounded-xl object-cover ring-2 ring-red-400" />
                <button type="button" onClick={() => setRawImageFile(imageFile)} className="text-xs text-gray-500 hover:text-red-500">Ajustar</button>
                <button type="button" onClick={() => setImageFile(null)} className="text-xs text-gray-400 hover:text-red-500">Quitar</button>
              </div>
            )}
            {!editData?.image && !imageFile && (
              <p className="text-[11px] text-gray-400 mt-1">Si no seleccionas una imagen se usará un diseño por defecto</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/60">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-600 rounded-2xl hover:bg-gray-300 font-display font-semibold text-sm transition-all
                shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)]
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 font-display font-semibold text-sm transition-all
                shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]
              "
            >
              {editData ? 'Actualizar Cambios' : 'Guardar Bebida'}
            </button>
          </div>
        </form>
      </div>

      <ImageCropModal
        file={rawImageFile}
        onCancel={() => setRawImageFile(null)}
        onConfirm={(croppedFile) => {
          setImageFile(croppedFile);
          setRawImageFile(null);
        }}
      />
    </div>
  );
};

export default AddDrinkModal;
