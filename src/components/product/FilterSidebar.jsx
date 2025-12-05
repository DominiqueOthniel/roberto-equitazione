'use client';

import { useState } from 'react';

export default function FilterSidebar({ filters, onFilterChange }) {
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 10000],
    types: [],
    sizes: [],
    materials: []
  });

  const types = ['Dressage', 'Salto Ostacoli', 'Uso Generale', 'Endurance', 'Western', 'Completo'];
  const sizes = ['16', '16.5', '17', '17.5', '18', '18.5'];
  const materials = ['Pelle', 'Sintetico', 'Misto'];

  const handlePriceChange = (index, value) => {
    const newRange = [...activeFilters.priceRange];
    newRange[index] = parseInt(value);
    const newFilters = { ...activeFilters, priceRange: newRange };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTypeToggle = (type) => {
    const newTypes = activeFilters.types.includes(type)
      ? activeFilters.types.filter(t => t !== type)
      : [...activeFilters.types, type];
    
    const newFilters = { ...activeFilters, types: newTypes };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSizeToggle = (size) => {
    const newSizes = activeFilters.sizes.includes(size)
      ? activeFilters.sizes.filter(s => s !== size)
      : [...activeFilters.sizes, size];
    
    const newFilters = { ...activeFilters, sizes: newSizes };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleMaterialToggle = (material) => {
    const newMaterials = activeFilters.materials.includes(material)
      ? activeFilters.materials.filter(m => m !== material)
      : [...activeFilters.materials, material];
    
    const newFilters = { ...activeFilters, materials: newMaterials };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeCount = activeFilters.types.length + activeFilters.sizes.length + activeFilters.materials.length;

  return (
    <aside className="w-full lg:w-64 bg-card lg:border-r border-border p-4 lg:p-6 h-full overflow-y-auto">
      {/* Fascia di Prezzo Filter */}
      <div className="mb-6 lg:mb-8">
        <h3 className="font-body font-semibold text-sm lg:text-base text-text-primary mb-3">Fascia di Prezzo</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Min: €{activeFilters.priceRange[0].toLocaleString('it-IT')}</span>
            <span>Max: €{activeFilters.priceRange[1].toLocaleString('it-IT')}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={activeFilters.priceRange[1]}
            onChange={(e) => handlePriceChange(1, e.target.value)}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Tipo di Sella Filter */}
      <div className="mb-6 lg:mb-8">
        <h3 className="font-body font-semibold text-sm lg:text-base text-text-primary mb-3">Tipo di Sella</h3>
        <div className="space-y-2">
          {types.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.types.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <span className="text-sm text-text-primary">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Misura Filter */}
      <div className="mb-6 lg:mb-8">
        <h3 className="font-body font-semibold text-sm lg:text-base text-text-primary mb-3">Misura</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeToggle(size)}
              className={`px-3 py-1.5 rounded-md text-sm font-body transition-fast ${
                activeFilters.sizes.includes(size)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-primary hover:bg-border'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Materiale Filter */}
      <div className="mb-6 lg:mb-8">
        <h3 className="font-body font-semibold text-sm lg:text-base text-text-primary mb-3">Materiale</h3>
        <div className="space-y-2">
          {materials.map((material) => (
            <label key={material} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.materials.includes(material)}
                onChange={() => handleMaterialToggle(material)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <span className="text-sm text-text-primary">{material}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

