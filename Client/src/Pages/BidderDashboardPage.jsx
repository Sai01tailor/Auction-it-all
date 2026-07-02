import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveAuctions } from '../services/auctionService';
import { useSocket } from '../hooks/useSocket';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';
import { useAuth } from '../Context/AuthContext';
import { useWallet } from '../Context/WalletContext';
import api from '../../Config/Axios';
import ProductCard from '../Components/Product/ProductCard';

// ─── ACTIVE BID CARD ────────────────────────────────────────────────────────
function ActiveBidCard({ item, onDelete }) {
  const navigate = useNavigate();
  const { currentBid, lastBidder } = useSocket(item._id, item.currentHighestBid, 'ENGLISH', item);
  const isLeading = lastBidder?.username === 'You';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        background: '#fff',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,35,102,0.02)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,35,102,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,35,102,0.02)';
      }}
    >
      {/* Photo Header */}
      <div style={{ position: 'relative', height: '130px', background: '#f8fafc', overflow: 'hidden' }}>
        {item.photos?.[0] ? (
          <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,35,102,0.03)', color: 'var(--color-brand-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}

        {/* Status Badge Overlaid */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 5 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.25rem 0.6rem', borderRadius: '20px',
            fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
            background: isLeading ? '#ecfdf5' : '#fef2f2',
            color: isLeading ? '#065f46' : '#991b1b',
            border: `1.5px solid ${isLeading ? '#10b981' : '#f87171'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            {isLeading
              ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
              : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /></svg>
            }
            {isLeading ? 'Winning' : 'Outbid'}
          </span>
        </div>

        {/* Delete button overlaid */}
        {/* <button
          onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
          style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 5,
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', border: '1px solid var(--color-border-subtle)',
            color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button> */}
      </div>

      {/* Card Body */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          margin: '0 0 0.5rem',
          fontSize: '0.85rem',
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

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', background: 'var(--color-surface-bg)', padding: '0.5rem 0.65rem', borderRadius: '10px', marginBottom: '0.85rem', marginTop: 'auto' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Current Bid</span>
            <span style={{ fontWeight: 800, color: 'var(--color-brand-primary)' }}>₹{currentBid?.toLocaleString() ?? '—'}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Leader</span>
            <span style={{ fontWeight: 800, color: isLeading ? '#10b981' : '#ef4444' }}>
              {isLeading ? 'You' : (lastBidder?.username || '—')}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/auction/${item._id}/console`)}
          style={{
            width: '100%', padding: '0.6rem 0', borderRadius: '10px', border: 'none',
            background: isLeading ? 'var(--color-brand-primary)' : '#ef4444',
            color: '#fff', fontWeight: 700, fontSize: '0.78rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {isLeading
            ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg> Terminal</>
            : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Re-bid</>
          }
        </button>
      </div>
    </motion.div>
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
    try {
      const saved = localStorage.getItem('watchlist');
      if (saved) { const p = JSON.parse(saved); if (p?.length > 0) setWatchlist(p); }
    } catch (_) { }

    getActiveAuctions({}, 0, 10)
      .then(res => {
        const items = res.items || [];
        if (items.length > 0) {
          setActiveItems(items.slice(0, 3));
          setWatchlist(prev => prev.length > 0 ? prev : items.slice(3, 7));
        }
      })
      .finally(() => setLoading(false));

    if (user) {
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
    }
  }, [user]);

  const removeActiveBid = id => setActiveItems(prev => prev.filter(i => i._id !== id));
  const removeWatchedItem = id => setWatchlist(prev => {
    const next = prev.filter(i => i._id !== id);
    localStorage.setItem('watchlist', JSON.stringify(next));
    return next;
  });

  // Filtered lists based on search
  const filteredBids = useMemo(() => activeItems.filter(i => i.title?.toLowerCase().includes(search.toLowerCase())), [activeItems, search]);
  const filteredWatch = useMemo(() => watchlist.filter(i => i.title?.toLowerCase().includes(search.toLowerCase())), [watchlist, search]);
  const filteredWon = useMemo(() => wonItems.filter(i => i.title?.toLowerCase().includes(search.toLowerCase())), [wonItems, search]);

  const tabs = [
    { key: 'bids', label: 'Active Bids', count: activeItems.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
    { key: 'watchlist', label: 'Watchlist', count: watchlist.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
    { key: 'won', label: 'Won Escrows', count: wonItems.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" /><path d="M12 2a5 5 0 0 0-5 5v3h10V7a5 5 0 0 0-5-5z" /></svg> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <AuthController />
      <Header />

      {/* ── FULL-WIDTH HERO BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg,var(--color-brand-primary-dark) 0%,var(--color-brand-primary) 55%,#1a3c7a 100%)',
        padding: '2rem 2rem 3.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dot grid overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            {/* <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(254,206,68,0.12)', border: '1px solid rgba(254,206,68,0.25)', padding: '0.3rem 0.85rem', borderRadius: '20px', marginBottom: '0.75rem' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-brand-accent)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Live Feed Active</span>
            </div> */}
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              {user?.username ? `${user.username}'s Dashboard` : 'Bidder Dashboard'}
            </h1>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
              Live auction rooms, watchlists, and secured escrow ledgers
            </p>
          </div>
          {/* Wallet summary pill */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1rem 1.25rem', backdropFilter: 'blur(10px)' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Cash Balance</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>₹{walletBalance?.toLocaleString('en-IN') ?? '0'}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-brand-accent)', fontWeight: 600, display: 'block', marginTop: '0.1rem' }}>10× Power: ₹{biddingPower?.toLocaleString('en-IN') ?? '0'}</span>
            </div> */}
            <button
              onClick={() => navigate('/wallet')}
              style={{
                alignSelf: 'center', padding: '0.7rem 1.4rem',
                background: 'var(--color-brand-accent)', color: 'var(--color-brand-primary-dark)',
                border: 'none', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 800,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 4px 16px rgba(254,206,68,0.2)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#ffd866'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-brand-accent)'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
              Top Up Wallet
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (overlaps hero) ── */}
      <div style={{ maxWidth: '1100px', margin: '-1.75rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>

        {/* ── 2-COLUMN LAYOUT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.75rem', alignItems: 'start' }} className="wallet-grid">

          {/* ── LEFT COLUMN (Utility + Stats) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Profile card */}
            <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-brand-primary-dark),var(--color-brand-primary))', color: '#fff', fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem', boxShadow: '0 4px 14px rgba(0,35,102,0.15)' }}>
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'BD'}
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
                {user?.username || 'Verified Bidder'}
              </h3>
              <p style={{ margin: '0.2rem 0 0.85rem', fontSize: '0.72rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {user?.email || 'bidder@bidkar.in'}
              </p>
              {user?.kycStatus?.toLowerCase() === 'verified' || user?.role === 'SELLER' || user?.role === 'ADMIN' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#ecfdf5', color: '#047857', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid #a7f3d0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                  KYC Verified
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fef2f2', color: '#991b1b', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid #fecaca', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  KYC Pending
                </span>
              )}
            </div>

            {/* Stats Card (Utility) */}
            <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bidding Activity</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { label: 'Active Rooms', value: activeItems.length, color: 'var(--color-brand-primary)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
                  { label: 'Watchlist Items', value: watchlist.length, color: '#f59e0b', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
                  { label: 'Won Escrows', value: wonItems.length, color: '#10b981', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> }
                ].map(stat => (
                  <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-surface-bg)', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${stat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                      {stat.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{stat.label}</span>
                    </div>
                    <strong style={{ fontSize: '0.95rem', fontWeight: 800, color: stat.color }}>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet snapshot */}
            <div style={{ background: 'linear-gradient(135deg,var(--color-brand-primary-dark) 0%,var(--color-brand-primary) 100%)', borderRadius: '20px', padding: '1.35rem 1.5rem', boxShadow: '0 6px 24px rgba(0,35,102,0.12)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '16px 16px', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-brand-accent)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '0.35rem' }}>Cash Balance</span>
                <strong style={{ display: 'block', fontSize: '1.65rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                  ₹{walletBalance?.toLocaleString('en-IN') ?? '0'}
                </strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.72rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>10× Power:</span>
                  <strong style={{ color: 'var(--color-brand-accent)' }}>₹{biddingPower?.toLocaleString('en-IN') ?? '0'}</strong>
                </div>
                <button
                  onClick={() => navigate('/wallet')}
                  style={{ width: '100%', marginTop: '0.9rem', padding: '0.65rem', background: 'var(--color-brand-accent)', color: 'var(--color-brand-primary-dark)', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(254,206,68,0.18)', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ffd866'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--color-brand-accent)'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                  Top Up Wallet
                </button>
              </div>
            </div>

            {/* Quick nav links */}
            <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '0.5rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)' }}>
              {[
                { label: 'View Passbook', path: '/ledger', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
                { label: 'Browse Auctions', path: '/auctions', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
                {
                  label: user?.kycStatus?.toLowerCase() === 'verified' ? 'KYC Details' : 'Complete KYC',
                  path: '/kyc',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                },
              ].map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.7rem 0.85rem', borderRadius: '12px', border: 'none', background: 'transparent', color: 'var(--color-text-rich)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,35,102,0.05)'; e.currentTarget.style.color = 'var(--color-brand-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-rich)'; }}
                >
                  <span style={{ color: 'var(--color-brand-primary)', display: 'inline-flex', flexShrink: 0 }}>{link.icon}</span>
                  {link.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              ))}
            </div>

          </div>

          {/* ── RIGHT COLUMN (Perfect Product Card Grid) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Tab bar + search header */}
            <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)' }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSearch(''); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.65rem 0.85rem',
                      background: 'none', border: 'none',
                      borderBottom: activeTab === tab.key ? '2.5px solid var(--color-brand-primary)' : '2.5px solid transparent',
                      color: activeTab === tab.key ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
                      fontWeight: activeTab === tab.key ? 800 : 600,
                      fontSize: '0.82rem', cursor: 'pointer',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                  >
                    <span style={{ color: 'inherit' }}>{tab.icon}</span>
                    {tab.label}
                    <span style={{
                      padding: '0.1rem 0.45rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800,
                      background: activeTab === tab.key ? 'rgba(0,35,102,0.08)' : 'rgba(0,35,102,0.04)',
                      color: activeTab === tab.key ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
                    }}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: 'relative', minWidth: '180px', maxWidth: '240px', width: '100%' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${activeTab === 'bids' ? 'bids' : activeTab === 'watchlist' ? 'watchlist' : 'won items'}…`}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.8rem', fontFamily: 'inherit', background: '#fff', outline: 'none', transition: 'border-color 0.15s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                />
              </div>
            </div>

            {/* Grid display */}
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '6rem 0', background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px' }}>
                  <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(0,35,102,0.1)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>Loading portfolio...</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">

                  {/* ACTIVE BIDS */}
                  {activeTab === 'bids' && (
                    <motion.div key="bids" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                      {filteredBids.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                          <AnimatePresence>
                            {filteredBids.map(item => <ActiveBidCard key={item._id} item={item} onDelete={removeActiveBid} />)}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', fontSize: '0.88rem', background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px' }}>
                          {search ? `No active bids matching "${search}".` : 'No active bids — browse listings to start!'}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* WATCHLIST */}
                  {activeTab === 'watchlist' && (
                    <motion.div key="watchlist" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                      {filteredWatch.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                          {filteredWatch.map(item => (
                            // <div
                            //   key={item._id}
                            //   style={{
                            //     background: '#fff',
                            //     border: '1px solid var(--color-border-subtle)',
                            //     borderRadius: '20px',
                            //     overflow: 'hidden',
                            //     boxShadow: '0 4px 20px rgba(0,35,102,0.02)',
                            //     display: 'flex',
                            //     flexDirection: 'column',
                            //     height: '100%',
                            //     transition: 'transform 0.2s, box-shadow 0.2s',
                            //   }}
                            //   onMouseEnter={e => {
                            //     e.currentTarget.style.transform = 'translateY(-4px)';
                            //     e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,35,102,0.06)';
                            //   }}
                            //   onMouseLeave={e => {
                            //     e.currentTarget.style.transform = 'none';
                            //     e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,35,102,0.02)';
                            //   }}
                            // >
                            //   <div style={{ position: 'relative', height: '130px', background: '#f8fafc', overflow: 'hidden' }}>
                            //     {item.photos?.[0] ? (
                            //       <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            //     ) : (
                            //       <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,35,102,0.03)', color: 'var(--color-brand-primary)' }}>
                            //         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                            //       </div>
                            //     )}

                            //     {/* <button
                            //       onClick={() => removeWatchedItem(item._id)}
                            //       style={{
                            //         position: 'absolute', top: '10px', right: '10px', zIndex: 5,
                            //         width: '26px', height: '26px', borderRadius: '50%',
                            //         background: 'rgba(255,255,255,0.9)', border: '1px solid var(--color-border-subtle)',
                            //         color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            //         cursor: 'pointer', transition: 'all 0.15s',
                            //       }}
                            //       onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fff'; }}
                            //       onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; }}
                            //     >
                            //       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            //     </button> */}
                            //   </div>
                            //   <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            //     <h3 style={{
                            //       margin: '0 0 0.5rem',
                            //       fontSize: '0.85rem',
                            //       fontWeight: 800,
                            //       color: 'var(--color-brand-primary)',
                            //       lineHeight: 1.4,
                            //       height: '2.8em',
                            //       display: '-webkit-box',
                            //       WebkitLineClamp: 2,
                            //       WebkitBoxOrient: 'vertical',
                            //       overflow: 'hidden',
                            //     }}>
                            //       {item.title}
                            //     </h3>
                            //     <div style={{ margin: 'auto 0 0.85rem' }}>
                            //       <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Starting Price</span>
                            //       <span style={{ fontWeight: 800, color: 'var(--color-brand-primary)', fontSize: '0.9rem' }}>₹{item.startingPrice?.toLocaleString()}</span>
                            //     </div>
                            //     <button
                            //       onClick={() => navigate(`/auction/${item._id}`)}
                            //       style={{
                            //         width: '100%', padding: '0.6rem 0', borderRadius: '10px',
                            //         border: '1.5px solid var(--color-brand-primary)', background: 'transparent',
                            //         color: 'var(--color-brand-primary)', fontWeight: 700, fontSize: '0.78rem',
                            //         cursor: 'pointer', transition: 'all 0.15s'
                            //       }}
                            //       onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-brand-primary)'; e.currentTarget.style.color = '#fff'; }}
                            //       onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-brand-primary)'; }}
                            //     >
                            //       View Auction
                            //     </button>
                            //   </div>
                            // </div>
                            <ProductCard key={item._id} item={item} />
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', fontSize: '0.88rem', background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px' }}>
                          {search ? `No watchlist items matching "${search}".` : 'Your watchlist is empty.'}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* WON ESCROWS */}
                  {activeTab === 'won' && (
                    <motion.div key="won" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                      {filteredWon.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                          {filteredWon.map(item => (
                            <div
                              key={item._id}
                              style={{
                                background: '#fff',
                                border: '1.5px solid #10b981',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(16,185,129,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(16,185,129,0.08)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.03)';
                              }}
                            >
                              <div style={{ position: 'relative', height: '130px', background: '#ecfdf5', overflow: 'hidden' }}>
                                {item.photos?.[0] ? (
                                  <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ecfdf5', color: '#10b981' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                  </div>
                                )}
                                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 5 }}>
                                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#047857', background: '#ecfdf5', border: '1.5px solid #10b981', padding: '0.25rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>Winner</span>
                                </div>
                              </div>
                              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <h3 style={{
                                  margin: '0 0 0.5rem',
                                  fontSize: '0.85rem',
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
                                <div style={{ margin: 'auto 0 0.85rem' }}>
                                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Final Price</span>
                                  <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>₹{item.finalBid?.toLocaleString()}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => navigate(`/handoff/${item._id}`)}
                                    style={{ flex: 1, padding: '0.55rem 0', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                                  >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                    Handoff
                                  </button>
                                  <button
                                    onClick={() => navigate(`/invoice/${item._id}`)}
                                    style={{ flex: 1, padding: '0.55rem 0', borderRadius: '10px', border: '1.5px solid #10b981', background: 'transparent', color: '#10b981', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    Invoice
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', fontSize: '0.88rem', background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px' }}>
                          {search ? `No won items matching "${search}".` : 'No won auctions yet — keep bidding!'}
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
