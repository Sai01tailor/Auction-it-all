import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../Config/Axios';
import ProductCard from './ProductCard';

/* ─────────────────────────────────────────
   SKELETON  – matches card dimensions
───────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border-subtle)] overflow-hidden animate-pulse">
      <div className="bg-gray-100" style={{ aspectRatio: '4/3' }} />
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="h-2.5 bg-gray-100 rounded w-2/5" />
        <div className="h-3.5 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-8 bg-gray-200 rounded-lg mt-2" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRODUCT GRID
   Fetches  GET /api/items?status=ACTIVE&limit=12&offset=N
   Infinite-scroll via IntersectionObserver sentinel.

   Props:
     endpoint  – API path (default '/items')
     params    – extra query params object
     cols      – tailwind cols class override
───────────────────────────────────────── */
export default function ProductGrid({
  endpoint = '/items',
  params   = { status: 'ACTIVE' },
  cols     = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
}) {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [hasMore,  setHasMore]  = useState(true);
  const [error,    setError]    = useState(null);
  const sentinelRef = React.useRef(null);

  const fetchPage = useCallback(async (offset) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(endpoint, {
        params: { limit: 12, offset, ...params },
      });
      // Accept { items: [] } or plain array
      const page = Array.isArray(data) ? data : (data.items ?? []);
      if (page.length < 12) setHasMore(false);
      setItems(prev => offset === 0 ? page : [...prev, ...page]);
    } catch (err) {
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(params)]);

  // Initial fetch
  useEffect(() => {
    setItems([]);
    setHasMore(true);
    fetchPage(0);
  }, [fetchPage]);

  // Infinite-scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchPage(items.length);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length, hasMore, loading, fetchPage]);

  /* ── empty state ── */
  if (!loading && !error && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--color-text-muted)]">
        <span className="text-4xl">🔍</span>
        <p className="text-sm font-medium m-0">No active auctions found.</p>
      </div>
    );
  }

  /* ── error state ── */
  if (error && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm text-[var(--color-text-muted)] m-0">{error}</p>
        <button
          onClick={() => fetchPage(0)}
          className="btn btn-accent text-sm px-5 py-2 mt-1"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className={`grid ${cols} gap-3 lg:gap-5`}>
        {items.map(item => (
          <ProductCard key={item._id} item={item} />
        ))}

        {/* Skeleton placeholders while first page loads */}
        {loading && items.length === 0 &&
          Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} />)
        }
      </div>

      {/* Infinite-scroll sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-8" />}

      {/* Load-more skeleton row */}
      {loading && items.length > 0 && (
        <div className={`grid ${cols} gap-3 lg:gap-5 mt-3 lg:mt-5`}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      )}

      {/* End of list */}
      {!hasMore && items.length > 0 && (
        <p className="text-center text-[0.8rem] text-[var(--color-text-muted)] py-8 m-0">
          — All {items.length} auctions loaded —
        </p>
      )}
    </section>
  );
}