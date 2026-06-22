import React from 'react';
import { useClientForm } from '../../hooks/useClientForm';
import PrimaryButton from '../commons/PrimaryButton';
import FAIcon from '../commons/FAIcon';

const clientModal = ({ isOpen, onClose }) => {
  // Jalamos todo lo del hook que creamos para limpiar la lógica de acá
  const { register, handleSubmit, errors, onSubmitClient } = useClientForm(onClose);

  // Si está cerrado, cortamos el renderizado en seco
  if (!isOpen) return null;

  return (
    // Capa oscura transparente de fondo
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      
      {/* Contenedor del Modal blanco */}
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#E5E7EB]">
        
        {/* Barra roja de arriba (#AF101A) idéntica al diseño */}
        <div className="p-5 flex justify-between items-center bg-[#AF101A] text-white">
          <h3 className="text-lg font-bold">Registrar Nuevo Cliente</h3>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer border-0 bg-transparent">
            <FAIcon icon="times" size="lg" />
          </button>
        </div>

        {/* Formulario con scroll por si la pantalla es chiquita */}
        <form onSubmit={handleSubmit(onSubmitClient)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Nombre y Apellido juntos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
              <input 
                type="text"
                {...register('personalInfo.name', { required: 'Ponele un nombre' })}
                placeholder="Juan" 
                className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none bg-white text-gray-900 ${errors.personalInfo?.name ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#AF101A]'}`}
              />
              {errors.personalInfo?.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.personalInfo.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Apellido</label>
              <input 
                type="text"
                {...register('personalInfo.lastname', { required: 'Ponele un apellido' })}
                placeholder="Pérez" 
                className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none bg-white text-gray-900 ${errors.personalInfo?.lastname ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#AF101A]'}`}
              />
              {errors.personalInfo?.lastname && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.personalInfo.lastname.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email (Login)</label>
            <input 
              type="email"
              {...register('loginInfo.email', { 
                required: 'El correo es de ley',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Correo mal escrito' }
              })}
              placeholder="usuario@elcorral.com" 
              className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none bg-white text-gray-900 ${errors.loginInfo?.email ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#AF101A]'}`}
            />
            {errors.loginInfo?.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.loginInfo.email.message}</p>}
          </div>

          {/* Teléfono y fecha de nacimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
              <input 
                type="text"
                {...register('personalInfo.phones.main', { required: 'Falta el número' })}
                placeholder="503+ 1234-5678" 
                className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none bg-white text-gray-900 ${errors.personalInfo?.phones?.main ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#AF101A]'}`}
              />
              {errors.personalInfo?.phones?.main && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.personalInfo.phones.main.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input 
                type="date"
                {...register('personalInfo.birthdate', { required: 'Falta la fecha' })}
                className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none bg-white text-gray-700 ${errors.personalInfo?.birthdate ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#AF101A]'}`}
              />
              {errors.personalInfo?.birthdate && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.personalInfo.birthdate.message}</p>}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Dirección Principal (Casa)</label>
            <input 
              type="text"
              {...register('personalInfo.addresses.0.details', { required: 'Falta la dirección' })}
              placeholder="Calle Principal, Polígono X, Casa #5" 
              className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none bg-white text-gray-900 ${errors.personalInfo?.addresses?.[0]?.details ? 'border-red-500' : 'border-[#E5E7EB] focus:border-[#AF101A]'}`}
            />
            {errors.personalInfo?.addresses?.[0]?.details && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.personalInfo.addresses[0].details.message}</p>}
          </div>

          {/* Tarjeta (Opcional) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Número de Tarjeta (Fidelidad - Opcional)</label>
            <input 
              type="text"
              {...register('personalInfo.card')}
              placeholder="CR-998234" 
              className="w-full border border-[#E5E7EB] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#AF101A] bg-white text-gray-900" 
            />
          </div>

          {/* Botones de abajo con estilos de la captura */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="w-1/2 py-3 bg-[#EFEDED] text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer border-0"
            >
              Cancelar
            </button>
            <div className="w-1/2 text-sm">
              <PrimaryButton 
                type="submit" 
                className="!py-3 rounded-xl text-white font-bold w-full bg-[#AF101A] hover:bg-red-800 transition-colors cursor-pointer"
              >
                Guardar
              </PrimaryButton>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default clientModal;