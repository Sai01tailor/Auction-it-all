import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';
import FilterSidebar, { MobileFilterSheet } from '../Components/Listing/FilterSidebar';
import AuctionGrid from '../Components/Listing/AuctionGrid';
import SearchBar from '../Components/Listing/SearchBar';
import { getActiveAuctions } from '../services/auctionService';

/* ─────────────────────────────────────────────────────────────
   P02: Listing Grid Page — /auctions
   
   Layout: sticky header | sidebar (240px) + main grid area
   Features:
     • URL-synced search via ?search= query param
     • Left sidebar filters (price, type, condition, category)
     • 4-column responsive auction card grid
     • Client-side infinite scroll pagination
     • Real-time bid price badges on cards (via ProductCard)
───────────────────────────────────────────────────────────── */

const DEFAULT_FILTERS = {
  search: '',
  priceRange: [0, 10_00_000],
  type: 'ACTIVE',
  condition: [],
  category: 'all',
  sort: 'ending',
  engine: 'ALL',
};

const ENGINES = [
  { id: 'ALL', label: 'All Auctions' },
  { id: 'ENGLISH', label: 'English (Ascending)' },
  { id: 'DUTCH', label: 'Dutch (Buy Now)' },
  { id: 'BLIND', label: 'Blind (Sealed Bid)' },
];



const PAGE_SIZE = 16;

