import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../Components/Global/Header';
import { toast } from 'react-toastify';

function FAQItem({ faq, isOpen, onClick }) {
  return (
    <div style={{
      border: '1px solid var(--color-border-subtle)',
      borderRadius: '12px',
      background: '#fff',
      overflow: 'hidden',
      transition: 'all 0.2s',
      boxShadow: isOpen ? '0 4px 15px rgba(0,35,102,0.03)' : 'none',
    }}>
      <button
        onClick={onClick}
        style={{
          width: '100%',
          padding: '1.15rem 1.25rem',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          fontWeight: 700,
          color: 'var(--color-brand-primary)',
          fontSize: '0.88rem',
          gap: '1rem'
        }}
      >
        <span>{faq.q}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            color: 'var(--color-brand-accent-dark)',
            flexShrink: 0
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div style={{
              padding: '0 1.25rem 1.25rem',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: '1rem',
            }}>
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HowItWorksPage() {
  const [role, setRole] = useState('bidder'); // 'bidder' or 'seller'
  const [deposit, setDeposit] = useState(5000);
  const biddingPower = deposit * 10;

  const [activeAuctionType, setActiveAuctionType] = useState('english');
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35);
  const [openFAQIndex, setOpenFAQIndex] = useState(-1);

  const auctionTypes = {
    english: {
      title: 'English Auction (Rising Bids)',
      tagline: 'The classic rising price model with pulsing countdowns.',
      tag: 'Classic Realtime',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="currentColor" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      steps: [
        'Seller sets a starting price and minimum bid increments.',
        'Bidders place bids; each bid extends the clock by 2 minutes if under the threshold (Popcorn Bidding).',
        'When the timer hits zero, the highest bidder wins the auction.',
        'Platform captures the 10% security deposit from the winner\'s wallet.'
      ]
    },
    dutch: {
      title: 'Dutch Auction (Price Drop)',
      tagline: 'A fast-paced descending price game. Who clicks first wins!',
      tag: 'Instant Buyout',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="18" x2="16" y2="12" />
          <line x1="16" y1="12" x2="10" y2="18" />
          <line x1="10" y1="18" x2="2" y2="10" />
          <polyline points="17 18 22 18 22 13" />
        </svg>
      ),
      steps: [
        'Seller sets a high starting price and a price floor.',
        'Price automatically drops by a fixed amount at set intervals (e.g., ₹500 every 12 seconds).',
        'First bidder to click "BUY NOW" wins the item instantly.',
        'Bidder must have at least 10% of the current price as bidding power to click buy.'
      ]
    },
    blind: {
      title: 'Blind Bid Portal (Sealed Envelope)',
      tagline: 'Submit secret, one-time bids. Unmasked after the deadline.',
      tag: 'Sealed Bidding',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      ),
      steps: [
        'Bidders submit a single private bid before the deadline.',
        'Other participants cannot see submitted bid amounts.',
        'Once the deadline expires, the system decrypts and reveals all bids.',
        'The highest bid wins, and losers are refunded their locked deposits instantly.'
      ]
    }
  };

  const faqs = [
    { q: 'What happens to my deposit if I lose?', a: 'Your security deposit is immediately unlocked and returned to your wallet balance. You can withdraw it back to your bank account at any time.' },
    { q: 'What if the seller is a scammer or doesn\'t show up?', a: 'If a handoff fails, either party can raise a claim in the Dispute Center within 48 hours. Our moderators will review chat logs and escrow records to refund or release the deposit.' },
    { q: 'How does the 10x Bidding Power leverage work?', a: 'To bid ₹50,000, you only need ₹5,000 in your wallet. The platform grants you 10x leverage power so you don\'t need to keep large sums of cash on the site.' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <Header />

      {/* ── 1. Modern Hero Section ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 60%, #001f5c 100%)',
        color: '#fff',
        padding: '5rem 1.5rem 6.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background decoration grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-brand-accent)',
            background: 'rgba(254,206,68,0.12)', border: '1px solid rgba(254,206,68,0.25)',
            padding: '0.35rem 0.85rem', borderRadius: '20px', display: 'inline-block',
            marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.08em'
          }}>
            Complete Storefront Walkthrough
          </span>
          <h1 style={{ color: 'var(--color-brand-accent)', margin: 0, fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Mastering the BidKar Marketplace
          </h1>
          <p style={{ margin: '1rem auto 2.25rem', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '640px' }}>
            Whether buying rare assets or selling verified goods, understand how our 10x leverage engine and escrow protection streamline safe deals.
          </p>

          {/* Quick Role Selection CTA Blocks */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setRole('bidder');
                document.getElementById('journey-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                padding: '1rem 1.75rem',
                borderRadius: '16px',
                background: role === 'bidder' ? 'var(--color-brand-accent)' : 'rgba(255,255,255,0.08)',
                color: role === 'bidder' ? 'var(--color-brand-primary-dark)' : '#fff',
                border: role === 'bidder' ? 'none' : '1px solid rgba(255,255,255,0.25)',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.25s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: role === 'bidder' ? '0 8px 24px rgba(254,206,68,0.25)' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="5" /><path d="M3 21v-2a7 7 0 0 1 14 0v2" />
              </svg>
              I want to Buy / Bid
            </button>
            <button
              onClick={() => {
                setRole('seller');
                document.getElementById('journey-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                padding: '1rem 1.75rem',
                borderRadius: '16px',
                background: role === 'seller' ? 'var(--color-brand-accent)' : 'rgba(255,255,255,0.08)',
                color: role === 'seller' ? 'var(--color-brand-primary-dark)' : '#fff',
                border: role === 'seller' ? 'none' : '1px solid rgba(255,255,255,0.25)',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.25s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: role === 'seller' ? '0 8px 24px rgba(254,206,68,0.25)' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              I want to Sell / List
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Interactive Journey Walkthrough (Role-Based Onboarding) ── */}
      <section id="journey-section" style={{
        maxWidth: '1000px',
        margin: '-3.5rem auto 4rem',
        padding: '0 1.5rem',
        position: 'relative',
        zIndex: 20
      }}>
        {/* Sticky Role Selector Header */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '20px',
          padding: '0.5rem',
          display: 'flex',
          boxShadow: '0 10px 30px rgba(0,35,102,0.04)',
          marginBottom: '2.5rem'
        }}>
          <button
            onClick={() => setRole('bidder')}
            style={{
              flex: 1, padding: '1rem', borderRadius: '16px', border: 'none',
              background: role === 'bidder' ? 'var(--color-brand-primary)' : 'transparent',
              color: role === 'bidder' ? '#fff' : 'var(--color-text-muted)',
              fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Bidder's Journey Roadmap
          </button>
          <button
            onClick={() => setRole('seller')}
            style={{
              flex: 1, padding: '1rem', borderRadius: '16px', border: 'none',
              background: role === 'seller' ? 'var(--color-brand-primary)' : 'transparent',
              color: role === 'seller' ? '#fff' : 'var(--color-text-muted)',
              fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Seller's Business Roadmap
          </button>
        </div>

        {/* Dynamic Journey Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {role === 'bidder' ? (
            /* ==================== BIDDER STEPS ==================== */
            <>
              {/* Step 1: Account & Calculator */}
              <div style={{
                background: '#fff', border: '1px solid var(--color-border-subtle)',
                borderRadius: '24px', padding: '2.25rem 2rem',
                boxShadow: '0 8px 30px rgba(0,35,102,0.01)',
                display: 'grid', gridTemplateColumns: '1fr', gap: '2rem'
              }} className="md:grid-cols-[1fr_1.1fr]">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>1</span>
                    <strong style={{ fontSize: '1.2rem', fontWeight: 800 }}>Complete KYC & Unlock 10x Power</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Before joining live rooms, complete a quick Aadhaar/PAN verify to confirm security. Once verified, add funds to your BidKar wallet.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Our site operates a <strong>10x Leverage Policy</strong>: your deposit represents a 10% commitment hold, granting you full bidding power up to 10x that amount.
                  </p>
                </div>

                {/* Leverage Calculator Nest */}
                <div style={{
                  padding: '1.5rem', background: 'var(--color-surface-bg)',
                  border: '1px solid var(--color-border-subtle)', borderRadius: '16px',
                  display: 'flex', flexDirection: 'column', gap: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Wallet Deposit</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-brand-primary)' }}>₹{deposit.toLocaleString('en-IN')}</strong>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={deposit}
                    onChange={e => setDeposit(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-brand-primary)' }}
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {[1000, 5000, 10000, 20000].map(v => (
                      <button key={v} onClick={() => setDeposit(v)} style={{
                        padding: '0.3rem 0.6rem', borderRadius: '6px', border: deposit === v ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                        background: deposit === v ? 'rgba(0,35,102,0.04)' : '#fff', color: deposit === v ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
                        fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer'
                      }}>₹{v.toLocaleString('en-IN')}</button>
                    ))}
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-primary-light) 100%)',
                    padding: '1rem', borderRadius: '10px', color: '#fff', textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600, opacity: 0.8, letterSpacing: '0.04em' }}>10x Bidding Limit Granted</span>
                    <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-brand-accent)' }}>₹{biddingPower.toLocaleString('en-IN')}</h3>
                  </div>
                </div>
              </div>

              {/* Step 2: Auction Types workspace */}
              <div style={{
                background: '#fff', border: '1px solid var(--color-border-subtle)',
                borderRadius: '24px', padding: '2.25rem 2rem',
                boxShadow: '0 8px 30px rgba(0,35,102,0.01)',
                display: 'flex', flexDirection: 'column', gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>2</span>
                  <strong style={{ fontSize: '1.2rem', fontWeight: 800 }}>Explore Dynamic Auction Types</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  BidKar houses three distinct engines. Toggle below to review their mechanical properties.
                </p>

                {/* Inline workspace switcher */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Selector list */}
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {Object.keys(auctionTypes).map(key => {
                      const isActive = activeAuctionType === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveAuctionType(key)}
                          style={{
                            padding: '0.75rem 1.15rem', border: '1px solid',
                            borderColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                            background: isActive ? 'var(--color-brand-primary)' : '#fff',
                            color: isActive ? '#fff' : 'var(--color-text-rich)',
                            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s',
                            fontWeight: 700, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
                          }}
                        >
                          {auctionTypes[key].icon}
                          <span>{key === 'english' ? 'Rising English' : key === 'dutch' ? 'Falling Dutch' : 'Sealed Blind'}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Details Card */}
                  <div style={{
                    padding: '1.25rem', background: 'var(--color-surface-bg)',
                    border: '1px solid var(--color-border-subtle)', borderRadius: '16px',
                    display: 'flex', flexDirection: 'column', gap: '0.75rem'
                  }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--color-brand-primary)' }}>{auctionTypes[activeAuctionType].title}</strong>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{auctionTypes[activeAuctionType].tagline}</p>

                    {/* Visual steps connection timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative', paddingLeft: '0.5rem', marginTop: '0.5rem' }}>
                      <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', background: 'rgba(0,35,102,0.08)' }} />
                      {auctionTypes[activeAuctionType].steps.map((str, sIdx) => (
                        <div key={sIdx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', position: 'relative', zIndex: 5 }}>
                          <span style={{
                            width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                            border: '1.5px solid var(--color-brand-accent-dark)', color: 'var(--color-brand-primary)',
                            fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>{sIdx + 1}</span>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-rich)', lineHeight: 1.4 }}>{str}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Winner Escrow Capture */}
              <div style={{
                background: '#fff', border: '1px solid var(--color-border-subtle)',
                borderRadius: '24px', padding: '2.25rem 2rem',
                boxShadow: '0 8px 30px rgba(0,35,102,0.01)',
                display: 'grid', gridTemplateColumns: '1fr', gap: '2rem'
              }} className="md:grid-cols-[1.1fr_1fr]">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>3</span>
                    <strong style={{ fontSize: '1.2rem', fontWeight: 800 }}>Automatic Escrow Deposit Lock</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    When the countdown timer expires, the winning bid is frozen. The platform automatically places a **10% security hold** on the winner's deposit, moving it into an escrow lock.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    This prevents bidding abandonment. If you win and back out, the deposit is forfeited to the seller. If the seller backs out, their penalties are triggered.
                  </p>
                </div>

                {/* Graphic Representation */}
                <div style={{
                  background: 'var(--color-surface-bg)', border: '1px solid var(--color-border-subtle)',
                  borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', gap: '1rem', alignItems: 'center', textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem 0.85rem', background: '#fff', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>Winner Wallet</div>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 800 }}>➔</span>
                    <div style={{ padding: '0.6rem 1rem', background: 'rgba(16,185,129,0.08)', border: '1.5px solid #10b981', color: '#065f46', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Escrow Lock (10%)
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>The remaining 90% is settled offline during inspection.</span>
                </div>
              </div>

              {/* Step 4: Physical Inspection & Settlement */}
              <div style={{
                background: '#fff', border: '1px solid var(--color-border-subtle)',
                borderRadius: '24px', padding: '2.25rem 2rem',
                boxShadow: '0 8px 30px rgba(0,35,102,0.01)',
                display: 'flex', flexDirection: 'column', gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>4</span>
                  <strong style={{ fontSize: '1.2rem', fontWeight: 800 }}>Physical Handoff & Release</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  Once the auction closes, both parties gain access to a private **Handoff Room** with chat and phone verification. Meet the seller physically to inspect the asset (e.g. vehicle, electronic, art).
                </p>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  After complete satisfaction, pay the remaining 90% balance directly to the seller via cash, bank transfer, or UPI. Once payment is received, both parties click **"Complete Delivery"** to release the 10% escrow hold.
                </p>
              </div>
            </>
          ) : (
            /* ==================== SELLER STEPS ==================== */
            <>
              {/* Step 1: Create listing */}
              <div style={{
                background: '#fff', border: '1px solid var(--color-border-subtle)',
                borderRadius: '24px', padding: '2.25rem 2rem',
                boxShadow: '0 8px 30px rgba(0,35,102,0.01)',
                display: 'flex', flexDirection: 'column', gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>1</span>
                  <strong style={{ fontSize: '1.2rem', fontWeight: 800 }}>Publish Showcase Listings</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  Upload clear photos of your item, write a description, and select the optimal engine format:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--color-surface-bg)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--color-brand-primary)', display: 'block', marginBottom: '0.2rem' }}> Rising English</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Highest bid wins. Ideal for rare, high-demand items.</span>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--color-surface-bg)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--color-brand-primary)', display: 'block', marginBottom: '0.2rem' }}> Falling Dutch</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Price drops automatically. First buyer clicks to claim instantly.</span>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--color-surface-bg)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--color-brand-primary)', display: 'block', marginBottom: '0.2rem' }}> Sealed Blind</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Bidders submit hidden bids. Safely decrypted after deadline.</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Live Room & Escrow Hold */}
              <div style={{
                background: '#fff', border: '1px solid var(--color-border-subtle)',
                borderRadius: '24px', padding: '2.25rem 2rem',
                boxShadow: '0 8px 30px rgba(0,35,102,0.01)',
                display: 'grid', gridTemplateColumns: '1fr', gap: '2rem'
              }} className="md:grid-cols-[1.1fr_1fr]">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>2</span>
                    <strong style={{ fontSize: '1.2rem', fontWeight: 800 }}>Real-time Monitoring & Winner Lock</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Monitor incoming bids from your Seller Studio dashboard. As soon as the auction concludes, our system verifies the winner and locks their **10% security deposit** in escrow.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    This guarantees the buyer is committed. You will never waste time dealing with "ghost" bids or non-paying window shoppers.
                  </p>
                </div>

                {/* Dashboard stats mockup */}
                <div style={{
                  padding: '1.5rem', background: 'var(--color-surface-bg)',
                  borderRadius: '16px', border: '1px solid var(--color-border-subtle)',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem'
                }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Seller Studio Stats</strong>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1, padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', display: 'block' }}>Live Revenue</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-brand-primary)' }}>₹45,200</strong>
                    </div>
                    <div style={{ flex: 1, padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', display: 'block' }}>Locked Escrow</span>
                      <strong style={{ fontSize: '1rem', color: '#10b981' }}>₹4,520</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Handoff Verification */}
              <div style={{
                background: '#fff', border: '1px solid var(--color-border-subtle)',
                borderRadius: '24px', padding: '2.25rem 2rem',
                boxShadow: '0 8px 30px rgba(0,35,102,0.01)',
                display: 'flex', flexDirection: 'column', gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>3</span>
                  <strong style={{ fontSize: '1.2rem', fontWeight: 800 }}>Offline Inspection & Settlement</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  Meet the buyer offline to hand over the asset. Give them time to inspect and verify that the items match your description.
                </p>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  Collect the remaining **90% balance** directly from the buyer. Once the payment clears in your account, confirm the transaction inside the Handoff Room to release the 10% deposit hold.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── 3. Simulated Player & Trust accordions ── */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto 5rem',
        padding: '0 1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2.5rem'
      }} className="md:grid-cols-2">

        {/* Simulated Video Player */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 8px 30px rgba(0,35,102,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(0,35,102,0.04)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-primary)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="2" y1="7" x2="7" y2="7" />
                <line x1="2" y1="17" x2="7" y2="17" />
                <line x1="17" y1="17" x2="22" y2="17" />
                <line x1="17" y1="7" x2="22" y2="7" />
              </svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-brand-primary)', letterSpacing: '-0.01em' }}>
              60s Bidding Video Guide
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Watch a quick demonstration of our English auction console.
          </p>

          <div style={{
            height: '190px', borderRadius: '16px', background: '#0c101d',
            position: 'relative', overflow: 'hidden', display: 'flex',
            flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'
          }}>
            {/* Play/Pause Button */}
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                toast.info(isPlaying ? 'Video Paused (Simulated)' : 'Playing Demonstration Video (Simulated)');
              }}
              style={{
                width: '54px', height: '54px', borderRadius: '50%',
                background: 'var(--color-brand-accent)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(254,206,68,0.3)',
                zIndex: 2, transition: 'all 0.2s'
              }}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-brand-primary)" stroke="var(--color-brand-primary)" strokeWidth="2">
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-brand-primary)" stroke="var(--color-brand-primary)" strokeWidth="2" style={{ transform: 'translateX(2px)' }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            <span style={{ color: '#fff', fontSize: '0.72rem', opacity: 0.7, marginTop: '0.85rem', zIndex: 2, fontWeight: 500 }}>
              {isPlaying ? 'Demonstrating live bidding...' : 'Click to Play'}
            </span>

            {/* Progress Bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ height: '100%', width: `${videoProgress}%`, background: 'var(--color-brand-accent)', transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        {/* Safety FAQ - Accordion Styled */}
        <div style={{
          background: '#fff', border: '1px solid var(--color-border-subtle)',
          borderRadius: '24px', padding: '2rem',
          boxShadow: '0 8px 30px rgba(0,35,102,0.02)',
          display: 'flex', flexDirection: 'column', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(0,35,102,0.04)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-primary)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-brand-primary)', letterSpacing: '-0.01em' }}>
              Trust & Safety FAQs
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            Immediate answers to common security and transaction questions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqs.map((faq, idx) => (
              <FAQItem
                key={idx}
                faq={faq}
                isOpen={openFAQIndex === idx}
                onClick={() => setOpenFAQIndex(openFAQIndex === idx ? -1 : idx)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
