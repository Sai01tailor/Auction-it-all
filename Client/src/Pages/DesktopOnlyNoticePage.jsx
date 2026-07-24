import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';

export default function DesktopOnlyNoticePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)', display: 'flex', flexDirection: 'column' }}>
      <AuthController />
      <Header />

      {/* ── FULL-WIDTH GRADIENT HERO BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 55%, #1a3c7a 100%)',
        padding: '3.5rem 1rem 5rem',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '550px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
            marginBottom: '1rem', backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            Desktop &amp; Laptop Feature Only
          </h1>
          <p style={{ margin: '0.45rem 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
            Creation of Auction Listings is supported exclusively on PC and Laptop devices.
          </p>
        </div>
      </div>

      {/* ── FLOATING RESTRICTION CARD ── */}
      <div style={{ maxWidth: '480px', margin: '-2.5rem auto 4rem', padding: '0 0.85rem', position: 'relative', zIndex: 10, width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          background: '#fff',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '24px',
          padding: '2rem 1.5rem',
          boxShadow: '0 12px 40px rgba(0,35,102,0.08)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.35rem',
        }}>

          {/* Explanation Box */}
          <div style={{
            background: 'var(--color-surface-bg)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '16px',
            padding: '1.1rem 1rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}>
            <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              Why is Desktop required for creating listings?
            </h3>
            
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--color-text-rich)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>High-Resolution Media Uploads:</strong> Multi-photo inspection galleries require uncompressed desktop file processing.</li>
              <li><strong>Engine Parameter Setup:</strong> Configuring Dutch price drop intervals, reserve prices, and blind deadline offsets requires precise inputs.</li>
              <li><strong>GPS Meeting Point Verification:</strong> Interactive Google Maps coordinate verification for safe local escrow handoffs.</li>
            </ul>
          </div>

          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            To publish a new listing, please open <strong>BidKar.in</strong> on your Web Browser using a <strong>Desktop PC or Laptop computer</strong>.
          </p>

          {/* Navigation CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.25rem' }}>
            <button
              onClick={() => navigate('/seller/studio')}
              style={{
                width: '100%', padding: '0.85rem', background: 'var(--color-brand-primary)', color: '#fff',
                border: 'none', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,35,102,0.14)', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
              Return to Seller Studio
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                width: '100%', padding: '0.8rem', background: '#fff', color: 'var(--color-text-rich)',
                border: '1.5px solid var(--color-border-subtle)', borderRadius: '12px', fontSize: '0.82rem',
                fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
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
