// src/components/inventory/InventoryModal.jsx
// Formulario de Inventario. Ya no maneja insumos "compuestos" (esa lógica
// vive ahora en Extras) — aquí solo se registra materia prima (Productos) o
// mobiliario/equipo (Activos fijos), según la pestaña activa en la página.
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FAIcon from '../commons/FAIcon';
import { ModalHeader, ModalBody, ModalFooter, MODAL_BTN_SECONDARY, MODAL_BTN_PRIMARY, FormSection, ImagePickerField, OptionalBadge, FORM_INPUT, FORM_LABEL } from '../commons/FormModal';
import Select from '../commons/Select';
import ImageCropModal from '../commons/ImageCropModal';
import DuplicateNameDialog from '../commons/DuplicateNameDialog';
import { useToast } from '../commons/ToastProvider';
import { useInventory } from '../../hooks/useInventory';
import { UNITS_BY_GROUP, GROUP_LABELS, INVENTORY_CATEGORIES, ASSET_CATEGORIES, ASSET_CONDITIONS } from '../../constants/units';

const InventoryModal = ({ isOpen, onClose, insumoData, itemType = 'producto', onSave, onEditExisting }) => {
  const { addToast } = useToast();
  const { checkName } = useInventory(false); // solo mutaciones: la lista no hace falta aquí
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

  // Mismos campos que la ficha del empleado (ver FormModal).
  const inputClasses = FORM_INPUT;
  const labelClasses = `block ${FORM_LABEL}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface rounded-2xl border border-line w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <ModalHeader
          icon="box"
          title={`${insumoData ? 'Editar' : 'Nuevo'} ${isAsset ? 'activo fijo' : 'insumo'}`}
          badge={insumoData ? 'Edición' : undefined}
          subtitle={isAsset ? 'Equipo y mobiliario del local' : 'Producto que se descuenta al vender'}
          onClose={onClose}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <ModalBody>
          <FormSection icon="list" title={isAsset ? 'Datos del activo' : 'Información general'}>
            <div className="space-y-3.5">
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
                {errors.name && <span className="text-ac text-xs mt-1 block font-medium">{errors.name.message}</span>}
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
                  {errors.price && <span className="text-ac text-xs mt-1 block font-medium">{errors.price.message}</span>}
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
                  {errors.quantity && <span className="text-ac text-xs mt-1 block font-medium">{errors.quantity.message}</span>}
                </div>
              </div>

              {!isAsset && (
                <div>
                  <label className={labelClasses}>Unidad</label>
                  <Select {...register('unit', { required: true })}>
                    {Object.entries(UNITS_BY_GROUP).map(([group, units]) => (
                      <optgroup key={group} label={GROUP_LABELS[group]}>
                        {units.map((u) => <option key={u} value={u}>{u}</option>)}
                      </optgroup>
                    ))}
                  </Select>
                </div>
              )}

            </div>
          </FormSection>

          <FormSection icon="location-dot" title={isAsset ? 'Ubicación y estado' : 'Ubicación y control de stock'}>
            <div className="space-y-3.5">
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
                {errors.ubication && <span className="text-ac text-xs mt-1 block font-medium">{errors.ubication.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={labelClasses}>Categoría</label>
                  <Select {...register('type')}>
                    {(isAsset ? ASSET_CATEGORIES : INVENTORY_CATEGORIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>

                {isAsset ? (
                  <div>
                    <label className={labelClasses}>Condición</label>
                    <Select {...register('condition')}>
                      {ASSET_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </div>
                ) : (
                  <div>
                    <label className={labelClasses}>Estado</label>
                    <Select {...register('status')}>
                      <option value="Disponible">Disponible</option>
                      <option value="Agotado">Agotado</option>
                      <option value="En Pedido">En Pedido</option>
                    </Select>
                  </div>
                )}
              </div>

              {isAsset ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className={labelClasses}>Estado de uso</label>
                    <Select {...register('status')}>
                      <option value="Disponible">En uso</option>
                      <option value="Agotado">Fuera de servicio</option>
                    </Select>
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
                  {errors.lowStockAlert && <span className="text-ac text-xs mt-1 block font-medium">{errors.lowStockAlert.message}</span>}
                  <p className="text-[11px] text-muted mt-1">Se avisa cuando la cantidad disponible caiga a este nivel o menos.</p>
                </div>
              )}

            </div>
          </FormSection>

          <FormSection icon="camera" title="Imagen" badge={<OptionalBadge />}>
            <ImagePickerField
              imageFile={imageFile}
              currentImage={insumoData?.image}
              onPick={(file) => setRawImageFile(file)}
              onAdjust={() => setRawImageFile(imageFile)}
              onRemove={() => setImageFile(null)}
            />
          </FormSection>

          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={onClose} className={MODAL_BTN_SECONDARY}>
              Cancelar
            </button>
            <button type="submit" className={MODAL_BTN_PRIMARY}>
              <FAIcon icon="check" size="xs" />
              Guardar
            </button>
          </ModalFooter>
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
