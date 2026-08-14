// src/components/tables/TableModal.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FAIcon from '../commons/FAIcon';
import { useToast } from '../commons/ToastProvider';

export default function TableModal({ isOpen, onClose, onSave, currentTable }) {
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { number: '', status: 'libre' },
  });

  useEffect(() => {
    if (isOpen) {
      if (currentTable) {
        setValue('number', currentTable.number || '');
        setValue('status', currentTable.status || 'libre');
      } else {
        reset({ number: '', status: 'libre' });
      }
    }
  }, [currentTable, isOpen, setValue, reset]);

  const onSubmit = (data) => {
    const num = parseInt(data.number);
    if (isNaN(num) || num <= 0) {
      addToast('El número de mesa debe ser un entero positivo', 'error');
      return;
    }
    onSave({ number: num, status: data.status });
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
          <h3 className="text-base sm:text-lg font-display font-bold">
            {currentTable ? 'Editar Mesa' : 'Añadir Nueva Mesa'}
          </h3>
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
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Número de la Mesa
            </label>
            <input
              type="number"
              {...register('number', {
                required: 'El número es obligatorio',
                min: { value: 1, message: 'Debe ser positivo' },
                valueAsNumber: true,
              })}
              placeholder="Ej: 8"
              className={inputClasses}
            />
            {errors.number && (
              <span className="text-red-500 text-xs mt-1 block font-medium">{errors.number.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Estado
            </label>
            <select {...register('status')} className={selectClasses}>
              <option value="libre">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="reservada">Reservada</option>
              <option value="limpieza">En Limpieza</option>
            </select>
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}