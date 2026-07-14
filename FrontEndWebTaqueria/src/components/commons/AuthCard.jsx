import React from 'react'

const AuthCard = ({ children }) => {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1),inset_1px_1px_3px_rgba(255,255,255,0.8)] border border-white/80 p-6 sm:p-8 relative">
      {children}
    </div>
  )
}

export default AuthCard