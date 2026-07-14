import React from 'react'

const PrimaryButton = ({ children, onClick, className = '', disabled = false, type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-white font-display font-semibold py-3 rounded-2xl transition-all shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)] bg-red-500 hover:bg-red-600 active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

export default PrimaryButton