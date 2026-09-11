// src/pages/recipes.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import FAIcon from '../components/commons/FAIcon';
import useDrinks from '../hooks/useDrinks';
import useSaucers from '../hooks/useSaucers';
import useExtras from '../hooks/useExtras';
import { ToastProvider } from '../components/commons/ToastProvider';
import { UNIT_LABELS } from '../constants/units';

const BOOKS = [
  { id: 'drinks', label: 'Bebidas', icon: 'wine-glass', color: 'from-amber-800 to-amber-950' },
  { id: 'dishes', label: 'Platillos', icon: 'utensils', color: 'from-red-900 to-red-950' },
  // Los extras compuestos (isCompound) también gastan inventario, así que
  // tienen receta igual que una bebida de casa o un platillo.
  { id: 'extras', label: 'Extras', icon: 'star', color: 'from-emerald-800 to-emerald-950' },
];

const DISH_CATEGORIES = ['Burritos', 'Tortas', 'Tacos', 'Sopas', 'Especiales'];

// Color del borde de la portada, a juego con el degradado de cada libro
const BOOK_BORDERS = {
  drinks: 'border-amber-900/70',
  dishes: 'border-red-950/70',
  extras: 'border-emerald-950/70',
};

// Qué hacer cuando un libro todavía no tiene recetas. Para los extras el
// consejo es distinto: además de poner ingredientes, hay que marcarlos como
// compuestos, porque si no el sistema los trata como un cargo suelto.
// A qué pantalla se va a editar la receta de cada libro. El recetario es de
// consulta (se lee como un libro); la edición de ingredientes ya existe en la
// pantalla de cada producto, así que se enlaza ahí en vez de duplicarla.
const EDIT_ROUTES = {
  drinks: { path: '/drinks', label: 'Editar en Bebidas' },
  dishes: { path: '/dishes', label: 'Editar en Platillos' },
  extras: { path: '/extras', label: 'Editar en Extras' },
};

const EMPTY_BOOK_HINTS = {
  drinks: 'Agrega ingredientes al crear o editar una bebida de casa',
  dishes: 'Agrega ingredientes al crear o editar un platillo',
  extras: 'Marca un extra como "compuesto" y agrégale ingredientes desde la pantalla de Extras',
};

// Los extras guardan sus ingredientes en "ingredients[]" con la forma
// { ingredientId, quantity, unit }, mientras bebidas y platillos usan
// "recipe[]" con { name, tracked, quantity, unit }. Esta función los traduce
// al formato de recipe[] para que la página pinte los tres libros con el
// mismo código, en vez de tener una rama aparte solo para extras.
//
// El nombre del insumo llega poblado desde el backend (extrasController hace
// populate de ingredientId con "name unit"); si por alguna razón no viniera,
// se muestra un texto neutro en vez de dejar la línea vacía.
const extraToRecipeShape = (extra) => ({
  ...extra,
  recipe: (extra.ingredients || []).map((item) => ({
    name: item.ingredientId?.name || 'Insumo no encontrado',
    // Siempre true: un extra compuesto solo puede apuntar a insumos que
    // existen en Inventario, por eso descuenta stock al venderse.
    tracked: Boolean(item.ingredientId),
    quantity: item.quantity,
    unit: item.unit,
  })),
});

function RecipesContent() {
  const [activeMenu] = useState('recipes');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('drinks');
  const [subFilter, setSubFilter] = useState('all');
  const [pageIndex, setPageIndex] = useState(0);

  const { drinks, loading: loadingDrinks } = useDrinks();
  const { saucers, loading: loadingSaucers } = useSaucers();
  const { extras, loading: loadingExtras } = useExtras();

  const drinksWithRecipe = drinks.filter((d) => d.category === 'casa' && d.recipe?.length > 0);
  const dishesWithRecipe = saucers.filter((d) => d.recipe?.length > 0);
  // Solo los extras marcados como compuestos tienen receta: el resto son un
  // cargo adicional sin relación con el inventario (ej. "Extra de queso" que
  // se cobra pero no se descuenta de ningún insumo).
  const extrasWithRecipe = extras
    .filter((e) => e.isCompound && e.ingredients?.length > 0)
    .map(extraToRecipeShape);

  const subOptionsForDrinks = ['all', ...new Set(drinksWithRecipe.map((d) => d.subcategory).filter(Boolean))];
  const subOptionsForDishes = ['all', ...DISH_CATEGORIES];
  // Los extras usan categoría libre (Verduras, Salsas...), así que las
  // opciones salen de los datos, igual que con las subcategorías de bebidas.
  const subOptionsForExtras = ['all', ...new Set(extrasWithRecipe.map((e) => e.category).filter(Boolean))];

  const SUB_OPTIONS_BY_BOOK = {
    drinks: subOptionsForDrinks,
    dishes: subOptionsForDishes,
    extras: subOptionsForExtras,
  };
  const subOptions = SUB_OPTIONS_BY_BOOK[typeFilter] || ['all'];

  const ITEMS_BY_BOOK = {
    drinks: drinksWithRecipe,
    dishes: dishesWithRecipe,
    extras: extrasWithRecipe,
  };
  const items = ITEMS_BY_BOOK[typeFilter] || [];

  // Las bebidas agrupan por subcategoría; platillos y extras, por categoría.
  const filteredItems = subFilter === 'all'
    ? items
    : items.filter((item) => (typeFilter === 'drinks' ? item.subcategory : item.category) === subFilter);

  const LOADING_BY_BOOK = {
    drinks: loadingDrinks,
    dishes: loadingSaucers,
    extras: loadingExtras,
  };
  const loading = LOADING_BY_BOOK[typeFilter] || false;

  const currentIndex = filteredItems.length === 0 ? 0 : Math.min(pageIndex, filteredItems.length - 1);
  const current = filteredItems[currentIndex];

  const handleBookChange = (id) => {
    if (id === typeFilter) return;
    setTypeFilter(id);
    setSubFilter('all');
    setPageIndex(0);
  };

  const handleSubFilterChange = (c) => {
    setSubFilter(c);
    setPageIndex(0);
  };

  const activeBook = BOOKS.find((b) => b.id === typeFilter);

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
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1 sm:mb-2">
                Recetario
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Elige un libro: cada receta es una página, cada categoría un separador.
              </p>
            </div>

            {/* Selector de libro: elegir cuál libro está abierto */}
            <div className="flex gap-4 justify-center mb-8">
              {BOOKS.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => handleBookChange(book.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-display font-semibold text-sm transition-all ${
                    typeFilter === book.id
                      ? `bg-gradient-to-br ${book.color} text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] scale-105`
                      : 'bg-white text-gray-600 border border-white/80 hover:bg-gray-50'
                  }`}
                >
                  <FAIcon icon={book.icon} size="sm" />
                  Libro de {book.label}
                </button>
              ))}
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <span className="ml-3 text-gray-600 font-medium">Abriendo el libro...</span>
              </div>
            )}

            {!loading && (
              <div key={typeFilter} className="max-w-3xl mx-auto animate-[fadeIn_0.25s_ease-out]">
                <div
                  className={`relative flex rounded-r-3xl rounded-l-md shadow-[0_25px_60px_rgba(0,0,0,0.3)] border-4 bg-gradient-to-br ${BOOK_BORDERS[typeFilter] || 'border-red-950/70'} overflow-hidden min-h-[380px]`}
                >
                  {/* Lomo del libro */}
                  <div className={`w-3 sm:w-4 bg-gradient-to-r ${activeBook.color} shadow-[inset_-4px_0_10px_rgba(0,0,0,0.4)]`} />

                  {/* Página */}
                  <div className="flex-1 bg-white relative p-5 sm:p-8 flex flex-col">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(0,0,0,0.06),transparent_60%)] pointer-events-none" />

                    {!current ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                        <FAIcon icon="feather" size="3x" className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-display font-semibold">
                          Este libro todavía no tiene páginas escritas
                        </p>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">
                          {EMPTY_BOOK_HINTS[typeFilter] || EMPTY_BOOK_HINTS.dishes}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3 mb-4 border-b-2 border-dashed border-gray-200 pb-3">
                          <div>
                            <h2 className="font-display font-bold text-xl text-gray-900">{current.title || current.name}</h2>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold">
                              {typeFilter === 'drinks'
                                ? (current.subcategory || 'Sin subcategoría')
                                : (current.category || 'Sin categoría')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Atajo a la pantalla donde sí se edita esta receta */}
                            {EDIT_ROUTES[typeFilter] && (
                              <Link
                                to={EDIT_ROUTES[typeFilter].path}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-[11px] font-display font-semibold hover:bg-gray-200 hover:text-gray-800 transition-colors"
                                title={EDIT_ROUTES[typeFilter].label}
                              >
                                <FAIcon icon="pen" size="xs" />
                                Editar
                              </Link>
                            )}
                            <FAIcon icon={activeBook.icon} size="xl" className="text-gray-200" />
                          </div>
                        </div>

                        <ul className="space-y-2 flex-1">
                          {current.recipe.map((ingredient, idx) => (
                            <li key={idx} className="flex items-center justify-between text-sm text-gray-700 border-b border-gray-100 pb-2 last:border-0">
                              <span className="flex items-center gap-2">
                                <FAIcon
                                  icon={ingredient.tracked ? 'box' : 'circle-info'}
                                  size="xs"
                                  className={ingredient.tracked ? 'text-green-600' : 'text-gray-400'}
                                />
                                {ingredient.name}
                                {ingredient.removable && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Quitable</span>
                                )}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {ingredient.quantity
                                  ? `${ingredient.quantity} ${UNIT_LABELS[ingredient.unit] || ingredient.unit || ''}`
                                  : ingredient.unit}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <p className="text-center text-xs text-gray-400 font-display italic mt-4">
                          — página {currentIndex + 1} de {filteredItems.length} —
                        </p>
                      </>
                    )}
                  </div>

                  {/* Separadores del libro (categorías) */}
                  <div className="flex flex-col gap-1 py-6 pr-1.5 pl-0.5 bg-transparent">
                    {subOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleSubFilterChange(c)}
                        title={c === 'all' ? 'Todas' : c}
                        className={`writing-mode-vertical px-1.5 py-2.5 rounded-r-lg text-[10px] font-display font-bold tracking-wide transition-all ${
                          subFilter === c
                            ? 'bg-red-500 text-white shadow-[2px_2px_8px_rgba(0,0,0,0.25)] -mr-1'
                            : 'bg-white/80 text-gray-500 hover:bg-gray-50'
                        }`}
                        style={{ writingMode: 'vertical-rl' }}
                      >
                        {c === 'all' ? 'Todas' : c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controles de pasar página */}
                {filteredItems.length > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <button
                      type="button"
                      onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-sm font-display font-semibold text-gray-600 border border-white/80 disabled:opacity-30 hover:bg-gray-50 transition-all"
                    >
                      <FAIcon icon="chevron-left" size="sm" />
                      Página anterior
                    </button>
                    <span className="text-xs text-gray-400">{currentIndex + 1} / {filteredItems.length}</span>
                    <button
                      type="button"
                      onClick={() => setPageIndex((i) => Math.min(filteredItems.length - 1, i + 1))}
                      disabled={currentIndex === filteredItems.length - 1}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-sm font-display font-semibold text-gray-600 border border-white/80 disabled:opacity-30 hover:bg-gray-50 transition-all"
                    >
                      Página siguiente
                      <FAIcon icon="chevron-right" size="sm" />
                    </button>
                  </div>
                )}
              </div>
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
