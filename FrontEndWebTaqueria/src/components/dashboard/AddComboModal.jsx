// src/components/dashboard/AddComboModal.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useSaucers from '../../hooks/useSaucers';
import useDrinks from '../../hooks/useDrinks';
import FAIcon from '../commons/FAIcon';
import CardPicker from '../commons/CardPicker';
import ImageCropModal from '../commons/ImageCropModal';
import { useToast } from '../commons/ToastProvider.jsx';

const AddComboModal = ({ isOpen, onClose, onSave, loading, comboToEdit = null }) => {
  const { saucers, loading: loadingSaucers } = useSaucers();
  const { drinks, loading: loadingDrinks } = useDrinks();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      price: '',
      description: '',
      quantity: 1,
      category: 'individual',
      status: 'disponible',
      allowHouseDrinkAddon: false,
    },
  });

  const [selectedSaucerIds, setSelectedSaucerIds] = useState([]);
  const [selectedDrinkIds, setSelectedDrinkIds] = useState([]);
  const [rawImageFile, setRawImageFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const saucerCategories = [...new Set(saucers.map((s) => s.category).filter(Boolean))];
  const thirdPartyDrinks = drinks.filter((d) => d.category === 'tercero');

  useEffect(() => {
    if (!isOpen) return;

    if (comboToEdit) {
      setValue('name', comboToEdit.name);
      setValue('price', comboToEdit.price);
      setValue('description', comboToEdit.description);
      setValue('quantity', comboToEdit.quantity || 1);
      setValue('category', comboToEdit.category || 'individual');
      setValue('status', comboToEdit.status || 'disponible');
      setValue('allowHouseDrinkAddon', Boolean(comboToEdit.drinkPolicy?.allowHouseDrinkAddon));

      setSelectedSaucerIds(
        (comboToEdit.saucers || []).map((s) => s.saucerId?._id || s.saucerId).filter(Boolean)
      );
      setSelectedDrinkIds(
        (comboToEdit.drinkPolicy?.thirdPartyDrinkIds || []).map((d) => d?._id || d).filter(Boolean)
      );
    } else {
      reset({
        name: '',
        price: '',
        description: '',
        quantity: 1,
        category: 'individual',
        status: 'disponible',
        allowHouseDrinkAddon: false,
      });
      setSelectedSaucerIds([]);
      setSelectedDrinkIds([]);
    }
    setImageFile(null);
    setRawImageFile(null);
  }, [comboToEdit, isOpen, setValue, reset]);

  const toggleSaucer = (id) =>
    setSelectedSaucerIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const toggleDrink = (id) =>
    setSelectedDrinkIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));

  const onSubmit = async (data) => {
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      addToast('La imagen no debe superar los 5MB', 'error');
      return;
    }

    if (selectedSaucerIds.length === 0) {
      addToast('Selecciona al menos un platillo', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('price', parseFloat(data.price));
      formData.append('description', data.description);
      formData.append('quantity', parseInt(data.quantity) || 1);
      formData.append('category', data.category);
      // Nace 'disponible' al crear (el select de estado solo se muestra al editar)
      formData.append('status', comboToEdit ? data.status : 'disponible');

      formData.append('saucers', JSON.stringify(selectedSaucerIds.map((id) => ({ saucerId: id }))));
      formData.append('drinkPolicy', JSON.stringify({
        thirdPartyDrinkIds: selectedDrinkIds,
        allowHouseDrinkAddon: data.allowHouseDrinkAddon,
      }));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await onSave(formData, comboToEdit?._id);
      reset();
    } catch (error) {
      console.error('Error al procesar el formulario del combo:', error);
    }
  };

  if (!isOpen) return null;

  const inputClasses =
    'w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 placeholder:text-gray-400 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]';
  const selectClasses = inputClasses + ' appearance-none';
  const labelClasses = 'block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/80">
        <div className="flex items-center justify-between p-4 sm:p-5 bg-red-500 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(220,38,38,0.3)]">
          <h2 className="text-base sm:text-lg font-display font-bold">
            {comboToEdit ? 'Actualizar combo' : 'Nuevo Combo'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"
            disabled={loading}
          >
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          <div>
            <label className={labelClasses}>Nombre del Combo</label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              })}
              placeholder="Ej: Combo almuerzo doble"
              className={inputClasses}
              disabled={loading}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
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
                disabled={loading}
              />
              {errors.price && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.price.message}</span>}
            </div>
            <div>
              <label className={labelClasses}>Cantidad</label>
              <input
                type="number"
                min="1"
                {...register('quantity', { required: true, min: 1, valueAsNumber: true })}
                className={inputClasses}
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelClasses}>Categoría</label>
              <select {...register('category', { required: true })} className={selectClasses} disabled={loading}>
                <option value="individual">Individual</option>
                <option value="duo">Duo</option>
                <option value="familiar">Familiar</option>
              </select>
            </div>
          </div>

          {comboToEdit && (
            <div>
              <label className={labelClasses}>Estado</label>
              <select {...register('status', { required: true })} className={selectClasses} disabled={loading}>
                <option value="disponible">Disponible</option>
                <option value="no disponible">No disponible</option>
              </select>
            </div>
          )}

          <div>
            <label className={labelClasses}>Descripción</label>
            <textarea
              {...register('description', {
                required: 'La descripción es obligatoria',
                minLength: { value: 10, message: 'Mínimo 10 caracteres' },
              })}
              placeholder="Ej: Dos platillos especiales acompañados de una bebida fría..."
              rows="2"
              className={inputClasses + ' resize-none'}
              disabled={loading}
            />
            {errors.description && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.description.message}</span>}
          </div>

          <div className="border-t border-white/60 pt-4">
            <label className={labelClasses}>Platillos incluidos ({selectedSaucerIds.length})</label>
            {loadingSaucers ? (
              <p className="text-xs text-gray-400">Cargando platillos...</p>
            ) : (
              <CardPicker
                items={saucers}
                selectedIds={selectedSaucerIds}
                onToggle={toggleSaucer}
                categories={saucerCategories}
              />
            )}
          </div>

          <div className="border-t border-white/60 pt-4">
            <label className={labelClasses}>Bebidas de tercero permitidas ({selectedDrinkIds.length})</label>
            <p className="text-[11px] text-gray-500 mb-2">
              El cliente elige entre estas al ordenar; ya están incluidas en el precio
            </p>
            {loadingDrinks ? (
              <p className="text-xs text-gray-400">Cargando bebidas...</p>
            ) : (
              <CardPicker items={thirdPartyDrinks} selectedIds={selectedDrinkIds} onToggle={toggleDrink} />
            )}

            <div className="mt-3 p-3 bg-white/70 rounded-2xl border border-white/80">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <input type="checkbox" {...register('allowHouseDrinkAddon')} className="accent-red-500" disabled={loading} />
                Permitir agregar una bebida de casa (costo extra)
              </label>
              <p className="text-[11px] text-gray-500 mt-1">
                El costo lo define el precio de esa bebida en Bebidas, no aquí
              </p>
            </div>
          </div>

          <div className="border-t border-white/60 pt-4">
            <label className={labelClasses}>Imagen (opcional)</label>
            {comboToEdit?.image && !imageFile && (
              <div className="mb-3 flex items-center gap-2 bg-white p-2 rounded-2xl border border-white/80 shadow-sm">
                <img src={comboToEdit.image} alt="Actual" className="w-10 h-10 object-cover rounded-xl shadow-inner" />
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
              disabled={loading}
            />
            {imageFile && (
              <div className="flex items-center gap-3 mt-2">
                <img src={URL.createObjectURL(imageFile)} alt="Vista previa" className="w-12 h-12 rounded-xl object-cover ring-2 ring-red-400" />
                <button type="button" onClick={() => setRawImageFile(imageFile)} className="text-xs text-gray-500 hover:text-red-500">Ajustar</button>
                <button type="button" onClick={() => setImageFile(null)} className="text-xs text-gray-400 hover:text-red-500">Quitar</button>
              </div>
            )}
            {!comboToEdit?.image && !imageFile && (
              <p className="text-[11px] text-gray-400 mt-1">Si no seleccionas una imagen se usará un diseño por defecto</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/60">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-600 rounded-2xl hover:bg-gray-300 font-display font-semibold text-sm transition-all
                shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)]
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 font-display font-semibold text-sm transition-all
                shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
                active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {loading ? 'Procesando...' : comboToEdit ? 'Guardar cambios' : 'Guardar combo'}
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

export default AddComboModal;
