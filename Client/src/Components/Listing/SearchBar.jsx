import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   SearchBar — Listing Grid prominent search input
   
   Props:
     onSearch    {function(query: string)} — debounced callback
     total       {number}                 — result count to display
     placeholder {string}
───────────────────────────────────────────────────────────── */
export default function SearchBar({
  onSearch,
  total,
  placeholder = 'Search by title, seller, category…',
}) {
  const [query,   setQuery]   = useState('');
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);

  // Debounce: fire onSearch 300ms after user stops typing
  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch?.(val), 300);
  };

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div
        id="listing-search-bar"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          border: focused
            ? '2px solid var(--color-brand-primary)'
            : '1.5px solid var(--color-border-subtle)',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: focused
            ? '0 0 0 4px rgba(0,35,102,0.08)'
            : '0 2px 8px rgba(0,35,102,0.04)',
        }}
      >
        {/* Search icon */}
        <div style={{
          padding: '0 0.75rem 0 1.1rem',
          display: 'flex', alignItems: 'center',
          color: focused ? 'var(--color-brand-primary)' : '#9ca3af',
          transition: 'color 0.2s',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          id="listing-search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '0.8rem 0.5rem',
            border: 'none',
            outline: 'none',
            fontSize: '0.975rem',
            color: 'var(--color-text-rich)',
            background: 'transparent',
            fontFamily: 'inherit',
          }}
        />

        {/* Result count badge */}
        {total != null && (
          <span style={{
            padding: '0.25rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            whiteSpace: 'nowrap',
            borderLeft: '1px solid var(--color-border-subtle)',
            marginLeft: '0.5rem',
          }}>
            {total.toLocaleString()} results
          </span>
        )}

        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            style={{
              padding: '0.5rem 0.75rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#9ca3af',
              display: 'flex', alignItems: 'center',
              flexShrink: 0,
              borderRadius: '0 12px 12px 0',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Active search tag */}
      {query.trim() && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Showing results for:
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.2rem 0.6rem',
            background: 'rgba(0,35,102,0.07)',
            color: 'var(--color-brand-primary)',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            "{query}"
            <button
              onClick={handleClear}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'inherit' }}
            >×</button>
          </span>
        </div>
      )}
    </div>
  );
}
