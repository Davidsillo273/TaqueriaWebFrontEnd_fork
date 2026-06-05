import React from 'react'
import Icon from './Icon'

// Input reutilizable con icono a la izquierda y opcional elemento a la derecha
const TextInput = ({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  leftIcon,
  rightElement,
  error
}) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-500 mb-2">{label}</label>
      <div className={`flex items-center bg-gray-50 rounded-md px-3 py-2 border ${error ? 'border-red-300' : 'border-transparent'}`}>
        {leftIcon && (
          <span className="text-gray-400 mr-3 w-5 h-5 flex-shrink-0">
            <Icon name={leftIcon} className="w-5 h-5" />
          </span>
        )}
        <input
          id={id}
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {rightElement && <div className="ml-3">{rightElement}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default TextInput
