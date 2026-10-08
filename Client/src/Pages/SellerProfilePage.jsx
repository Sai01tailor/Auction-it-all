import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSellerProfile } from '../services/auctionService';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';

export default function SellerProfilePage() {
  const { id } = useParams();
  const sellerId = id || 'mock-seller-id';

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getSellerProfile(sellerId);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load seller profile details', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [sellerId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
        <Header />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0,35,102,0.1)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Loading public storefront...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
        <Header />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <p style={{ color: 'var(--color-text-muted)', fontWeight: 700, marginTop: '1rem' }}>Seller profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <SEO
        title={`${profile.username}'s Verified Showroom | BidKar.in`}
        description={`Explore verified auctions and seller reputation track records for ${profile.username} on BidKar.in.`}
      />
      <Header />

      {/* ── 1. SOLID NAVY HERO BANNER (With Gavel Image Showcase as in HowItWorksPage) ── */}
      <section style={{
        background: 'linear-gradient(160deg, #00102e 0%, #001948 40%, #002366 100%)',
        position: 'relative',
        padding: '2.5rem 1.5rem 3rem',
      }}>
        {/* SVG clip path for card shape */}
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

          {/* LEFT: Text & Eyebrow & Badges */}
          <div className="dashboard-hero-left" style={{ flex: 1, minWidth: '280px' }}>
            <p className="dashboard-hero-eyebrow" style={{
              margin: '0 0 0.45rem',
              fontSize: '0.65rem', fontWeight: 800,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--color-brand-accent)',
            }}>
              ✦ VERIFIED SELLER SHOWROOM ✦
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
              <span style={{ color: '#ffffff', display: 'block' }}>{profile.username ? `${profile.username}'s` : 'Seller'}</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(90deg, #fece44 0%, #feda75 50%, #e5b630 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Showroom</span>
            </h1>
            <p className="dashboard-hero-desc" style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#94a3b8', maxWidth: '520px', lineHeight: 1.5 }}>
              Browse verified inventory, escrow-backed auctions, reputation track records, and authenticated settlements.
            </p>

            {/* Quick Badges / Action Links */}
            <div className="dashboard-hero-actions" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                background: 'rgba(254, 206, 68, 0.12)',
                color: 'var(--color-brand-accent)',
                border: '1px solid rgba(254, 206, 68, 0.3)',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                {profile.reputation} ★ Top Rated
              </span>

              {profile.kycStatus === 'VERIFIED' && (
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                  KYC Verified
                </span>
              )}

              <span style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Member since {profile.joinedDate}
              </span>
            </div>
          </div>

          {/* RIGHT: Solid Opaque Seller Profile Card with Notched Clip Path (like BidderDashboardPage) */}
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
                {profile.username ? profile.username.slice(0, 2).toUpperCase() : 'SL'}
              </div>

              <h3 className="dashboard-profile-name" style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: 'var(--color-brand-primary-dark)', letterSpacing: '-0.01em' }}>
                {profile.username || 'Verified Seller'}
              </h3>
              <p className="dashboard-profile-email" style={{ margin: '0.2rem 0 0.85rem', fontSize: '0.75rem', color: 'rgba(0, 21, 61, 0.8)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {profile.joinedDate ? `Member since ${profile.joinedDate}` : 'Verified Merchant'}
              </p>

              {/* Solid Status Badges */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {profile.kycStatus === 'VERIFIED' ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    background: '#065f46', color: '#ffffff',
                    padding: '0.25rem 0.65rem', borderRadius: '6px',
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
                    padding: '0.25rem 0.65rem', borderRadius: '6px',
                    fontSize: '0.65rem', fontWeight: 800,
                    border: '1px solid #7f1d1d',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    KYC Pending
                  </span>
                )}

                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  background: 'var(--color-brand-primary)', color: '#ffffff',
                  padding: '0.25rem 0.65rem', borderRadius: '6px',
                  fontSize: '0.65rem', fontWeight: 800,
                  border: '1px solid var(--color-brand-primary-dark)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  {profile.reputation} ★
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Container - Asymmetrical layouts */}
      <div className="seller-profile-grid">
        
        {/* Left Side Column: Trust Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Trust Performance Metrics Card */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '24px',
            padding: '1.75rem',
            boxShadow: '0 10px 30px rgba(0,35,102,0.02)',
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-brand-primary)', marginBottom: '1.25rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Escrow Trust Ratings</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Handoff Success Rate</span>
                  <strong style={{ color: '#10b981' }}>{profile.successRate}%</strong>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${profile.successRate}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Items Authenticated</span>
                  <strong style={{ color: 'var(--color-brand-primary)' }}>{profile.totalSold}</strong>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', background: 'var(--color-brand-primary)', borderRadius: '4px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981', flexShrink: 0 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>This seller operates under BidKar's Strict 10% Escrow Escort Agreement. Winner deposits are verified offline before releasing funds.</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side Column: Active Listings Grid & Review Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          {/* Active Listings Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: 0 }}>
                Active Showroom Listings
              </h2>
              <span style={{ background: 'var(--color-brand-primary)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                {profile.activeItems.length} LIVE
              </span>
            </div>

            {profile.activeItems.length === 0 ? (
              <div style={{
                background: '#fff',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '24px',
                padding: '3rem 2rem',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--color-surface-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.5rem',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-brand-primary)' }}>Showroom is currently empty.</p>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No active auctions are listed by this seller at the moment.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.5rem',
              }}>
                {profile.activeItems.map((item) => (
                  <Link
                    key={item._id}
                    to={`/auction/${item._id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: '#fff',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0,35,102,0.01)',
                      transition: 'all 0.25s',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
                        e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,35,102,0.06)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,35,102,0.01)';
                      }}
                    >
                      {/* Image container */}
                      <div style={{ height: '160px', background: 'var(--color-surface-bg)', position: 'relative' }}>
                        {item.photos && item.photos[0] && (
                          <img
                            src={item.photos[0]}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                        <span style={{
                          position: 'absolute', top: '10px', right: '10px',
                          background: 'rgba(0,35,102,0.85)', color: '#fff',
                          padding: '0.2rem 0.5rem', borderRadius: '4px',
                          fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase'
                        }}>
                          {item.auctionType}
                        </span>
                      </div>

                      {/* Info body */}
                      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-brand-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </h4>

                        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                              Current valuation
                            </span>
                            <strong className="tabular-nums" style={{ fontSize: '0.9rem', color: 'var(--color-brand-primary)' }}>
                              ₹{(item.currentHighestBid || item.startingPrice)?.toLocaleString('en-IN')}
                            </strong>
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-brand-accent-dark)' }}>
                            Bid Now →
                          </span>
                        </div>
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Previous Ended Auctions Section */}
          {profile.endedItems && profile.endedItems.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: 0 }}>
                  Previous Ended Auctions
                </h2>
                <span style={{ background: '#6b7280', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {profile.endedItems.length} COMPLETED
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.5rem',
              }}>
                {profile.endedItems.map((item) => (
                  <Link
                    key={item._id}
                    to={`/auction/${item._id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: '#fff',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0,35,102,0.01)',
                      transition: 'all 0.25s',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: 0.85
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
                        e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,35,102,0.06)';
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,35,102,0.01)';
                        e.currentTarget.style.opacity = '0.85';
                      }}
                    >
                      {/* Image container */}
                      <div style={{ height: '160px', background: 'var(--color-surface-bg)', position: 'relative' }}>
                        {item.photos && item.photos[0] && (
                          <img
                            src={item.photos[0]}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(35%)' }}
                          />
                        )}
                        <span style={{
                          position: 'absolute', top: '10px', right: '10px',
                          background: 'rgba(107, 114, 128, 0.95)', color: '#fff',
                          padding: '0.2rem 0.5rem', borderRadius: '4px',
                          fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase'
                        }}>
                          SOLD
                        </span>
                      </div>

                      {/* Info body */}
                      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </h4>

                        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                              Hammer Price
                            </span>
                            <strong className="tabular-nums" style={{ fontSize: '0.9rem', color: '#10b981' }}>
                              ₹{(item.currentHighestBid || item.startingPrice)?.toLocaleString('en-IN')}
                            </strong>
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                            View Handoff
                          </span>
                        </div>
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Verified Winner Review Feed */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', marginBottom: '1.5rem' }}>
              Customer Experiences ({profile.reviews.length} Verified Reviews)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {profile.reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    boxShadow: '0 4px 15px rgba(0,35,102,0.01)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, color: 'var(--color-brand-primary)', fontSize: '0.9rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {rev.bidder}
                      </span>
                      <span style={{
                        background: 'rgba(3, 105, 161, 0.08)', color: '#0369a1',
                        fontSize: '0.62rem', fontWeight: 800,
                        padding: '0.15rem 0.5rem', borderRadius: '4px',
                        textTransform: 'uppercase',
                        display: 'inline-flex', alignItems: 'center', gap: '0.2rem'
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Verified Winner
                      </span>
                    </div>

                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '0.15rem', color: 'var(--color-brand-accent-dark)' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill={i < rev.rating ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-rich)', fontStyle: 'italic', lineHeight: '1.5' }}>
                    "{rev.comment}"
                  </p>

                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.5rem', textAlign: 'right' }}>
                    {rev.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
