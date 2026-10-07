import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';
import CategoryGrid from '../Components/Home/CategoryGrid';
import TrustBar from '../Components/Home/TrustBar';
import Carousel from '../Components/Product/Carousel';
import ProductGrid from '../Components/Product/Product_grid';
import { getEndingSoon } from '../services/auctionService';
import { Zap, Tag, ShieldCheck, Lock, Scale, Clock, Play } from 'lucide-react';

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
    <>
      <div className='text-white bg-red-900 text-center py-2'> Note : the Site is Under Construction and this is just a preview. avoid investing as of now.</div>
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
      </div></>
  );
}

/* ── Hero Auction Images from public directory ── */
const HERO_IMAGES = {
  watch: '/hero/watch.jpg',
  camera: '/hero/camera.jpg',
  fineArt: '/hero/fine-art.jpg',
  gavel: '/hero/gavel.jpg',
  vintageCar: '/hero/vintage-car.jpg',
  jewellery: '/hero/jewellery.jpg',
  collectible: '/hero/collectible.jpg',
};

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
      className="relative overflow-hidden text-white select-none w-full pt-4 sm:pt-6 pb-20 sm:pb-24 lg:pb-28 px-2 sm:px-4 lg:px-6 min-h-[640px] lg:min-h-[720px]"
      style={{
        background: 'linear-gradient(175deg, #001948 0%, var(--color-brand-primary) 50%, #00133a 100%)',
      }}
    >
      {/* Background glow & interactive mouse shine */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 420px at ${cursor.x}px ${cursor.y}px, rgba(254,206,68,0.16) 0%, rgba(26,60,122,0.1) 50%, transparent 80%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* SVG ClipPath Definitions for Folder Tabs */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="tab-left-notch" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.08 C 0,0.03 0.05,0 0.12,0 L 0.5,0 C 0.56,0 0.6,0.02 0.64,0.045 C 0.68,0.07 0.72,0.08 0.78,0.08 L 0.88,0.08 C 0.95,0.08 1,0.11 1,0.16 L 1,0.92 C 1,0.97 0.95,1 0.88,1 L 0.12,1 C 0.05,1 0,0.97 0,0.92 Z" />
          </clipPath>
          <clipPath id="tab-right-notch" clipPathUnits="objectBoundingBox">
            <path d="M 1,0.08 C 1,0.03 0.95,0 0.88,0 L 0.5,0 C 0.44,0 0.4,0.02 0.36,0.045 C 0.32,0.07 0.28,0.08 0.22,0.08 L 0.12,0.08 C 0.05,0.08 0,0.11 0,0.16 L 0,0.92 C 0,0.97 0.05,1 0.12,1 L 0.88,1 C 0.95,1 1,0.97 1,0.92 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Full Width Container: Columns fill full width and headline sits between 1st & 5th cols */}
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* Desktop Layout (md and up): 5-column grid spanning 100% width without clipping */}
        <div className="hidden md:grid md:grid-cols-5 gap-3 lg:gap-4 w-full items-start">

          {/* Column 1 (Far Left): Two stacked cards */}
          <div className="col-span-1 flex flex-col gap-2.5">
            {/* Watch Top Card */}
            <div className="relative h-[255px] lg:h-[270px] rounded-[24px] overflow-hidden bg-[#ea580c] shadow-lg group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={HERO_IMAGES.watch}
                alt="Luxury Watch Auction"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
            </div>
            {/* Camera Bottom Card */}
            <div className="relative h-[125px] lg:h-[270px] rounded-[20px] overflow-hidden bg-[#f59e0b] shadow-lg group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={HERO_IMAGES.camera}
                alt="Vintage Camera Auction"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Center Area (Cols 2, 3, 4): Headline sits directly above cards */}
          <div className="col-span-3 flex flex-col items-center">
            {/* Headline centered between 1st and 5th columns */}
            <div className="text-center px-2 mb-2 w-full">
              <h1 className="text-white font-black tracking-tight leading-[1.05] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl max-w-xl mx-auto">
                India's Live <br />
                <span style={{ color: 'var(--color-brand-accent)' }}>Auction Marketplace</span>
              </h1>
            </div>

            {/* 3 Columns: Col 2, Col 3, Col 4 */}
            <div className="w-full grid grid-cols-3 gap-3 lg:gap-4 items-stretch min-h-[380px] lg:min-h-[410px]">

              {/* Column 2: Tall Sculpture card with tab notch */}
              <div className="h-full min-h-[380px] lg:min-h-[410px]">
                <div
                  className="relative w-full h-full overflow-hidden bg-[#16a34a] shadow-lg group cursor-pointer transition-transform duration-300 hover:scale-[1.02] rounded-b-[24px] rounded-tl-[28px] rounded-tr-[16px]"
                  style={{
                    clipPath: 'url(#tab-left-notch)',
                    WebkitClipPath: 'url(#tab-left-notch)',
                  }}
                >
                  <img
                    src={HERO_IMAGES.fineArt}
                    alt="Fine Art Sculpture Auction"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Column 3: Center Column with Golden Rosette + Gold Gavel Card + 2 Buttons */}
              <div className="flex flex-col items-center justify-between h-full min-h-[380px] lg:min-h-[410px]">
                {/* Decorative Starburst / Floral Mandala Icon */}
                <div className="flex justify-center items-center py-0.5">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[var(--color-brand-accent)] animate-[pulse_3s_ease-in-out_infinite]">
                    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
                    <circle cx="12" cy="4" r="1.3" fill="currentColor" opacity="0.85" />
                    <circle cx="12" cy="20" r="1.3" fill="currentColor" opacity="0.85" />
                    <circle cx="4" cy="12" r="1.3" fill="currentColor" opacity="0.85" />
                    <circle cx="20" cy="12" r="1.3" fill="currentColor" opacity="0.85" />
                    <circle cx="6.34" cy="6.34" r="1.3" fill="currentColor" opacity="0.75" />
                    <circle cx="17.66" cy="17.66" r="1.3" fill="currentColor" opacity="0.75" />
                    <circle cx="6.34" cy="17.66" r="1.3" fill="currentColor" opacity="0.75" />
                    <circle cx="17.66" cy="6.34" r="1.3" fill="currentColor" opacity="0.75" />
                    <path d="M12 6.5V9.5M12 14.5V17.5M6.5 12H9.5M14.5 12H17.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Center Card (Gold Gavel) */}
                <div className="relative w-full h-[220px] lg:h-[240px] rounded-[24px] overflow-hidden bg-[#eab308] shadow-lg group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
                  <img
                    src={HERO_IMAGES.gavel}
                    alt="Prestigious Live Auction"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* 2 Buttons: 1. start bidding (bigger, golden) and 2. list your item (smaller) */}
                <div className="w-full flex flex-col items-center gap-1.5 pt-2">
                  <Link to="/auctions" id="hero-cta-bid" className="w-full flex justify-center">
                    <button
                      className="w-full max-w-[190px] py-2 px-3.5 rounded-full font-black text-xs sm:text-sm tracking-tight transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/25 hover:scale-[1.03] active:scale-[0.98]"
                      style={{
                        background: 'var(--color-brand-accent)',
                        color: 'var(--color-brand-primary-dark)',
                      }}
                    >
                      Start Bidding <span className="font-bold text-sm leading-none">↗</span>
                    </button>
                  </Link>

                  <Link to="/sign-up" id="hero-cta-sell">
                    <button
                      className="py-1 px-3 rounded-full font-semibold text-[11px] sm:text-xs tracking-normal text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200 flex items-center gap-1 cursor-pointer hover:border-white/40"
                    >
                      <Tag size={11} className="text-[var(--color-brand-accent)]" /> List Your Item
                    </button>
                  </Link>
                </div>
              </div>

              {/* Column 4: Tall Vintage Sports Car card with tab notch */}
              <div className="h-full min-h-[380px] lg:min-h-[410px]">
                <div
                  className="relative w-full h-full overflow-hidden bg-[#0284c7] shadow-lg group cursor-pointer transition-transform duration-300 hover:scale-[1.02] rounded-b-[24px] rounded-tr-[28px] rounded-tl-[16px]"
                  style={{
                    clipPath: 'url(#tab-right-notch)',
                    WebkitClipPath: 'url(#tab-right-notch)',
                  }}
                >
                  <img
                    src={HERO_IMAGES.vintageCar}
                    alt="Vintage Sports Car Auction"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

          {/* Column 5 (Far Right): Two stacked cards */}
          <div className="col-span-1 flex flex-col gap-2.5">
            {/* Jewellery Top Card */}
            <div className="relative h-[255px] lg:h-[270px] rounded-[24px] overflow-hidden bg-[#34d399] shadow-lg group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={HERO_IMAGES.jewellery}
                alt="High Jewellery Auction"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
            {/* Collectible Bottom Card */}
            <div className="relative h-[125px] lg:h-[270px] rounded-[20px] overflow-hidden bg-[#065f46] shadow-lg group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={HERO_IMAGES.collectible}
                alt="Rare Antique Collectible Auction"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Mobile Layout (< md): Centered directly on Column index 2 with index 1 & index 3 peeking on edges, scroll disabled */}
        <div className="block md:hidden w-full overflow-hidden">
          <div className="text-center px-3 mb-2.5">
            <h1 className="text-white font-black tracking-tight leading-[1.08] text-2xl sm:text-3xl max-w-xs mx-auto">
              India's Live <br />
              <span style={{ color: 'var(--color-brand-accent)' }}>Auction Marketplace</span>
            </h1>
          </div>

          {/* Centered static showcase: locked onto col idx 2 (0th indexed) via left-50% / translateX(-50%) */}
          <div className="relative w-full overflow-hidden py-1 touch-none">
            <div
              className="relative flex items-start gap-3 select-none pointer-events-auto"
              style={{
                width: 'max-content',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              {/* Col idx 1 (Fine Art - peeking from left) */}
              <div className="w-[140px] shrink-0 h-[380px]">
                <div
                  className="relative w-full h-full overflow-hidden bg-[#16a34a] shadow-md rounded-b-[24px] rounded-tl-[28px] rounded-tr-[16px]"
                  style={{ clipPath: 'url(#tab-left-notch)', WebkitClipPath: 'url(#tab-left-notch)' }}
                >
                  <img src={HERO_IMAGES.fineArt} alt="Fine Art" className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Col idx 2 (Dead Center - Gavel Card + Buttons) */}
              <div className="flex flex-col items-center justify-between w-[215px] shrink-0 h-[385px]">
                {/* Starburst icon */}
                <div className="py-0.5 text-[var(--color-brand-accent)] text-lg">✦</div>
                {/* Gavel Card */}
                <div className="relative w-full h-[255px] rounded-[26px] overflow-hidden bg-[#eab308] shadow-xl">
                  <img src={HERO_IMAGES.gavel} alt="Gavel" className="w-full h-full object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Buttons */}
                <div className="w-full flex flex-col items-center gap-1.5 pt-2">
                  <Link to="/auctions" className="w-full flex justify-center">
                    <button
                      className="w-full py-2.5 px-4 rounded-full font-black text-xs sm:text-sm shadow-md cursor-pointer"
                      style={{ background: 'var(--color-brand-accent)', color: 'var(--color-brand-primary-dark)' }}
                    >
                      Start Bidding ↗
                    </button>
                  </Link>
                  <Link to="/sign-up">
                    <button className="py-1 px-3.5 rounded-full font-semibold text-[11px] text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer">
                      <Tag size={11} className="inline mr-1 text-[var(--color-brand-accent)]" /> List Your Item
                    </button>
                  </Link>
                </div>
              </div>

              {/* Col idx 3 (Vintage Car - peeking from right) */}
              <div className="w-[140px] shrink-0 h-[380px]">
                <div
                  className="relative w-full h-full overflow-hidden bg-[#0284c7] shadow-md rounded-b-[24px] rounded-tr-[28px] rounded-tl-[16px]"
                  style={{ clipPath: 'url(#tab-right-notch)', WebkitClipPath: 'url(#tab-right-notch)' }}
                >
                  <img src={HERO_IMAGES.vintageCar} alt="Car" className="w-full h-full object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Quick trust assurances row */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8 pt-2 flex-wrap">
          {[
            { text: 'KYC Verified Bidders', icon: <ShieldCheck size={16} className="text-[#10b981]" /> },
            { text: 'Escrow Protected Payments', icon: <Lock size={16} className="text-[var(--color-brand-accent)]" /> },
            { text: 'IT Act Compliant & Transparent', icon: <Scale size={16} className="text-[#60a5fa]" /> }
          ].map(item => (
            <span
              key={item.text}
              className="text-xs sm:text-sm font-medium text-white/60 flex items-center gap-2 tracking-wide"
            >
              {item.icon} {item.text}
            </span>
          ))}
        </div>
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
      <SEO
        title="BidKar.in | Live Online Auctions & Verified Marketplace"
        description="BidKar.in is India's premier online auction platform. Bid live on verified electronics, luxury items, domain names, and art with escrow security."
      />
      <Header />
      {/* Platform stats bar (commented out as requested) */}
      {/* <PlatformStats /> */}
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
