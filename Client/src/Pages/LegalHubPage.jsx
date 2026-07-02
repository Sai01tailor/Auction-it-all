import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../Components/Global/Header';

export default function LegalHubPage() {
  const { section = 'terms' } = useParams();
  const navigate = useNavigate();

  // Tax Calculator states
  const [hammerPrice, setHammerPrice] = useState(600000); // Default ₹6,00,000 (above ₹5L threshold)
  const [hasPan, setHasPan] = useState(true);

  // Math calculations based on corrections:
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <Header />

      {/* Banner - Full Bleed Hero */}
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
            Legal Framework & Compliance
          </span>
          <h1 style={{ color: 'var(--color-brand-accent)', margin: 0, fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Legal & Compliance Hub
          </h1>
          <p style={{ margin: '0.6rem 0 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            Review our legally binding offline handoff policies, zero-storage privacy architectures, Indian E-Commerce TDS parameters, and grievance mediation systems.
          </p>
        </div>
      </section>

      {/* Main Grid Container - Overlapping with absolute z-index stacking */}
      <div style={{ maxWidth: '1100px', margin: '-3.5rem auto 4.5rem', padding: '0 1.5rem', position: 'relative', zIndex: 20 }}>

        {/* Main Split Grid */}
        <div className="legal-hub-grid">

          {/* Sticky Sidebar Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', height: 'fit-content', position: 'sticky', top: '90px', zIndex: 10 }}>
            {tabs.map(tab => {
              const isActive = section === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/legal/${tab.id}`)}
                  style={{
                    textAlign: 'left',
                    padding: '1.25rem',
                    border: '1.5px solid',
                    borderColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                    background: isActive ? 'var(--color-brand-primary)' : '#fff',
                    color: isActive ? '#fff' : 'var(--color-text-rich)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 8px 20px rgba(0,35,102,0.08)' : '0 2px 8px rgba(0,35,102,0.01)',
                    transition: 'all 0.2s',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: isActive ? '#fff' : 'var(--color-brand-primary)' }}>
                      {tab.icon}
                    </span>
                    <span>{tab.name}</span>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    opacity: isActive ? 0.8 : 0.6,
                    paddingLeft: '1.65rem'
                  }}>
                    {tab.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Side Content Panel */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: '0 8px 30px rgba(0,35,102,0.02)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>

            {section === 'terms' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Terms & Conditions of Escrow</span>
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-text-muted)' }}>
                  <p>
                    Welcome to <strong>BidKar.in</strong>. By participating in any auction listings, you agree to comply with our offline handoff escrow terms.
                  </p>

                  <div style={{ background: 'var(--color-surface-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border-subtle)' }}>
                    <strong style={{ color: 'var(--color-brand-primary)', fontSize: '0.95rem', display: 'block', marginBottom: '0.4rem' }}>1. The 10% Escrow Hold Rule</strong>
                    <span style={{ fontSize: '0.85rem' }}>
                      To secure an auction, the highest bidder is required to place a 10% cash deposit, which is frozen in the platform's escrow wallet upon auction end. This deposit serves as a guarantee of execution for both parties.
                    </span>
                  </div>

                  <div style={{ background: 'var(--color-surface-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border-subtle)' }}>
                    <strong style={{ color: 'var(--color-brand-primary)', fontSize: '0.95rem', display: 'block', marginBottom: '0.4rem' }}>2. The 90% Offline Balance Payment</strong>
                    <span style={{ fontSize: '0.85rem' }}>
                      The remaining 90% balance must be settled directly between the buyer and the seller during physical inspections at the agreed meeting coordinates. The platform does not collect or process the 90% offline balance.
                    </span>
                  </div>

                  <div style={{ background: 'var(--color-surface-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border-subtle)' }}>
                    <strong style={{ color: 'var(--color-brand-primary)', fontSize: '0.95rem', display: 'block', marginBottom: '0.4rem' }}>3. Direct Inspection</strong>
                    <span style={{ fontSize: '0.85rem' }}>
                      Buyers must inspect the condition of the asset thoroughly before confirming receipt. The platform releases liability once the "Confirm Item Received" action is executed in the Handoff Room.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {section === 'privacy' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Zero-Storage Privacy Policy</span>
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-text-muted)' }}>
                  <p>
                    We prioritize user data integrity. Our identity verification pipeline uses automated 3rd-party government links (SurePass/Digio) to secure your credentials.
                  </p>

                  <div style={{ background: 'var(--color-surface-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border-subtle)' }}>
                    <strong style={{ color: 'var(--color-brand-primary)', fontSize: '0.95rem', display: 'block', marginBottom: '0.4rem' }}>1. Document Storage Guard</strong>
                    <span style={{ fontSize: '0.85rem' }}>
                      To prevent identity theft, the platform operates a strict **Zero-Storage Policy** for raw Aadhaar and PAN documents. We store only the verified verification transaction ID hash, full name, and birth year.
                    </span>
                  </div>

                  <div style={{ background: 'var(--color-surface-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border-subtle)' }}>
                    <strong style={{ color: 'var(--color-brand-primary)', fontSize: '0.95rem', display: 'block', marginBottom: '0.4rem' }}>2. Contact Information Controls</strong>
                    <span style={{ fontSize: '0.85rem' }}>
                      To prevent shill harassment and contact spam, phone numbers and emails are masked in our handoff databases and are only revealed if the 10% security deposit has been successfully captured from the buyer's wallet.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {section === 'tax-info' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                    <line x1="9" y1="22" x2="15" y2="22" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="16" y1="14" x2="16" y2="18" />
                  </svg>
                  <span>Interactive Tax & Compliance Calculator</span>
                </h2>
                <p style={{ margin: '0 0 2rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Calculate TDS (Section 194-O & 206AA) and GST platform commission liabilities dynamically.
                </p>

                {/* Calculator Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                  {/* Hammer Price Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-rich)', marginBottom: '0.5rem' }}>
                      Hammer Price (₹)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--color-text-muted)' }}>₹</span>
                      <input
                        type="number"
                        value={hammerPrice}
                        onChange={e => setHammerPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2rem',
                          border: '1.5px solid var(--color-border-subtle)',
                          borderRadius: '10px',
                          fontSize: '1rem',
                          fontWeight: 700,
                          outline: 'none',
                          color: 'var(--color-brand-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* PAN Verification toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-surface-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                    <input
                      type="checkbox"
                      id="pan-toggle"
                      checked={hasPan}
                      onChange={e => setHasPan(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-brand-primary)' }}
                    />
                    <label htmlFor="pan-toggle" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: 'var(--color-text-rich)' }}>
                      Seller has verified **PAN Card** linked to KYC (Section 206AA)
                    </label>
                  </div>

                  {/* Calculation Summary Table */}
                  <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                    <div style={{ background: 'var(--color-surface-bg)', padding: '1rem', fontWeight: 800, fontSize: '0.88rem', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-brand-primary)' }}>
                      Platform Compliance Breakdown
                    </div>

                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Hammer Price:</span>
                        <strong style={{ color: 'var(--color-text-rich)' }}>₹{hammerPrice.toLocaleString('en-IN')}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          Section 194-O TDS {isTdsApplicable ? `(${hasPan ? '1%' : '5%'})` : '(0%)'}:
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            Threshold: ₹5 Lakhs. {hasPan ? '' : '⚠️ Non-PAN Penalty 5% (Sec 206AA) applies.'}
                          </p>
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

                      <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <span style={{ fontWeight: 800 }}>Seller Receives (Net):</span>
                        <strong style={{ color: '#10b981', fontWeight: 900 }}>
                          ₹{(hammerPrice - platformFee - calculatedTds).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* TDS Info Banner */}
                  <div style={{
                    background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem', fontSize: '0.75rem', color: '#1e40af', lineHeight: 1.4,
                    display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>
                      <strong>TDS Rule Check:</strong> 1% TDS on E-commerce participants is legally applicable *only* when total transactions on a marketplace exceed <strong>₹5,00,000 (5 Lakhs)</strong> in a financial year. If no PAN card is verified, the rate jumps to <strong>5%</strong> as a non-compliance penalty.
                    </span>
                  </div>

                </div>
              </div>
            )}

            {section === 'it-act' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                    <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
                    <path d="M9 22V12h6v10" />
                    <path d="M2 9h20L12 2z" />
                  </svg>
                  <span>Grievance Escalation Corridor</span>
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-text-muted)' }}>
                  <p>
                    As mandated under Indian E-commerce guidelines, BidKar has appointed a dedicated Grievance Officer to adjudicate escalations and mediation disputes.
                  </p>

                  <div style={{
                    background: 'var(--color-surface-bg)', padding: '1.5rem', borderRadius: '16px',
                    border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column',
                    gap: '0.6rem', color: 'var(--color-text-rich)'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Officer Name:</strong>  Mr. Sai Tailor</p>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Designation:</strong> Grievance Redressal Lead</p>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Address:</strong>  Surat, Gujarat</p>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Escalation Email:</strong> support@bidkar.in</p>
                  </div>

                  <p>
                    If you have filed a case in the Dispute Center and are unsatisfied with the Admin mediation result, you may formally request a review by Team within 7 working days.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
