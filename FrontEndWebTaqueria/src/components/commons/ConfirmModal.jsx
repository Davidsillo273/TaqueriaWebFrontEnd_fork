import React from 'react';
import FAIcon from './FAIcon';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar', 
  loading = false,
  icon = 'exclamation-triangle', 
  variant = 'danger', 
}) => {
  if (!isOpen) return null;

  // Variantes de color para el ícono
  const variantStyles = {
    danger: {
      bg: 'bg-red-100',
      icon: 'text-red-500',
      btn: 'bg-red-500 hover:bg-red-600 shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]',
    },
    warning: {
      bg: 'bg-amber-100',
      icon: 'text-amber-500',
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-[0_6px_16px_rgba(245,158,11,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full ${currentVariant.bg} flex items-center justify-center flex-shrink-0 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)]`}
          >
            <FAIcon icon={icon} className={currentVariant.icon} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-display font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 text-sm font-display font-semibold text-white rounded-2xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${currentVariant.btn}`}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;