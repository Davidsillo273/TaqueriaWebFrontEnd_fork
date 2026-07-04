import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FAIcon from '../commons/FAIcon';
import { useToast } from '../commons/ToastProvider';

export default function TableModal({ isOpen, onClose, onSave, currentTable }) {
  const { addToast } = useToast();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { number: '', status: 'Disponible' }
  });

  useEffect(() => {
    if (isOpen) {
      if (currentTable) {
        setValue('number', currentTable.number || '');
        setValue('status', currentTable.status || 'Disponible');
      } else reset({ number: '', status: 'Disponible' });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-xl overflow-hidden shadow-xl z-10">
        <div className="bg-red-600 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold">{currentTable ? 'Editar Mesa' : 'Añadir Nueva Mesa'}</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><FAIcon icon="times" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Número de la Mesa</label>
            <input type="number" {...register('number', { required: 'El número es obligatorio', min: { value: 1, message: 'Debe ser positivo' }, valueAsNumber: true })} placeholder="Ej: 8" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm" />
            {errors.number && <span className="text-red-500 text-xs mt-1 block">{errors.number.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
            <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900 text-sm">
              <option value="Disponible">Disponible</option>
              <option value="Sirviendo">Sirviendo</option>
              <option value="Reservada">Reservada</option>
              <option value="En Limpieza">En Limpieza</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}