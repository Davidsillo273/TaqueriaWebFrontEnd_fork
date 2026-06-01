import React from 'react'

// Botón primario reutilizable con estilo gradiente rojo
const PrimaryButton = ({ children, onClick, className = '', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} w-full text-white font-semibold py-3 rounded-md shadow-sm transition-opacity disabled:opacity-60`} 
      style={{ background: 'linear-gradient(180deg,#c71b1b,#b10f0f)' }}
    >
      {children}
    </button>
  )
}

export default PrimaryButton
