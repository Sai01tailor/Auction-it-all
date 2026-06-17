import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

/* ─────────────────────────────────────────────────────────────
   HEADER — BidKar.in
   Features:
     • Sticky + scroll-aware glass morphism
     • Bidkar.in logo with gold accent
     • Central search bar with keyboard shortcut
     • Live bid count indicator
     • Auth-aware nav (Sign In | user avatar + dropdown)
     • Mobile hamburger drawer
───────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Browse',       to: '/auctions'    },
  { label: 'Ending Soon',  to: '/auctions?sort=ending' },
  { label: 'How It Works', to: '/how-it-works' },
];

/* ── Logo ── */
function BidKarLogo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none', flexShrink: 0 }}>
      <div style={{
        width: '34px', height: '34px',
        borderRadius: '9px',
        background: 'linear-gradient(135deg, #fece44, #e5b630)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(254,206,68,0.4)',
      }}>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#002366', lineHeight: 1 }}>B</span>
      </div>
      <span style={{
        fontSize: '1.35rem',
        fontWeight: 800,
        color: 'var(--color-brand-primary)',
        letterSpacing: '-0.04em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        BidKar<span style={{ color: '#fece44' }}>.in</span>
      </span>
    </Link>
  );
}

/* ── Search Bar ── */
function SearchBar({ onSearch, collapsed }) {
  const [query, setQuery]   = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut: /
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/auctions?search=${encodeURIComponent(query.trim())}`);
    onSearch?.(query.trim());
  };

  if (collapsed) return null;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        flex: 1,
        maxWidth: '480px',
        position: 'relative',
      }}
    >
      {/* Search icon */}
      <div style={{
        position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', display: 'flex', alignItems: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={focused ? 'var(--color-brand-primary)' : '#9ca3af'}
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <input
        ref={inputRef}
        id="header-search"
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder='Search auctions… press "/" to focus'
        style={{
          width: '100%',
          padding: '0.5rem 2.5rem 0.5rem 2.5rem',
          borderRadius: '10px',
          border: focused
            ? '1.5px solid var(--color-brand-primary)'
            : '1.5px solid var(--color-border-subtle)',
          background: focused ? '#fff' : 'var(--color-surface-bg)',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: focused ? '0 0 0 3px rgba(0,35,102,0.08)' : 'none',
          color: 'var(--color-text-rich)',
        }}
      />

      {/* Keyboard hint */}
      {!focused && (
        <span style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '0.65rem', fontWeight: 600,
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          padding: '1px 5px',
          color: '#9ca3af',
          pointerEvents: 'none',
        }}>/</span>
      )}
    </form>
  );
}

/* ── User Avatar / Auth ── */
function AuthSection({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
        <Link to="/login">
          <button id="header-sign-in" style={{
            padding: '0.45rem 1.1rem',
            background: 'var(--color-brand-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
          }}>
            Sign In
          </button>
        </Link>
        <Link to="/sign-up">
          <button id="header-sign-up" style={{
            padding: '0.45rem 1.1rem',
            background: 'rgba(254,206,68,0.15)',
            color: 'var(--color-brand-primary)',
            border: '1.5px solid rgba(254,206,68,0.6)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
          }}>
            Register
          </button>
        </Link>
      </div>
    );
  }

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : (user.email?.[0] ?? 'U').toUpperCase();

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        id="header-avatar-btn"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '38px', height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-brand-primary), #1a3c7a)',
          color: '#fff',
          fontSize: '0.8rem',
          fontWeight: 700,
          border: '2px solid var(--color-brand-accent)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {initials}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#fff',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '12px',
          boxShadow: '0 12px 40px rgba(0,35,102,0.12)',
          padding: '0.5rem',
          minWidth: '200px',
          zIndex: 100,
        }}>
          <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: '0.25rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-rich)' }}>
              {user.username}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {user.email}
            </p>
          </div>
          {[
            { label: '👤 My Profile',      to: '/profile'   },
            { label: '📦 My Bids',         to: '/my-bids'   },
            { label: '🏷️ My Listings',     to: '/sell'      },
            { label: '⚙️ Settings',        to: '/settings'  },
          ].map(({ label, to }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} style={{
              display: 'block',
              padding: '0.5rem 0.75rem',
              fontSize: '0.85rem',
              color: 'var(--color-text-rich)',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Mobile Drawer ── */
function MobileDrawer({ open, onClose }) {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          zIndex: 199,
        }}
      />
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: '75vw', maxWidth: '300px',
        background: '#fff',
        zIndex: 200,
        display: 'flex', flexDirection: 'column',
        padding: '1.5rem 1.25rem',
        gap: '0.5rem',
        boxShadow: '4px 0 30px rgba(0,35,102,0.15)',
        animation: 'slideInLeft 0.25s ease',
      }}>
        <style>{`@keyframes slideInLeft { from { transform: translateX(-100%) } to { transform: translateX(0) } }`}</style>
        <BidKarLogo />
        <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '1rem 0' }} />
        {NAV_LINKS.map(link => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            style={{
              padding: '0.75rem 0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--color-text-rich)',
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'block',
            }}
          >
            {link.label}
          </Link>
        ))}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/login" onClick={onClose}>
            <button style={{ width: '100%', padding: '0.7rem', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Sign In
            </button>
          </Link>
          <Link to="/sign-up" onClick={onClose}>
            <button style={{ width: '100%', padding: '0.7rem', background: 'transparent', color: 'var(--color-brand-primary)', border: '1.5px solid var(--color-brand-primary)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Register
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

/* ── Main Header ────────────────────────────────────────────── */
export default function Header() {
  const { user }      = useAuth();
  const [scrolled, setScrolled]   = useState(false);
  const [mobile, setMobile]       = useState(false);
  const [drawerOpen, setDrawer]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    const onResize = () => setMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const headerStyle = {
    position: 'sticky', top: 0, zIndex: 50,
    width: '100%',
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: mobile ? '0 1rem' : '0 2rem',
    background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid',
    borderColor: scrolled ? 'var(--color-border-subtle)' : 'rgba(229,231,235,0.4)',
    boxShadow: scrolled ? '0 2px 16px rgba(0,35,102,0.07)' : 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  };

  return (
    <>
      <header style={headerStyle}>
        {/* Mobile burger */}
        {mobile && (
          <button
            id="header-burger"
            onClick={() => setDrawer(true)}
            style={{
              padding: '6px', border: 'none', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px', flexShrink: 0,
            }}
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-brand-primary)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <BidKarLogo />

        {/* Desktop nav links */}
        {!mobile && (
          <nav style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--color-text-rich)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--color-surface-bg)';
                  e.currentTarget.style.color = 'var(--color-brand-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-rich)';
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Search — desktop only */}
        <SearchBar collapsed={mobile} />

        {/* Live indicator */}
        {!mobile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            flexShrink: 0, padding: '0.3rem 0.75rem',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '20px',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#10b981',
              animation: 'bid-pulse 1.2s ease-out infinite',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46', whiteSpace: 'nowrap' }}>
              Live
            </span>
          </div>
        )}

        {/* Auth */}
        <AuthSection user={user} />
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawer(false)} />
    </>
  );
}