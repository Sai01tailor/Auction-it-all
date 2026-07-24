import React, { useState, useEffect, useRef } from 'react';
import LongLogo from '../../assets/LongLogo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useWallet } from '../../Context/WalletContext';
import api from '../../../Config/Axios';

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

const DESKTOP_NAV_LINKS = [
  { label: 'Browse', to: '/auctions' },
  { label: 'Ending Soon', to: '/auctions?sort=ending' },
  { label: 'How It Works', to: '/how-it-works' },
];

const MOBILE_NAV_LINKS = [
  { label: 'Auctions', to: '/auctions' },
  { label: 'Ending Soon', to: '/auctions?sort=ending' },
  { label: 'Disputes', to: '/disputes' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Contact Us', to: '/contact/email' },
];

/* ── Logo Component ── */
export function BigLogo({ style = {}, compact = false }) {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none', flexShrink: 0, ...style }}>
      <img src={LongLogo} alt="BidKar Logo" style={{ width: compact ? '82px' : '110px', height: 'auto', objectFit: 'contain' }} />
    </Link>
  );
}

export const BidKarLogo = BigLogo;

/* ── Search Bar ── */
function SearchBar({ onSearch, collapsed }) {
  const [query, setQuery] = useState('');
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
            { label: ' My Profile', to: '/dashboard' },
            { label: ' My Bids', to: '/dashboard' },
            { label: ' Settings', to: '/settings' },
          ].map(({ label, to }, idx) => (
            <Link key={idx} to={to} onClick={() => setOpen(false)} style={{
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
  const { user, logout } = useAuth();
  if (!open) return null;

  const loggedInLinks = [
    { label: 'Auctions', to: '/auctions' },
    { label: 'Ending Soon', to: '/auctions?sort=ending' },
    { label: 'Bidder Dashboard', to: '/dashboard' },
    { label: 'TopUP Wallet', to: '/wallet' },
    { label: 'Disputes', to: '/disputes' },
    { label: 'How It Works', to: '/how-it-works' },
  ];

  const guestLinks = MOBILE_NAV_LINKS;

  const linksToRender = user ? loggedInLinks : guestLinks;

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
        width: '78vw', maxWidth: '300px',
        background: '#fff',
        zIndex: 200,
        display: 'flex', flexDirection: 'column',
        padding: '1.5rem 1.25rem',
        gap: '0.5rem',
        boxShadow: '4px 0 30px rgba(0,35,102,0.15)',
        animation: 'slideInLeft 0.25s ease',
      }}>
        <style>{`@keyframes slideInLeft { from { transform: translateX(-100%) } to { transform: translateX(0) } }`}</style>
        <BigLogo />
        <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '0.85rem 0' }} />

        {linksToRender.map(link => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            style={{
              padding: '0.65rem 0.5rem',
              fontSize: '0.92rem',
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

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', pt: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          {user ? (
            <>
              <div style={{ padding: '0.4rem 0.5rem', background: 'var(--color-surface-bg)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-brand-primary)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {user.username ? user.username.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-brand-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.username}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                style={{
                  width: '100%', padding: '0.65rem',
                  background: '#fef2f2', color: '#991b1b',
                  border: '1.5px solid #fecaca', borderRadius: '10px',
                  fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Notification Bell Drodown (P20) ── */
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All');
  const ref = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications', { params: { type: filter } });
      const list = res.data.notifications || res.data.data || [];
      setNotifications(list);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 20000); // poll every 20s

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [filter]);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id, link) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
      setOpen(false);
      if (link) navigate(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
          padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px'
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            background: '#ef4444', color: '#fff', fontSize: '0.62rem', fontWeight: 900,
            borderRadius: '50%', width: '16px', height: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 2px #fff'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#fff', border: '1px solid var(--color-border-subtle)',
          borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,35,102,0.12)',
          padding: '1rem', minWidth: '320px', maxWidth: '360px', zIndex: 100
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-brand-primary)' }}>Inbox Alerts</span>
            <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary-light)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Mark all read</button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {['All', 'Bids', 'Payments', 'System Alerts'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '0.25rem 0.5rem', border: 'none', borderRadius: '6px',
                  background: filter === cat ? 'var(--color-brand-primary)' : 'var(--color-surface-bg)',
                  color: filter === cat ? '#fff' : 'var(--color-text-muted)',
                  fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notifications.length === 0 ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center', display: 'block', padding: '1rem 0' }}>No notifications found.</span>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => handleMarkRead(n._id, n.link)}
                  style={{
                    padding: '0.6rem', borderRadius: '10px',
                    background: n.isRead ? 'transparent' : 'rgba(254,206,68,0.06)',
                    border: '1px solid',
                    borderColor: n.isRead ? 'var(--color-border-subtle)' : 'rgba(254,206,68,0.2)',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(254,206,68,0.06)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--color-brand-primary)' }}>{n.title}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>{n.type}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-rich)', lineHeight: 1.3 }}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Header ────────────────────────────────────────────── */
export default function Header() {
  const { user } = useAuth();
  const { walletBalance } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [drawerOpen, setDrawer] = useState(false);

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
    height: mobile ? '62px' : '68px',
    display: 'flex',
    alignItems: 'center',
    gap: mobile ? '0.6rem' : '1rem',
    padding: mobile ? '0 0.85rem' : '0 2rem',
    background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid',
    borderColor: scrolled ? 'var(--color-border-subtle)' : 'rgba(229,231,235,0.4)',
    boxShadow: scrolled ? '0 2px 16px rgba(0,35,102,0.07)' : 'none',
    transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
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

        {/* Logo (compact 82px on mobile to fit alongside header controls) */}
        <BigLogo compact={mobile} />

        {/* Desktop nav links */}
        {!mobile && (
          <nav style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
            {DESKTOP_NAV_LINKS.map(link => (
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

        {/* Right Side Alignment Wrapper */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: mobile ? '0.45rem' : '1rem', flexShrink: 0 }}>
          {/* Wallet Balance Badge */}
          {user && (
            <Link
              to="/wallet"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: mobile ? '0.3rem' : '0.45rem',
                flexShrink: 0,
                padding: mobile ? '0.25rem 0.55rem' : '0.35rem 0.8rem',
                background: 'rgba(254,206,68,0.08)',
                border: '1.5px solid rgba(254,206,68,0.4)',
                borderRadius: '20px',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(254,206,68,0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(254,206,68,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width={mobile ? "15" : "18"} height={mobile ? "15" : "18"} viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                  <circle cx="6" cy="18" r="2" />
                  <circle cx="18" cy="6" r="2" />
                </svg>
              </span>
              <span style={{ fontSize: mobile ? '0.68rem' : '0.78rem', fontWeight: 800, color: 'var(--color-brand-primary)', whiteSpace: 'nowrap' }} className="tabular-nums">
                ₹{walletBalance.toLocaleString('en-IN')}
              </span>
            </Link>
          )}

          {/* Auth */}
          {user && <NotificationBell />}
          {!mobile && <AuthSection user={user} />}
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawer(false)} />
    </>
  );
}