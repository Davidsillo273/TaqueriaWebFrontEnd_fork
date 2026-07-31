// src/components/commons/AttentionCenter.jsx
import React, { useState } from 'react';
import FAIcon from './FAIcon';

const PLACEHOLDER_IMAGE = 'https://placehold.co/300x200/f3f0eb/9ca3af?text=Sin+imagen';

// Reemplaza los banners de "alerta" por un label clickeable ("Atención: N")
// que abre un modal con las tarjetas de lo que falta completar. Cuando no
// falta nada, el label y el modal cambian a un estado verde/tranquilo.
const AttentionCenter = ({ items, getKey, getTitle, getImage, getReason, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const count = items.length;
  const hasIssues = count > 0;

  const handleItemClick = (item) => {
    setIsOpen(false);
    onEdit(item);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`mb-4 flex items-center gap-2 text-sm font-display font-semibold underline decoration-dotted decoration-2 underline-offset-4 cursor-pointer transition-opacity hover:opacity-70 ${
          hasIssues ? 'text-amber-700' : 'text-green-700'
        }`}
      >
        <FAIcon icon="eye" size="sm" />
        {hasIssues ? `Atención: ${count}` : 'Todo en orden'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#f3f0eb] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.7)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/80">
            <div
              className={`flex items-center justify-between p-4 sm:p-5 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.2)] ${
                hasIssues ? 'bg-amber-500' : 'bg-green-500'
              }`}
            >
              <h2 className="text-base sm:text-lg font-display font-bold">
                {hasIssues ? `Atención: ${count} por completar` : 'Todo en orden'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-all"
              >
                <FAIcon icon="times" size="lg" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {!hasIssues ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FAIcon icon="face-smile" size="3xl" className="text-green-500 mb-3" />
                  <p className="text-gray-700 font-display font-semibold text-lg">
                    No hay nada que revisar
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {items.map((item) => {
                    const clickable = Boolean(onEdit);
                    const Wrapper = clickable ? 'button' : 'div';
                    return (
                      <Wrapper
                        key={getKey(item)}
                        type={clickable ? 'button' : undefined}
                        onClick={clickable ? () => handleItemClick(item) : undefined}
                        className={`flex items-center gap-3 bg-white rounded-2xl p-3 border border-white/80 shadow-sm text-left w-full ${
                          clickable ? 'hover:border-amber-300 hover:shadow-md transition-all cursor-pointer' : ''
                        }`}
                      >
                        <img
                          src={getImage?.(item) || PLACEHOLDER_IMAGE}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-semibold text-gray-900 text-sm truncate">
                            {getTitle(item)}
                          </p>
                          <p className="text-xs text-amber-700 mt-0.5">{getReason(item)}</p>
                        </div>
                        {clickable && (
                          <FAIcon icon="pen" size="sm" className="text-gray-400 shrink-0" />
                        )}
                      </Wrapper>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttentionCenter;
