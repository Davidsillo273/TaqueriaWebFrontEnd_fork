import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TextInput from '../components/commons/TextInput'
import PrimaryButton from '../components/commons/PrimaryButton'
import AuthCard from '../components/commons/AuthCard'

// Página de recuperación de contraseña
export default function Recovery() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  // Validación del correo electrónico
  const validate = () => {
    const newErrors = {}
    if (!email) newErrors.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Ingresa un correo válido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    // Aquí se implementará la llamada al backend para enviar el código de recuperación
    // Por ahora se simula el envío y se redirige a la verificación del código
    setSuccess(true)
    setTimeout(() => {
      navigate('/verify-code')
    }, 1500)
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

        {/* Vista del formulario de recuperación */}
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              id="email"
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <p className="text-xs text-gray-500 text-center">
              Ingresa tu correo para recibir un código de recuperación
            </p>

            <PrimaryButton type="submit">Enviar código</PrimaryButton>

            <div className="text-center">
              <Link className="text-sm text-red-600 hover:underline" to="/">Volver al login</Link>
            </div>
          </form>
        ) : (
          /* Mensaje de éxito tras el envío */
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">Correo enviado correctamente</p>
              <p className="text-xs text-green-600 mt-1">
                Revisa tu bandeja de entrada para el código de recuperación
              </p>
            </div>
            <Link className="block text-sm text-red-600 hover:underline" to="/">Volver al login</Link>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400 text-center">
          © 2024 Taquería El Corral Admin Portal. Acceso restringido a personal autorizado.
        </p>
      </AuthCard>
    </div>
  )
}