import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveLeaderboard({ currentBid, totalBids, lastBidder, bidHistory = [], viewerCount = 1 }) {
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

  // Compute real unique active bidders from bid history
  const uniqueBidders = new Set(bidHistory.map(b => b.bidder)).size;
  const activeBiddersCount = uniqueBidders > 0 ? uniqueBidders : (totalBids > 0 ? 1 : 0);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fece44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
              <path d="M12 2a5 5 0 0 0-5 5v3h10V7a5 5 0 0 0-5-5z" />
            </svg>
            Leading Bidder
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {/* Tag 1: Bidders who bidded on product till now */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(254, 206, 68, 0.12)',
              border: '1px solid rgba(254, 206, 68, 0.3)',
              padding: '0.2rem 0.55rem', borderRadius: '12px',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fece44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
                <path d="m16 16 6-6" />
                <path d="m8 8 6-6" />
                <path d="m9 7 8 8" />
                <path d="m21 11-8-8" />
              </svg>
              <span style={{ fontSize: '0.68rem', color: '#fece44', fontWeight: 800 }}>
                {activeBiddersCount} {activeBiddersCount === 1 ? 'Bidder' : 'Bidders'}
              </span>
            </div>

            {/* Tag 2: Real-time Live Viewers watching console right now */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.2rem 0.55rem', borderRadius: '12px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'bid-pulse 1s ease-out infinite' }} />
              <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 800 }}>
                {viewerCount || 1} Watching
              </span>
            </div>
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
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  {lastBidder.city || 'India'} · Rating: {lastBidder.rating || '4.5'}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#fece44" stroke="#fece44" strokeWidth="1" style={{ display: 'inline', marginLeft: '1px' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
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
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Activity Feed
        </h4>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '0.6rem',
          maxHeight: '260px',
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
        <h5 style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h18" />
          </svg>
          Minimum Bid Raise Table
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
