import React from 'react';
import { Category, Brand, ProductFilters } from '../../types/index.js';
import { Star, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  filters: ProductFilters;
  onChange: (newFilters: ProductFilters) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  brands,
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Filters
        </h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!filters.category || filters.category === 'all'}
              onChange={() => onChange({ ...filters, category: undefined, page: 1 })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center justify-between text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer py-0.5"
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat.slug}
                  onChange={() => onChange({ ...filters, category: cat.slug, page: 1 })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{cat.name}</span>
              </div>
              {cat.productCount !== undefined && (
                <span className="text-[10px] text-gray-400">({cat.productCount})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-2.5 border-t border-gray-100 pt-5 dark:border-gray-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Brands
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer">
            <input
              type="radio"
              name="brand"
              checked={!filters.brand || filters.brand === 'all'}
              onChange={() => onChange({ ...filters, brand: undefined, page: 1 })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>All Brands</span>
          </label>
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center justify-between text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer py-0.5"
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="brand"
                  checked={filters.brand === brand.slug}
                  onChange={() => onChange({ ...filters, brand: brand.slug, page: 1 })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{brand.name}</span>
              </div>
              {brand.productCount !== undefined && (
                <span className="text-[10px] text-gray-400">({brand.productCount})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2.5 border-t border-gray-100 pt-5 dark:border-gray-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Price Range (₹)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              })
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              })
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Customer Rating */}
      <div className="space-y-2.5 border-t border-gray-100 pt-5 dark:border-gray-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Customer Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() =>
                onChange({
                  ...filters,
                  rating: filters.rating === stars ? undefined : stars,
                  page: 1,
                })
              }
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs transition ${
                filters.rating === stars
                  ? 'bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < stars ? 'fill-amber-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span>& up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stock Availability */}
      <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(filters.inStock)}
            onChange={(e) =>
              onChange({
                ...filters,
                inStock: e.target.checked ? true : undefined,
                page: 1,
              })
            }
            className="rounded text-indigo-600 focus:ring-indigo-500"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );
};
