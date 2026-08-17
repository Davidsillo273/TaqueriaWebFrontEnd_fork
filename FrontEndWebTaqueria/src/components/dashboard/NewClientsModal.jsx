// src/components/dashboard/NewClientsModal.jsx
import React from 'react';
import FAIcon from '../commons/FAIcon';

const NewClientsModal = ({ isOpen, onClose, clients }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/80 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-red-500 px-5 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-white font-display font-bold text-lg">Clientes Nuevos</h3>
            <p className="text-white/80 text-xs">Registrados hoy</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/90 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
            <FAIcon icon="times" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-3">
          {clients.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Todavía no se ha registrado ningún cliente hoy</p>
          ) : (
            clients.map((c) => {
              const name = `${c.personalInfo?.name || ''} ${c.personalInfo?.lastname || ''}`.trim() || 'Cliente';
              return (
                <div key={c._id} className="bg-white/80 rounded-2xl border border-white/80 p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-display font-semibold text-xs shrink-0">
                    {name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold text-gray-900 text-sm truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.loginInfo?.email}</p>
                  </div>
                  {c.createdAt && (
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {new Date(c.createdAt).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NewClientsModal;
