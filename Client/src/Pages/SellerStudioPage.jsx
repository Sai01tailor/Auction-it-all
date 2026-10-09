import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSellerDashboard, getSellerListings, updateHandoffStatus } from '../services/auctionService';
import { useAuth } from '../Context/AuthContext';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';
import AuthController from '../Components/Global/AuthController';

// ─── DOTTED CREATE LISTING 1ST CARD ──────────────────────────────────────────
function CreateListingCard() {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate('/seller/create')}
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
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
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
        Create Listing
      </span>

      <p className="dashboard-card-desc" style={{
        margin: 0,
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        fontWeight: 500,
        maxWidth: '180px',
        lineHeight: 1.4,
      }}>
        List new inventory for live bidding &amp; escrow
      </p>
    </div>
  );
}

// ─── SELLER LISTING CARD ─────────────────────────────────────────────────────
function SellerListingCard({ item, onConfirmHandoff }) {
  const navigate = useNavigate();
  const now = new Date();
  const isEnded = new Date(item.endTime) <= now || item.status !== 'ACTIVE';
  const handoffStatus = item.handoffStatus || 'PENDING';

  const statusBg =
    item.status === 'ACTIVE' ? '#ecfdf5' :
    item.status === 'SOLD' ? '#ecfdf5' :
    item.status === 'CANCELLED' ? '#fef2f2' : '#fffbeb';

  const statusColor =
    item.status === 'ACTIVE' ? '#065f46' :
    item.status === 'SOLD' ? '#047857' :
    item.status === 'CANCELLED' ? '#991b1b' : '#b45309';

  const statusBorder =
    item.status === 'ACTIVE' ? '#a7f3d0' :
    item.status === 'SOLD' ? '#a7f3d0' :
    item.status === 'CANCELLED' ? '#fecaca' : '#fde68a';

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
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 5, display: 'flex', gap: '0.35rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.25rem 0.6rem', borderRadius: '6px',
            fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
            background: statusBg,
            color: statusColor,
            border: `1px solid ${statusBorder}`,
          }}>
            {item.status}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.25rem 0.5rem', borderRadius: '6px',
            fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
            background: 'rgba(0, 25, 72, 0.75)', color: '#ffffff',
            backdropFilter: 'blur(4px)',
          }}>
            {item.auctionType || 'ENGLISH'}
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

        {/* Price Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', background: '#f8fafc', border: '1px solid var(--color-border-subtle)', padding: '0.55rem 0.75rem', borderRadius: '8px', marginBottom: '0.85rem', marginTop: 'auto' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Starting</span>
            <span className="dashboard-card-price" style={{ fontWeight: 800, color: 'var(--color-brand-primary)', fontSize: '0.88rem' }}>₹{item.startingPrice?.toLocaleString('en-IN') ?? '—'}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>Current / Final</span>
            <span style={{ fontWeight: 800, color: item.status === 'SOLD' ? '#059669' : 'var(--color-brand-primary)', fontSize: '0.88rem' }}>
              ₹{(item.currentHighestBid || item.startingPrice)?.toLocaleString('en-IN') ?? '—'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {item.status === 'ACTIVE' ? (
          <button
            onClick={() => navigate(`/auction/${item._id}/console`)}
            className="dashboard-btn-action"
            style={{
              width: '100%', padding: '0.62rem 0', borderRadius: '8px', border: 'none',
              background: 'var(--color-brand-primary)',
              color: '#fff', fontWeight: 700, fontSize: '0.8rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              transition: 'background 0.15s, opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
            Live Terminal Console
          </button>
        ) : item.status === 'SOLD' ? (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => navigate(`/handoff/${item._id}`)}
              className="dashboard-btn-action"
              style={{
                flex: 1, padding: '0.55rem 0', borderRadius: '8px', border: 'none',
                background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.78rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#047857'}
              onMouseLeave={e => e.currentTarget.style.background = '#059669'}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
              Handoff
            </button>
            <button
              onClick={() => navigate(`/invoice/${item._id}`)}
              className="dashboard-btn-action"
              style={{
                flex: 1, padding: '0.55rem 0', borderRadius: '8px',
                border: '1px solid #059669', background: '#ffffff', color: '#059669',
                fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#ecfdf5'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              Invoice
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate(`/auction/${item._id}`)}
            className="dashboard-btn-action"
            style={{
              width: '100%', padding: '0.62rem 0', borderRadius: '8px',
              border: '1px solid var(--color-border-subtle)', background: '#f8fafc',
              color: 'var(--color-brand-primary)', fontWeight: 700, fontSize: '0.8rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
          >
            View Listing
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE COMPONENT ─────────────────────────────────────────────────────
export default function SellerStudioPage() {
  const navigate = useNavigate();
  const { user, isInitializing } = useAuth();

  // Loading and Data State
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
  const limit = 8;

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
      await loadDashboardStats();
      await loadListings();
    } catch (err) {
      console.error('Handoff update failed', err);
    }
  };

  // Filtered items by search
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const tabs = [
    { key: 'ALL', label: 'All Listings', count: dashboard?.totalListings ?? totalItems },
    { key: 'ACTIVE', label: 'Active', count: dashboard?.activeListings ?? 0 },
    { key: 'SOLD', label: 'Sold', count: dashboard?.soldListings ?? 0 },
    { key: 'PENDING', label: 'Pending', count: dashboard?.pendingSettlements ?? 0 },
    { key: 'CANCELLED', label: 'Cancelled', count: dashboard?.cancelledListings ?? 0 },
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
        <SEO
          title="Seller Verification Required | BidKar.in"
          description="Complete identity verification to access the Seller Studio and start listing auctions on BidKar.in."
        />
        <AuthController />
        <Header />

        {/* Solid Navy Hero Banner */}
        <section style={{
          background: 'linear-gradient(160deg, #00102e 0%, #001948 40%, #002366 100%)',
          position: 'relative',
          padding: '2.5rem 1.5rem 3rem',
        }}>
          <div style={{
            maxWidth: '1200px', margin: '0 auto', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '2rem',
          }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <p style={{
                margin: '0 0 0.45rem', fontSize: '0.65rem', fontWeight: 800,
                letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-brand-accent)',
              }}>
                ✦ VERIFIED SELLER HUB ✦
              </p>
              <h1 style={{
                margin: 0,
                fontFamily: "Impact, 'Arial Narrow', 'Franklin Gothic Medium', Arial, sans-serif",
                fontSize: 'clamp(2rem, 4.2vw, 3.4rem)',
                fontWeight: 500,
                letterSpacing: '0.03em',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                marginBottom: '0.65rem',
              }}>
                <span style={{ color: '#ffffff', display: 'block' }}>Identity</span>
                <span style={{
                  display: 'block',
                  background: 'linear-gradient(90deg, #fece44 0%, #feda75 50%, #e5b630 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Verification Required</span>
              </h1>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#94a3b8', maxWidth: '520px', lineHeight: 1.5 }}>
                Under RBI regulations and platform security policies, sellers must complete Aadhaar KYC before listing premium items and receiving escrow settlements.
              </p>
            </div>
          </div>
        </section>

        {/* Card Container */}
        <div style={{ maxWidth: '540px', margin: '-1.5rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{ background: '#ffffff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '2rem', boxShadow: '0 8px 30px rgba(0,35,102,0.06)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(254,206,68,0.15)', border: '1.5px solid var(--color-brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-primary)', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>Unlock Full Seller Privileges</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Takes under 60 seconds with Aadhaar OTP</p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                Instant Role Upgrade: Automates seller access upon verification.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                100% Escrow Protection: Verified seller badge and secured payouts.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                onClick={() => navigate('/kyc')}
                style={{
                  width: '100%', padding: '0.75rem', background: 'var(--color-brand-accent)', color: 'var(--color-brand-primary-dark)',
                  border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(254,206,68,0.25)', transition: 'opacity 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Complete KYC Verification
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  width: '100%', padding: '0.75rem', background: '#ffffff', color: 'var(--color-text-rich)',
                  border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.85rem',
                  fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
              >
                Return to Bidder Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <SEO
        title="Seller Studio & Auction Management"
        description="Manage your auction listings, track live bids, complete verified escrow handoffs, and monitor settlement revenue on BidKar.in."
      />
      <AuthController />
      <Header />

      {/* ── 1. SOLID NAVY HERO BANNER (Matching BidderDashboardPage) ── */}
      <section style={{
        background: 'linear-gradient(160deg, #00102e 0%, #001948 40%, #002366 100%)',
        position: 'relative',
        padding: '2.5rem 1.5rem 3rem',
      }}>
        {/* SVG clip path for card notch */}
        <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
          <defs>
            <clipPath id="seller-card-notch" clipPathUnits="objectBoundingBox">
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
              ✦ VERIFIED SELLER HUB ✦
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
              <span style={{ color: '#ffffff', display: 'block' }}>{user?.username ? `${user.username}'s` : 'Seller'}</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(90deg, #fece44 0%, #feda75 50%, #e5b630 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Studio</span>
            </h1>
            <p className="dashboard-hero-desc" style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#94a3b8', maxWidth: '520px', lineHeight: 1.5 }}>
              Track live bids, complete local escrow handoffs, and manage inventory seamlessly.
            </p>

            {/* Action Buttons */}
            <div className="dashboard-hero-actions" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/seller/create')}
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Create Listing
              </button>

              <button
                onClick={() => navigate(`/seller/${user?._id || user?.id || 'me'}`)}
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Storefront Profile
              </button>

              <button
                onClick={() => navigate('/ledger')}
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                Passbook &amp; Ledger
              </button>
            </div>
          </div>

          {/* RIGHT: Solid Gold Seller Panel with Notched Clip Path */}
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
              clipPath: 'url(#seller-card-notch)',
              WebkitClipPath: 'url(#seller-card-notch)',
              padding: '1.75rem 1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}>
              {/* Clean Circular Avatar */}
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
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'SE'}
              </div>

              <h3 className="dashboard-profile-name" style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: 'var(--color-brand-primary-dark)', letterSpacing: '-0.01em' }}>
                {user?.username || 'Verified Seller'}
              </h3>
              <p className="dashboard-profile-email" style={{ margin: '0.2rem 0 0.85rem', fontSize: '0.75rem', color: 'rgba(0, 21, 61, 0.8)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {user?.email || 'seller@bidkar.in'}
              </p>

              {/* Status Badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                background: '#065f46', color: '#ffffff',
                padding: '0.25rem 0.75rem', borderRadius: '6px',
                fontSize: '0.65rem', fontWeight: 800,
                border: '1px solid #047857',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                Seller Verified
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. DASHBOARD CONTENT (Matching BidderDashboardPage Structure) ── */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>

        <div className="bidder-dashboard-layout">

          {/* ── LEFT SIDEBAR: Seller Activity + Revenue ── */}
          <div className="dashboard-sidebar">

            {/* Top: Seller Activity Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--color-border-subtle)',
              borderBottom: 'none',
              borderRadius: '16px 16px 0 0',
              padding: '1.25rem',
            }}>
              <h4 className="dashboard-stat-title" style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Seller Activity
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { label: 'Active Listings', value: dashboard?.activeListings ?? 0, color: 'var(--color-brand-primary)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
                  { label: 'Completed Sales', value: dashboard?.soldListings ?? 0, color: '#059669', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> },
                  { label: 'Pending Handoffs', value: dashboard?.pendingSettlements ?? 0, color: '#d97706', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
                  { label: 'Disputed / Cancelled', value: (dashboard?.cancelledListings ?? 0) + (dashboard?.disputedSettlements ?? 0), color: '#dc2626', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> }
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

            {/* Bottom: Revenue Feature Card (Connected with 0 gap) */}
            <div style={{
              background: '#001948',
              border: '1px solid #001948',
              borderRadius: '0 0 16px 16px',
              padding: '1.35rem 1.25rem',
            }}>
              <span className="dashboard-stat-label" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-brand-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.25rem' }}>
                Total Escrow Revenue
              </span>
              <strong className="dashboard-balance-amount" style={{ display: 'block', fontSize: '1.65rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                ₹{parseFloat(dashboard?.totalRevenueRupees || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.72rem' }}>
                <span style={{ color: '#94a3b8' }}>Total Listings:</span>
                <strong style={{ color: 'var(--color-brand-accent)' }}>{dashboard?.totalListings ?? 0} Lots</strong>
              </div>
              <button
                onClick={() => navigate('/seller/create')}
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Create New Listing
              </button>
            </div>

            {/* Quick Links Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '16px',
              padding: '0.65rem',
              marginTop: '1.25rem',
            }}>
              {[
                { label: 'Storefront Profile', path: `/seller/${user?._id || user?.id || 'me'}`, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
                { label: 'Bidder Dashboard', path: '/dashboard', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg> },
                { label: 'Disputes Center', path: '/disputes', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg> },
              ].map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem',
                    padding: '0.65rem 0.75rem', borderRadius: '10px', border: 'none',
                    background: 'transparent', color: 'var(--color-text-rich)', fontWeight: 600,
                    fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.15s, color 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-bg)'; e.currentTarget.style.color = 'var(--color-brand-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-rich)'; }}
                >
                  <span style={{ color: 'var(--color-brand-primary)', display: 'inline-flex', flexShrink: 0 }}>{link.icon}</span>
                  {link.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              ))}
            </div>

          </div>

          {/* ── RIGHT MAIN WORKSPACE: Tabs, Search & Listings Grid ── */}
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
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', maxWidth: '100%' }}>
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
                  placeholder="Search listings…"
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
                  <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Loading inventory...</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem' }}>
                      {/* 1st Card: Create Listing Card */}
                      <CreateListingCard />
                      {filteredItems.map(item => (
                        <SellerListingCard key={item._id} item={item} onConfirmHandoff={handleConfirmHandoff} />
                      ))}
                    </div>

                    {filteredItems.length === 0 && search && (
                      <div style={{ textAlign: 'center', marginTop: '1.25rem', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', background: '#ffffff', border: '1px solid var(--color-border-subtle)', borderRadius: '12px' }}>
                        No listings matching "{search}".
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                        <button
                          disabled={page === 1}
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          style={{
                            padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1.5px solid var(--color-border-subtle)',
                            background: '#ffffff', color: page === 1 ? 'var(--color-text-muted)' : 'var(--color-brand-primary)',
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
                              background: p === page ? 'var(--color-brand-primary)' : '#ffffff',
                              color: p === page ? '#ffffff' : 'var(--color-text-rich)',
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
                            background: '#ffffff', color: page === totalPages ? 'var(--color-text-muted)' : 'var(--color-brand-primary)',
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
