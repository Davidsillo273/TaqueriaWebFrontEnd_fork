// src/components/dishes/AddDishModal.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FAIcon from '../commons/FAIcon';
import { useToast } from '../commons/ToastProvider';

const AddDishModal = ({ isOpen, onClose, onSave, dishToEdit = null }) => {
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
      category: '',
      price: '',
      status: 'Activo',
      imageFile: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (dishToEdit) {
        setValue('name', dishToEdit.name || '');
        setValue('category', dishToEdit.category || '');
        setValue('price', dishToEdit.price || '');
        setValue('status', dishToEdit.status || 'Activo');
        setValue('imageFile', null);
      } else {
        reset({
          name: '',
          category: '',
          price: '',
          status: 'Activo',
          imageFile: null,
        });
      }
    }
  }, [dishToEdit, isOpen, setValue, reset]);

  const onSubmit = async (data) => {
    if (data.imageFile && data.imageFile[0] && data.imageFile[0].size > 5 * 1024 * 1024) {
      addToast('La imagen no debe superar los 5MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('price', parseFloat(data.price));
    formData.append('status', data.status);
    if (data.imageFile && data.imageFile[0]) {
      formData.append('image', data.imageFile[0]);
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  // Estilos clay para inputs
  const inputClasses =
    'w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 placeholder:text-gray-400 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]';
  const selectClasses = inputClasses + ' appearance-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] w-full max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/80">
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
          {/* Nombre */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre del Platillo
            </label>
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

          {/* Categoría */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Categoría
            </label>
            <input
              type="text"
              {...register('category', {
                required: 'La categoría es obligatoria',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              })}
              placeholder="Ej. Tacos, Carnes, Aves"
              className={inputClasses}
            />
            {errors.category && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.category.message}</span>}
          </div>

          {/* Precio y Estado */}
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
              />
              {errors.price && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.price.message}</span>}
            </div>
            <div>
              <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Estado
              </label>
              <select
                {...register('status')}
                className={selectClasses}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Imagen del Platillo {dishToEdit && <span className="text-xs font-normal text-gray-400">(Opcional)</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('imageFile', {
                required: dishToEdit ? false : 'La imagen es obligatoria',
              })}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 file:transition-colors file:shadow-[0_4px_12px_rgba(220,38,38,0.3)] cursor-pointer"
            />
            {errors.imageFile && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.imageFile.message}</span>}
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
    </div>
  );
};

export default AddDishModal;