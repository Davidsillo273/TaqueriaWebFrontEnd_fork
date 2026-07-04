import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import FAIcon from '../commons/FAIcon'
import { useToast } from '../commons/ToastProvider'

const InventoryModal = ({ isOpen, onClose, insumoData, onSave }) => {
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
      ubication: '',
      type: 'Carnes',
      quantity: '',
      status: 'Disponible'
    }
  })

  // Sincroniza el formulario con los datos a editar
  useEffect(() => {
    if (isOpen) {
      if (insumoData) {
        setValue('name', insumoData.name || '')
        setValue('price', insumoData.price !== undefined ? insumoData.price : '')
        setValue('ubication', insumoData.ubication || '')
        setValue('type', insumoData.type || 'Carnes')
        setValue('quantity', insumoData.quantity !== undefined ? insumoData.quantity : '')
        setValue('status', insumoData.status || 'Disponible')
      } else {
        reset({
          name: '',
          price: '',
          ubication: '',
          type: 'Carnes',
          quantity: '',
          status: 'Disponible'
        })
      }
    }
  }, [insumoData, isOpen, setValue, reset])

  const onSubmit = async (data) => {
    // Validaciones extra antes de enviar (refuerzo de las validaciones del backend)
    const priceNum = parseFloat(data.price)
    const qtyNum = parseInt(data.quantity)

    if (data.name.trim().length < 3) {
      addToast('El nombre debe tener al menos 3 caracteres', 'error')
      return
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast('El precio debe ser un número mayor a 0', 'error')
      return
    }
    if (!data.ubication.trim()) {
      addToast('La ubicación es requerida', 'error')
      return
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      addToast('La cantidad debe ser un número positivo o cero', 'error')
      return
    }

    const payload = {
      name: data.name.trim(),
      price: priceNum,
      ubication: data.ubication.trim(),
      type: data.type,
      quantity: qtyNum,
      status: data.status
    }

    const result = await onSave(payload, insumoData?._id || insumoData?.id)
    if (result.success) {
      addToast(
        insumoData ? 'Insumo actualizado correctamente' : 'Insumo creado correctamente',
        'success'
      )
      onClose()
    } else {
      addToast(result.message || 'Error al guardar el insumo', 'error')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all z-10">
        <div className="bg-red-600 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold">
            {insumoData ? 'Editar Insumo' : 'Añadir Nuevo Insumo'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer text-lg"
          >
            <FAIcon icon="times" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Insumo</label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
              placeholder="Carne para Hamburguesa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Precio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', {
                  required: 'El precio es obligatorio',
                  min: { value: 0.01, message: 'Debe ser mayor a 0' },
                  valueAsNumber: true
                })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
              />
              {errors.price && <span className="text-red-500 text-xs mt-1 block">{errors.price.message}</span>}
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                min="0"
                {...register('quantity', {
                  required: 'La cantidad es obligatoria',
                  min: { value: 0, message: 'No puede ser negativa' },
                  valueAsNumber: true
                })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
              />
              {errors.quantity && <span className="text-red-500 text-xs mt-1 block">{errors.quantity.message}</span>}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              {...register('ubication', {
                required: 'La ubicación es obligatoria',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
              })}
              placeholder="Estante A - Nevera 2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
            />
            {errors.ubication && <span className="text-red-500 text-xs mt-1 block">{errors.ubication.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Tipo/Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo/Categoría</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900 text-sm"
              >
                <option value="Carnes">Carnes</option>
                <option value="Verduras">Verduras</option>
                <option value="Lácteos">Lácteos</option>
                <option value="Panadería">Panadería</option>
                <option value="Desechables">Desechables</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900 text-sm"
              >
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
                <option value="En Pedido">En Pedido</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InventoryModal