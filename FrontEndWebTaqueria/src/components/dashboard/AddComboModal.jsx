// src/components/dashboard/AddComboModal.jsx
import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import useSaucers from '../../hooks/useSaucers';
import useDrinks from '../../hooks/useDrinks';
import FAIcon from '../commons/FAIcon';
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
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      price: '',
      description: '',
      quantity: 1,
      status: 'available',
      drinksId: '',
      saucers: [{ saucerId: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'saucers',
  });

  useEffect(() => {
    if (isOpen) {
      if (comboToEdit) {
        setValue('name', comboToEdit.name);
        setValue('price', comboToEdit.price);
        setValue('description', comboToEdit.description);
        setValue('quantity', comboToEdit.quantity || 1);
        setValue('status', comboToEdit.status || 'available');
        setValue('drinksId', comboToEdit.drinksId?._id || comboToEdit.drinksId || '');

        if (comboToEdit.saucersId) {
          const rawId = comboToEdit.saucersId?._id || comboToEdit.saucersId;
          setValue('saucers', [{ saucerId: rawId }]);
        } else if (comboToEdit.saucers && comboToEdit.saucers.length > 0) {
          setValue('saucers', comboToEdit.saucers.map(s => ({ saucerId: s._id || s })));
        } else {
          setValue('saucers', [{ saucerId: '' }]);
        }
      } else {
        reset({
          name: '',
          price: '',
          description: '',
          quantity: 1,
          status: 'available',
          drinksId: '',
          saucers: [{ saucerId: '' }],
          image: null,
        });
      }
    }
  }, [comboToEdit, isOpen, setValue, reset]);

  const onSubmit = async (data) => {
    if (data.image && data.image[0] && data.image[0].size > 5 * 1024 * 1024) {
      addToast('La imagen no debe superar los 5MB', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('price', parseFloat(data.price));
      formData.append('description', data.description);
      formData.append('quantity', parseInt(data.quantity) || 1);
      formData.append('status', data.status);
      formData.append('drinksId', data.drinksId);

      const validSaucers = data.saucers.filter(s => s.saucerId !== '').map(s => s.saucerId);
      if (validSaucers.length > 0) {
        formData.append('saucersId', validSaucers[0]);
      }

      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      await onSave(formData, comboToEdit?._id);
      reset();
    } catch (error) {
      console.error('Error al procesar el formulario del combo:', error);
    }
  };

  if (!isOpen) return null;

  // Estilo común para inputs clay
  const inputClasses =
    'w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 placeholder:text-gray-400 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]';

  const selectClasses = inputClasses + ' appearance-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      {/* Panel clay */}
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/80">
        {/* Encabezado con rojo clay */}
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

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre del Combo
            </label>
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
            {errors.name && (
              <span className="text-red-500 text-xs mt-1 block font-medium">{errors.name.message}</span>
            )}
          </div>

          {/* Platillos dinámicos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-display font-semibold text-gray-500 uppercase tracking-wider">
                Platillos ({fields.length})
              </label>
              <button
                type="button"
                onClick={() => append({ saucerId: '' })}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-500 rounded-xl hover:bg-red-50 transition-colors font-semibold
                  shadow-[0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)]
                "
                disabled={loading || loadingSaucers}
              >
                <FAIcon icon="plus" size="xs" /> Agregar
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <select
                    {...register(`saucers.${index}.saucerId`, {
                      required: 'Selecciona un platillo',
                    })}
                    className={selectClasses}
                    disabled={loading || loadingSaucers}
                  >
                    <option value="">-- Platillo {index + 1} --</option>
                    {saucers.map((saucer) => (
                      <option key={saucer._id} value={saucer._id}>
                        {saucer.name} (${parseFloat(saucer.price || 0).toFixed(2)})
                      </option>
                    ))}
                  </select>
                  {errors.saucers?.[index]?.saucerId && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.saucers[index].saucerId.message}
                    </span>
                  )}
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Eliminar platillo"
                  >
                    <FAIcon icon="trash" size="sm" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Bebida */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Bebida
            </label>
            <select
              {...register('drinksId', { required: 'Selecciona una bebida' })}
              className={selectClasses}
              disabled={loading || loadingDrinks}
            >
              <option value="">-- Selecciona una bebida --</option>
              {drinks.map((drink) => (
                <option key={drink.id} value={drink.id}>
                  {drink.title} (${parseFloat(drink.price || 0).toFixed(2)})
                </option>
              ))}
            </select>
            {errors.drinksId && (
              <span className="text-red-500 text-xs mt-1 block font-medium">{errors.drinksId.message}</span>
            )}
          </div>

          {/* Precio y estado */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Precio ($)
              </label>
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
              {errors.price && (
                <span className="text-red-500 text-xs mt-1 block font-medium">{errors.price.message}</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Estado
              </label>
              <select
                {...register('status')}
                className={selectClasses}
                disabled={loading}
              >
                <option value="available">Disponible</option>
                <option value="unavailable">No Disponible</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Descripción
            </label>
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
            {errors.description && (
              <span className="text-red-500 text-xs mt-1 block font-medium">{errors.description.message}</span>
            )}
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Imagen
            </label>
            {comboToEdit && comboToEdit.image && (
              <div className="mb-3 flex items-center gap-2 bg-white p-2 rounded-2xl border border-white/80 shadow-sm">
                <img
                  src={comboToEdit.image}
                  alt="Actual"
                  className="w-10 h-10 object-cover rounded-xl shadow-inner"
                />
                <span className="text-xs text-gray-400 truncate">Conservar imagen actual</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              {...register('image', {
                required: comboToEdit ? false : 'La imagen es obligatoria',
              })}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 file:transition-colors file:shadow-[0_4px_12px_rgba(220,38,38,0.3)] cursor-pointer"
              disabled={loading}
            />
            {errors.image && (
              <span className="text-red-500 text-xs mt-1 block font-medium">{errors.image.message}</span>
            )}
          </div>

          {/* Botones */}
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
    </div>
  );
};

export default AddComboModal;