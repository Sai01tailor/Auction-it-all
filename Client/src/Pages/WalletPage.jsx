import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../Context/WalletContext';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';
import AuthController from '../Components/Global/AuthController';
import { toast } from 'react-toastify';

export default function WalletPage() {
  const navigate = useNavigate();
  const { walletBalance, biddingPower, addFunds } = useWallet();

  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [targetBid, setTargetBid] = useState(100000);
  const requiredDeposit = Math.floor(targetBid * 0.10);
  const depositShortfall = Math.max(0, requiredDeposit - walletBalance);

  // SVG ring gauge
  const circumference = 502.65;
  const maxVisualPower = 1000000;
  const fillPct = Math.min(100, (biddingPower / maxVisualPower) * 100);
  const strokeDashoffset = circumference - (fillPct / 100) * circumference;

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    const amount = parseInt(payAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    setIsProcessing(true);
    try {
      const result = await addFunds(amount);
      if (result?.success !== false) {
        toast.success(`₹${amount.toLocaleString('en-IN')} added to wallet!`);
        setShowPayModal(false);
        setPayAmount('');
      } else {
        toast.error(result?.message || 'Top-up failed. Please try again.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerQuickAdd = (amt) => { setPayAmount(String(amt)); setShowPayModal(true); };
  const handleShortcutTopUp = () => { setPayAmount(String(depositShortfall)); setShowPayModal(true); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <SEO
        title="My Digital Wallet & Bidding Power"
        description="Manage your wallet balance, calculate bidding power, top up funds securely with Razorpay, and check escrow reserves on BidKar.in."
      />
      <AuthController />
      <Header />

      {/* ── RAZORPAY CHECKOUT MODAL ── */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 18 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{ background: '#fff', width: '100%', maxWidth: '420px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}
            >
              {/* Modal top bar */}
              <div style={{ background: '#0a2540', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00d4b2', fontWeight: 700 }}>Secure Gateway</p>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Razorpay Checkout</h2>
                </div>
                <button
                  onClick={() => !isProcessing && setShowPayModal(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'inline-flex', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <form onSubmit={handleTopUpSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {isProcessing ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '4px solid rgba(0,35,102,0.08)', borderTopColor: '#0a2540', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
                    <p style={{ margin: 0, fontWeight: 700 }}>Authorizing Escrow Funds…</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Communicating with Razorpay node…</p>
                  </div>
                ) : (
                  <>
                    <div style={{ background: 'var(--color-surface-bg)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Merchant Partner</span>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>BidKar.in Escrow Wallet</p>
                    </div>

                    <div>
                      <label htmlFor="top-up-input" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                        Deposit Amount (INR)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--color-text-muted)' }}>₹</span>
                        <input
                          id="top-up-input" type="text" required value={payAmount} placeholder="0"
                          onChange={e => setPayAmount(e.target.value.replace(/[^0-9]/g, ''))}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem 1rem 0.8rem 2.25rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', outline: 'none', transition: 'border-color 0.15s' }}
                          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
                          onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{ background: '#0a2540', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.9rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'opacity 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                      Pay ₹{(parseInt(payAmount, 10) || 0).toLocaleString()} Now
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO BANNER (same structure as Dashboard / Ledger) ── */}
      <div style={{ background: 'linear-gradient(135deg,var(--color-brand-primary-dark) 0%,var(--color-brand-primary) 55%,#1a3c7a 100%)', padding: '1.5rem 0.65rem 3.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>My Cash Wallet</h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>Escrow deposits &amp; instant bidding power management</p>
          </div>
          <button
            onClick={() => navigate('/ledger')}
            style={{ padding: '0.55rem 1.1rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', transition: 'background 0.15s', backdropFilter: 'blur(8px)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            View Passbook
          </button>
        </div>
      </div>

      {/* ── CONTENT (overlaps banner) ── */}
      <div style={{ maxWidth: '1100px', margin: '-1.75rem auto 4rem', padding: '0 0.65rem', position: 'relative', zIndex: 10 }}>

        {/* STATS STRIP */}
        <div className="wallet-stats-strip">
          {[
            { label: 'Cash Balance', value: `₹${walletBalance.toLocaleString('en-IN')}`, color: 'var(--color-brand-primary)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg> },
            { label: 'Bidding Power', value: `₹${biddingPower.toLocaleString('en-IN')}`, color: '#10b981', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
            { label: '10× Multiplier', value: '10×', color: '#f59e0b', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg> },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '18px', padding: '0.9rem 1.1rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-rich)', fontWeight: 600, opacity: 0.65 }}>{s.label}</p>
                <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN CARD: responsive two-column */}
        <div className="wallet-main-grid">

          {/* ── LEFT: Gauge + Balance + Quick-add ── */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 24px rgba(0,35,102,0.02)' }}>

            {/* SVG ring */}
            <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(0,35,102,0.05)" strokeWidth="14" />
                <motion.circle
                  cx="100" cy="100" r="80" fill="none"
                  stroke="url(#power-grad)"
                  strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.6, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="power-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-brand-primary)" />
                    <stop offset="100%" stopColor="var(--color-brand-accent)" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block' }}>Total Leverage</span>
                <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', letterSpacing: '-0.02em', marginTop: '0.15rem' }}>
                  ₹{biddingPower.toLocaleString('en-IN')}
                </strong>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800, display: 'block', marginTop: '0.15rem' }}>10× Power Active</span>
              </div>
            </div>

            {/* Balance + quick-add */}
            <div style={{ width: '100%', borderTop: '1px solid var(--color-border-subtle)', marginTop: '1.5rem', paddingTop: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-rich)', letterSpacing: '0.05em', fontWeight: 700, opacity: 0.6 }}>Available Cash Balance</span>
              <h2 style={{ margin: '0.2rem 0 1.25rem', fontSize: '2.1rem', fontWeight: 900, color: 'var(--color-brand-primary)', letterSpacing: '-0.02em' }}>
                ₹{walletBalance.toLocaleString('en-IN')}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.55rem', marginBottom: '0.85rem' }}>
                {[1000, 5000, 10000].map(amt => (
                  <button key={amt} onClick={() => triggerQuickAdd(amt)}
                    style={{ padding: '0.6rem 0.25rem', background: 'var(--color-surface-bg)', border: '1px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', color: 'var(--color-text-rich)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-brand-primary)'; e.currentTarget.style.background = 'rgba(0,35,102,0.03)'; e.currentTarget.style.color = 'var(--color-brand-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.background = 'var(--color-surface-bg)'; e.currentTarget.style.color = 'var(--color-text-rich)'; }}
                  >
                    + ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                onClick={() => triggerQuickAdd(25000)}
                style={{ width: '100%', padding: '0.85rem', border: 'none', borderRadius: '14px', background: 'var(--color-brand-primary)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,35,102,0.15)', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand-primary-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-brand-primary)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                Top Up via UPI / Card
              </button>
            </div>
          </div>

          {/* ── RIGHT: Leverage Calculator ── */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 24px rgba(0,35,102,0.02)' }}>

            {/* Heading */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,35,102,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-primary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>10× Bidding Leverage Calculator</h2>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Calculate exactly how much deposit is needed for your target auction bid.
              </p>
            </div>

            {/* Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-rich)' }}>Target Bid</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-rich)' }}>₹</span>
                  <input
                    type="text"
                    value={targetBid.toLocaleString()}
                    onChange={e => setTargetBid(Math.min(2000000, parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0))}
                    style={{ width: '110px', padding: '0.4rem 0.6rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, textAlign: 'right', outline: 'none', transition: 'border-color 0.15s' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                  />
                </div>
              </div>
              <input type="range" min="10000" max="1000000" step="10000" value={targetBid} onChange={e => setTargetBid(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: 'var(--color-brand-primary)', height: '4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                <span>₹10,000</span><span>₹5,00,000</span><span>₹10,00,000</span>
              </div>
            </div>

            {/* Result breakdown */}
            <div style={{ background: 'var(--color-surface-bg)', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', overflow: 'hidden' }}>
              {[
                { label: 'Bidding Power Required', value: `₹${targetBid.toLocaleString()}`, color: 'var(--color-text-rich)' },
                { label: 'Escrow Deposit (10%)', value: `₹${requiredDeposit.toLocaleString()}`, color: 'var(--color-brand-primary)' },
              ].map((row, i) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.8rem 1rem', borderBottom: i === 0 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                  <span style={{ color: 'var(--color-text-rich)', opacity: 0.7 }}>{row.label}</span>
                  <strong style={{ color: row.color }}>{row.value}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-rich)' }}>Wallet Coverage</span>
                {depositShortfall > 0 ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#dc2626' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /></svg>
                    Shortfall ₹{depositShortfall.toLocaleString()}
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Coverage Sufficient
                  </span>
                )}
              </div>
            </div>

            {/* Shortfall CTA */}
            {depositShortfall > 0 && (
              <button
                onClick={handleShortcutTopUp}
                style={{ width: '100%', padding: '0.8rem', border: '1.5px dashed #dc2626', borderRadius: '12px', background: 'rgba(220,38,38,0.03)', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.03)'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                Top Up Shortfall of ₹{depositShortfall.toLocaleString()}
              </button>
            )}

            {/* Disclaimer note */}
            <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start', fontSize: '0.78rem', color: 'var(--color-text-rich)', lineHeight: 1.6, padding: '0.9rem 1rem', background: 'rgba(0,35,102,0.03)', borderRadius: '12px', border: '1px solid rgba(0,35,102,0.08)', marginTop: 'auto', opacity: 0.8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-brand-primary)' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Under India e-commerce guidelines, BidKar escrow accounts hold the 10% deposit until handoff completes. Bidding power is exactly 10× your cash balance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
