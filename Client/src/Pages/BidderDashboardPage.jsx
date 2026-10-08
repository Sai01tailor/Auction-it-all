import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';
import AuthController from '../Components/Global/AuthController';
import { useAuth } from '../Context/AuthContext';
import { useWallet } from '../Context/WalletContext';
import api from '../../Config/Axios';
import ProductCard from '../Components/Product/ProductCard';

// ─── DOTTED BROWSE AUCTION 1ST CARD ─────────────────────────────────────────
function BrowseAuctionCard() {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate('/auctions')}
      style={{
        background: '#ffffff',
        border: '2px dashed #cbd5e1',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1.25rem',
        minHeight: '290px',
        height: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--color-brand-accent)';
        e.currentTarget.style.backgroundColor = '#fffdf7';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = '#cbd5e1';
        e.currentTarget.style.backgroundColor = '#ffffff';
      }}
    >
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
        color: 'var(--color-brand-primary)',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
          <path d="m16 16 6-6" />
          <path d="m8 8 6-6" />
          <path d="m9 7 8 8" />
          <path d="m21 11-8-8" />
        </svg>
      </div>

      <span className="dashboard-card-title" style={{
        fontSize: '0.92rem',
        fontWeight: 800,
        color: 'var(--color-brand-primary)',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: '0.3rem',
      }}>
        Browse Auction
      </span>

      <p className="dashboard-card-desc" style={{
        margin: 0,
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        fontWeight: 500,
        maxWidth: '180px',
        lineHeight: 1.4,
      }}>
        Discover live lots &amp; place your bids
      </p>
    </div>
  );
}

// ─── ACTIVE BID CARD ────────────────────────────────────────────────────────
function ActiveBidCard({ item, onDelete }) {
  const navigate = useNavigate();
  const { currentBid, lastBidder } = useSocket(item._id, item.currentHighestBid, 'ENGLISH', item);
  const isLeading = lastBidder?.username === 'You';

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,35,102,0.06)';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
      }}
    >
      {/* Photo Header */}
      <div style={{ position: 'relative', height: '150px', background: '#f8fafc', overflow: 'hidden' }}>
        {item.photos?.[0] ? (
          <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: 'var(--color-brand-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}

        {/* Status Badge Overlaid */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 5 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.25rem 0.6rem', borderRadius: '6px',
            fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
            background: isLeading ? '#ecfdf5' : '#fef2f2',
            color: isLeading ? '#065f46' : '#991b1b',
            border: `1px solid ${isLeading ? '#a7f3d0' : '#fecaca'}`,
          }}>
            {isLeading
              ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
              : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /></svg>
            }
            {isLeading ? 'Winning' : 'Outbid'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 className="dashboard-card-title" style={{
          margin: '0 0 0.5rem',
          fontSize: '0.88rem',
          fontWeight: 800,
          color: 'var(--color-brand-primary)',
          lineHeight: 1.4,
          height: '2.8em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {item.title}
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', background: '#f8fafc', border: '1px solid var(--color-border-subtle)', padding: '0.55rem 0.75rem', borderRadius: '8px', marginBottom: '0.85rem', marginTop: 'auto' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Current Bid</span>
            <span className="dashboard-card-price" style={{ fontWeight: 800, color: 'var(--color-brand-primary)', fontSize: '0.88rem' }}>₹{currentBid?.toLocaleString() ?? '—'}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Leader</span>
            <span style={{ fontWeight: 800, color: isLeading ? '#059669' : '#dc2626' }}>
              {isLeading ? 'You' : (lastBidder?.username || '—')}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/auction/${item._id}/console`)}
          className="dashboard-btn-action"
          style={{
            width: '100%', padding: '0.62rem 0', borderRadius: '8px', border: 'none',
            background: isLeading ? 'var(--color-brand-primary)' : '#dc2626',
            color: '#fff', fontWeight: 700, fontSize: '0.8rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {isLeading
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg> Terminal</>
            : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Re-bid</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function BidderDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletBalance, biddingPower } = useWallet();

  const [activeItems, setActiveItems] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [wonItems, setWonItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bids');   // 'bids' | 'watchlist' | 'won'
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Key watchlist per-user — prevents two accounts on the same browser from sharing it
    const watchlistKey = `watchlist:${user?.userId || user?._id || 'guest'}`;

    try {
      const saved = localStorage.getItem(watchlistKey);
      if (saved) { const p = JSON.parse(saved); if (p?.length > 0) setWatchlist(p); }
    } catch (_) { }

    if (user) {
      setLoading(true);

      // Fetch ONLY auctions the logged-in user has actually bidded on
      api.get('/items/user/my-bids')
        .then(res => {
          const myBiddedItems = res.data?.items ?? [];
          setActiveItems(myBiddedItems);
        })
        .catch(err => {
          console.warn('Failed to fetch user active bids', err);
          setActiveItems([]);
        })
        .finally(() => setLoading(false));

      // Fetch won auctions
      api.get('/items', { params: { status: 'SOLD', limit: 100 } })
        .then(res => {
          const allSold = res.data?.items ?? [];
          const myWon = allSold
            .filter(item => {
              const w = typeof item.winnerId === 'object' ? item.winnerId?._id : item.winnerId;
              return w === user.userId || w === user._id;
            })
            .map(item => ({ ...item, finalBid: item.currentHighestBid || item.startingPrice }));
          setWonItems(myWon);
        })
        .catch(() => { });
    } else {
      setActiveItems([]);
      setLoading(false);
    }
  }, [user]);

  const removeActiveBid = id => setActiveItems(prev => prev.filter(i => i._id !== id));
  const removeWatchedItem = id => setWatchlist(prev => {
    const watchlistKey = `watchlist:${user?.userId || user?._id || 'guest'}`;
    const next = prev.filter(i => i._id !== id);
    localStorage.setItem(watchlistKey, JSON.stringify(next));
    return next;
  });

  // Filtered lists based on search
  const filteredBids = useMemo(() => activeItems.filter(i => i.title?.toLowerCase().includes(search.toLowerCase())), [activeItems, search]);
  const filteredWatch = useMemo(() => watchlist.filter(i => i.title?.toLowerCase().includes(search.toLowerCase())), [watchlist, search]);
  const filteredWon = useMemo(() => wonItems.filter(i => i.title?.toLowerCase().includes(search.toLowerCase())), [wonItems, search]);

  const tabs = [
    { key: 'bids', label: 'Active Bids', count: activeItems.length },
    { key: 'watchlist', label: 'Watchlist', count: watchlist.length },
    { key: 'won', label: 'Won Escrows', count: wonItems.length },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <SEO
        title="Bidder Dashboard & Live Activities"
        description="Track active bids, manage watchlist items, monitor won escrows, and view seller activity on BidKar.in."
      />
      <AuthController />
      <Header />

      {/* ── 1. SOLID NAVY HERO BANNER (Inspired by ListingGridPage) ── */}
      <section style={{
        background: 'linear-gradient(160deg, #00102e 0%, #001948 40%, #002366 100%)',
        position: 'relative',
        padding: '2.5rem 1.5rem 3rem',
      }}>
        {/* SVG clip path for card shape (matching ListingGridPage) */}
        <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
          <defs>
            <clipPath id="dashboard-card-notch" clipPathUnits="objectBoundingBox">
              <path d="M 1,0.08 C 1,0.03 0.95,0 0.88,0 L 0.5,0 C 0.44,0 0.4,0.02 0.36,0.045 C 0.32,0.07 0.28,0.08 0.22,0.08 L 0.12,0.08 C 0.05,0.08 0,0.11 0,0.16 L 0,0.92 C 0,0.97 0.05,1 0.12,1 L 0.88,1 C 0.95,1 1,0.97 1,0.92 Z" />
            </clipPath>
          </defs>
        </svg>

        <div style={{
          maxWidth: '1200px', margin: '0 auto', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem',
        }}>

          {/* LEFT: Text & Action Buttons */}
          <div className="dashboard-hero-left" style={{ flex: 1, minWidth: '280px' }}>
            <p className="dashboard-hero-eyebrow" style={{
              margin: '0 0 0.45rem',
              fontSize: '0.65rem', fontWeight: 800,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--color-brand-accent)',
            }}>
              ✦ LIVE AUCTION MARKETPLACE ✦
            </p>
            <h1 className="dashboard-hero-title" style={{
              margin: 0,
              fontFamily: "Impact, 'Arial Narrow', 'Franklin Gothic Medium', Arial, sans-serif",
              fontSize: 'clamp(2rem, 4.2vw, 3.4rem)',
              fontWeight: 500,
              letterSpacing: '0.03em',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              marginBottom: '0.65rem',
            }}>
              <span style={{ color: '#ffffff', display: 'block' }}>{user?.username ? `${user.username}'s` : 'Bidder'}</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(90deg, #fece44 0%, #feda75 50%, #e5b630 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Dashboard</span>
            </h1>
            <p className="dashboard-hero-desc" style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#94a3b8', maxWidth: '520px', lineHeight: 1.5 }}>
              Live auction rooms, watchlists, real-time bids, and secured escrow settlement.
            </p>

            {/* Action Buttons (Consistent with HowItWorksPage) */}
            <div className="dashboard-hero-actions" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/ledger')}
                className="btn-hero-action dashboard-btn-action"
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  background: 'var(--color-brand-accent)',
                  color: 'var(--color-brand-primary-dark)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                View Passbook
              </button>

              <button
                onClick={() => navigate('/kyc')}
                className="btn-hero-action btn-kyc-action dashboard-btn-action"
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: '#ffffff',
                  background: '#001b44',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#00255c'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#001b44'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                {user?.kycStatus?.toLowerCase() === 'verified' ? 'KYC Details' : 'Complete KYC'}
              </button>

              {/* <button
                onClick={() => navigate('/wallet')}
                className="btn-hero-action dashboard-btn-action"
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: '#ffffff',
                  background: '#001b44',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#00255c'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#001b44'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                Top Up Wallet
              </button> */}
            </div>
          </div>

          {/* RIGHT: Solid Opaque Bidder Panel with Notched Clip Path */}
          <div className="dashboard-hero-right" style={{
            flex: '0 0 clamp(240px, 28vw, 320px)',
            position: 'relative',
          }}>
            {/* Deep navy vertical accent strip */}
            <div style={{
              position: 'absolute', left: -4, top: '15%', bottom: '10%',
              width: '5px',
              background: 'var(--color-brand-accent-dark)',
              borderRadius: '4px',
              zIndex: 2,
            }} />

            {/* Solid Gold Card Container with Clip Path */}
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, #fece44 0%, #feda75 50%, #e5b630 100%)',
              border: '1px solid rgba(229, 182, 48, 0.4)',
              clipPath: 'url(#dashboard-card-notch)',
              WebkitClipPath: 'url(#dashboard-card-notch)',
              padding: '1.75rem 1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}>
              {/* Clean Circular Avatar with Deep Blue Background */}
              <div style={{
                width: '54px', height: '54px', borderRadius: '50%',
                background: 'var(--color-brand-primary)',
                color: 'var(--color-brand-accent)',
                fontSize: '1.25rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.75rem',
                border: '2.5px solid #ffffff',
                boxShadow: '0 2px 8px rgba(0,35,102,0.25)',
              }}>
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'BD'}
              </div>

              <h3 className="dashboard-profile-name" style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: 'var(--color-brand-primary-dark)', letterSpacing: '-0.01em' }}>
                {user?.username || 'Verified Bidder'}
              </h3>
              <p className="dashboard-profile-email" style={{ margin: '0.2rem 0 0.85rem', fontSize: '0.75rem', color: 'rgba(0, 21, 61, 0.8)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {user?.email || 'bidder@bidkar.in'}
              </p>

              {/* Solid KYC Status Badge */}
              {user?.kycStatus?.toLowerCase() === 'verified' || user?.role === 'SELLER' || user?.role === 'ADMIN' ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  background: '#065f46', color: '#ffffff',
                  padding: '0.25rem 0.75rem', borderRadius: '6px',
                  fontSize: '0.65rem', fontWeight: 800,
                  border: '1px solid #047857',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                  KYC Verified
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  background: '#991b1b', color: '#ffffff',
                  padding: '0.25rem 0.75rem', borderRadius: '6px',
                  fontSize: '0.65rem', fontWeight: 800,
                  border: '1px solid #7f1d1d',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  KYC Pending
                </span>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. DASHBOARD CONTENT (Navbar → Navy Hero → Dashboard Content) ── */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>

        <div className="bidder-dashboard-layout">

          {/* ── LEFT SIDEBAR: Bidding Activity + Wallet (Justify Start & 0 Gap) ── */}
          <div className="dashboard-sidebar">

            {/* Top: Bidding Activity */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--color-border-subtle)',
              borderBottom: 'none',
              borderRadius: '16px 16px 0 0',
              padding: '1.25rem',
            }}>
              <h4 className="dashboard-stat-title" style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bidding Activity
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { label: 'Active Rooms', value: activeItems.length, color: 'var(--color-brand-primary)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
                  { label: 'Watchlist Items', value: watchlist.length, color: '#d97706', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
                  { label: 'Won Escrows', value: wonItems.length, color: '#059669', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> }
                ].map(stat => (
                  <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                      {stat.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="dashboard-stat-label" style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{stat.label}</span>
                    </div>
                    <strong className="dashboard-stat-value" style={{ fontSize: '0.95rem', fontWeight: 800, color: stat.color }}>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: Wallet Feature Card (Directly connected with 0 gap) */}
            <div style={{
              background: '#001948',
              border: '1px solid #001948',
              borderRadius: '0 0 16px 16px',
              padding: '1.35rem 1.25rem',
            }}>
              <span className="dashboard-stat-label" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-brand-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.25rem' }}>
                Cash Balance
              </span>
              <strong className="dashboard-balance-amount" style={{ display: 'block', fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                ₹{walletBalance?.toLocaleString('en-IN') ?? '0'}
              </strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.72rem' }}>
                <span style={{ color: '#94a3b8' }}>10× Power:</span>
                <strong style={{ color: 'var(--color-brand-accent)' }}>₹{biddingPower?.toLocaleString('en-IN') ?? '0'}</strong>
              </div>
              <button
                onClick={() => navigate('/wallet')}
                className="dashboard-btn-action"
                style={{
                  width: '100%', marginTop: '1rem', padding: '0.65rem',
                  background: 'var(--color-brand-accent)', color: 'var(--color-brand-primary-dark)',
                  border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800,
                  cursor: 'pointer', transition: 'opacity 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                Top Up Wallet
              </button>
            </div>

          </div>

          {/* ── RIGHT MAIN WORKSPACE: Tabs, Search & Auction Grid ── */}
          <div className="dashboard-main-content">

            {/* Flat Navigation Row + Search Input */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: '0.75rem',
            }}>
              {/* Flat Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {tabs.map(tab => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); setSearch(''); }}
                      className="dashboard-tab-btn"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 0.75rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: isActive ? '2.5px solid var(--color-brand-primary)' : '2.5px solid transparent',
                        color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
                        fontWeight: isActive ? 800 : 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.15s',
                      }}
                    >
                      {tab.label}
                      <span className="dashboard-tab-badge" style={{
                        padding: '0.1rem 0.45rem',
                        borderRadius: '12px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        background: isActive ? 'rgba(0,35,102,0.08)' : '#f1f5f9',
                        color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Clean Search Input */}
              <div style={{ position: 'relative', width: '220px', maxWidth: '100%' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${activeTab === 'bids' ? 'bids' : activeTab === 'watchlist' ? 'watchlist' : 'won items'}…`}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '0.45rem 0.75rem 0.45rem 2rem',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontFamily: 'inherit',
                    background: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                />
              </div>
            </div>

            {/* Grid Display */}
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '6rem 0', background: '#ffffff', border: '1px solid var(--color-border-subtle)', borderRadius: '16px' }}>
                  <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(0,35,102,0.1)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Loading portfolio...</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">

                  {/* ACTIVE BIDS */}
                  {activeTab === 'bids' && (
                    <motion.div key="bids" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem' }}>
                        {/* 1st Card: Browse Auction */}
                        <BrowseAuctionCard />
                        {filteredBids.map(item => <ActiveBidCard key={item._id} item={item} onDelete={removeActiveBid} />)}
                      </div>
                      {filteredBids.length === 0 && search && (
                        <div style={{ textAlign: 'center', marginTop: '1.25rem', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', background: '#ffffff', border: '1px solid var(--color-border-subtle)', borderRadius: '12px' }}>
                          No active bids matching "{search}".
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* WATCHLIST */}
                  {activeTab === 'watchlist' && (
                    <motion.div key="watchlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem' }}>
                        {/* 1st Card: Browse Auction */}
                        <BrowseAuctionCard />
                        {filteredWatch.map(item => (
                          <div key={item._id} style={{ position: 'relative' }}>
                            <ProductCard item={item} />
                            {/* Remove from Watchlist button */}
                            <button
                              onClick={() => removeWatchedItem(item._id)}
                              title="Remove from watchlist"
                              style={{
                                position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                                width: '22px', height: '22px', borderRadius: '50%',
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                color: '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                transition: 'color 0.15s, border-color 0.15s',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.color = '#dc2626';
                                e.currentTarget.style.borderColor = '#f87171';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.color = '#64748b';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      {filteredWatch.length === 0 && search && (
                        <div style={{ textAlign: 'center', marginTop: '1.25rem', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', background: '#ffffff', border: '1px solid var(--color-border-subtle)', borderRadius: '12px' }}>
                          No watchlist items matching "{search}".
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* WON ESCROWS */}
                  {activeTab === 'won' && (
                    <motion.div key="won" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem' }}>
                        {/* 1st Card: Browse Auction */}
                        <BrowseAuctionCard />
                        {filteredWon.map(item => (
                          <div
                            key={item._id}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #059669',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                              transition: 'transform 0.15s, box-shadow 0.15s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(5,150,105,0.08)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                            }}
                          >
                            <div style={{ position: 'relative', height: '150px', background: '#ecfdf5', overflow: 'hidden' }}>
                              {item.photos?.[0] ? (
                                <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ecfdf5', color: '#059669' }}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                </div>
                              )}
                              <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 5 }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.25rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Winner</span>
                              </div>
                            </div>
                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <h3 className="dashboard-card-title" style={{
                                margin: '0 0 0.5rem',
                                fontSize: '0.88rem',
                                fontWeight: 800,
                                color: 'var(--color-brand-primary)',
                                lineHeight: 1.4,
                                height: '2.8em',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {item.title}
                              </h3>
                              <div style={{ margin: 'auto 0 0.85rem', background: '#f0fdf4', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                <span style={{ color: '#15803d', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Final Price</span>
                                <span className="dashboard-card-price" style={{ fontWeight: 800, color: '#047857', fontSize: '0.95rem' }}>₹{item.finalBid?.toLocaleString()}</span>
                              </div>

                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => navigate(`/handoff/${item._id}`)}
                                  className="dashboard-btn-action"
                                  style={{ flex: 1, padding: '0.55rem 0', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#047857'}
                                  onMouseLeave={e => e.currentTarget.style.background = '#059669'}
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                  Handoff
                                </button>
                                <button
                                  onClick={() => navigate(`/invoice/${item._id}`)}
                                  className="dashboard-btn-action"
                                  style={{ flex: 1, padding: '0.55rem 0', borderRadius: '8px', border: '1px solid #059669', background: '#ffffff', color: '#059669', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#ecfdf5'}
                                  onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                  Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {filteredWon.length === 0 && search && (
                        <div style={{ textAlign: 'center', marginTop: '1.25rem', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', background: '#ffffff', border: '1px solid var(--color-border-subtle)', borderRadius: '12px' }}>
                          No won items matching "{search}".
                        </div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
