import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import useSaucers from '../../hooks/useSaucers'
import useDrinks from '../../hooks/useDrinks'
import FAIcon from '../commons/FAIcon'

const AddComboModal = ({ isOpen, onClose, onSave, loading, comboToEdit = null }) => {
  const { saucers, loading: loadingSaucers } = useSaucers()
  const { drinks, loading: loadingDrinks } = useDrinks()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      price: '',
      description: '',
      quantity: 1,
      status: 'available',
      drinksId: '',
      saucers: [{ saucerId: '' }] // Estructura inicial dinámica
    }
  })

  // useFieldArray nos permite controlar la lista dinámica de platillos
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'saucers'
  })

  // CONTROL DE AUTO-RELLENADO PARA ACTUALIZAR
  useEffect(() => {
    if (isOpen) {
      if (comboToEdit) {
        setValue('name', comboToEdit.name)
        setValue('price', comboToEdit.price)
        setValue('description', comboToEdit.description)
        setValue('quantity', comboToEdit.quantity || 1)
        setValue('status', comboToEdit.status || 'available')
        setValue('drinksId', comboToEdit.drinksId?._id || comboToEdit.drinksId || '')

        // Si el backend te devuelve un array de platillos o uno solo, lo adaptamos al formato dinámico
        if (comboToEdit.saucersId) {
          const rawId = comboToEdit.saucersId?._id || comboToEdit.saucersId
          setValue('saucers', [{ saucerId: rawId }])
        } else if (comboToEdit.saucers && comboToEdit.saucers.length > 0) {
          setValue('saucers', comboToEdit.saucers.map(s => ({ saucerId: s._id || s })))
        } else {
          setValue('saucers', [{ saucerId: '' }])
        }
      } else {
        reset({
          name: '',
          price: '',
          description: '',
          quantity: 1,
          status: 'available',
          drinksId: '',
          saucers: [{ saucerId: '' }],
          image: null
        })
      }
    }
  }, [comboToEdit, isOpen, setValue, reset])

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('price', parseFloat(data.price))
      formData.append('description', data.description)
      formData.append('quantity', parseInt(data.quantity) || 1)
      formData.append('status', data.status)
      formData.append('drinksId', data.drinksId)
      
      // Mapeamos los platillos seleccionados filtrando los vacíos
      const validSaucers = data.saucers.filter(s => s.saucerId !== '').map(s => s.saucerId)
      
      if (validSaucers.length > 0) {
        formData.append('saucersId', validSaucers[0]) 
      }

      if (data.image && data.image[0]) {
        formData.append('image', data.image[0])
      }

      await onSave(formData, comboToEdit?._id)
      reset()
    } catch (error) {
      console.error('Error al procesar el formulario del combo:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-red-500 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-red-600">
          <div className="flex items-center gap-2">
            <span className="text-xl">{comboToEdit ? '' : ''}</span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {comboToEdit ? 'Actualizar combo' : 'Nuevo Combo'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-all"
            disabled={loading}
          >
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto flex-1 bg-white">
          
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nombre del Combo</label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es obligatorio' })}
              placeholder="Ej: Combo almuerzo doble"
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400 text-gray-700 bg-gray-50/50"
              disabled={loading}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.name.message}</span>}
          </div>

          {/* SECCIÓN DINÁMICA DE PLATILLOS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Platillos del combo ({fields.length})
              </label>
              <button
                type="button"
                onClick={() => append({ saucerId: '' })}
                className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                disabled={loading || loadingSaucers}
              >
                <FAIcon icon="plus" size="xs" /> Agregar otro platillo
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 animate-slide-down">
                <div className="flex-1">
                  <select
                    {...register(`saucers.${index}.saucerId`, { required: 'Selecciona un platillo base' })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white text-gray-700 text-sm transition-all"
                    disabled={loading || loadingSaucers}
                  >
                    <option value="">-- Elige el platillo {index + 1} --</option>
                    {saucers.map((saucer) => (
                      <option key={saucer._id} value={saucer._id}>
                        {saucer.name} (${parseFloat(saucer.price || 0).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Eliminar platillo"
                  >
                    <FAIcon icon="trash" size="sm" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* SELECCIÓN DE BEBIDA */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Bebida del combo</label>
            <select
              {...register('drinksId', { required: 'Debes seleccionar una bebida' })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white text-gray-700 text-sm transition-all"
              disabled={loading || loadingDrinks}
            >
              <option value="">-- Selecciona una bebida del menú --</option>
              {drinks.map((drink) => (
                <option key={drink.id} value={drink.id}>
                  {drink.title} (${parseFloat(drink.price || 0).toFixed(2)})
                </option>
              ))}
            </select>
            {errors.drinksId && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.drinksId.message}</span>}
          </div>

          {/* Precio e Inventario */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Precio($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', { required: 'El precio es obligatorio', valueAsNumber: true })}
                placeholder="0.00"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-700 bg-gray-50/50"
                disabled={loading}
              />
              {errors.price && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.price.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Estado</label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white text-gray-700 text-sm transition-all"
                disabled={loading}
              >
                <option value="available">Disponible</option>
                <option value="unavailable">No Disponible</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descripción del platillo</label>
            <textarea
              {...register('description', { required: 'La descripción es obligatoria' })}
              placeholder="Ej: Dos platillos especiales acompañados de una bebida fría..."
              rows="2"
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none text-gray-700 bg-gray-50/50"
              disabled={loading}
            />
            {errors.description && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.description.message}</span>}
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Imagen</label>
            {comboToEdit && comboToEdit.image && (
              <div className="mb-3 flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <img src={comboToEdit.image} alt="Actual" className="w-10 h-10 object-cover rounded-lg shadow-sm" />
                <span className="text-xs text-gray-400 truncate">Conservar imagen de Cloudinary</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              {...register('image', { 
                required: comboToEdit ? false : 'La imagen es obligatoria' 
              })}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100 file:transition-colors cursor-pointer"
              disabled={loading}
            />
            {errors.image && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.image.message}</span>}
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:opacity-95 font-semibold text-sm transition-all shadow-md shadow-red-600/10"
            >
              {loading ? 'Procesando...' : comboToEdit ? 'Guardar cambios' : 'Guardar combo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddComboModal