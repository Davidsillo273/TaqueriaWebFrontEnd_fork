// src/components/dishes/AddDishModal.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FAIcon from '../commons/FAIcon';
import Select from '../commons/Select';
import ImageCropModal from '../commons/ImageCropModal';
import RecipeBuilder from '../commons/RecipeBuilder';
import { resolveRecipeRows } from '../../utils/recipeRowUtils';
import DuplicateNameDialog from '../commons/DuplicateNameDialog';
import { useToast } from '../commons/ToastProvider';
import { useInventory } from '../../hooks/useInventory';
import useSaucers from '../../hooks/useSaucers';
import { INGREDIENT_CATEGORIES_DISHES } from '../../constants/units';

const DISH_CATEGORIES = ['Burritos', 'Tortas', 'Tacos', 'Sopas', 'Especiales'];
const NO_SUBCATEGORY = ['Sopas', 'Especiales'];
const TACO_QUANTITIES = [3, 4, 5];
const SUBCATEGORY_SUGGESTIONS = ['Al pastor', 'Pollo', 'Carne', 'Birria', 'Vegetariano', 'Mixto'];

const AddDishModal = ({ isOpen, onClose, onSave, onEditExisting, dishToEdit = null }) => {
  const { addToast } = useToast();
  const { quickCreateInsumo } = useInventory();
  const { checkName } = useSaucers();

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
      category: 'Tacos',
      subcategory: '',
      description: '',
      price: '',
      status: 'Activo',
    },
  });

  const category = watch('category');
  const isTacoCategory = category === 'Tacos';
  const subcategoryApplies = !NO_SUBCATEGORY.includes(category);

  const [rawImageFile, setRawImageFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [recipeRows, setRecipeRows] = useState([]);
  const [tacoQuantity, setTacoQuantity] = useState(3);
  const [duplicate, setDuplicate] = useState(null);
  const [pendingSubmit, setPendingSubmit] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    if (dishToEdit) {
      setValue('name', dishToEdit.name || '');
      setValue('category', dishToEdit.category || 'Tacos');
      setValue('subcategory', dishToEdit.subcategory || '');
      setValue('description', dishToEdit.description || '');
      setValue('price', dishToEdit.price || '');
      setValue('status', dishToEdit.status || 'Activo');
      setTacoQuantity(TACO_QUANTITIES.includes(dishToEdit.quantity) ? dishToEdit.quantity : 3);
      setRecipeRows(
        (dishToEdit.recipe || []).map((item) => ({
          key: crypto.randomUUID(),
          name: item.name || '',
          tracked: Boolean(item.tracked),
          inventoryId: item.inventoryId?._id || item.inventoryId || null,
          removable: Boolean(item.removable),
          quantity: item.quantity ?? '',
          unit: item.unit || 'unidad',
          ingredientCategory: 'Verduras',
          isNew: false,
        }))
      );
    } else {
      reset({ name: '', category: 'Tacos', subcategory: '', description: '', price: '', status: 'Activo' });
      setRecipeRows([]);
      setTacoQuantity(3);
    }
    setImageFile(null);
    setRawImageFile(null);
  }, [dishToEdit, isOpen, setValue, reset]);

  if (!isOpen) return null;

  const buildFormData = async (data) => {
    const resolvedRecipe = await resolveRecipeRows({ rows: recipeRows, quickCreateInsumo, addToast });

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('subcategory', subcategoryApplies ? (data.subcategory || '') : '');
    formData.append('description', data.description || '');
    formData.append('price', parseFloat(data.price));
    formData.append('status', data.status);
    if (isTacoCategory) {
      formData.append('quantity', tacoQuantity);
    }
    formData.append('recipe', JSON.stringify(resolvedRecipe));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return formData;
  };

  const onSubmit = async (data) => {
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      addToast('La imagen no debe superar los 5MB', 'error');
      return;
    }

    if (recipeRows.filter((r) => r.name.trim()).length === 0) {
      addToast('La receta es obligatoria: agrega al menos un ingrediente', 'error');
      return;
    }

    if (!dishToEdit) {
      const existing = await checkName(data.name);
      if (existing) {
        setDuplicate(existing);
        setPendingSubmit(() => data);
        return;
      }
    }

    const formData = await buildFormData(data);
    onSave(formData);
  };

  const handleCreateAnyway = async () => {
    const data = pendingSubmit;
    setDuplicate(null);
    setPendingSubmit(null);
    if (!data) return;
    const formData = await buildFormData(data);
    onSave(formData);
  };

  // Estilos clay para inputs
  const inputClasses =
    'w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 placeholder:text-gray-400 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]';
  const labelClasses = 'block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/80">
        {/* Cabecera roja con relieve */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-red-500 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(220,38,38,0.3)]">
          <h2 className="text-base sm:text-lg font-display font-bold">
            {dishToEdit ? 'Editar Platillo' : 'Nuevo Platillo'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"
          >
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          <div>
            <label className={labelClasses}>Nombre del Platillo</label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              })}
              placeholder="Ej. Tacos al Pastor"
              className={inputClasses}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClasses}>Categoría</label>
              <Select {...register('category', { required: true })}>
                {DISH_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
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
                placeholder="0.00"
                className={inputClasses}
              />
              {errors.price && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.price.message}</span>}
            </div>
          </div>

          {subcategoryApplies && (
            <div>
              <label className={labelClasses}>Subcategoría</label>
              <Select {...register('subcategory')}>
                <option value="">Selecciona una subcategoría...</option>
                {SUBCATEGORY_SUGGESTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          )}

          <div>
            <label className={labelClasses}>Descripción</label>
            <textarea
              {...register('description')}
              placeholder="Breve descripción del platillo..."
              rows={2}
              className={inputClasses}
            />
          </div>

          {isTacoCategory && (
            <div>
              <label className={labelClasses}>Cantidad de tacos por orden</label>
              <div className="flex gap-2">
                {TACO_QUANTITIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setTacoQuantity(q)}
                    className={`flex-1 py-2.5 rounded-2xl font-display font-semibold text-sm transition-all ${
                      tacoQuantity === q
                        ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]'
                        : 'bg-white text-gray-600 border border-white/80 hover:bg-gray-50'
                    }`}
                  >
                    {q} tacos
                  </button>
                ))}
              </div>
            </div>
          )}

          {dishToEdit && (
            <div>
              <label className={labelClasses}>Estado</label>
              <Select {...register('status')}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </Select>
            </div>
          )}

          <div className="border-t border-white/60 pt-4">
            <RecipeBuilder
              rows={recipeRows}
              setRows={setRecipeRows}
              categories={INGREDIENT_CATEGORIES_DISHES}
              showRemovable
              paginate
              title="Receta (obligatoria)"
              helperText="Marca 'el cliente puede quitarlo' para los ingredientes que se puedan pedir sin ellos. Los ingredientes ligados a un insumo descuentan inventario al confirmarse una orden con este platillo."
            />
          </div>

          <div className="border-t border-white/60 pt-4">
            <label className={labelClasses}>Imagen (opcional)</label>
            {dishToEdit?.image && !imageFile && (
              <div className="mb-3 flex items-center gap-2 bg-white p-2 rounded-2xl border border-white/80 shadow-sm">
                <img src={dishToEdit.image} alt="Actual" className="w-10 h-10 object-cover rounded-xl shadow-inner" />
                <span className="text-xs text-gray-400 truncate">Conservar imagen actual</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                if (selected) setRawImageFile(selected);
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
            {!dishToEdit?.image && !imageFile && (
              <p className="text-[11px] text-gray-400 mt-1">Si no seleccionas una imagen se usará un diseño por defecto</p>
            )}
          </div>

          {/* Botones */}
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
              {dishToEdit ? 'Actualizar' : 'Guardar'}
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

      <DuplicateNameDialog
        existing={duplicate}
        onEditExisting={() => {
          const existing = duplicate;
          setDuplicate(null);
          setPendingSubmit(null);
          onEditExisting?.(existing);
        }}
        onCreateAnyway={handleCreateAnyway}
        onCancel={() => { setDuplicate(null); setPendingSubmit(null); }}
      />
    </div>
  );
};

export default AddDishModal;
