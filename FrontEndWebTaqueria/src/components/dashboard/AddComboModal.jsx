import React from 'react'
import { useForm } from 'react-hook-form'
import FAIcon from '../commons/FAIcon'

const AddComboModal = ({ isOpen, onClose, onSave, loading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    try {
      // Crear FormData para enviar la imagen como archivo
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('price', parseFloat(data.price))
      formData.append('description', data.description)
      formData.append('quantity', 1)
      formData.append('status', 'available')
      
      // Si hay una imagen seleccionada, agregarla
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0])
      }

      await onSave(formData)
      reset() // Limpiar el formulario después de guardar
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Nuevo Combo</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading}
          >
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del Combo
            </label>
            <input
              type="text"
              {...register('name', { 
                required: 'El nombre es requerido',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
              placeholder="Ej: Combo Taquero"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              disabled={loading}
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Precio
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('price', { 
                required: 'El precio es requerido',
                min: { value: 0.01, message: 'El precio debe ser mayor a 0' },
                valueAsNumber: true
              })}
              placeholder="Ej: 14.50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              disabled={loading}
            />
            {errors.price && (
              <span className="text-red-500 text-xs mt-1">{errors.price.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              {...register('description', { 
                required: 'La descripción es requerida',
                minLength: { value: 10, message: 'Mínimo 10 caracteres' }
              })}
              placeholder="Describe los componentes del combo..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              disabled={loading}
            />
            {errors.description && (
              <span className="text-red-500 text-xs mt-1">{errors.description.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagen del Combo
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('image', { 
                required: 'La imagen es requerida',
                validate: {
                  fileSize: (value) => {
                    if (!value[0]) return true
                    const maxSize = 5 * 1024 * 1024 // 5MB
                    return value[0].size <= maxSize || 'La imagen no debe superar 5MB'
                  },
                  fileType: (value) => {
                    if (!value[0]) return true
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
                    return allowedTypes.includes(value[0].type) || 'Formato no permitido (JPEG, PNG, WebP, GIF)'
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Formatos aceptados: JPEG, PNG, WebP, GIF. Máximo 5MB
            </p>
            {errors.image && (
              <span className="text-red-500 text-xs mt-1">{errors.image.message}</span>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Combo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddComboModal