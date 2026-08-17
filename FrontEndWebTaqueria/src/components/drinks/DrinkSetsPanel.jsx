// src/components/drinks/DrinkSetsPanel.jsx
// Panel de administración de "Conjuntos de bebidas": el admin crea, edita y
// deshabilita (nunca elimina) agrupaciones de bebidas de conveniencia que
// luego reutiliza al armar combos, en vez de elegir bebida por bebida.
import React, { useState } from 'react';
import FAIcon from '../commons/FAIcon';
import AddDrinkSetModal from '../dashboard/AddDrinkSetModal';
import useDrinkSets from '../../hooks/useDrinkSets';
import useDrinks from '../../hooks/useDrinks';
import { useToast } from '../commons/ToastProvider';

const DrinkSetsPanel = () => {
  const { drinkSets, loading, createDrinkSet, updateDrinkSet, toggleDrinkSetStatus } = useDrinkSets();
  const { drinks } = useDrinks();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);

  const thirdPartyDrinks = drinks.filter((d) => d.category === 'tercero');

  const handleToggleStatus = async (set) => {
    const result = await toggleDrinkSetStatus(set._id);
    if (result.success) {
      addToast(set.status === 'activo' ? 'Conjunto deshabilitado' : 'Conjunto habilitado', 'success');
    } else {
      addToast('No se pudo actualizar el estado del conjunto', 'error');
    }
  };

  return (
    <div className="mb-4 sm:mb-6 bg-white/70 rounded-3xl border border-white/80 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <FAIcon icon="layer-group" size="sm" className="text-amber-600" />
          <span className="font-display font-bold text-gray-900 text-sm sm:text-base">
            Conjuntos de bebidas ({drinkSets.length})
          </span>
        </div>
        <FAIcon icon={isOpen ? 'chevron-up' : 'chevron-down'} size="sm" className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">
              Agrupa bebidas que normalmente van juntas para elegirlas rápido al armar un combo.
            </p>
            <button
              type="button"
              onClick={() => { setEditingSet(null); setIsModalOpen(true); }}
              className="shrink-0 ml-3 text-xs font-display font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <FAIcon icon="plus" size="xs" /> Nuevo conjunto
            </button>
          </div>

          {loading && <p className="text-xs text-gray-400">Cargando conjuntos...</p>}

          {!loading && drinkSets.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-3 bg-white/50 rounded-xl">
              Todavía no hay conjuntos creados.
            </p>
          )}

          {!loading && drinkSets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {drinkSets.map((set) => (
                <div
                  key={set._id}
                  className={`p-3 rounded-2xl border ${
                    set.status === 'activo' ? 'border-white/80 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-display font-semibold text-gray-800">{set.name}</p>
                    <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      set.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {set.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 mb-2 line-clamp-2">
                    {(set.drinkIds || []).map((d) => d.name).join(', ') || 'Sin bebidas'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditingSet(set); setIsModalOpen(true); }}
                      className="flex-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg py-1.5 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(set)}
                      className={`flex-1 text-[11px] font-semibold rounded-lg py-1.5 transition-colors text-white ${
                        set.status === 'activo'
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {set.status === 'activo' ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AddDrinkSetModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSet(null); }}
        onCreated={createDrinkSet}
        onUpdated={updateDrinkSet}
        drinks={thirdPartyDrinks}
        setToEdit={editingSet}
      />
    </div>
  );
};

export default DrinkSetsPanel;
