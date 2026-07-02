import React from 'react';
import { useClientForm } from '../../hooks/useClientForm';
import PrimaryButton from '../commons/PrimaryButton';
import FAIcon from '../commons/FAIcon';

const ClientModal = ({ isOpen, onClose, editingClient, onSuccess }) => {
  const { register, handleSubmit, errors, onSubmitClient, isSubmitting, submitError } = useClientForm(onClose, editingClient, onSuccess);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#E5E7EB]">
        
        <div className="p-5 flex justify-between items-center bg-[#AF101A] text-white">
          <h3 className="text-lg font-bold">Editar Perfil del Cliente</h3>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer border-0 bg-transparent">
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitClient)} className="p-6 space-y-4">
          
          {submitError && (
            <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md font-semibold">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
            <input 
              type="text"
              {...register('name', { required: 'El nombre es obligatorio' })}
              className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none bg-white text-gray-900 ${errors.name ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#AF101A]'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Apellido</label>
            <input 
              type="text"
              {...register('lastname', { required: 'El apellido es obligatorio' })}
              className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none bg-white text-gray-900 ${errors.lastname ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#AF101A]'}`}
            />
            {errors.lastname && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.lastname.message}</p>}
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="w-1/2 py-3 bg-[#EFEDED] text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer border-0"
            >
              Cancelar
            </button>
            <div className="w-1/2 text-sm">
              <PrimaryButton type="submit" disabled={isSubmitting} className="!py-3 rounded-xl text-white font-bold w-full bg-[#AF101A] hover:bg-red-800">
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </PrimaryButton>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ClientModal;