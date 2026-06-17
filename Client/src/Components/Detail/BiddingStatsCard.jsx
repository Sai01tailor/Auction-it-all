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

function StatPill({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0.875rem 1rem',
      background: highlight ? 'rgba(0,35,102,0.04)' : '#f8fafc',
      borderRadius: '12px',
      border: highlight ? '1px solid rgba(0,35,102,0.12)' : '1px solid var(--color-border-subtle)',
      flex: 1, minWidth: '80px',
    }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
        {label}
      </span>
      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: highlight ? 'var(--color-brand-primary)' : 'var(--color-text-rich)' }}>
        {value}
      </span>
    </div>
  );
}

export default function BiddingStatsCard({ item }) {
  const { currentBid, totalBids, lastBidder, isConnected } = useSocket(
    item?._id,
    item?.currentHighestBid ?? 0,
  );

  const prevBid   = useRef(currentBid);
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
  const isSold   = item?.status === 'SOLD';

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
        {/* Connection indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.25rem 0.65rem',
          background: isConnected ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          borderRadius: '20px',
          border: `1px solid ${isConnected ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444',
            display: 'inline-block',
            animation: isConnected ? 'bid-pulse 1.2s ease-out infinite' : 'none',
          }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isConnected ? '#065f46' : '#991b1b' }}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* ── Current Highest Bid ── */}
      <div style={{
        padding: '1.25rem',
        background: 'linear-gradient(135deg, rgba(0,35,102,0.04) 0%, rgba(254,206,68,0.06) 100%)',
        borderRadius: '14px',
        border: pulse ? '2px solid #10b981' : '2px solid transparent',
        transition: 'border-color 0.3s',
        textAlign: 'center',
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
        {lastBidder && (
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            🏆 by <strong style={{ color: 'var(--color-text-rich)' }}>{lastBidder}</strong>
          </p>
        )}
      </div>

      {/* ── Stat Pills ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <StatPill label="Starting" value={formatINR(item?.startingPrice)} />
        <StatPill label="Total Bids" value={totalBids > 0 ? totalBids : item?.bidsCount ?? 0} highlight />
        <StatPill
          label="Your Standing"
          value={totalBids > 0 ? '—' : 'No bids'}
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
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid var(--color-border-subtle)',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#6b7280' }}>
            {isSold ? '🔒 Auction Closed — Item Sold' : '❌ Auction Cancelled'}
          </p>
          {isSold && item?.winnerId && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Winner: <strong>{item.winnerId.username}</strong>
            </p>
          )}
        </div>
      )}

      {/* ── Bid history hint ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.8rem', color: 'var(--color-text-muted)',
        padding: '0.5rem 0',
        borderTop: '1px solid var(--color-border-subtle)',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Real-time updates via live connection
      </div>
    </div>
  );
}
