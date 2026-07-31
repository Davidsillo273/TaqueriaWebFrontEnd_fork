// src/components/commons/FilterBar.jsx
// Barra de filtros genérica (categoría, subcategoría, estado...) reutilizada
// en Platillos, Bebidas, Combos y Extras. Cada filtro es un <select> simple;
// la lista de opciones que recibe ya viene adaptada a lo que tiene cada tipo.
import React from 'react';

const FilterBar = ({ filters = [] }) => {
  const visible = filters.filter((f) => f.options && f.options.length > 1);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
      {visible.map((filter) => (
        <select
          key={filter.label}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="px-3 py-2 bg-white border border-white/80 rounded-xl text-xs sm:text-sm text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/30 shadow-sm"
        >
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
};

export default FilterBar;
