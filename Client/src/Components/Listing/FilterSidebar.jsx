import React, { useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   FilterSidebar — Left sidebar for P02 Listing Grid
   
   Props:
     onFilterChange  {function(filters)}  — called on any change
     filters         {object}             — current filter state
───────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🌐' },
  { id: 'electronics', label: 'Electronics', icon: '💻' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'vehicles', label: 'Vehicles', icon: '🏍️' },
  { id: 'jewellery', label: 'Jewellery', icon: '💍' },
  { id: 'realestate', label: 'Real Estate', icon: '🏠' },
  { id: 'fashion', label: 'Fashion', icon: '👜' },
  { id: 'antiques', label: 'Antiques', icon: '🏺' },
  { id: 'sports', label: 'Sports', icon: '🏋️' },
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const PRICE_PRESETS = [
  { label: 'Any', min: 0, max: 10_00_000 },
  { label: '< ₹10K', min: 0, max: 10_000 },
  { label: '₹10K–50K', min: 10_000, max: 50_000 },
  { label: '₹50K–2L', min: 50_000, max: 2_00_000 },
  { label: '₹2L–5L', min: 2_00_000, max: 5_00_000 },
  { label: '> ₹5L', min: 5_00_000, max: 10_00_000 },
];

/* ── Section wrapper ── */
function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', border: 'none', background: 'none', cursor: 'pointer',
          padding: '0 0 0.75rem',
          marginBottom: open ? '0.75rem' : 0,
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-rich)' }}>
          {title}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && children}
    </div>
  );
}

/* ── Reusable Filter Controls ── */
export function FilterControls({ filters, onFilterChange }) {
  const set = (key, val) => onFilterChange({ ...filters, [key]: val });

  const toggleCondition = (cond) => {
    const list = filters.condition ?? [];
    set('condition', list.includes(cond) ? list.filter(c => c !== cond) : [...list, cond]);
  };

  const formatINR = (n) =>
    n >= 1_00_000
      ? `₹${(n / 1_00_000).toFixed(n % 1_00_000 === 0 ? 0 : 1)}L`
      : n >= 1_000
        ? `₹${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 0)}K`
        : `₹${n}`;

  const [min, max] = filters.priceRange ?? [0, 10_00_000];

  return (
    <>
      {/* ── Category ── */}
      <Section title="Category">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.4rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => set('category', cat.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                padding: '0.45rem 0.5rem',
                borderRadius: '8px',
                border: filters.category === cat.id
                  ? '1.5px solid var(--color-brand-primary)'
                  : '1.5px solid var(--color-border-subtle)',
                background: filters.category === cat.id
                  ? 'rgba(0,35,102,0.08)' : '#fff',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: filters.category === cat.id ? 700 : 500,
                color: filters.category === cat.id ? 'var(--color-brand-primary)' : 'var(--color-text-rich)',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Price Range ── */}
      <Section title="Price Range">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{
              fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-brand-primary)',
              padding: '0.2rem 0.5rem', background: 'rgba(0,35,102,0.06)',
              borderRadius: '6px',
            }}>
              {formatINR(min)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>to</span>
            <span style={{
              fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-brand-primary)',
              padding: '0.2rem 0.5rem', background: 'rgba(0,35,102,0.06)',
              borderRadius: '6px',
            }}>
              {formatINR(max)}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {PRICE_PRESETS.map(preset => {
              const active = min === preset.min && max === preset.max;
              return (
                <button
                  key={preset.label}
                  id={`filter-price-${preset.label.replace(/[^a-z0-9]/gi, '')}`}
                  onClick={() => set('priceRange', [preset.min, preset.max])}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: active ? 700 : 500,
                    border: active
                      ? '1.5px solid var(--color-brand-primary)'
                      : '1.5px solid var(--color-border-subtle)',
                    borderRadius: '20px',
                    background: active ? 'var(--color-brand-primary)' : '#fff',
                    color: active ? '#fff' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── Auction Status ── */}
      <Section title="Auction Status">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { val: 'ACTIVE', label: 'Live Now' },
            { val: 'UPCOMING', label: 'Upcoming' },
            { val: 'ENDED', label: 'Ended' },
          ].map(opt => (
            <label
              key={opt.val}
              id={`filter-type-${opt.val}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                cursor: 'pointer', padding: '0.2rem 0',
              }}
            >
              <input
                type="radio"
                name="auction-type"
                value={opt.val}
                checked={filters.type === opt.val}
                onChange={() => set('type', opt.val)}
                style={{ accentColor: 'var(--color-brand-primary)', width: '15px', height: '15px' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-rich)', fontWeight: 500 }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Condition ── */}
      <Section title="Condition">
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          {CONDITIONS.map(cond => {
            const checked = (filters.condition ?? []).includes(cond);
            return (
              <label
                key={cond}
                id={`filter-cond-${cond.replace(/\s/g, '')}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.2rem 0' }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCondition(cond)}
                  style={{ accentColor: 'var(--color-brand-primary)', width: '15px', height: '15px' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-rich)', fontWeight: 500 }}>
                  {cond}
                </span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* ── Sort ── */}
      <div style={{ marginTop: '0.5rem' }}>
        <p style={{
          margin: '0 0 0.5rem',
          fontSize: '0.8rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--color-text-rich)',
        }}>
          Sort By
        </p>
        <select
          id="filter-sort"
          value={filters.sort ?? 'ending'}
          onChange={e => set('sort', e.target.value)}
          style={{
            width: '100%',
            padding: '0.55rem 0.75rem',
            borderRadius: '10px',
            border: '1.5px solid var(--color-border-subtle)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-brand-primary)',
            background: '#fff',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="ending">Ending Soon</option>
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="bids">Most Bids</option>
        </select>
      </div>
    </>
  );
}

/* ── Desktop Filter Sidebar (hidden on mobile via inline media query / class) ── */
export default function FilterSidebar({ filters, onFilterChange }) {
  return (
    <aside
      id="filter-sidebar"
      className="hidden md:block"
      style={{
        width: '240px',
        flexShrink: 0,
        background: '#fff',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '14px',
        padding: '1.25rem',
        height: 'fit-content',
        position: 'sticky',
        top: '84px',
        boxShadow: '0 2px 12px rgba(0,35,102,0.05)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
          Filters
        </h2>
        <button
          id="filter-clear-all"
          onClick={() => onFilterChange({ priceRange: [0, 10_00_000], type: 'ACTIVE', condition: [], category: 'all' })}
          style={{
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--color-brand-accent-dark)',
            padding: '2px 6px', borderRadius: '4px',
          }}
        >
          Clear all
        </button>
      </div>

      <FilterControls filters={filters} onFilterChange={onFilterChange} />
    </aside>
  );
}

/* ── Flipkart-style Bottom Sheet Mobile Filter Modal ── */
export function MobileFilterSheet({ isOpen, onClose, filters, onFilterChange }) {
  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-content" onClick={e => e.stopPropagation()}>
        
        {/* Handle Bar */}
        <div style={{ padding: '0.75rem 0 0.25rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '5px', borderRadius: '10px', background: '#cbd5e1' }} />
        </div>

        {/* Sheet Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem 0.85rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
            Filter & Sort
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => onFilterChange({ priceRange: [0, 10_00_000], type: 'ACTIVE', condition: [], category: 'all' })}
              style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#475569', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Filter Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          <FilterControls filters={filters} onFilterChange={onFilterChange} />
        </div>

        {/* Bottom Apply CTA */}
        <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--color-border-subtle)', background: '#fff' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '0.8rem', borderRadius: '12px', border: 'none',
              background: 'var(--color-brand-primary)', color: '#fff',
              fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,35,102,0.2)',
            }}
          >
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  );
}
