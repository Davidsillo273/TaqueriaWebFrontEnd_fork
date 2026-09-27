// src/components/tables/TableModal.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import FormModal, { FormSection, FORM_INPUT, FORM_LABEL, FORM_ERROR } from '../commons/FormModal';
import Select from '../commons/Select';
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

          <label className="block">
            <span className={FORM_LABEL}>Estado</span>
            <div className="mt-1">
              <Select {...register('status')}>
                <option value="libre">Disponible</option>
                <option value="ocupada">Ocupada</option>
                <option value="reservada">Reservada</option>
                <option value="limpieza">En Limpieza</option>
              </Select>
            </div>
          </label>
        </div>
      </FormSection>
    </FormModal>
  );
}