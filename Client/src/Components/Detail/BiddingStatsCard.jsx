import React, { useEffect, useRef, useState } from 'react';
import LiveTimer from '../Global/LiveTimer';
import { useSocket } from '../../hooks/useSocket';

/* ─────────────────────────────────────────────────────────────
   BiddingStatsCard — Real-time bid stats panel for P03 Detail
   
   Props:
     item {Item} — full item object from auctionService.getAuctionById
 ───────────────────────────────────────────────────────────── */

function formatINR(n) {
  if (n == null || n === 0) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);
}

function StatPill({ label, value, highlight, type }) {
  let bg = '#f8fafc';
  let border = '1px solid var(--color-border-subtle)';
  let valueColor = 'var(--color-text-rich)';

  if (highlight) {
    if (type === 'success') {
      bg = 'rgba(16, 185, 129, 0.06)';
      border = '1px solid rgba(16, 185, 129, 0.2)';
      valueColor = '#10b981';
    } else if (type === 'warning') {
      bg = 'rgba(239, 68, 68, 0.06)';
      border = '1px solid rgba(239, 68, 68, 0.2)';
      valueColor = '#ef4444';
    } else {
      bg = 'rgba(0,35,102,0.04)';
      border = '1px solid rgba(0,35,102,0.12)';
      valueColor = 'var(--color-brand-primary)';
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0.875rem 1rem',
      background: bg,
      borderRadius: '12px',
      border: border,
      flex: 1, minWidth: '80px',
    }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
        {label}
      </span>
      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

export default function BiddingStatsCard({ item }) {
  const { currentBid, totalBids, lastBidder, isConnected } = useSocket(
    item?._id,
    item?.currentHighestBid ?? item?.startingPrice ?? 0,
    item?.auctionType ?? 'ENGLISH',
    item,
  );

  const prevBid = useRef(currentBid);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (currentBid !== prevBid.current) {
      prevBid.current = currentBid;
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 900);
      return () => clearTimeout(t);
    }
  }, [currentBid]);

  const isActive = item?.status === 'ACTIVE';
  const isSold = item?.status === 'SOLD';

  const bidderName = typeof lastBidder === 'object' ? lastBidder?.username : lastBidder;
  const effectiveTotalBids = totalBids > 0 ? totalBids : (item?.bidsCount ?? 0);

  // Real-time standing calculation
  let standingValue = '—';
  if (effectiveTotalBids === 0) {
    standingValue = 'No bids';
  } else if (bidderName) {
    const isMe = bidderName === 'You' || bidderName === 'you';
    standingValue = isMe ? 'Leading' : 'Outbid';
  } else {
    standingValue = 'Active';
  }

  return (
    <div
      id="bidding-stats-card"
      style={{
        background: '#fff',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '18px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 4px 24px rgba(0,35,102,0.07)',
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
          Bidding Stats
        </h2>
      </div>

      {/* ── Current Highest Bid ── */}
      <div style={{
        padding: '1.25rem',
        background: 'linear-gradient(135deg, rgba(0,35,102,0.04) 0%, rgba(254,206,68,0.06) 100%)',
        borderRadius: '14px',
        border: pulse ? '2px solid #10b981' : '2px solid transparent',
        transition: 'border-color 0.3s',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
        className={pulse ? 'bid-pulse' : ''}
      >
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
          Current Highest Bid
        </p>
        <div style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 900,
          color: pulse ? '#10b981' : 'var(--color-brand-primary)',
          letterSpacing: '-0.03em',
          transition: 'color 0.3s',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatINR(currentBid)}
        </div>
        {bidderName && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            marginTop: '0.4rem',
            padding: '0.2rem 0.65rem',
            background: bidderName === 'You' ? 'rgba(16,185,129,0.08)' : 'rgba(0,35,102,0.04)',
            borderRadius: '20px',
            border: `1px solid ${bidderName === 'You' ? 'rgba(16,185,129,0.15)' : 'rgba(0,35,102,0.08)'}`,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: bidderName === 'You' ? '#10b981' : 'var(--color-brand-primary)' }}>
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              by <strong style={{ color: bidderName === 'You' ? '#065f46' : 'var(--color-text-rich)' }}>{bidderName}</strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Stat Pills ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <StatPill label="Starting" value={formatINR(item?.startingPrice)} />
        <StatPill label="Total Bids" value={effectiveTotalBids} highlight />
        <StatPill
          label="Your Standing"
          value={standingValue}
          highlight={standingValue !== '—' && standingValue !== 'No bids'}
          type={standingValue === 'Leading' ? 'success' : standingValue === 'Outbid' ? 'warning' : undefined}
        />
      </div>

      {/* ── Countdown Timer ── */}
      {isActive && (
        <div style={{
          padding: '1rem 1.25rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid var(--color-border-subtle)',
        }}>
          <LiveTimer
            startTime={item?.startTime}
            endTime={item?.endTime}
            size="lg"
            showBar
          />
        </div>
      )}

      {/* Sold / Cancelled state */}
      {(isSold || item?.status === 'CANCELLED') && (
        <div style={{
          padding: '1rem',
          background: isSold ? 'rgba(0,35,102,0.02)' : 'rgba(239,68,68,0.02)',
          borderRadius: '12px',
          border: isSold ? '1px solid rgba(0,35,102,0.1)' : '1px solid rgba(239,68,68,0.1)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.35rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: isSold ? 'var(--color-brand-primary)' : '#ef4444',
          }}>
            {isSold ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            <span>{isSold ? 'Auction Closed — Item Sold' : 'Auction Cancelled'}</span>
          </div>
          {isSold && item?.winnerId && (
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Winner: <strong style={{ color: 'var(--color-text-rich)' }}>{item.winnerId.username}</strong>
            </p>
          )}
        </div>
      )}

      {/* ── Bid history hint ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.8rem', color: 'var(--color-text-muted)',
        padding: '0.5rem 0',
        borderTop: '1px solid var(--color-border-subtle)',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        Real-time updates via live connection
      </div>
    </div>
  );
}
