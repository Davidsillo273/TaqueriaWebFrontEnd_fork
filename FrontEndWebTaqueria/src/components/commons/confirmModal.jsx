// src/components/commons/confirmModal.jsx
import React from 'react';
import FAIcon from './FAIcon';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80 max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0
            shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)]">
            <FAIcon icon="exclamation-triangle" className="text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold text-gray-900 mb-1">
              {title || 'Confirmar acción'}
            </h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-display font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors
              shadow-[0_4px_10px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)]
            "
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-display font-semibold text-white bg-red-500 hover:bg-red-600 rounded-2xl transition-colors
              shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;