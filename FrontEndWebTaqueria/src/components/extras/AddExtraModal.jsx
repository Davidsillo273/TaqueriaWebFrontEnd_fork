import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import FAIcon from '../commons/FAIcon'
import { useToast } from '../commons/ToastProvider'

const AddExtraModal = ({ isOpen, onClose, onAdd, editingExtra = null }) => {
  const { addToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      price: '',
      status: 'DISPONIBLE'
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (editingExtra) {
        setValue('name', editingExtra.name || '')
        setValue('price', editingExtra.price || '')
        setValue('status', editingExtra.status || 'DISPONIBLE')
      } else {
        reset({
          name: '',
          price: '',
          status: 'DISPONIBLE'
        })
      }
    }
  }, [editingExtra, isOpen, setValue, reset])

  const onSubmit = (data) => {
    // Validación extra de precio numérico (aunque el input es number, aseguramos)
    const priceNum = parseFloat(data.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast('El precio debe ser un número mayor a 0', 'error')
      return
    }
    onAdd(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all z-10">
        <div className="flex items-center justify-between p-4 sm:p-6 bg-red-600 text-white">
          <h2 className="text-lg sm:text-xl font-bold">
            {editingExtra ? 'Editar extra' : 'Nuevo extra'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del extra</label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
              })}
              placeholder="Ej: Queso Cheddar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Precio ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('price', {
                required: 'El precio es obligatorio',
                min: { value: 0.01, message: 'Debe ser mayor a 0' },
                valueAsNumber: true
              })}
              placeholder="Ej: 1.50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
            />
            {errors.price && <span className="text-red-500 text-xs mt-1 block">{errors.price.message}</span>}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900 text-sm"
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="AGOTADO">Agotado</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm transition-colors"
            >
              {editingExtra ? 'Actualizar extra' : 'Agregar extra'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddExtraModal