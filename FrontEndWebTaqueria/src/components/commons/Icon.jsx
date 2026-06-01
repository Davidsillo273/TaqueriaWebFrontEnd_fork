import React from 'react'

// Componente simple para iconos SVG reutilizables
// Incluye iconos usados en la pantalla de login
const Icon = ({ name, className = '' }) => {
  switch (name) {
    case 'logo':
      return (
        <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Corral fence - left arc */}
          <path d="M 40 80 Q 30 60, 40 40" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" fill="none" />
          {/* Corral fence - right arc */}
          <path d="M 160 80 Q 170 60, 160 40" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" fill="none" />
          {/* Corral fence - vertical posts left */}
          <line x1="55" y1="45" x2="55" y2="120" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
          <line x1="75" y1="45" x2="75" y2="120" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
          <line x1="125" y1="45" x2="125" y2="120" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
          <line x1="145" y1="45" x2="145" y2="120" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
          {/* Corral fence - horizontal bars */}
          <line x1="40" y1="65" x2="160" y2="65" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
          <line x1="40" y1="95" x2="160" y2="95" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
          {/* Pepperoni shape - main body */}
          <ellipse cx="100" cy="75" rx="22" ry="28" fill="#1a1a1a" />
          {/* Pepperoni stem */}
          <path d="M 105 45 Q 110 35, 105 25" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Pepperoni shine/highlight */}
          <ellipse cx="95" cy="65" rx="6" ry="10" fill="#fff" opacity="0.3" />
        </svg>
      )
    case 'mail':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 7.5v9A2.5 2.5 0 0 0 5.5 19h13A2.5 2.5 0 0 0 21 16.5v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 7.5L12 13 3 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'lock':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'eye':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'eyeOff':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6 0-10-7-10-7 .98-1.74 2.43-3.37 4.22-4.78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}

export default Icon
