// src/components/inventory/InventoryModal.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FAIcon from '../commons/FAIcon';
import { useToast } from '../commons/ToastProvider';

const InventoryModal = ({ isOpen, onClose, insumoData, onSave }) => {
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
      ubication: '',
      type: 'Carnes',
      quantity: '',
      status: 'Disponible',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (insumoData) {
        setValue('name', insumoData.name || '');
        setValue('price', insumoData.price !== undefined ? insumoData.price : '');
        setValue('ubication', insumoData.ubication || '');
        setValue('type', insumoData.type || 'Carnes');
        setValue('quantity', insumoData.quantity !== undefined ? insumoData.quantity : '');
        setValue('status', insumoData.status || 'Disponible');
      } else {
        reset({
          name: '',
          price: '',
          ubication: '',
          type: 'Carnes',
          quantity: '',
          status: 'Disponible',
        });
      }
    }
  }, [insumoData, isOpen, setValue, reset]);

  const onSubmit = async (data) => {
    const priceNum = parseFloat(data.price);
    const qtyNum = parseInt(data.quantity);

    if (data.name.trim().length < 3) {
      addToast('El nombre debe tener al menos 3 caracteres', 'error');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast('El precio debe ser un número mayor a 0', 'error');
      return;
    }
    if (!data.ubication.trim()) {
      addToast('La ubicación es requerida', 'error');
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      addToast('La cantidad debe ser un número positivo o cero', 'error');
      return;
    }

    const payload = {
      name: data.name.trim(),
      price: priceNum,
      ubication: data.ubication.trim(),
      type: data.type,
      quantity: qtyNum,
      status: data.status,
    };

    const result = await onSave(payload, insumoData?._id || insumoData?.id);
    if (result.success) {
      addToast(
        insumoData ? 'Insumo actualizado correctamente' : 'Insumo creado correctamente',
        'success'
      );
      onClose();
    } else {
      addToast(result.message || 'Error al guardar el insumo', 'error');
    }
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
            {insumoData ? 'Editar Insumo' : 'Añadir Nuevo Insumo'}
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
          {/* Nombre */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre del Insumo
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              })}
              placeholder="Carne para Hamburguesa"
              className={inputClasses}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Precio */}
            <div>
              <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Precio</label>
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

            {/* Cantidad */}
            <div>
              <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Cantidad</label>
              <input
                type="number"
                min="0"
                {...register('quantity', {
                  required: 'La cantidad es obligatoria',
                  min: { value: 0, message: 'No puede ser negativa' },
                  valueAsNumber: true,
                })}
                placeholder="0"
                className={inputClasses}
              />
              {errors.quantity && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.quantity.message}</span>}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ubicación</label>
            <input
              type="text"
              {...register('ubication', {
                required: 'La ubicación es obligatoria',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              })}
              placeholder="Estante A - Nevera 2"
              className={inputClasses}
            />
            {errors.ubication && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.ubication.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Tipo/Categoría */}
            <div>
              <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tipo/Categoría</label>
              <select
                {...register('type')}
                className={selectClasses}
              >
                <option value="Aves">Aves</option>
                <option value="Carnes">Carnes</option>
                <option value="Verduras">Verduras</option>
                <option value="Frutas">Frutas</option>
                <option value="Minerales">Minerales</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Estado</label>
              <select
                {...register('status')}
                className={selectClasses}
              >
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
                <option value="En Pedido">En Pedido</option>
              </select>
            </div>
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;