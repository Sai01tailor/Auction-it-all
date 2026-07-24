import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSellerDashboard, getSellerListings, updateHandoffStatus } from '../services/auctionService';
import { useAuth } from '../Context/AuthContext';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';

export default function SellerStudioPage() {
  const navigate = useNavigate();
  const { user, isInitializing } = useAuth();

  // Loading and State
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [items, setItems] = useState([]);
  const [isForbidden, setIsForbidden] = useState(false);

  // Search & Filter State
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'SOLD' | 'CANCELLED' | 'PENDING'
  const [search, setSearch] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 6; // smaller limit for tighter card layouts

  // Load general dashboard stats
  const loadDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const data = await getSellerDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load seller dashboard stats', err);
      if (err.response?.status === 403) {
        setIsForbidden(true);
      }
    } finally {
      setStatsLoading(false);
    }
  };

  // Load paginated own listings based on page & status filter
  const loadListings = async () => {
    setLoading(true);
    try {
      const statusFilter = activeTab === 'ALL' ? null : activeTab;
      const res = await getSellerListings(page, statusFilter, limit);
      setItems(res.items || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load seller listings', err);
      if (err.response?.status === 403) {
        setIsForbidden(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync load operations
  useEffect(() => {
    if (!isInitializing && (user?.role === 'SELLER' || user?.role === 'ADMIN')) {
      loadDashboardStats();
    }
  }, [isInitializing, user]);

  useEffect(() => {
    // Reset to page 1 when activeTab changes
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (!isInitializing && (user?.role === 'SELLER' || user?.role === 'ADMIN')) {
      loadListings();
    }
  }, [page, activeTab, isInitializing, user]);

  // Handle handoff validation completion
  const handleConfirmHandoff = async (itemId) => {
    try {
      await updateHandoffStatus(itemId, 'COMPLETED');
      // Reload stats and listings to refresh UI
      await loadDashboardStats();
      await loadListings();
    } catch (err) {
      console.error('Handoff update failed', err);
    }
  };

  // Client-side search filtering on current page items
  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { key: 'ALL', label: 'All Listings' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'SOLD', label: 'Sold' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'PENDING', label: 'Pending' }
  ];

  // Auth block states
  if (isInitializing) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3.5px solid rgba(0,35,102,0.08)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const isAuthorized = user?.role === 'SELLER' || user?.role === 'ADMIN';

  if (isForbidden || !isAuthorized) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
        <AuthController />
        <Header />

        {/* Full-width gradient banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 55%, #1a3c7a 100%)',
          padding: '4rem 2rem 5rem',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛡️</span>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              Identity Verification Required
            </h1>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)' }}>
              Unlock the Seller Studio and start listing premium items.
            </p>
          </div>
        </div>

        {/* Floating Block Card */}
        <div style={{ maxWidth: '500px', margin: '-2.5rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 8px 30px rgba(0,35,102,0.06)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-rich)', lineHeight: 1.6 }}>
              Under RBI deposit guidelines and platform regulations, all sellers must complete identity verification (Aadhaar KYC) before creating auctions or receiving escrow settlements.
            </p>

            <div style={{ background: 'var(--color-surface-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', fontSize: '0.78rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                Instant Upgrades: Verify Aadhaar instantly via OTP and upgrade your role automatically.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                Secure Escrow Guarantee: Safely list high-value items with protected deposits.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => navigate('/kyc')}
                style={{
                  width: '100%', padding: '0.85rem', background: 'var(--color-brand-primary)', color: '#fff',
                  border: 'none', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,35,102,0.12)', transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Start KYC Verification
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  width: '100%', padding: '0.85rem', background: '#fff', color: 'var(--color-text-rich)',
                  border: '1.5px solid var(--color-border-subtle)', borderRadius: '12px', fontSize: '0.88rem',
                  fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Go to Bidder Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <AuthController />
      <Header />

      {/* ── FULL-WIDTH GRADIENT HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 55%, #1a3c7a 100%)',
        padding: '1.5rem 0.65rem 3.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dot grid overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              {user?.username ? `${user.username}'s Seller Studio` : 'Seller Studio'}
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>
              Track live bids, complete local escrow handoffs, and manage premium listings.
            </p>
          </div>
          <div>
            <button
              onClick={() => navigate('/seller/create')}
              style={{
                padding: '0.55rem 1.1rem',
                background: 'var(--color-brand-accent)', color: 'var(--color-brand-primary-dark)',
                border: 'none', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 4px 16px rgba(254,206,68,0.2)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#ffd866'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-brand-accent)'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Create New Listing
            </button>
          </div>
        </div>
      </div>

      {/* ── OVERLAPPING CONTENT WRAPPER ── */}
      <div style={{ maxWidth: '1100px', margin: '-1.75rem auto 4rem', padding: '0 0.65rem', position: 'relative', zIndex: 10 }}>

        {/* ── RESPONSIVE FLATTENED GRID & ORDER LAYOUT ── */}
        <div className="seller-dashboard-layout">

          {/* 1. Profile Card (Order 1 on mobile) */}
          <div className="seller-profile-card" style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-brand-primary-dark),var(--color-brand-primary))', color: '#fff', fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem', boxShadow: '0 4px 14px rgba(0,35,102,0.15)' }}>
              {user?.username ? user.username.slice(0, 2).toUpperCase() : 'SE'}
            </div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
              {user?.username || 'Premium Seller'}
            </h3>
            <p style={{ margin: '0.2rem 0 0.85rem', fontSize: '0.72rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
              {user?.email || 'seller@bidkar.in'}
            </p>
            {user?.role === 'SELLER' || user?.role === 'ADMIN' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#ecfdf5', color: '#047857', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid #a7f3d0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                Active Seller
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fef2f2', color: '#991b1b', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid #fecaca', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                KYC Pending
              </span>
            )}
          </div>

          {/* 3. Quick nav links (Order 3 on mobile) */}
          <div className="seller-quick-links" style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '0.5rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)' }}>
            {[
              { label: 'Create Listing', path: '/seller/create', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> },
              { label: 'Storefront Profile', path: `/seller/${user?._id || user?.id || 'me'}`, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
              { label: 'Bidder Dashboard', path: '/dashboard', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg> },
              { label: 'Disputes Center', path: '/disputes', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg> },
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

          {/* 4. Quick Selling Tips Card (Order 4 on mobile) */}
          <div className="seller-tips-card" style={{ background: 'linear-gradient(135deg,var(--color-brand-primary-dark) 0%,var(--color-brand-primary) 100%)', borderRadius: '20px', padding: '1.25rem', color: '#fff', boxShadow: '0 4px 20px rgba(0,35,102,0.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '16px 16px', pointerEvents: 'none' }} />
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-brand-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escrow Guarantee</h4>
            <p style={{ margin: 0, fontSize: '0.72rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.75)' }}>
              Funds are secured in escrow at hammer time. Meet the buyer at the coordinates to confirm exchange and release funds instantly.
            </p>
          </div>

          {/* 2. MAIN RIGHT COLUMN (Order 2 on mobile) */}
          <div className="seller-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Overview / Stats Cards Grid */}
            <div className="wallet-stats-strip">
              {statsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', padding: '1.25rem', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '20px', height: '20px', border: '2.5px solid rgba(0,35,102,0.08)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                ))
              ) : (
                <>
                  {/* Card 1: Total Revenue */}
                  <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderTop: '4px solid #10b981', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total Escrow Revenue</span>
                      <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.45rem', fontWeight: 900, color: '#10b981', letterSpacing: '-0.01em' }}>
                        ₹{parseFloat(dashboard?.totalRevenueRupees || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h2>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>Completed sales released</span>
                  </div>

                  {/* Card 2: Active Listings */}
                  <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderTop: '4px solid var(--color-brand-primary)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Active Listings</span>
                      <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-brand-primary)', letterSpacing: '-0.01em' }}>
                        {dashboard?.activeListings || 0} / {dashboard?.totalListings || 0}
                      </h2>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>Items currently in bidding</span>
                  </div>

                  {/* Card 3: Logistical Settlements */}
                  <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderTop: '4px solid var(--color-brand-accent-dark)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Handoffs & Settlements</span>
                      <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.45rem', fontWeight: 900, color: '#d97706', letterSpacing: '-0.01em' }}>
                        {dashboard?.pendingSettlements || 0} Pending
                      </h2>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#b45309', marginTop: '0.35rem', fontWeight: 600 }}>
                      {dashboard?.disputedSettlements || 0} Disputed / {dashboard?.cancelledListings || 0} Cancelled
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Tab bar + search header */}
            <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)' }}>
              <div style={{ display: 'flex', gap: '0.15rem', overflowX: 'auto', maxWidth: '100%' }}>
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSearch(''); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.55rem 0.65rem',
                      background: 'none', border: 'none',
                      borderBottom: activeTab === tab.key ? '2.5px solid var(--color-brand-primary)' : '2.5px solid transparent',
                      color: activeTab === tab.key ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
                      fontWeight: activeTab === tab.key ? 800 : 600,
                      fontSize: '0.78rem', cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: '160px', width: '100%' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search listings..."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.8rem', fontFamily: 'inherit', background: '#fff', outline: 'none', transition: 'border-color 0.15s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                />
              </div>
            </div>

            {/* Listings Display Grid / List */}
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '6rem 0', background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px' }}>
                  <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(0,35,102,0.1)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>Retrieving listings...</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

                    {filteredItems.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {filteredItems.map(item => {
                          const now = new Date();
                          const isEnded = new Date(item.endTime) <= now || item.status !== 'ACTIVE';
                          const handoffStatus = item.handoffStatus || 'PENDING';

                          return (
                            <div
                              key={item._id}
                              style={{
                                border: '1px solid var(--color-border-subtle)',
                                borderRadius: '16px',
                                padding: '1.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                background: '#fff',
                                boxShadow: '0 2px 8px rgba(0,35,102,0.01)',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
                                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,35,102,0.03)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,35,102,0.01)';
                              }}
                            >
                              {/* Item Top Row */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  {item.photos && item.photos[0] ? (
                                    <img
                                      src={item.photos[0]}
                                      alt={item.title}
                                      style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--color-border-subtle)' }}
                                    />
                                  ) : (
                                    <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'var(--color-surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-border-subtle)' }}>
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                    </div>
                                  )}
                                  <div>
                                    <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                                      {item.title}
                                    </h3>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.15rem' }}>
                                      Condition: <strong style={{ color: 'var(--color-text-rich)' }}>{item.condition?.replace('_', ' ')}</strong>
                                    </span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <span style={{
                                    background: item.auctionType === 'ENGLISH' ? '#eff6ff' : item.auctionType === 'DUTCH' ? '#fef3c7' : '#faf5ff',
                                    color: item.auctionType === 'ENGLISH' ? '#1e40af' : item.auctionType === 'DUTCH' ? '#92400e' : '#6b21a8',
                                    padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase'
                                  }}>
                                    {item.auctionType || 'ENGLISH'}
                                  </span>

                                  <span style={{
                                    background: item.status === 'ACTIVE' ? '#dcfce7' : item.status === 'SOLD' ? '#ecfdf5' : '#fee2e2',
                                    color: item.status === 'ACTIVE' ? '#166534' : item.status === 'SOLD' ? '#047857' : '#991b1b',
                                    padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase'
                                  }}>
                                    {item.status}
                                  </span>
                                </div>
                              </div>

                              {/* Price Details */}
                              <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem',
                                background: 'var(--color-surface-bg)', padding: '0.75rem 1rem', borderRadius: '10px'
                              }}>
                                <div>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>Starting Price</span>
                                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-brand-primary)' }}>₹{item.startingPrice?.toLocaleString('en-IN')}</strong>
                                </div>

                                <div>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>Current Bid / Value</span>
                                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-brand-primary)' }}>
                                    ₹{(item.currentHighestBid || item.startingPrice)?.toLocaleString('en-IN')}
                                  </strong>
                                </div>

                                {item.meetingPoint && (
                                  <div style={{ gridColumn: 'span 2' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>Meeting Point</span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-rich)', fontWeight: 600 }}>📍 {item.meetingPoint}</span>
                                  </div>
                                )}
                              </div>

                              {/* Action Bar */}
                              {isEnded ? (
                                <div style={{ borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
                                  <div>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Winner Details:</span>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                                      {item.winnerId?.username ? `👤 ${item.winnerId.username} (${item.winnerId.email})` : '👤 Auction Closed'}
                                    </span>
                                  </div>

                                  <div>
                                    {handoffStatus === 'COMPLETED' ? (
                                      <div style={{ background: '#ecfdf5', border: '1.5px solid #34d399', color: '#065f46', padding: '0.35rem 0.85rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                        Escrow Finalized
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleConfirmHandoff(item._id)}
                                        style={{
                                          background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '8px',
                                          padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 10px rgba(16,185,129,0.2)'
                                        }}
                                      >
                                        Confirm Escrow Handover
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '0.85rem' }}>
                                  <Link to={`/auction/${item._id}/console`} style={{ textDecoration: 'none' }}>
                                    <button
                                      onMouseEnter={e => {
                                        e.currentTarget.style.padding = '0.45rem 1.5rem';
                                        e.currentTarget.style.background = '#001f56';
                                        e.currentTarget.querySelector('.arrow').style.transform = 'translateX(5px)';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.padding = '0.45rem 1rem';
                                        e.currentTarget.style.background = 'var(--color-brand-primary)';
                                        e.currentTarget.querySelector('.arrow').style.transform = 'translateX(0)';
                                      }}
                                      onMouseDown={e => {
                                        e.currentTarget.style.padding = '0.45rem 1.7rem';
                                        e.currentTarget.querySelector('.arrow').style.transform = 'translateX(8px)';
                                      }}
                                      onMouseUp={e => {
                                        e.currentTarget.style.padding = '0.45rem 1.5rem';
                                        e.currentTarget.querySelector('.arrow').style.transform = 'translateX(5px)';
                                      }}
                                      style={{
                                        background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: '8px',
                                        padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                        transition: 'padding 0.2s ease, background 0.2s ease',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      Enter Trading Terminal
                                      <span className="arrow" style={{ transition: 'transform 0.2s ease', display: 'inline-block', fontWeight: 900 }}>→</span>
                                    </button>
                                  </Link>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)', background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px' }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>🏷️</span>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>No listings found in this category.</p>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem' }}>Create a high-fidelity listing to receive active escrow bids.</p>
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <button
                          disabled={page === 1}
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          style={{
                            padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1.5px solid var(--color-border-subtle)',
                            background: '#fff', color: page === 1 ? 'var(--color-text-muted)' : 'var(--color-brand-primary)',
                            fontWeight: 700, fontSize: '0.75rem', cursor: page === 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              border: p === page ? 'none' : '1.5px solid var(--color-border-subtle)',
                              background: p === page ? 'var(--color-brand-primary)' : '#fff',
                              color: p === page ? '#fff' : 'var(--color-text-rich)',
                              fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer'
                            }}
                          >
                            {p}
                          </button>
                        ))}

                        <button
                          disabled={page === totalPages}
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          style={{
                            padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1.5px solid var(--color-border-subtle)',
                            background: '#fff', color: page === totalPages ? 'var(--color-text-muted)' : 'var(--color-brand-primary)',
                            fontWeight: 700, fontSize: '0.75rem', cursor: page === totalPages ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
