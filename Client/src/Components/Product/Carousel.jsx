import React, { useRef, useState, useEffect, useCallback } from 'react';
import api from '../../../Config/Axios';
import ProductCard from './ProductCard';

/* ─────────────────────────────────────────────────────────────
   CAROUSEL
   Horizontal scrollable strip of ProductCards.

   Props:
     title     – section heading
     endpoint  – API path            (default '/items')
     params    – extra query params  (default { status:'ACTIVE', limit:10 })
     items     – optional static list (skips API fetch)
     service   – optional async function() → Item[] (takes priority over endpoint)
───────────────────────────────────────────────────────────── */
export default function Carousel({
  title    = 'Auctions',
  endpoint = '/items',
  params   = { status: 'ACTIVE', limit: 10 },
  items: staticItems,
  service,
}) {
  const trackRef = useRef(null);
  const [items,   setItems]   = useState(staticItems ?? []);
  const [loading, setLoading] = useState(!staticItems);
  const [error,   setError]   = useState(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

  /* ── fetch: prefer service fn → fallback to endpoint ── */
  useEffect(() => {
    if (staticItems) return;
    let cancelled = false;

    const doFetch = service
      ? service().then(list => ({ data: { items: list } }))
      : api.get(endpoint, { params });

    doFetch
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data.items ?? []);
        setItems(list);
      })
      .catch(() => !cancelled && setError('Could not load items.'))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [endpoint, JSON.stringify(params), !!staticItems, !!service]);

  /* ── scroll position tracking ── */
  const syncEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', syncEdges, { passive: true });
    syncEdges();
    return () => el.removeEventListener('scroll', syncEdges);
  }, [items, syncEdges]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = el.querySelector('article')?.offsetWidth ?? 260;
    el.scrollBy({ left: dir * (cardW + 16) * 2, behavior: 'smooth' });
  };

  /* ── skeleton cards ── */
  const SkeletonCard = () => (
    <div
      className="flex-none bg-white rounded-xl border border-[var(--color-border-subtle)] overflow-hidden animate-pulse"
      style={{ width: 224 }}
    >
      <div className="bg-gray-100" style={{ aspectRatio: '4/3' }} />
      <div className="p-3.5 flex flex-col gap-2">
        <div className="h-2.5 bg-gray-100 rounded w-2/5" />
        <div className="h-3.5 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-7 bg-gray-200 rounded-lg mt-1" />
      </div>
    </div>
  );

  /* ── arrow button ── */
  const Arrow = ({ dir, disabled }) => (
    <button
      onClick={() => scroll(dir)}
      disabled={disabled}
      aria-label={dir === -1 ? 'Scroll left' : 'Scroll right'}
      className="flex-none w-9 h-9 rounded-full border border-[var(--color-border-subtle)] flex items-center justify-center text-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-default"
      style={{
        background: disabled ? '#f9fafb' : 'var(--color-brand-primary)',
        color: disabled ? '#9ca3af' : '#fff',
      }}
    >
      {dir === -1 ? '←' : '→'}
    </button>
  );

  return (
    <section className="w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-[var(--color-brand-primary)] text-xl font-bold m-0">
          {title}
        </h2>
        <div className="flex gap-2">
          <Arrow dir={-1} disabled={atStart || loading} />
          <Arrow dir={1}  disabled={atEnd   || loading} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-[var(--color-text-muted)] py-6 text-center">{error}</p>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{
          scrollbarWidth: 'none',       // Firefox
          msOverflowStyle: 'none',      // IE/Edge
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Hide webkit scrollbar */}
        <style>{`.carousel-hide-scroll::-webkit-scrollbar{display:none}`}</style>

        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(item => (
              <div
                key={item._id}
                className="flex-none"
                style={{ width: 224 }}
              >
                <ProductCard item={item} />
              </div>
            ))
        }

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)] py-6 w-full text-center m-0">
            No items to show.
          </p>
        )}
      </div>
    </section>
  );
}
