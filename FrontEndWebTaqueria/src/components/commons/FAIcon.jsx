import React from 'react'

// Componente para usar iconos de Font Awesome de forma reutilizable
const FAIcon = ({ icon, className = '', size = 'base' }) => {
  const sizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  }

  return <i className={`fas fa-${icon} ${sizeMap[size]} ${className}`} />
}

export default FAIcon