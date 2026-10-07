import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';
import FilterSidebar, { MobileFilterSheet } from '../Components/Listing/FilterSidebar';
import AuctionGrid from '../Components/Listing/AuctionGrid';
// SearchBar removed — search is handled via URL params from the global Header
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

/* ── Auctions page hero: luxurious text left + gavel card right ── */
const HERO_IMAGES = { gavel: '/hero/gavel.jpg' };

function AuctionsHero() {
  return (
    <section style={{
      background: 'linear-gradient(160deg, #00102e 0%, #001f55 40%, #002366 70%, #001540 100%)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '25vh',
      display: 'flex',
      alignItems: 'center',
      padding: '1.5rem 1.5rem 4.5rem',
    }}>

      {/* Ambient gold glow — top left */}
      <div style={{
        pointerEvents: 'none', position: 'absolute',
        top: '-40%', left: '-10%',
        width: '55%', height: '200%',
        background: 'radial-gradient(ellipse, rgba(254,206,68,0.07) 0%, transparent 65%)',
      }} />

      {/* Ambient blue-white glow — bottom right */}
      <div style={{
        pointerEvents: 'none', position: 'absolute',
        bottom: '-60%', right: '5%',
        width: '45%', height: '180%',
        background: 'radial-gradient(ellipse, rgba(147,197,253,0.05) 0%, transparent 60%)',
      }} />

      {/* Diagonal gold shimmer line */}
      <div style={{
        pointerEvents: 'none', position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(118deg, transparent 30%, rgba(254,206,68,0.04) 45%, transparent 60%)',
      }} />

      {/* SVG clip path for card shape */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <clipPath id="lgp-card-notch" clipPathUnits="objectBoundingBox">
            <path d="M 1,0.08 C 1,0.03 0.95,0 0.88,0 L 0.5,0 C 0.44,0 0.4,0.02 0.36,0.045 C 0.32,0.07 0.28,0.08 0.22,0.08 L 0.12,0.08 C 0.05,0.08 0,0.11 0,0.16 L 0,0.92 C 0,0.97 0.05,1 0.12,1 L 0.88,1 C 0.95,1 1,0.97 1,0.92 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Two-column layout */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto', width: '100%',
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center',
        gap: '2rem',
      }}>

        {/* LEFT: Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: '0 0 0.35rem',
            fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--color-brand-accent)',
            opacity: 0.8,
          }}>
            ✦ &nbsp; Live Auction Marketplace &nbsp; ✦
          </p>
          <h1 style={{
            margin: 0,
            fontFamily: "Impact, 'Arial Narrow', 'Franklin Gothic Medium', Arial, sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 3.6rem)',
            fontWeight: 500,
            letterSpacing: '0.03em',
            lineHeight: 0.95,
            textTransform: 'uppercase',
          }}>
            <span style={{ color: '#ffffff', display: 'block' }}>Browse &amp;</span>
            <span style={{
              display: 'block',
              background: 'linear-gradient(90deg, #fece44 0%, #feda75 50%, #e5b630 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Bid</span>
          </h1>
        </div>

        {/* RIGHT: Gavel card — desktop only */}
        <div className="hidden md:block" style={{
          flex: '0 0 clamp(180px, 25vw, 340px)',
          height: 'clamp(160px, 22vw, 300px)',
          position: 'relative',
        }}>
          {/* Gold accent strip */}
          <div style={{
            position: 'absolute', left: -5, top: '15%', bottom: '15%',
            width: '7px',
            background: 'linear-gradient(180deg, #feda75, #fece44, #e5b630)',
            borderRadius: '4px',
            zIndex: 2,
            boxShadow: '0 0 12px rgba(254,206,68,0.5)',
          }} />
          {/* Card */}
          <div style={{
            width: '100%', height: '100%',
            overflow: 'hidden',
            boxShadow: '0 12px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(254,206,68,0.12)',
            clipPath: 'url(#lgp-card-notch)',
            WebkitClipPath: 'url(#lgp-card-notch)',
          }}>
            <img
              src={HERO_IMAGES.gavel}
              alt="Premium Auction Gavel"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
          </div>
        </div>

      </div>
    </section>
  );
}


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

      {/* ── 5-column editorial Hero ── */}
      <AuctionsHero />

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
