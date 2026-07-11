import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import FAIcon from '../commons/FAIcon'
import { useToast } from '../commons/ToastProvider'

const ClientModal = ({ isOpen, onClose, editingClient, onSuccess }) => {
  const { addToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      lastname: ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (editingClient) {
        setValue('name', editingClient.personalInfo?.name || '')
        setValue('lastname', editingClient.personalInfo?.lastname || '')
      } else {
        reset({ name: '', lastname: '' })
      }
    }
  }, [editingClient, isOpen, setValue, reset])

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`http://localhost:4000/api/clients/${editingClient._id || editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalInfo: {
            name: data.name.trim(),
            lastname: data.lastname.trim()
          }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Error al actualizar')

      onSuccess()  // cierra modal y recarga lista + toast
    } catch (err) {
      addToast(err.message || 'Error al guardar los cambios', 'error')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <div className="bg-red-600 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold">Editar Perfil del Cliente</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <FAIcon icon="times" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
            <input
              type="text"
              {...register('lastname', { required: 'El apellido es obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm ${errors.lastname ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.lastname && <span className="text-red-500 text-xs mt-1 block">{errors.lastname.message}</span>}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60">
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientModal