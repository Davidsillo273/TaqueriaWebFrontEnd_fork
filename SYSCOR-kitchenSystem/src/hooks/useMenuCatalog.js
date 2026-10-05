// hooks/useMenuCatalog.js
//
// Catálogo del menú para cocina: categoría de cada platillo (para el color
// de la estación) y receta de cada producto (para el modo "con detalles").
//
// Los productos de un pedido solo traen su id, nombre y cantidad; esto se
// carga una vez al entrar y se cruza por id. Si falla, un ticket sin receta
// se ve igual, solo sin el desglose.
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@syscor/web-shared/src/hooks/useSocket';
import kitchenApi from '../services/kitchenApi';

const EMPTY_CATALOG = {
  saucers: new Map(),
  combos: new Map(),
  drinks: new Map(),
  extras: new Map(),
};

const idOf = (value) => String(value?._id || value || '');

const normalizeSaucer = (saucer) => ({
  id: idOf(saucer),
  name: saucer.name || 'Platillo',
  category: saucer.category || null,
  quantity: saucer.quantity || null,
  recipe: saucer.recipe || [],
});

const buildCatalog = ({ saucers = [], combos = [], drinks = [], extras = [] }) => {
  const catalog = {
    saucers: new Map(saucers.map((saucer) => [idOf(saucer), normalizeSaucer(saucer)])),
    combos: new Map(),
    drinks: new Map(drinks.map((drink) => [idOf(drink), { id: idOf(drink), name: drink.name, recipe: drink.recipe || [] }])),
    extras: new Map(
      extras.map((extra) => [
        idOf(extra),
        {
          id: idOf(extra),
          name: extra.name,
          ingredients: (extra.ingredients || []).map((ingredient) => ({
            name: ingredient.ingredientId?.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit || ingredient.ingredientId?.unit,
          })),
        },
      ])
    ),
  };

  for (const combo of combos) {
    // Los combos llegan con sus platillos ya poblados: se aprovechan también
    // para conocer platillos que hoy no están activos en el menú.
    const fixed = (combo.saucers || []).map((entry) => entry.saucerId).filter(Boolean).map(normalizeSaucer);
    const options = (combo.selectiveOptions || []).map((entry) => entry.saucerId).filter(Boolean).map(normalizeSaucer);
    for (const saucer of [...fixed, ...options]) {
      if (!catalog.saucers.has(saucer.id)) catalog.saucers.set(saucer.id, saucer);
    }
    catalog.combos.set(idOf(combo), {
      id: idOf(combo),
      name: combo.name,
      selective: Boolean(combo.selective),
      maxPicks: combo.selectiveMaxPicks || 1,
      saucers: combo.selective ? [] : fixed,
      options: combo.selective ? options : [],
    });
  }

  return catalog;
};

// GET /kitchen/menu: solo categorías y recetas (sin precios ni existencias),
// con el permiso orders:read de la pantalla. Si falla, el tablero sigue
// funcionando sin colores de estación precisos ni recetas.
const fetchCatalog = async () => {
  try {
    const { data } = await kitchenApi.get('/kitchen/menu');
    return { catalog: buildCatalog(data || {}), failed: false };
  } catch (error) {
    console.error('No se pudo cargar el menú de cocina:', error);
    return { catalog: buildCatalog({}), failed: true };
  }
};

export default function useMenuCatalog() {
  const { reconnectCount } = useSocket();
  const [catalog, setCatalog] = useState(EMPTY_CATALOG);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Al abrir, al reintentar y al reconectar el socket
  useEffect(() => {
    let ignore = false;
    fetchCatalog().then((result) => {
      if (ignore) return;
      setCatalog(result.catalog);
      setError(result.failed ? 'El menú no se pudo cargar: las recetas no se verán.' : null);
    });
    return () => {
      ignore = true;
    };
  }, [reconnectCount, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { catalog, error, refetch };
}
