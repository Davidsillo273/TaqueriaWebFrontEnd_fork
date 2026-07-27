// src/pages/recipes.jsx
import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import FAIcon from '../components/commons/FAIcon';
import PaginationControls from '../components/commons/PaginationControls';
import useDrinks from '../hooks/useDrinks';
import useSaucers from '../hooks/useSaucers';
import { usePagination } from '../hooks/usePagination';
import { ToastProvider } from '../components/commons/ToastProvider';

const TYPE_FILTERS = [
  { id: 'drinks', label: 'Bebidas' },
  { id: 'dishes', label: 'Platillos' },
];

const DISH_CATEGORIES = ['Burritos', 'Tortas', 'Tacos', 'Sopas', 'Especiales'];

function RecipesContent() {
  const [activeMenu] = useState('recipes');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('drinks');
  const [subFilter, setSubFilter] = useState('all');

  const { drinks, loading: loadingDrinks } = useDrinks();
  const { saucers, loading: loadingSaucers } = useSaucers();

  const drinksWithRecipe = drinks.filter((d) => d.category === 'casa' && d.recipe?.length > 0);
  const dishesWithRecipe = saucers.filter((d) => d.recipe?.length > 0);

  const subOptionsForDrinks = ['all', ...new Set(drinksWithRecipe.map((d) => d.subcategory).filter(Boolean))];
  const subOptionsForDishes = ['all', ...DISH_CATEGORIES];
  const subOptions = typeFilter === 'drinks' ? subOptionsForDrinks : subOptionsForDishes;

  const items = typeFilter === 'drinks' ? drinksWithRecipe : dishesWithRecipe;
  const filteredItems = subFilter === 'all'
    ? items
    : items.filter((item) => (typeFilter === 'drinks' ? item.subcategory : item.category) === subFilter);

  const { page, totalPages, paginatedItems, goTo, next, prev } = usePagination(filteredItems, 4);

  const loading = typeFilter === 'drinks' ? loadingDrinks : loadingSaucers;

  const handleTypeChange = (id) => {
    setTypeFilter(id);
    setSubFilter('all');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0eb]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar activeMenu={activeMenu} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1 sm:mb-2">
                Recetas
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Ingredientes registrados para bebidas de casa y platillos. Es información opcional
                que el administrador agrega al crear o editar cada uno.
              </p>
            </div>

            {/* Filtro por tipo */}
            <div className="flex gap-2 mb-3">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleTypeChange(f.id)}
                  className={`px-4 py-2 rounded-2xl text-sm font-display font-semibold transition-colors ${
                    typeFilter === f.id
                      ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]'
                      : 'bg-white/70 text-gray-600 hover:bg-white border border-white/80'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Subfiltro por categoría propia de cada tipo */}
            <div className="flex gap-1.5 flex-wrap mb-6 sm:mb-8">
              {subOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSubFilter(c)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                    subFilter === c ? 'bg-gray-800 text-white' : 'bg-white/60 text-gray-600 hover:bg-white'
                  }`}
                >
                  {c === 'all' ? 'Todas' : c}
                </button>
              ))}
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <span className="ml-3 text-gray-600 font-medium">Cargando recetas...</span>
              </div>
            )}

            {!loading && filteredItems.length === 0 && (
              <div className="text-center py-12">
                <FAIcon icon="flask" size="3x" className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-base sm:text-lg font-display font-semibold">
                  Todavía no hay recetas registradas
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Agrega ingredientes al crear o editar {typeFilter === 'drinks' ? 'una bebida de casa' : 'un platillo'}
                </p>
              </div>
            )}

            {!loading && filteredItems.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {paginatedItems.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="bg-white rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08),inset_1px_1px_3px_rgba(255,255,255,0.7)] border border-white/80"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display font-bold text-gray-900">{item.title || item.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold">
                          {typeFilter === 'drinks' ? (item.subcategory || 'Sin subcategoría') : item.category}
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {item.recipe.map((ingredient, idx) => (
                          <li key={idx} className="flex items-center justify-between text-sm text-gray-600 border-b border-gray-50 pb-1.5 last:border-0">
                            <span className="flex items-center gap-2">
                              <FAIcon
                                icon={ingredient.tracked ? 'box' : 'circle-info'}
                                size="xs"
                                className={ingredient.tracked ? 'text-green-500' : 'text-gray-400'}
                              />
                              {ingredient.name}
                              {ingredient.removable && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Quitable</span>
                              )}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {ingredient.quantity ? `${ingredient.quantity} ${ingredient.unit || ''}` : ingredient.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <PaginationControls page={page} totalPages={totalPages} onPrev={prev} onNext={next} onGoTo={goTo} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Recipes() {
  return (
    <ToastProvider>
      <RecipesContent />
    </ToastProvider>
  );
}
