// src/components/extras/AddExtraModal.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FAIcon from '../commons/FAIcon';
import { useToast } from '../commons/ToastProvider';

const AddExtraModal = ({ isOpen, onClose, onAdd, editingExtra = null }) => {
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
      category: '',
      status: 'DISPONIBLE',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingExtra) {
        setValue('name', editingExtra.name || '');
        setValue('price', editingExtra.price || '');
        setValue('category', editingExtra.category || '');
        setValue('status', editingExtra.status || 'DISPONIBLE');
      } else {
        reset({
          name: '',
          price: '',
          category: '',
          status: 'DISPONIBLE',
        });
      }
    }
  }, [editingExtra, isOpen, setValue, reset]);

  const onSubmit = (data) => {
    const priceNum = parseFloat(data.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast('El precio debe ser un número mayor a 0', 'error');
      return;
    }
    onAdd(data);
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
            {editingExtra ? 'Editar extra' : 'Nuevo extra'}
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
              Nombre del extra
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              })}
              placeholder="Ej: Queso Cheddar"
              className={inputClasses}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.name.message}</span>}
          </div>

          {/* Precio */}
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
              placeholder="Ej: 1.50"
              className={inputClasses}
            />
            {errors.price && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.price.message}</span>}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Categoría
            </label>
            <input
              type="text"
              list="extra-category-suggestions"
              {...register('category')}
              placeholder="Ej: Verduras, Lácteos, Salsas, Especial..."
              className={inputClasses}
            />
            <datalist id="extra-category-suggestions">
              <option value="Verduras" />
              <option value="Lácteos" />
              <option value="Salsas" />
              <option value="Especial" />
              <option value="Otros" />
            </datalist>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Estado
            </label>
            <select
              {...register('status')}
              className={selectClasses}
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="AGOTADO">Agotado</option>
            </select>
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
              {editingExtra ? 'Actualizar extra' : 'Agregar extra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExtraModal;