// src/components/commons/DuplicateNameDialog.jsx
// Aviso (no bloqueante) de que ya existe un ítem con el nombre que se está
// por crear. El admin decide: editar el existente o crear de todas formas.
import React from 'react';
import FAIcon from './FAIcon';

const DuplicateNameDialog = ({ existing, onEditExisting, onCreateAnyway, onCancel }) => {
  if (!existing) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] w-full max-w-md overflow-hidden border border-white/80">
        <div className="flex items-center gap-2 p-4 sm:p-5 bg-amber-500 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.2)]">
          <FAIcon icon="triangle-exclamation" size="sm" />
          <h2 className="text-base sm:text-lg font-display font-bold">Ya existe un ítem con este nombre</h2>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-white/80 shadow-sm">
            {existing.image && (
              <img src={existing.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-display font-semibold text-gray-900 text-sm truncate">{existing.name}</p>
              {existing.price !== undefined && (
                <p className="text-xs text-gray-500 mt-0.5">${Number(existing.price).toFixed(2)}</p>
              )}
              {existing.status && (
                <p className="text-xs text-gray-400 mt-0.5">Estado: {existing.status}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onEditExisting}
              className="w-full px-4 py-2.5 bg-red-500 text-white rounded-2xl font-display font-semibold text-sm hover:bg-red-600 transition-all
                shadow-[0_6px_16px_rgba(220,38,38,0.35),inset_1px_1px_2px_rgba(255,255,255,0.3)]"
            >
              Editar el existente
            </button>
            <button
              type="button"
              onClick={onCreateAnyway}
              className="w-full px-4 py-2.5 bg-white text-gray-700 rounded-2xl font-display font-semibold text-sm hover:bg-gray-50 transition-all border border-white/80"
            >
              Crear de todas formas
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-2 text-gray-500 text-xs hover:text-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateNameDialog;
