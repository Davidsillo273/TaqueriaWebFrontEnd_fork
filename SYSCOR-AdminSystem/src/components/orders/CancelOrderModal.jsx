import { useState, useEffect } from 'react'
import {
  ModalShell, ModalHeader, ModalBody, ModalFooter, FormSection,
  FORM_INPUT, FORM_LABEL, FORM_ERROR, MODAL_BTN_SECONDARY, MODAL_BTN_PRIMARY,
} from '@syscor/web-shared/src/components/FormModal'

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
    <ModalShell maxWidth="max-w-md">
      <ModalHeader
        icon="ban"
        title={`Cancelar pedido ${orderCode || ''}`.trim()}
        subtitle="Requiere autorización de un administrador"
        onClose={loading ? undefined : onClose}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <ModalBody>
          <FormSection icon="lock" title="Autorización">
            <p className="text-[13px] text-inkalt leading-relaxed mb-3.5">
              Esta acción requiere autorización de un administrador. Ingresa su contraseña para confirmar.
            </p>
            <label className="block">
              <span className={FORM_LABEL}>Contraseña del administrador</span>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className={FORM_INPUT}
              />
              {error && <span className={FORM_ERROR}>{error}</span>}
            </label>
          </FormSection>
        </ModalBody>

        <ModalFooter>
          <button type="button" onClick={onClose} disabled={loading} className={MODAL_BTN_SECONDARY}>
            Volver
          </button>
          <button type="submit" disabled={loading} className={MODAL_BTN_PRIMARY}>
            {loading ? 'Cancelando...' : 'Cancelar pedido'}
          </button>
        </ModalFooter>
      </form>
    </ModalShell>
  )
}
