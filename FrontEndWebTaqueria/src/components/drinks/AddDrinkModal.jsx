import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import FAIcon from '../commons/FAIcon'
import { useToast } from '../commons/ToastProvider'

const AddDrinkModal = ({ isOpen, onClose, onSave, editData = null }) => {
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
      quantity: '',
      status: 'Disponible',
      imageFile: null
    }
  })

  // Sincroniza los valores del formulario cuando se abre para editar
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setValue('name', editData.title || '')
        setValue('price', editData.price || '')
        setValue('quantity', editData.stock || '')
        setValue('status', editData.status || 'Disponible')
        setValue('imageFile', null)
      } else {
        reset({
          name: '',
          price: '',
          quantity: '',
          status: 'Disponible',
          imageFile: null
        })
      }
    }
  }, [editData, isOpen, setValue, reset])

  const onSubmit = async (data) => {
    // Validación adicional de tamaño de imagen
    if (data.imageFile && data.imageFile[0] && data.imageFile[0].size > 5 * 1024 * 1024) {
      addToast('La imagen no debe superar los 5MB', 'error')
      return
    }

    // Construye FormData con los nombres que espera el backend
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('price', parseFloat(data.price))
    formData.append('quantity', parseInt(data.quantity))
    formData.append('status', data.status)
    if (data.imageFile && data.imageFile[0]) {
      formData.append('image', data.imageFile[0])
    }

    await onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {editData ? 'Editar Bebida' : 'Nueva Bebida'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          {/* Nombre (campo: name) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre de la Bebida
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
              placeholder="Ej: Limonada Natural"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-gray-900 text-sm"
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Precio (campo: price) */}
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
                placeholder="Ej: 3.50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-gray-900 text-sm"
              />
              {errors.price && (
                <span className="text-red-500 text-xs mt-1 block">{errors.price.message}</span>
              )}
            </div>

            {/* Cantidad/Stock (campo: quantity) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Inicial</label>
              <input
                type="number"
                min="0"
                {...register('quantity', {
                  required: 'El stock es obligatorio',
                  min: { value: 0, message: 'No puede ser negativo' },
                  valueAsNumber: true
                })}
                placeholder="Ej: 50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-gray-900 text-sm"
              />
              {errors.quantity && (
                <span className="text-red-500 text-xs mt-1 block">{errors.quantity.message}</span>
              )}
            </div>
          </div>

          {/* Estado (campo: status) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 bg-white text-gray-900 text-sm"
            >
              <option value="Disponible">Disponible</option>
              <option value="Más Vendido">Más Vendido</option>
              <option value="Agotado">Agotado</option>
            </select>
          </div>

          {/* Imagen (campo: image) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {editData ? 'Cambiar Imagen (Opcional)' : 'Imagen de la Bebida'}
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('imageFile', {
                required: editData ? false : 'La imagen es obligatoria'
              })}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100 file:transition-colors cursor-pointer"
            />
            {errors.imageFile && (
              <span className="text-red-500 text-xs mt-1 block">{errors.imageFile.message}</span>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              {editData ? 'Actualizar Cambios' : 'Guardar Bebida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDrinkModal