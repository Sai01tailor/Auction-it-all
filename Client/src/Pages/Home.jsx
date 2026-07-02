import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Global/Header';
import CategoryGrid from '../Components/Home/CategoryGrid';
import TrustBar from '../Components/Home/TrustBar';
import Carousel from '../Components/Product/Carousel';
import ProductGrid from '../Components/Product/Product_grid';
import { getEndingSoon } from '../services/auctionService';
import { Zap, Tag, ShieldCheck, Lock, Scale, Clock } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   P01: Home Page — /
   
   Sections (top → bottom):
     1. Header (sticky)
     2. Hero — high-energy brand statement
     3. Platform Stats bar
     4. Ending Soon carousel (wired to auctionService.getEndingSoon)
     5. Category Grid
     6. Featured / Browse All grid (wired to GET /api/items)
     7. TrustBar
───────────────────────────────────────────────────────────── */

/* ── Live platform stats ── */
const STATS = [
  { value: '12,400+', label: 'Active Auctions' },
  { value: '3.2L+', label: 'Registered Bidders' },
  { value: '₹48Cr+', label: 'Total Value Traded' },
  { value: '99.1%', label: 'Escrow Success Rate' },
];

function PlatformStats() {
  return (
    <div
      className='hidden md:flex'
      style={{
        background: 'var(--color-brand-primary-dark)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '0',
        flexWrap: 'wrap',
      }}>
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '0.5rem 2rem',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}
          >
            <span style={{
              fontSize: '1.1rem', fontWeight: 800,
              color: 'var(--color-brand-accent)',
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {stat.value}
            </span>
            <span style={{
              fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
              marginTop: '1px',
            }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Hero Section ── */
function Hero() {
  const [cursor, setCursor] = useState({ x: -9999, y: -9999 });

  return (
    <section
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setCursor({ x: -9999, y: -9999 })}
      style={{
        background: 'linear-gradient(160deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 100%)',
        padding: 'clamp(3rem, 6vw, 5rem) 1.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Background grid — slightly visible lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Cursor-reactive glow overlay — lights up grid near mouse */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle 320px at ${cursor.x}px ${cursor.y}px, rgba(254,206,68,0.13) 0%, rgba(26,60,122,0.08) 50%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 1,
        transition: 'background 0.05s ease',
      }} />

      {/* Grid line glow — intensifies near cursor */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(254,206,68,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(254,206,68,0.22) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: `radial-gradient(circle 220px at ${cursor.x}px ${cursor.y}px, black 0%, transparent 100%)`,
        WebkitMaskImage: `radial-gradient(circle 220px at ${cursor.x}px ${cursor.y}px, black 0%, transparent 100%)`,
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* Live badge */}
      {/* <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(16,185,129,0.12)',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '20px',
        padding: '0.3rem 0.9rem',
        marginBottom: '1.5rem',
      }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
          animation: 'bid-pulse 1.2s ease-out infinite', display: 'inline-block',
        }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399' }}>
          Marketplace is live
        </span>
      </div> */}

      {/* Headline */}
      <h1 style={{
        margin: '0 0 1rem',
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 900,
        color: '#fff',
        letterSpacing: '-0.04em',
        lineHeight: 1.1,
        maxWidth: '720px',
      }}>
        India's Live<br />
        <span style={{ color: 'var(--color-brand-accent)' }}>Auction Marketplace</span>
      </h1>

      <p style={{
        margin: '0 0 2rem',
        fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
        color: 'rgba(255,255,255,0.65)',
        lineHeight: 1.7,
        maxWidth: '480px',
      }}>
        Bid on rare finds, sell at your price — escrow-protected, KYC-verified, and fully transparent.
      </p>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/auctions" id="hero-cta-bid">
          <button style={{
            padding: '0.85rem 2rem',
            background: 'var(--color-brand-accent)',
            color: 'var(--color-brand-primary-dark)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem', fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(254,206,68,0.4)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* <Zap size={18} />  */}
            Start Bidding
          </button>
        </Link>
        <Link to="/sign-up" id="hero-cta-sell">
          <button style={{
            padding: '0.85rem 2rem',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <Tag size={18} /> List Your Item
          </button>
        </Link>
      </div>

      {/* Quick trust icons */}
      <div style={{
        display: 'flex', gap: '1.5rem', marginTop: '2.5rem',
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          { text: 'KYC Verified', icon: <ShieldCheck size={16} style={{ color: '#10b981' }} /> },
          { text: 'Escrow Protected', icon: <Lock size={16} style={{ color: 'var(--color-brand-accent)' }} /> },
          { text: 'IT Act Compliant', icon: <Scale size={16} style={{ color: '#60a5fa' }} /> }
        ].map(item => (
          <span key={item.text} style={{
            fontSize: '0.78rem', fontWeight: 600,
            color: 'rgba(255,255,255,0.55)',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            {item.icon} {item.text}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ── Ending Soon Carousel (with auctionService) ── */
function EndingSoonSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEndingSoon(12)
      .then(data => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ padding: '3rem 0', background: 'var(--color-surface-bg)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <Carousel
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={20} style={{ color: 'var(--color-brand-primary-light)' }} /> Ending Soon
            </span>
          }
          items={loading ? undefined : items}
          endpoint={loading ? '/items' : undefined}
          params={{ status: 'ACTIVE', limit: 12 }}
        />
      </div>
    </section>
  );
}

/* ── Section header helper ── */
function SectionHeader({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
        {eyebrow}
      </p>
      <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-brand-primary)', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
    </div>
  );
}

/* ── Main Page ── */
export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <PlatformStats />
      <Hero />

      {/* Ending Soon carousel — wired to auctionService.getEndingSoon */}
      <EndingSoonSection />

      {/* Category tiles */}
      <CategoryGrid />

      {/* Browse All active auctions */}
      <section style={{ padding: '3rem 0', background: '#fff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <SectionHeader eyebrow="All Active Auctions" title="Browse & Bid" />
            <Link to="/auctions" style={{
              fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--color-brand-primary)',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
              View all →
            </Link>
          </div>
          {/* Wired to GET /api/items?status=ACTIVE */}
          <ProductGrid
            endpoint="/items"
            params={{ status: 'ACTIVE' }}
            cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          />
        </div>
      </section>

      {/* Trust bar */}
      <TrustBar />
    </div>
  );
}
