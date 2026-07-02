import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../Global/Header';

export default function BlindReveal({ item, userBid, blindBidsList = [] }) {
  const navigate = useNavigate();
  const [sealBroken, setSealBroken] = useState(false);

  // Auto break seal after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSealBroken(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const anonymize = (user) => {
    if (!user) return '—';
    if (user === 'You') return 'You';
    const str = String(user);
    if (str.length <= 2) return str + '***';
    return str[0] + '***' + str[str.length - 1];
  };

  const sortedBids = [...blindBidsList].sort((a, b) => b.amount - a.amount);
  const winner = sortedBids[0];
  const isWinner = winner && (winner.bidder === 'You' || winner.bidder === 'You (You)');
  const refundAmount = Math.floor(userBid * 0.1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-brand-primary-dark)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Header />

      {/* Confetti styling animation for winners */}
      {sealBroken && isWinner && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(254,206,68,0.1) 0%, transparent 70%)', zIndex: 1 }} />
      )}

      {/* ── BREAKING SEAL OVERLAY ── */}
      <AnimatePresence>
        {!sealBroken && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'fixed', top: '80px', left: 0, right: 0, bottom: 0,
              background: '#00153d',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              zIndex: 999, padding: '1.5rem',
            }}
          >
            {/* Split wax seal stamp animation */}
            <div style={{ position: 'relative', width: '220px', height: '220px' }}>
              
              {/* Left Seal Half */}
              <motion.div
                animate={{ rotate: [0, -2, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="#dc2626" stroke="#991b1b" strokeWidth="4" />
                  <circle cx="100" cy="100" r="70" fill="#ef4444" />
                  {/* Wax Seal Text */}
                  <text x="100" y="80" fill="#fff" fontSize="12" fontWeight="800" textAnchor="middle" letterSpacing="0.1em">SECURE VAULT</text>
                  <path d="M60 100 L140 100" stroke="#fff" strokeWidth="3" />
                  <text x="100" y="130" fill="#fece44" fontSize="14" fontWeight="900" textAnchor="middle" letterSpacing="0.05em">UNSEALING...</text>
                </svg>
              </motion.div>
            </div>
            
            <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 900, marginTop: '2rem', textAlign: 'center' }}>
              Decrypting Sealed Bid Envelopes
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'center' }}>
              Decrypting and sorting submissions from local secure storage...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN REVEAL SCREEN ── */}
      {sealBroken && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 2 }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <button
              onClick={() => navigate('/auctions')}
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              ← Back to Marketplace
            </button>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{item.title}</h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>🔓 DECRYPTED REPORT RELEASED</p>
            </div>
          </div>

          {/* Winner Spotlight Banner */}
          <div style={{
            background: isWinner
              ? 'linear-gradient(135deg, rgba(254,206,68,0.15) 0%, rgba(16,185,129,0.15) 100%)'
              : 'rgba(255,255,255,0.03)',
            border: isWinner
              ? '2px solid #fece44'
              : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.5rem' }}>
              {isWinner ? '👑' : '🏆'}
            </span>
            
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: isWinner ? '#fece44' : '#fff', margin: '0 0 0.5rem' }}>
              {isWinner ? 'You Won the Auction!' : 'Auction Winner Spotlight'}
            </h1>
            
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem', margin: '0 0 1.5rem' }}>
              {isWinner
                ? 'Your private bid was the highest recorded submission. Handoff room is now open!'
                : `The sealed envelope for this item has been unmasked. The winning bid was recorded by bidder ${anonymize(winner?.bidder)}.`}
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2rem',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem 2.5rem',
              borderRadius: '20px',
            }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Winner ID</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: isWinner ? '#fece44' : '#fff' }}>
                  {anonymize(winner?.bidder)}
                </h3>
              </div>
              <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Winning Bid Value</span>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>
                  ₹{winner?.amount?.toLocaleString('en-IN')}
                </h3>
              </div>
            </div>

            {/* Loser Refund Badge or Winner CTA */}
            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'center' }}>
              {isWinner ? (
                <button
                  onClick={() => navigate('/auctions')}
                  style={{
                    background: '#fece44', color: 'var(--color-brand-primary-dark)',
                    padding: '0.75rem 2.5rem', borderRadius: '12px', border: 'none',
                    fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem'
                  }}
                >
                  Proceed to Handoff Room (P21)
                </button>
              ) : userBid > 0 ? (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1.5px solid rgba(239,68,68,0.25)',
                  color: '#fca5a5',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🛡️ <strong>Refund Triggered:</strong> Refund of ₹{refundAmount.toLocaleString()} (10% deposit) initiated to your bank wallet.
                </div>
              ) : null}
            </div>
          </div>

          {/* The Full Spread: Bids Table */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: '#fece44', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📊 Decrypted Submissions Feed (The Full Spread)
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Rank</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Anonymized Bidder ID</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Bid Amount</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Decryption Log</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBids.map((bid, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: bid.bidder === 'You' || bid.bidder === 'You (You)' ? 'rgba(254,206,68,0.04)' : 'transparent',
                        fontWeight: bid.bidder === 'You' || bid.bidder === 'You (You)' ? 700 : 500
                      }}
                    >
                      <td style={{ padding: '1rem', color: idx === 0 ? '#fece44' : '#fff', fontWeight: 800 }}>
                        #{idx + 1}
                      </td>
                      <td style={{ padding: '1rem', color: bid.bidder === 'You' || bid.bidder === 'You (You)' ? '#fece44' : '#fff' }}>
                        {anonymize(bid.bidder)} {bid.bidder === 'You' && ' (You)'}
                      </td>
                      <td style={{ padding: '1rem', color: '#34d399', fontWeight: 700 }}>
                        ₹{bid.amount?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {new Date(bid.timestamp).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {sortedBids.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                        No bids recorded for this item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
