import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import DigitInput from '../components/auth/DigitInput'
import PrimaryButton from '../components/commons/PrimaryButton'
import AuthCard from '../components/commons/AuthCard'

// Página de verificación del código enviado al correo
export default function VerifyCode() {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef([])

  // Maneja el cambio en cada input de dígito y avanza al siguiente automáticamente
  const handleDigitChange = (value, index) => {
    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Navegación entre inputs con teclas de flecha y retroceso
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Valida que el código tenga 6 dígitos
  const validate = () => {
    const code = digits.join('')
    if (code.length < 6) {
      setError('Ingresa el código completo')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const code = digits.join('')
    // Aquí se implementará la verificación real contra el backend
    // Por ahora se muestra un estado de éxito
    setSuccess(true)
    console.log('Code verified:', code)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center relative overflow-hidden p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-red-100 opacity-60 blur-3xl" />
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-green-50 opacity-60 blur-3xl" />

      <AuthCard>
        {/* Encabezado con logo */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <img src="/logo.png" alt="Taquería El Corral" className="w-24 h-24 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Portal</h1>
          <p className="text-sm text-gray-500 mb-6">Recuperación de contraseña</p>
        </div>

        {/* Vista del formulario de verificación */}
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 text-center">Ingresa el código</h2>
              <p className="text-sm text-gray-600 text-center">
                Por favor, escribe el código de 6 dígitos que hemos enviado a tu correo.
              </p>
            </div>

            {/* Inputs para los 6 dígitos */}
            <div className="flex justify-center gap-3">
              {digits.map((digit, index) => (
                <DigitInput
                  key={index}
                  value={digit}
                  onChange={handleDigitChange}
                  onKeyDown={handleKeyDown}
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  index={index}
                />
              ))}
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <PrimaryButton type="submit">Verificar</PrimaryButton>

            <div className="text-center">
              <p className="text-xs text-gray-600">
                ¿No recibiste el código?{' '}
                <Link className="text-red-600 hover:underline font-semibold" to="/recovery">
                  Reenviar
                </Link>
              </p>
            </div>
          </form>
        ) : (
          /* Mensaje de éxito tras la verificación */
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">Código verificado correctamente</p>
              <p className="text-xs text-green-600 mt-1">Tu identidad ha sido confirmada</p>
            </div>
            <Link className="block text-sm text-red-600 hover:underline" to="/">
              Volver al login
            </Link>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400 text-center">
          © 2024 Taquería El Corral Admin Portal. Acceso restringido a personal autorizado.
        </p>
      </AuthCard>
    </div>
  )
}