export default function ListingGridPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') ?? 'all',
    engine: searchParams.get('engine') ?? 'ALL',
  }));

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  /* ── Sort items client-side ── */
  const sortItems = (list, sort) => {
    const arr = [...list];
    switch (sort) {
      case 'newest': return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'price_asc': return arr.sort((a, b) => (a.currentHighestBid || a.startingPrice) - (b.currentHighestBid || b.startingPrice));
      case 'price_desc': return arr.sort((a, b) => (b.currentHighestBid || b.startingPrice) - (a.currentHighestBid || a.startingPrice));
      case 'bids': return arr.sort((a, b) => (b.bidsCount ?? 0) - (a.bidsCount ?? 0));
      case 'ending':
      default: return arr.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
    }
  };

  /* ── Fetch page of data ── */
  const fetchPage = useCallback(async (currentFilters, currentOffset, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const { items: page, total: t, hasMore: more } = await getActiveAuctions(
        currentFilters,
        currentOffset,
        PAGE_SIZE,
      );
      const sorted = sortItems(page, currentFilters.sort);
      setTotal(t);
      setHasMore(more);
      setItems(prev => reset ? sorted : [...prev, ...sorted]);
      setOffset(currentOffset + sorted.length);
    } catch (err) {
      setError('Failed to load auctions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Reset + refetch when filters change ── */
  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    fetchPage(filters, 0, true);

    // Sync URL
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category !== 'all') params.category = filters.category;
    if (filters.engine !== 'ALL') params.engine = filters.engine;
    setSearchParams(params, { replace: true });
  }, [JSON.stringify(filters)]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query) => {
    setFilters(f => ({ ...f, search: query }));
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) fetchPage(filters, offset, false);
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== 'all' ||
    filters.engine !== 'ALL' ||
    filters.condition.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10_00_000;

  const pageTitle = filters.search
    ? `Search "${filters.search}" — Live Auctions`
    : filters.category !== 'all'
    ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Auctions`
    : 'Browse All Live Auctions & Drops';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)', paddingBottom: '3.5rem' }}>
      <SEO
        title={pageTitle}
        description={`Explore live auctions on BidKar.in. Filter by category, price, and bidding engine (English, Dutch, Blind bidding).`}
      />
      <Header />

      {/* ── Page Header Band ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 100%)',
        padding: '2rem 0 4.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle decorative dot pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 0.65rem', position: 'relative', zIndex: 2 }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(254,206,68,0.9)' }}>
            Live Auction Marketplace
          </p>
          <h1 style={{
            margin: '0 0 1.25rem',
            fontSize: 'clamp(1.3rem, 3vw, 2rem)',
            fontWeight: 800, color: '#fff',
            letterSpacing: '-0.03em',
          }}>
            Browse & Bid
            {total > 0 && (
              <span style={{
                marginLeft: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.85)',
                padding: '0.2rem 0.7rem',
                borderRadius: '20px',
                verticalAlign: 'middle',
              }}>
                {total.toLocaleString()} items
              </span>
            )}
          </h1>

          {/* Search bar in the hero band */}
          <SearchBar
            onSearch={handleSearch}
            total={total}
            placeholder="Search by title, description…"
          />
        </div>
      </div>

      {/* ── Upper Bidding Engine Navigation: Desktop Buttons & Mobile Dropdown ── */}
      <div style={{ maxWidth: '1280px', margin: '-2rem auto 0', padding: '0 0.65rem', position: 'relative', zIndex: 10 }}>

        {/* Desktop Engine Grid (Hidden on Mobile) */}
        <div className="hidden md:grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: 'var(--color-surface-main)', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '0.45rem', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          {ENGINES.map(eng => {
            const active = (filters.engine || 'ALL') === eng.id;
            return (
              <button
                key={eng.id}
                onClick={() => handleFilterChange({ ...filters, engine: eng.id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: active ? 'rgba(0,35,102,0.06)' : 'transparent',
                  color: active ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
                  fontSize: '0.88rem',
                  fontWeight: active ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: active ? '0 2px 8px rgba(0,35,102,0.04)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span>{eng.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Engine Dropdown Select (Visible only on Mobile) */}
        <div className="block md:hidden">
          <div style={{ background: '#fff', border: '1.5px solid var(--color-border-subtle)', borderRadius: '16px', padding: '0.6rem 0.85rem', boxShadow: '0 6px 20px rgba(0,35,102,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>

            <select
              value={filters.engine || 'ALL'}
              onChange={e => handleFilterChange({ ...filters, engine: e.target.value })}
              style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: '10px', border: '1.5px solid var(--color-brand-primary)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brand-primary)', background: 'rgba(0,35,102,0.04)', outline: 'none', cursor: 'pointer' }}
            >
              {ENGINES.map(eng => <option key={eng.id} value={eng.id}>{eng.label}</option>)}
            </select>
          </div>
        </div>

      </div>

      {/* ── Main Layout: Sidebar + Grid ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 0.5rem' }}>
        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>

          {/* Left Desktop Sidebar */}
          <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />

          {/* Main grid area */}
          <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
            {/* Active filter chips */}
            {hasActiveFilters && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {filters.search && (
                  <FilterChip label={`Search: "${filters.search}"`} onRemove={() => handleFilterChange({ ...filters, search: '' })} />
                )}
                {filters.category !== 'all' && (
                  <FilterChip label={`Category: ${filters.category}`} onRemove={() => handleFilterChange({ ...filters, category: 'all' })} />
                )}
                {filters.engine !== 'ALL' && (
                  <FilterChip label={`Engine: ${filters.engine}`} onRemove={() => handleFilterChange({ ...filters, engine: 'ALL' })} />
                )}
                {filters.condition.map(c => (
                  <FilterChip key={c} label={`Condition: ${c}`} onRemove={() =>
                    handleFilterChange({ ...filters, condition: filters.condition.filter(x => x !== c) })
                  } />
                ))}
              </div>
            )}

            <AuctionGrid
              items={items}
              loading={loading}
              error={error}
              hasMore={hasMore}
              hasFilters={hasActiveFilters}
              onLoadMore={handleLoadMore}
              onRetry={() => fetchPage(filters, 0, true)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Filter Bar (like Flipkart & Myntra) */}
      <div className="block md:hidden" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
        background: '#ffffff', borderTop: '1px solid var(--color-border-subtle)',
        padding: '0.65rem 1rem', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      }}>
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: '12px', border: 'none',
            background: 'var(--color-brand-primary)', color: '#fff',
            fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(0,35,102,0.18)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
          Filter & Sort
          {hasActiveFilters && (
            <span style={{ background: 'var(--color-brand-accent)', color: 'var(--color-brand-primary-dark)', borderRadius: '20px', padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 900 }}>
              Active
            </span>
          )}
        </button>
      </div>

      {/* Mobile Bottom Filter Sheet Drawer Modal */}
      <MobileFilterSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}

/* ── Filter chip ── */
function FilterChip({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.25rem 0.65rem',
      background: 'rgba(0,35,102,0.08)',
      color: 'var(--color-brand-primary)',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 600,
      border: '1px solid rgba(0,35,102,0.15)',
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'inherit', fontSize: '1rem', display: 'flex' }}
      >×</button>
    </span>
  );
}
