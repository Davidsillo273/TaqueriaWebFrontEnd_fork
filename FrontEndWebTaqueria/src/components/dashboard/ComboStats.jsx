import React from 'react'
import FAIcon from '../commons/FAIcon'

// Tarjeta de estadística para combos
const ComboStats = ({ icon, title, value, label, highlighted = false }) => {
  return (
    <div className={`rounded-lg p-4 sm:p-6 border-l-4 ${highlighted ? 'border-l-red-600 bg-red-50' : 'border-l-gray-300 bg-white'} border border-gray-200`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs sm:text-sm font-semibold ${highlighted ? 'text-gray-700' : 'text-gray-600'}`}>{title}</p>
        <FAIcon icon={icon} size="lg" className={highlighted ? 'text-red-600' : 'text-gray-400'} />
      </div>
      <h3 className={`text-2xl sm:text-3xl font-bold mb-1 ${highlighted ? 'text-red-600' : 'text-gray-900'}`}>{value}</h3>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

export default ComboStats