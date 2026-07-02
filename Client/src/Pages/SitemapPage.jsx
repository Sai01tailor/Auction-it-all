import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../Components/Global/Header';
import { toast } from 'react-toastify';
import api from '../../Config/Axios';

export default function SitemapPage() {
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { name: 'Antiques & Fine Art', links: ['Paintings', 'Sculptures', 'Vintage Furniture', 'Coins & Stamps'] },
    { name: 'Business Machinery', links: ['Office Equipment', 'Industrial Tools', 'Printing Presses', 'Textile Machines'] },
    { name: 'Designer Tech', links: ['Smartphones', 'Premium Laptops', 'Audio gear', 'Camera gear'] },
    { name: 'Luxury Apparel', links: ['Designer Watches', 'Jewelry', 'Leather bags', 'Limited Sneakers'] },
    { name: 'Real Estate Block', links: ['Surat Commercial', 'Mumbai Residential', 'Villas & Plots'] },
    { name: 'Automotive Showroom', links: ['Vintage Cars', 'Superbikes', 'Electric Vehicles', 'Utility Vehicles'] }
  ];

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/suggestions', { category: suggestion });
      toast.success('Category suggestion submitted successfully!');
      setSubmitted(true);
      setSuggestion('');
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      toast.error('Failed to submit category suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <Header />
      
      {/* Banner - Full Bleed Hero matching Legal/HowItWorks */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 60%, #001f5c 100%)',
        color: '#fff',
        padding: '5rem 1.5rem 6.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-brand-accent)', background: 'rgba(254,206,68,0.12)', border: '1px solid rgba(254,206,68,0.25)', padding: '0.35rem 0.85rem', borderRadius: '20px', display: 'inline-block', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Platform Directories
          </span>
          <h1 style={{ color: 'var(--color-brand-accent)', margin: 0, fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Sitemap Directory
          </h1>
          <p style={{ margin: '0.6rem 0 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            An indexed portal of active subcategories, bidding showcases, and corporate compliance routes for search crawlers and public navigators.
          </p>
        </div>
      </section>

      {/* Overlapping Content Container */}
      <div style={{ maxWidth: '1100px', margin: '-3.5rem auto 4.5rem', padding: '0 1.5rem', position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Categories Directory Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {categories.map((cat, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 8px 30px rgba(0,35,102,0.02)',
                transition: 'transform 0.25s, border-color 0.25s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
              }}
            >
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-brand-primary)', borderBottom: '2px solid var(--color-border-subtle)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span>{cat.name}</span>
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {cat.links.map((link, lIdx) => (
                  <li key={lIdx} style={{ fontSize: '0.85rem' }}>
                    <Link
                      to={`/auctions?search=${encodeURIComponent(link)}`}
                      style={{ color: 'var(--color-text-rich)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-primary-light)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-rich)'}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ color: 'var(--color-brand-accent-dark)' }}>•</span>
                        {link}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-brand-accent-dark)', fontWeight: 700 }}>Browse →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Public Utility Corridor */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 30px rgba(0,35,102,0.02)' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>Platform Corridors</span>
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
            
            <Link to="/" style={{ color: 'var(--color-text-rich)', textDecoration: 'none', padding: '0.85rem 1rem', background: 'var(--color-surface-bg)', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-border-subtle)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-primary)' }}>
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Home Dashboard</span>
            </Link>

            <Link to="/auctions" style={{ color: 'var(--color-text-rich)', textDecoration: 'none', padding: '0.85rem 1rem', background: 'var(--color-surface-bg)', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-border-subtle)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-primary)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <span>Auction Showroom</span>
            </Link>

            <Link to="/wallet" style={{ color: 'var(--color-text-rich)', textDecoration: 'none', padding: '0.85rem 1rem', background: 'var(--color-surface-bg)', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-border-subtle)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-primary)' }}>
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <span>Top-Up Wallet</span>
            </Link>

            <Link to="/kyc" style={{ color: 'var(--color-text-rich)', textDecoration: 'none', padding: '0.85rem 1rem', background: 'var(--color-surface-bg)', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-border-subtle)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-primary)' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>KYC Portal</span>
            </Link>

            <Link to="/legal/terms" style={{ color: 'var(--color-text-rich)', textDecoration: 'none', padding: '0.85rem 1rem', background: 'var(--color-surface-bg)', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-border-subtle)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-primary)' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Terms of Service</span>
            </Link>

            <Link to="/legal/privacy" style={{ color: 'var(--color-text-rich)', textDecoration: 'none', padding: '0.85rem 1rem', background: 'var(--color-surface-bg)', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-border-subtle)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-primary)' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Privacy Charter</span>
            </Link>

            <Link to="/legal/it-act" style={{ color: 'var(--color-text-rich)', textDecoration: 'none', padding: '0.85rem 1rem', background: 'var(--color-surface-bg)', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-border-subtle)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-primary)' }}>
                <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
                <path d="M9 22V12h6v10" />
                <path d="M2 9h20L12 2z" />
              </svg>
              <span>Bidding Escrow Ethics</span>
            </Link>
            
          </div>
        </div>

        {/* Suggest Category Form */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '2.25rem 2rem', boxShadow: '0 8px 30px rgba(0,35,102,0.02)' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
            <span>Suggest a Niche Marketplace</span>
          </h3>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            Tell us what specialty auctions you would like to list or bid on. Our engineering team reviews all requests.
          </p>

          <form onSubmit={handleSuggestionSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              required
              placeholder="e.g. Rare Comic Books, Vintage Audio Amplifiers..."
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '0.75rem 1rem',
                border: '1.5px solid var(--color-border-subtle)',
                borderRadius: '10px',
                fontSize: '0.88rem',
                outline: 'none',
                color: 'var(--color-brand-primary)',
                fontWeight: 600
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'var(--color-brand-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </form>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '1rem', color: '#047857', fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Thank you! Category suggestion submitted.</span>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
