// src/components/tables/TableModal.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormModal, { FormSection, FORM_INPUT, FORM_LABEL, FORM_ERROR } from '@syscor/web-shared/src/components/FormModal';
import Select from '../commons/Select';
import { useToast } from '@syscor/web-shared/src/components/ToastProvider';
import { TABLE_ZONES } from '../../constants/tables';

const EMPTY = { number: '', status: 'libre', capacity: 4, zone: 'salon_central' };

export default function TableModal({ isOpen, onClose, onSave, currentTable }) {
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (isOpen) {
      if (currentTable) {
        setValue('number', currentTable.number || '');
        setValue('status', currentTable.status || 'libre');
        setValue('capacity', currentTable.capacity || 4);
        setValue('zone', currentTable.zone || 'salon_central');
      } else {
        reset(EMPTY);
      }
    }
  }, [currentTable, isOpen, setValue, reset]);

  const onSubmit = (data) => {
    const num = parseInt(data.number);
    if (isNaN(num) || num <= 0) {
      addToast('El número de mesa debe ser un entero positivo', 'error');
      return;
    }
    const capacity = parseInt(data.capacity);
    if (isNaN(capacity) || capacity < 1 || capacity > 20) {
      addToast('La capacidad debe estar entre 1 y 20 personas', 'error');
      return;
    }
    onSave({ number: num, status: data.status, capacity, zone: data.zone });
  };

  if (!isOpen) return null;

  return (
    <FormModal
      icon="chair"
      title={currentTable ? 'Editar mesa' : 'Nueva mesa'}
      badge={currentTable ? 'Edición' : undefined}
      subtitle={currentTable ? `Mesa ${currentTable.number}` : 'Agrega una mesa al salón'}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={currentTable ? 'Guardar cambios' : 'Crear mesa'}
      maxWidth="max-w-md"
    >
      <FormSection icon="list" title="Información de la mesa">
        <div className="space-y-4">
          <label className="block">
            <span className={FORM_LABEL}>Número de la mesa</span>
            <input
              type="number"
              {...register('number', {
                required: 'El número es obligatorio',
                min: { value: 1, message: 'Debe ser positivo' },
                valueAsNumber: true,
              })}
              placeholder="Ej: 8"
              className={`${FORM_INPUT} num`}
            />
            {errors.number && <span className={FORM_ERROR}>{errors.number.message}</span>}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={FORM_LABEL}>Capacidad (personas)</span>
              <input
                type="number"
                {...register('capacity', {
                  required: 'La capacidad es obligatoria',
                  min: { value: 1, message: 'Mínimo 1' },
                  max: { value: 20, message: 'Máximo 20' },
                  valueAsNumber: true,
                })}
                placeholder="Ej: 4"
                className={`${FORM_INPUT} num`}
              />
              {errors.capacity && <span className={FORM_ERROR}>{errors.capacity.message}</span>}
            </label>

            <label className="block">
              <span className={FORM_LABEL}>Ubicación</span>
              <div className="mt-1">
                <Select {...register('zone')}>
                  {Object.entries(TABLE_ZONES).map(([key, zone]) => (
                    <option key={key} value={key}>
                      {zone.label} · {zone.floor}
                    </option>
                  ))}
                </Select>
              </div>
            </label>
          </div>

          <label className="block">
            <span className={FORM_LABEL}>Estado</span>
            <div className="mt-1">
              <Select {...register('status')}>
                <option value="libre">Disponible</option>
                <option value="ocupada">Ocupada</option>
                <option value="reservada">Reservada</option>
              </Select>
            </div>
          </label>
        </div>
      </FormSection>
    </FormModal>
  );
}