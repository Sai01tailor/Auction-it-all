import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';
import { toast } from 'react-toastify';

export default function LegalHubPage() {
  const { section = 'terms' } = useParams();
  const navigate = useNavigate();

  // Tax Calculator states
  const [hammerPrice, setHammerPrice] = useState(600000); // Default ₹6,00,000 (above ₹5L threshold)
  const [hasPan, setHasPan] = useState(true);

  // Math calculations:
  // Threshold: ₹5,00,000 (5 Lakhs)
  // Under 194-O: TDS is 1% if price > 5L. If NO PAN (206AA), it becomes 5%.
  const tdsThreshold = 500000;
  const isTdsApplicable = hammerPrice > tdsThreshold;
  const tdsRate = isTdsApplicable ? (hasPan ? 0.01 : 0.05) : 0;
  const calculatedTds = hammerPrice * tdsRate;
  const gstRate = 0.18; // Standard 18% GST on services platform commission fee
  const platformFeeRate = 0.02; // 2% platform fee
  const platformFee = hammerPrice * platformFeeRate;
  const gstOnFee = platformFee * gstRate;

  const tabs = [
    {
      id: 'terms',
      name: 'Terms & Conditions',
      desc: 'Escrow holds & handoffs',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    },
    {
      id: 'privacy',
      name: 'Privacy Policy',
      desc: 'Zero-storage government KYC',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    },
    {
      id: 'tax-info',
      name: 'TDS & GST Calculator',
      desc: 'Section 194-O computations',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="9" y1="22" x2="15" y2="22" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="16" y1="14" x2="16" y2="18" />
          <path d="M16 10h.01" />
          <path d="M12 10h.01" />
          <path d="M8 10h.01" />
          <path d="M12 14h.01" />
          <path d="M8 14h.01" />
          <path d="M12 18h.01" />
          <path d="M8 18h.01" />
        </svg>
      )
    },
    {
      id: 'it-act',
      name: 'IT Act & Grievance',
      desc: 'Arbitration escalations',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
          <path d="M9 22V12h6v10" />
          <path d="M2 9h20L12 2z" />
        </svg>
      )
    }
  ];

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <SEO
        title="Legal & Compliance Hub | BidKar.in"
        description="Review BidKar.in terms of escrow, zero-storage privacy policies, IT Act grievance redressal, and Section 194-O tax compliance."
      />
      <Header />

      {/* SVG ClipPath Definition for Tab Notch (Matching ContactUS.jsx) */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="legal-right-notch" clipPathUnits="objectBoundingBox">
            <path d="M 1,0.08 C 1,0.03 0.95,0 0.88,0 L 0.5,0 C 0.44,0 0.4,0.02 0.36,0.045 C 0.32,0.07 0.28,0.08 0.22,0.08 L 0.12,0.08 C 0.05,0.08 0,0.11 0,0.16 L 0,0.92 C 0,0.97 0.05,1 0.12,1 L 0.88,1 C 0.95,1 1,0.97 1,0.92 Z" />
          </clipPath>
          <clipPath id="legal-left-notch" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.08 C 0,0.03 0.05,0 0.12,0 L 0.5,0 C 0.56,0 0.6,0.02 0.64,0.045 C 0.68,0.07 0.72,0.08 0.78,0.08 L 0.88,0.08 C 0.95,0.08 1,0.11 1,0.16 L 1,0.92 C 1,0.97 0.05,1 0.12,1 L 0.88,1 C 0.95,1 1,0.97 1,0.92 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ── 1. Hero Banner with Notched Golden Gavel Showcase (Identical to ContactUS) ── */}
      <section
        className="relative overflow-hidden text-white w-full pt-8 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-12"
        style={{
          background: 'linear-gradient(175deg, #001948 0%, var(--color-brand-primary) 50%, #00133a 100%)',
        }}
      >
        {/* Subtle dot matrix texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          {/* Left Column: Eyebrow + Large 2-Line Headline + Subtitle */}
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 mb-3">
              <span style={{ color: 'var(--color-brand-accent)' }} className="text-xs font-black tracking-widest uppercase">
                ✦ OFFICIAL LEGAL & COMPLIANCE ✦
              </span>
            </div>

            <h1 className="text-white font-black tracking-tight leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase mb-4">
              LEGAL & <br />
              <span style={{ color: 'var(--color-brand-accent)' }}>COMPLIANCE</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-lg leading-relaxed mb-6">
              Review our legally binding offline handoff policies, zero-storage privacy architectures, Indian E-Commerce TDS parameters, and grievance mediation systems.
            </p>
          </div>

          {/* Right Column: Golden Notched Showcase Folder Card */}
          <div className="hidden md:flex w-full md:w-[380px] lg:w-[420px] flex-shrink-0 justify-center md:justify-end">
            <div
              className="relative w-[280px] sm:w-[320px] md:w-[340px] h-[220px] sm:h-[240px] overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
              style={{
                background: '#f59e0b',
                clipPath: 'url(#legal-right-notch)',
                WebkitClipPath: 'url(#legal-right-notch)',
                borderRadius: '0 0 24px 24px',
              }}
            >
              <img
                src="/hero/gavel.jpg"
                alt="Support & Legal Gavel"
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Main Grid Container - Overlapping with absolute z-index stacking ── */}
      <div style={{ maxWidth: '1100px', margin: '-2.5rem auto 4.5rem', padding: '0 0.65rem', position: 'relative', zIndex: 20 }}>

        {/* Main Split Grid (Using identical responsive classes as ContactUS) */}
        <div className="contact-grid">

          {/* Sidebar Navigation */}
          <div className="contact-sidebar">
            {tabs.map(tab => {
              const isActive = section === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/legal/${tab.id}`)}
                  className="contact-tab-btn"
                  style={{
                    textAlign: 'left',
                    border: '1.5px solid',
                    borderColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                    background: isActive ? 'var(--color-brand-primary)' : '#fff',
                    color: isActive ? '#fff' : 'var(--color-text-rich)',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 8px 20px rgba(0,35,102,0.08)' : '0 2px 8px rgba(0,35,102,0.01)',
                    transition: 'all 0.2s',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: isActive ? '#fff' : 'var(--color-brand-primary)', display: 'inline-flex', flexShrink: 0 }}>
                      {tab.icon}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.name}</span>
                  </div>
                  <span className="hidden sm:block" style={{
                    fontSize: '0.68rem',
                    fontWeight: 500,
                    opacity: isActive ? 0.8 : 0.6,
                    paddingLeft: '1.4rem'
                  }}>
                    {tab.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legal Workspace */}
          <div className="contact-workspace" style={{
            background: '#fff',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 8px 30px rgba(0,35,102,0.02)',
            minHeight: '380px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>

            {/* ── Tab 1: Terms & Conditions ── */}
            {section === 'terms' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>Terms &amp; Conditions of Escrow</span>
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Governing rules for auction participation, frozen 10% deposits, and offline physical handoffs.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--color-text-rich)' }}>
                  <p style={{ margin: 0 }}>
                    Welcome to <strong>BidKar.in</strong>. By participating in any auction listings or bidding rooms, you agree to comply with our offline handoff escrow terms.
                  </p>

                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '14px', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(0,35,102,0.08)', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900 }}>1</span>
                      <strong style={{ color: 'var(--color-brand-primary)', fontSize: '0.92rem' }}>The 10% Escrow Hold Rule</strong>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'block', lineHeight: 1.5 }}>
                      To secure an auction, the winning bidder places a 10% cash deposit frozen in the platform's escrow wallet upon auction end. This deposit guarantees commitment for both buyer and seller.
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '14px', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(0,35,102,0.08)', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900 }}>2</span>
                      <strong style={{ color: 'var(--color-brand-primary)', fontSize: '0.92rem' }}>The 90% Offline Balance Payment</strong>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'block', lineHeight: 1.5 }}>
                      The remaining 90% balance is settled directly between buyer and seller during physical inspection at agreed coordinates. The platform does not take custody of this offline portion.
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '14px', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(0,35,102,0.08)', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900 }}>3</span>
                      <strong style={{ color: 'var(--color-brand-primary)', fontSize: '0.92rem' }}>Physical Inspection &amp; Liability Release</strong>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'block', lineHeight: 1.5 }}>
                      Buyers must inspect the asset thoroughly before confirming receipt. Once the "Confirm Item Received" action is executed in the Handoff Room, the 10% escrow is released and the transaction is closed.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Tab 2: Privacy Policy ── */}
            {section === 'privacy' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Zero-Storage Privacy Policy</span>
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    How we safeguard your identity verification credentials, biometric data, and communication records.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--color-text-rich)' }}>
                  <p style={{ margin: 0 }}>
                    We prioritize user data integrity. Our verification pipeline uses automated government links to verify identity without retaining raw sensitive documents.
                  </p>

                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '14px', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(0,35,102,0.08)', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900 }}>1</span>
                      <strong style={{ color: 'var(--color-brand-primary)', fontSize: '0.92rem' }}>Zero-Storage Document Security</strong>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'block', lineHeight: 1.5 }}>
                      To prevent identity theft, BidKar operates a strict **Zero-Storage Policy** for raw Aadhaar and PAN documents. We store only the verified verification transaction ID hash, full name, and birth year.
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '14px', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(0,35,102,0.08)', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900 }}>2</span>
                      <strong style={{ color: 'var(--color-brand-primary)', fontSize: '0.92rem' }}>Contact Information Masking</strong>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'block', lineHeight: 1.5 }}>
                      To prevent harassment and unsolicited spam, phone numbers and emails are masked in our handoff databases and are only revealed once the 10% security deposit has been captured.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Tab 3: TDS & GST Calculator ── */}
            {section === 'tax-info' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                      <line x1="9" y1="22" x2="15" y2="22" />
                      <line x1="8" y1="6" x2="16" y2="6" />
                      <line x1="16" y1="14" x2="16" y2="18" />
                    </svg>
                    <span>Interactive Tax &amp; Compliance Calculator</span>
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Calculate Section 194-O TDS, Section 206AA Non-PAN penalty, and platform GST liabilities dynamically.
                  </p>
                </div>

                {/* Calculator Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Hammer Price Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-rich)', marginBottom: '0.4rem' }}>
                      Hammer Price (₹)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--color-text-muted)' }}>₹</span>
                      <input
                        type="number"
                        value={hammerPrice}
                        onChange={e => setHammerPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          padding: '0.65rem 1rem 0.65rem 2rem',
                          border: '1.5px solid var(--color-border-subtle)',
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          outline: 'none',
                          color: 'var(--color-brand-primary)',
                          background: '#fff'
                        }}
                      />
                    </div>
                  </div>

                  {/* PAN Verification toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                    <input
                      type="checkbox"
                      id="pan-toggle"
                      checked={hasPan}
                      onChange={e => setHasPan(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-brand-primary)' }}
                    />
                    <label htmlFor="pan-toggle" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', color: 'var(--color-text-rich)' }}>
                      Seller has verified <strong>PAN Card</strong> linked to KYC (Avoid Section 206AA Penalty)
                    </label>
                  </div>

                  {/* Calculation Summary Table */}
                  <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,35,102,0.02)' }}>
                    <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', fontWeight: 800, fontSize: '0.82rem', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-brand-primary)' }}>
                      Platform Compliance Breakdown
                    </div>

                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Hammer Price:</span>
                        <strong style={{ color: 'var(--color-text-rich)' }}>₹{hammerPrice.toLocaleString('en-IN')}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          Section 194-O TDS {isTdsApplicable ? `(${hasPan ? '1%' : '5%'})` : '(0%)'}:
                          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                            Threshold: ₹5 Lakhs. {hasPan ? '' : '⚠️ Non-PAN Penalty 5% (Sec 206AA) applies.'}
                          </span>
                        </span>
                        <strong style={{ color: calculatedTds > 0 ? '#ef4444' : 'var(--color-text-rich)' }}>
                          ₹{calculatedTds.toLocaleString('en-IN')}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Platform Fee (2% Escrow Commission):</span>
                        <strong style={{ color: 'var(--color-text-rich)' }}>₹{platformFee.toLocaleString('en-IN')}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>GST on Platform Fee (18% on ₹{platformFee.toLocaleString()}):</span>
                        <strong style={{ color: 'var(--color-text-rich)' }}>₹{gstOnFee.toLocaleString('en-IN')}</strong>
                      </div>

                      <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-brand-primary)' }}>Seller Receives (Net):</span>
                        <strong style={{ color: '#10b981', fontWeight: 900 }}>
                          ₹{(hammerPrice - platformFee - calculatedTds).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* TDS Info Banner */}
                  <div style={{
                    background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.85rem', fontSize: '0.75rem', color: '#1e40af', lineHeight: 1.4,
                    display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '1px' }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>
                      <strong>TDS Rule:</strong> 1% TDS on E-commerce participants is legally applicable *only* when total transactions on a marketplace exceed <strong>₹5,00,000 (5 Lakhs)</strong> in a financial year. If no PAN card is verified, the rate jumps to <strong>5%</strong>.
                    </span>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ── Tab 4: IT Act & Grievance ── */}
            {section === 'it-act' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                      <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
                      <path d="M9 22V12h6v10" />
                      <path d="M2 9h20L12 2z" />
                    </svg>
                    <span>Grievance Escalation Corridor</span>
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Statutory Grievance Redressal Mechanism under Rule 3(2) of the Information Technology (Intermediary Guidelines) Rules.
                  </p>
                </div>

                <div style={{
                  background: '#fff',
                  border: '1.5px solid var(--color-brand-primary)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 8px 24px rgba(0,35,102,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: 'var(--color-brand-accent)',
                    transform: 'rotate(45deg)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-brand-accent-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OFFICER APPOINTMENT</span>
                      <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>Mr. Sai Tailor</h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Grievance Redressal &amp; Compliance Lead</span>
                    </div>

                    <button
                      onClick={() => handleCopyToClipboard('support@bidkar.in', 'Grievance Email')}
                      style={{
                        background: '#f8fafc',
                        color: 'var(--color-brand-primary)',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: '8px',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                    >
                      Copy Official Email
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    background: '#f8fafc',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '0.78rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase' }}>Jurisdiction</span>
                      <strong style={{ color: 'var(--color-brand-primary)' }}>Surat, Gujarat, India</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase' }}>Direct Email</span>
                      <strong style={{ color: 'var(--color-brand-primary)' }}>support@bidkar.in</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase' }}>Resolution SLA</span>
                      <strong style={{ color: '#059669' }}>Within 15 Working Days</strong>
                    </div>
                  </div>

                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    If you have filed a case in the Dispute Center and are unsatisfied with the mediation result, you may formally request a review by Team within 7 working days.
                  </p>
                </div>
              </motion.div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
