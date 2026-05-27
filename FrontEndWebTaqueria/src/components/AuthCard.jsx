import React from 'react'

// Contenedor blanco con sombra para formularios de autenticación
const AuthCard = ({ children }) => {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 relative">
      {children}
    </div>
  )
}

export default AuthCard
