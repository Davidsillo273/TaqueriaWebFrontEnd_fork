import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import FAIcon from '../commons/FAIcon'
import { useToast } from '../commons/ToastProvider'

const AddDishModal = ({ isOpen, onClose, onSave, dishToEdit = null }) => {
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
      category: '',
      price: '',
      status: 'Activo',
      imageFile: null
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (dishToEdit) {
        setValue('name', dishToEdit.name || '')
        setValue('category', dishToEdit.category || '')
        setValue('price', dishToEdit.price || '')
        setValue('status', dishToEdit.status || 'Activo')
        setValue('imageFile', null)
      } else {
        reset({
          name: '',
          category: '',
          price: '',
          status: 'Activo',
          imageFile: null
        })
      }
    }
  }, [dishToEdit, isOpen, setValue, reset])

  const onSubmit = async (data) => {
    if (data.imageFile && data.imageFile[0] && data.imageFile[0].size > 5 * 1024 * 1024) {
      addToast('La imagen no debe superar los 5MB', 'error')
      return
    }

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('category', data.category)
    formData.append('price', parseFloat(data.price))
    formData.append('status', data.status)
    if (data.imageFile && data.imageFile[0]) {
      formData.append('image', data.imageFile[0])
    }

    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all z-10 border border-gray-100">
        <div className="bg-red-600 px-4 sm:px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-lg sm:text-xl font-bold tracking-wide">
            {dishToEdit ? 'Editar Platillo' : 'Nuevo Platillo'}
          </h2>
          <button type="button" onClick={onClose} className="text-white opacity-80 hover:opacity-100 transition-opacity p-1">
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 bg-white">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Platillo</label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es obligatorio', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
              placeholder="Ej. Tacos al Pastor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
            <input
              type="text"
              {...register('category', { required: 'La categoría es obligatoria', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
              placeholder="Ej. Tacos, Carnes, Aves"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
            />
            {errors.category && <span className="text-red-500 text-xs mt-1 block">{errors.category.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Precio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Precio ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', { required: 'El precio es obligatorio', min: { value: 0.01, message: 'Debe ser mayor a 0' }, valueAsNumber: true })}
                placeholder="0.00"
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
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Imagen del Platillo {dishToEdit && <span className="text-xs font-normal text-gray-400">(Opcional)</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('imageFile', { required: dishToEdit ? false : 'La imagen es obligatoria' })}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
            />
            {errors.imageFile && <span className="text-red-500 text-xs mt-1 block">{errors.imageFile.message}</span>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors shadow-sm">
              {dishToEdit ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDishModal