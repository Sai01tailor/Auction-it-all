import React, { useRef, useEffect } from 'react';
import ProductCard from '../Product/ProductCard';

/* ─────────────────────────────────────────────────────────────
   AuctionGrid — 4-column responsive grid for P02 Listing
   
   Props:
     items    {Item[]}   — auction items to render
     loading  {boolean}  — show skeleton placeholders
     error    {string}   — error message
     hasMore  {boolean}  — whether more pages exist
     onLoadMore {fn}     — called when sentinel enters view
     onRetry  {fn}       — retry on error
───────────────────────────────────────────────────────────── */

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px',
      border: '1px solid var(--color-border-subtle)',
      overflow: 'hidden',
    }}>
      <div style={{ background: '#f3f4f6', aspectRatio: '4/3' }} className="animate-pulse" />
      <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ height: '10px', background: '#f3f4f6', borderRadius: '6px', width: '40%' }} className="animate-pulse" />
        <div style={{ height: '14px', background: '#e5e7eb', borderRadius: '6px', width: '80%' }} className="animate-pulse" />
        <div style={{ height: '11px', background: '#f3f4f6', borderRadius: '6px', width: '100%' }} className="animate-pulse" />
        <div style={{ height: '11px', background: '#f3f4f6', borderRadius: '6px', width: '65%' }} className="animate-pulse" />
        <div style={{ height: '36px', background: '#e5e7eb', borderRadius: '8px', marginTop: '0.5rem' }} className="animate-pulse" />
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ hasFilters }) {
  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '4rem 1rem', gap: '1rem',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '3.5rem' }}>{hasFilters ? '🔍' : '📦'}</span>
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-brand-primary)' }}>
        {hasFilters ? 'No auctions match your filters' : 'No active auctions right now'}
      </h3>
      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', maxWidth: '340px' }}>
        {hasFilters
          ? 'Try adjusting your filters or search query to see more results.'
          : 'New auctions go live constantly — check back in a few minutes!'}
      </p>
    </div>
  );
}

/* ── Error State ── */
function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '4rem 1rem', gap: '1rem',
    }}>
      <span style={{ fontSize: '3rem' }}>⚠️</span>
      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{message}</p>
      <button
        onClick={onRetry}
        className="btn btn-accent"
        style={{ fontSize: '0.875rem', padding: '0.5rem 1.5rem' }}
      >
        Retry
      </button>
    </div>
  );
}

/* ── Main Grid ── */
export default function AuctionGrid({ items = [], loading, error, hasMore, onLoadMore, onRetry, hasFilters }) {
  const sentinelRef = useRef(null);

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onLoadMore?.(); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  const SKELETON_COUNT = 8;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, width: '100%' }}>
      {/* Grid */}
      <div className="mobile-auction-grid">
        {/* Skeletons on first load */}
        {loading && items.length === 0 &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)
        }

        {/* Actual items */}
        {items.map(item => (
          <ProductCard key={item._id} item={item} />
        ))}

        {/* Error */}
        {error && items.length === 0 && (
          <ErrorState message={error} onRetry={onRetry} />
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <EmptyState hasFilters={hasFilters} />
        )}
      </div>

      {/* Infinite scroll skeleton rows */}
      {loading && items.length > 0 && (
        <div className="mobile-auction-grid">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Sentinel */}
      {hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}

      {/* End of list */}
      {!hasMore && items.length > 0 && (
        <p style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          padding: '1.5rem 0',
          margin: 0,
        }}>
          — All {items.length} auctions loaded —
        </p>
      )}
    </div>
  );
}
