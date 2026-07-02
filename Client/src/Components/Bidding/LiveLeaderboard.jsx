import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveLeaderboard({ currentBid, totalBids, lastBidder, bidHistory = [] }) {
  // Determine minimum increment bracket based on current bid
  const getMinIncrement = (price) => {
    if (price < 10000) return 250;
    if (price < 50000) return 500;
    return 1000;
  };

  const currentMinIncrement = getMinIncrement(currentBid);

  // Helper to anonymize username (e.g. rahul_m -> r***l_m)
  const anonymize = (user) => {
    if (!user) return '—';
    if (user === 'You') return 'You';
    const str = String(user);
    if (str.length <= 2) return str + '***';
    return str[0] + '***' + str[str.length - 1];
  };

  return (
    <div style={{
      background: 'var(--color-brand-primary-dark)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#fff',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      height: '100%',
      minHeight: '450px',
      boxShadow: '0 12px 36px rgba(0, 15, 61, 0.4)',
    }}>
      {/* High-Bid Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)' }}>
            🏆 Leading Bidder
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'bid-pulse 1s ease-out infinite' }} />
            <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>
              {totalBids + 5} Active Bidders
            </span>
          </div>
        </div>

        {lastBidder ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: lastBidder.username === 'You' ? '#fece44' : '#fff' }}>
                  {anonymize(lastBidder.username)}
                  {lastBidder.username === 'You' && ' (You)'}
                </h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                  📍 {lastBidder.city || 'India'} · User Rating: {lastBidder.rating || '4.5★'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)' }}>
                  Active Bid
                </p>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>
                  ₹{currentBid?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No bids placed yet</p>
          </div>
        )}
      </div>

      {/* Scrolling Bid Feed */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>
          ⏱️ Activity Feed
        </h4>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '0.5rem',
          maxHeight: '220px',
        }} className="custom-scrollbar">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <AnimatePresence initial={false}>
              {bidHistory.map((bid, i) => (
                <motion.li
                  key={bid.amount + '-' + i}
                  initial={{ opacity: 0, y: -20, backgroundColor: 'rgba(16,185,129,0.2)' }}
                  animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(255,255,255,0.02)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    border: '1px solid rgba(255,255,255,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                      {bid.timestamp}
                    </span>
                    <span style={{ fontWeight: 600, color: bid.bidder === 'You' ? '#fece44' : '#fff' }}>
                      {anonymize(bid.bidder)}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>
                    ₹{bid.amount?.toLocaleString('en-IN')}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
            {bidHistory.length === 0 && (
              <li style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                Waiting for auction start...
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Increment Bracket Table */}
      <div style={{
        background: 'rgba(0,0,0,0.15)',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <h5 style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ⚖️ Minimum Bid Raise Table
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>Under ₹10k Bracket:</div>
          <div style={{ fontWeight: 600, color: '#fece44', textAlign: 'right' }}>+ ₹250</div>

          <div style={{ color: 'rgba(255,255,255,0.5)' }}>₹10k to ₹50k Bracket:</div>
          <div style={{ fontWeight: 600, color: '#fece44', textAlign: 'right' }}>+ ₹500</div>

          <div style={{ color: 'rgba(255,255,255,0.5)' }}>Over ₹50k Bracket:</div>
          <div style={{ fontWeight: 600, color: '#fece44', textAlign: 'right' }}>+ ₹1,000</div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.5rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Active Increment Requirement:</span>
          <span style={{ color: '#10b981' }}>+ ₹{currentMinIncrement}</span>
        </div>
      </div>
    </div>
  );
}
