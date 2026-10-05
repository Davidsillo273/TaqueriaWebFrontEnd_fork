import { useMemo, useState, useEffect } from 'react';

// Paginación genérica en cliente: recibe el arreglo completo y devuelve solo
// la porción visible de la página actual, junto con los controles para moverse.
export function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Si la lista se encoge (ej. tras un filtro) y la página actual queda fuera
  // de rango, la regresamos a la última página válida.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const goTo = (n) => setPage(Math.min(Math.max(1, n), totalPages));
  const next = () => goTo(page + 1);
  const prev = () => goTo(page - 1);

  return { page, totalPages, paginatedItems, goTo, next, prev, setPage };
}

export default usePagination;
