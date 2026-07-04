import React from 'react'
import FAIcon from '../commons/FAIcon'

// Tarjeta de alerta o información especial
const AlertCard = ({ type, title, subtitle, icon }) => {
  const typeStyles = {
    warning: 'bg-red-600 text-white',
    success: 'bg-green-500 text-white',
    dark: 'bg-gray-900 text-white',
  }

  return (
    <div className={`rounded-lg p-4 sm:p-6 ${typeStyles[type]}`}>
      <div className="flex items-start gap-3">
        <FAIcon icon={icon} size="2xl" />
        <div>
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs opacity-90">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

export default AlertCard