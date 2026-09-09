import { useState } from 'react';

export default function FilterBar({ filters, handleFilterChange, filterOptions, onClearFilters }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white sticky top-[80px] z-40 md:top-20 w-full border-b border-border-subtle shadow-sm">
      <div className="container-main py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search items..."
              className="w-full px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface placeholder-text-muted border border-border-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md"
            />
          </div>

          {/* Category Filter */}
          {filterOptions?.categories && (
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface border border-border-subtle focus:outline-none focus:border-primary font-body-md cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <option value="" className="bg-white">
                All Categories
              </option>
              {filterOptions.categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white">
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* Condition Filter */}
          {filterOptions?.conditions && (
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface border border-border-subtle focus:outline-none focus:border-primary font-body-md cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <option value="" className="bg-white">
                All Conditions
              </option>
              {filterOptions.conditions.map((cond) => (
                <option key={cond} value={cond} className="bg-white">
                  {cond}
                </option>
              ))}
            </select>
          )}

          {/* Auction Type Filter */}
          {filterOptions?.auctionTypes && (
            <select
              value={filters.auctionType}
              onChange={(e) => handleFilterChange('auctionType', e.target.value)}
              className="px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface border border-border-subtle focus:outline-none focus:border-primary font-body-md cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <option value="" className="bg-white">
                All Types
              </option>
              {filterOptions.auctionTypes.map((type) => (
                <option key={type} value={type} className="bg-white">
                  {type}
                </option>
              ))}
            </select>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined">
              {isOpen ? 'close' : 'tune'}
            </span>
          </button>

          {/* Desktop Advanced Filters */}
          <details className="hidden md:block group">
            <summary className="px-4 py-2 rounded-lg bg-surface-container-low border border-border-subtle hover:bg-surface-container transition-colors cursor-pointer font-body-md text-on-surface">
              <span className="material-symbols-outlined inline align-middle mr-2">
                filter_list
              </span>
              More Filters
            </summary>
            <div className="absolute right-0 top-full mt-2 bg-white border border-border-subtle rounded-lg p-4 shadow-lg space-y-4 w-96 z-50">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-on-surface-variant font-body-md block">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface placeholder-text-muted border border-border-subtle focus:outline-none focus:border-primary font-body-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-on-surface-variant font-body-md block">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="999999"
                  className="w-full px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface placeholder-text-muted border border-border-subtle focus:outline-none focus:border-primary font-body-md"
                />
              </div>

              <button
                onClick={onClearFilters}
                className="w-full px-4 py-2 rounded-lg bg-error/10 text-error border border-error/50 hover:bg-error/20 transition-colors font-body-md"
              >
                Clear All Filters
              </button>
            </div>
          </details>
        </div>

        {/* Mobile Advanced Filters */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-4 pt-4 border-t border-border-subtle">
            <div className="space-y-2">
              <label className="text-on-surface-variant font-body-md block">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface placeholder-text-muted border border-border-subtle focus:outline-none focus:border-primary font-body-md"
              />
            </div>

            <div className="space-y-2">
              <label className="text-on-surface-variant font-body-md block">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="999999"
                className="w-full px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface placeholder-text-muted border border-border-subtle focus:outline-none focus:border-primary font-body-md"
              />
            </div>

            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 rounded-lg bg-error/10 text-error border border-error/50 hover:bg-error/20 transition-colors font-body-md"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
