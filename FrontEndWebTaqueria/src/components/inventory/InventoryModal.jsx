// src/components/inventory/InventoryModal.jsx
// Formulario de Inventario. Ya no maneja insumos "compuestos" (esa lógica
// vive ahora en Extras) — aquí solo se registra materia prima (Productos) o
// mobiliario/equipo (Activos fijos), según la pestaña activa en la página.
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FAIcon from '../commons/FAIcon';
import ImageCropModal from '../commons/ImageCropModal';
import DuplicateNameDialog from '../commons/DuplicateNameDialog';
import { useToast } from '../commons/ToastProvider';
import { useInventory } from '../../hooks/useInventory';
import { UNITS_BY_GROUP, GROUP_LABELS, INVENTORY_CATEGORIES, ASSET_CATEGORIES, ASSET_CONDITIONS } from '../../constants/units';

const InventoryModal = ({ isOpen, onClose, insumoData, itemType = 'producto', onSave, onEditExisting }) => {
  const { addToast } = useToast();
  const { checkName } = useInventory();
  const isAsset = (insumoData?.itemType || itemType) === 'activo_fijo';

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
      type: isAsset ? ASSET_CATEGORIES[0] : 'Carnes',
      quantity: '',
      unit: 'g',
      status: isAsset ? 'Bueno' : 'Disponible',
      condition: 'Bueno',
      acquisitionDate: '',
      lowStockAlert: '',
    },
  });

  const [rawImageFile, setRawImageFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [pendingSubmit, setPendingSubmit] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (insumoData) {
        setValue('name', insumoData.name || '');
        setValue('price', insumoData.price !== undefined ? insumoData.price : '');
        setValue('ubication', insumoData.ubication || '');
        setValue('type', insumoData.type || (isAsset ? ASSET_CATEGORIES[0] : 'Carnes'));
        setValue('quantity', insumoData.quantity !== undefined ? insumoData.quantity : '');
        setValue('unit', insumoData.unit || 'g');
        setValue('status', insumoData.status || (isAsset ? 'Bueno' : 'Disponible'));
        setValue('condition', insumoData.condition || 'Bueno');
        setValue('acquisitionDate', insumoData.acquisitionDate ? insumoData.acquisitionDate.slice(0, 10) : '');
        setValue('lowStockAlert', insumoData.lowStockAlert ?? '');
      } else {
        reset({
          name: '',
          price: '',
          ubication: '',
          type: isAsset ? ASSET_CATEGORIES[0] : 'Carnes',
          quantity: '',
          unit: 'g',
          status: isAsset ? 'Bueno' : 'Disponible',
          condition: 'Bueno',
          acquisitionDate: '',
          lowStockAlert: '',
        });
      }
    }
    setImageFile(null);
    setRawImageFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insumoData, isOpen, setValue, reset]);

  if (!isOpen) return null;

  const buildFormData = (data) => {
    const formData = new FormData();
    formData.append('name', data.name.trim());
    formData.append('itemType', isAsset ? 'activo_fijo' : 'producto');
    formData.append('price', parseFloat(data.price));
    formData.append('ubication', data.ubication.trim());
    formData.append('type', data.type);
    formData.append('quantity', parseFloat(data.quantity));
    formData.append('status', data.status);
    if (isAsset) {
      formData.append('condition', data.condition);
      if (data.acquisitionDate) formData.append('acquisitionDate', data.acquisitionDate);
    } else {
      formData.append('unit', data.unit);
      formData.append('lowStockAlert', Number(data.lowStockAlert));
    }
    if (imageFile) formData.append('image', imageFile);
    return formData;
  };

  const submitForm = async (data) => {
    const formData = buildFormData(data);
    const result = await onSave(formData, insumoData?._id || insumoData?.id);
    if (result.success) {
      addToast(insumoData ? 'Registro actualizado correctamente' : 'Registro creado correctamente', 'success');
      onClose();
    } else {
      addToast(result.message || 'Error al guardar el registro', 'error');
    }
  };

  const onSubmit = async (data) => {
    const priceNum = parseFloat(data.price);
    const qtyNum = parseFloat(data.quantity);

    if (data.name.trim().length < 3) {
      addToast('El nombre debe tener al menos 3 caracteres', 'error');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast(isAsset ? 'El valor debe ser un número mayor a 0' : 'El precio debe ser un número mayor a 0', 'error');
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
    if (!isAsset) {
      const alertNum = parseFloat(data.lowStockAlert);
      if (data.lowStockAlert === '' || isNaN(alertNum) || alertNum < 0) {
        addToast('El umbral de alerta de stock es requerido y debe ser un número positivo', 'error');
        return;
      }
    }
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      addToast('La imagen no debe superar los 5MB', 'error');
      return;
    }

    if (!insumoData) {
      const existing = await checkName(data.name);
      if (existing) {
        setDuplicate(existing);
        setPendingSubmit(() => data);
        return;
      }
    }

    await submitForm(data);
  };

  const handleCreateAnyway = async () => {
    const data = pendingSubmit;
    setDuplicate(null);
    setPendingSubmit(null);
    if (!data) return;
    await submitForm(data);
  };

  const inputClasses =
    'w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 placeholder:text-gray-400 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]';
  const selectClasses = inputClasses + ' appearance-none';
  const labelClasses = 'block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/80">
        {/* Cabecera roja con relieve */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-red-500 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(220,38,38,0.3)]">
          <h3 className="text-base sm:text-lg font-display font-bold">
            {insumoData ? 'Editar' : 'Nuevo'} {isAsset ? 'Activo fijo' : 'Insumo'}
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
            <label className={labelClasses}>Nombre</label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              })}
              placeholder={isAsset ? 'Mesa de madera 4 personas' : 'Carne para Hamburguesa'}
              className={inputClasses}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClasses}>{isAsset ? 'Valor de adquisición ($)' : 'Precio ($)'}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', {
                  required: 'Este campo es obligatorio',
                  min: { value: 0.01, message: 'Debe ser mayor a 0' },
                  valueAsNumber: true,
                })}
                placeholder="0.00"
                className={inputClasses}
              />
              {errors.price && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.price.message}</span>}
            </div>

            <div>
              <label className={labelClasses}>Cantidad</label>
              <input
                type="number"
                min="0"
                step="any"
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

          {!isAsset && (
            <div>
              <label className={labelClasses}>Unidad</label>
              <select {...register('unit', { required: true })} className={selectClasses}>
                {Object.entries(UNITS_BY_GROUP).map(([group, units]) => (
                  <optgroup key={group} label={GROUP_LABELS[group]}>
                    {units.map((u) => <option key={u} value={u}>{u}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {/* Ubicación */}
          <div>
            <label className={labelClasses}>Ubicación</label>
            <input
              type="text"
              {...register('ubication', {
                required: 'La ubicación es obligatoria',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              })}
              placeholder={isAsset ? 'Salón principal' : 'Estante A - Nevera 2'}
              className={inputClasses}
            />
            {errors.ubication && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.ubication.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClasses}>Categoría</label>
              <select {...register('type')} className={selectClasses}>
                {(isAsset ? ASSET_CATEGORIES : INVENTORY_CATEGORIES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {isAsset ? (
              <div>
                <label className={labelClasses}>Condición</label>
                <select {...register('condition')} className={selectClasses}>
                  {ASSET_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className={labelClasses}>Estado</label>
                <select {...register('status')} className={selectClasses}>
                  <option value="Disponible">Disponible</option>
                  <option value="Agotado">Agotado</option>
                  <option value="En Pedido">En Pedido</option>
                </select>
              </div>
            )}
          </div>

          {isAsset ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className={labelClasses}>Estado de uso</label>
                <select {...register('status')} className={selectClasses}>
                  <option value="Disponible">En uso</option>
                  <option value="Agotado">Fuera de servicio</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Fecha de adquisición (opcional)</label>
                <input type="date" {...register('acquisitionDate')} className={inputClasses} />
              </div>
            </div>
          ) : (
            <div>
              <label className={labelClasses}>Alerta de stock</label>
              <input
                type="number"
                min="0"
                step="any"
                {...register('lowStockAlert', {
                  required: 'El umbral de alerta de stock es obligatorio',
                  min: { value: 0, message: 'No puede ser negativo' },
                })}
                placeholder="Ej. 5 (en la unidad de este insumo)"
                className={inputClasses}
              />
              {errors.lowStockAlert && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.lowStockAlert.message}</span>}
              <p className="text-[11px] text-gray-400 mt-1">Se avisa cuando la cantidad disponible caiga a este nivel o menos.</p>
            </div>
          )}

          {/* Imagen */}
          <div className="border-t border-white/60 pt-4">
            <label className={labelClasses}>Imagen (opcional)</label>
            {insumoData?.image && !imageFile && (
              <div className="mb-3 flex items-center gap-2 bg-white p-2 rounded-2xl border border-white/80 shadow-sm">
                <img src={insumoData.image} alt="Actual" className="w-10 h-10 object-cover rounded-xl shadow-inner" />
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
            {!insumoData?.image && !imageFile && (
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
              Guardar
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

export default InventoryModal;
