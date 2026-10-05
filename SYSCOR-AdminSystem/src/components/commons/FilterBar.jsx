// src/components/commons/FilterBar.jsx
// Barra de filtros genérica (categoría, subcategoría, estado...) reutilizada
// en Platillos, Bebidas, Combos y Extras. Cada filtro es un <select> simple;
// la lista de opciones que recibe ya viene adaptada a lo que tiene cada tipo.
import React from 'react';
import Select from './Select';

const FilterBar = ({ filters = [] }) => {
  const visible = filters.filter((f) => f.options && f.options.length > 1);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
      {visible.map((filter) => (
        <Select
          key={filter.label}
          size="sm"
          className="w-auto"
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
        >
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      ))}
    </div>
  );
};

export default FilterBar;
