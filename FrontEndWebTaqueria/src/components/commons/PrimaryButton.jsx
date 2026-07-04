import React from 'react'

// Botón primario reutilizable con estilo sólido rojo, coherente con el resto del sistema
const PrimaryButton = ({ children, onClick, className = '', disabled = false, type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-white font-semibold py-3 rounded-lg shadow-sm transition-colors bg-red-600 hover:bg-red-700 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  )
}

export default PrimaryButton