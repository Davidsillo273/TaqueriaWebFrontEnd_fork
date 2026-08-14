import React, { useState, useEffect } from 'react'
import FAIcon from '../commons/FAIcon'

// Pide la contraseña de un administrador para autorizar la cancelación de un
// pedido ya tomado (a diferencia de un simple "Eliminar", esto queda
// registrado como "cancelled" en vez de borrarse).
export default function CancelOrderModal({ isOpen, onClose, onConfirm, orderCode, loading }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) {
      setError('Ingresa la contraseña del administrador')
      return
    }
    const result = await onConfirm(password)
    if (result && result.success === false) {
      setError(result.message || 'Contraseña incorrecta')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)]">
            <FAIcon icon="ban" className="text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold text-gray-900 mb-1">Cancelar pedido {orderCode}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Esta acción requiere autorización de un administrador. Ingresa su contraseña para confirmar.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Contraseña del administrador
          </label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-[#f3f0eb] border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all text-gray-700 text-sm shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]"
          />
          {error && (
            <span className="text-red-500 text-xs mt-1.5 block font-medium">{error}</span>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-display font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] disabled:opacity-50 cursor-pointer"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-sm font-display font-semibold text-white rounded-2xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer bg-red-500 hover:bg-red-600 shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]"
            >
              {loading ? 'Cancelando...' : 'Cancelar pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
