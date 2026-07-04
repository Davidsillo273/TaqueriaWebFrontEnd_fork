import React from 'react'
import FAIcon from '../commons/FAIcon'
import { useAuth } from '../../hooks/auth/useAuth'

// Traduce el rol técnico del backend a una etiqueta legible en la UI
const ROLE_LABELS = {
  admin: 'Administrador',
  employee: 'Empleado',
  customer: 'Cliente',
}

// Genera iniciales a partir de nombre/apellido, para el avatar cuando no hay imagen
const getInitials = (name, lastname) => {
  const first = name?.trim()?.[0] || ''
  const second = lastname?.trim()?.[0] || ''
  return (first + second).toUpperCase() || '?'
}

const TopBar = ({ onMenuClick }) => {
  const { user, isLoading } = useAuth()

  const fullName = user ? `${user.name || ''} ${user.lastname || ''}`.trim() : ''
  const roleLabel = user ? (ROLE_LABELS[user.role] || user.role) : ''

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
      {/* Botón hamburguesa visible solo en móvil/tableta */}
      <button
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 mr-2"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <FAIcon icon="bars" size="lg" />
      </button>

      <div className="flex-1 max-w-md">
        {/* Input de búsqueda vacío, se mantiene espacio */}
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button className="relative p-2 text-gray-600 hover:text-gray-900">
          <FAIcon icon="bell" size="lg" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
        </button>

        <button className="p-2 text-gray-600 hover:text-gray-900">
          <FAIcon icon="cog" size="lg" />
        </button>

        <div className="hidden sm:flex items-center gap-3 pl-4 sm:pl-6 border-l border-gray-200">
          {isLoading ? (
            <>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-col text-xs sm:text-sm hidden sm:flex gap-1">
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-14 h-2 bg-gray-200 rounded animate-pulse" />
              </div>
            </>
          ) : (
            <>
              {user?.image ? (
                <img
                  src={user.image}
                  alt={fullName}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  {getInitials(user?.name, user?.lastname)}
                </div>
              )}
              <div className="flex-col text-xs sm:text-sm hidden sm:flex">
                <span className="font-semibold text-gray-900">{fullName || 'Usuario'}</span>
                <span className="text-xs text-gray-500">{roleLabel}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopBar