import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useWallet } from '../../Context/WalletContext';
import { toast } from 'react-toastify';

/* ─────────────────────────────────────────────────────────────
   BidConsoleButton — Primary CTA for P03 Auction Detail
   
   Props:
     item    {Item}    — full auction item object
     currentBid {number} — live bid from useSocket
───────────────────────────────────────────────────────────── */
export default function BidConsoleButton({ item, currentBid }) {
  const { user } = useAuth();
  const { biddingPower } = useWallet();
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  // Key watchlist per-user so two accounts on the same browser never share it
  const watchlistKey = `watchlist:${user?.userId || user?._id || 'guest'}`;

  const [isWatchlisted, setIsWatchlisted] = useState(() => {
    try {
      const saved = localStorage.getItem(watchlistKey);
      const list = saved ? JSON.parse(saved) : [];
      return list.some(x => x._id === item._id);
    } catch {
      return false;
    }
  });

  const handleWatchlistToggle = () => {
    try {
      const saved = localStorage.getItem(watchlistKey);
      let list = saved ? JSON.parse(saved) : [];
      if (isWatchlisted) {
        list = list.filter(x => x._id !== item._id);
        setIsWatchlisted(false);
        toast.success('Removed from watchlist! ');
      } else {
        list.push(item);
        setIsWatchlisted(true);
        toast.success('Added to watchlist! ');
      }
      localStorage.setItem(watchlistKey, JSON.stringify(list));
    } catch (err) {
      console.error('Failed to toggle watchlist', err);
    }
  };

  if (!item) return null;

  const now = Date.now();
  const hasEnded = new Date(item.endTime).getTime() <= now;
  const hasStarted = new Date(item.startTime).getTime() <= now;
  const isActive = item.status === 'ACTIVE' && hasStarted && !hasEnded;
  const isSold = item.status === 'SOLD';
  const isCancelled = item.status === 'CANCELLED';
  const notLoggedIn = !user;

  /* ── Determine button state ── */
  let label, bg, disabled, tooltip;

  if (isSold) {
    label = ' Item Sold';
    bg = '#6b7280';
    disabled = true;
    tooltip = 'This auction has ended and the item has been sold.';
  } else if (isCancelled) {
    label = ' Auction Cancelled';
    bg = '#ef4444';
    disabled = true;
    tooltip = 'This auction was cancelled by the seller.';
  } else if (hasEnded) {
    label = ' Auction Closed';
    bg = '#9ca3af';
    disabled = true;
    tooltip = 'Bidding time has expired for this item.';
  } else if (!hasStarted) {
    label = ' Bidding Not Open Yet';
    bg = '#f59e0b';
    disabled = true;
    tooltip = 'This auction has not started yet. Check back soon!';
  } else if (notLoggedIn) {
    label = ' Sign In to Bid';
    bg = 'var(--color-brand-primary)';
    disabled = false;
    tooltip = 'You must be signed in to place a bid.';
  } else if (
    (user?.kycStatus ?? 'Unverified').toLowerCase() !== 'verified' &&
    user?.role !== 'SELLER' &&
    user?.role !== 'ADMIN'
  ) {
    label = ' Complete KYC to Bid';
    bg = 'var(--color-brand-primary)';
    disabled = false;
    tooltip = 'KYC verification is required to participate in live bidding.';
  } else if (biddingPower < item.startingPrice) {
    label = ' Deposit Escrow to Bid';
    bg = 'var(--color-brand-primary)';
    disabled = false;
    tooltip = `Minimum ₹${Math.floor(item.startingPrice * 0.1).toLocaleString()} deposit required to enter this console.`;
  } else {
    label = ' Enter Bidding Console';
    bg = 'var(--color-brand-primary)';
    disabled = false;
    tooltip = null;
  }

  const handleClick = () => {
    if (disabled) return;
    if (notLoggedIn) {
      navigate(`/login?redirect=/auction/${item._id}/console`);
      return;
    }
    if (
      (user?.kycStatus ?? 'Unverified').toLowerCase() !== 'verified' &&
      user?.role !== 'SELLER' &&
      user?.role !== 'ADMIN'
    ) {
      navigate('/kyc');
      return;
    }
    if (biddingPower < item.startingPrice) {
      navigate('/wallet');
      return;
    }
    navigate(`/auction/${item._id}/console`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* ── Main CTA ── */}
      <div style={{ position: 'relative' }}>
        <button
          id="bid-console-cta"
          onClick={handleClick}
          disabled={disabled}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width: '100%',
            padding: '1rem 1.5rem',
            background: disabled ? '#e5e7eb' : (hover ? 'var(--color-brand-primary-light)' : bg),
            color: disabled ? '#9ca3af' : '#fff',
            border: 'none',
            borderRadius: '14px',
            fontSize: '1.05rem',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: !disabled && hover
              ? '0 8px 24px rgba(0,35,102,0.3)'
              : !disabled
                ? '0 4px 16px rgba(0,35,102,0.2)'
                : 'none',
            transform: !disabled && hover ? 'translateY(-1px)' : 'translateY(0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}
        >
          {!disabled && isActive && (
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#fece44',
              display: 'inline-block',
              animation: 'bid-pulse 0.9s ease-out infinite',
              flexShrink: 0,
            }} />
          )}
          {label}
        </button>

        {/* Tooltip */}
        {tooltip && hover && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
            transform: 'translateX(-50%)',
            background: '#1f2937',
            color: '#fff',
            fontSize: '0.78rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            zIndex: 10,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            {tooltip}
            <div style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #1f2937',
            }} />
          </div>
        )}
      </div>

      {/* ── Watchlist + Share row ── */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          id="btn-watchlist"
          onClick={handleWatchlistToggle}
          style={{
            flex: 1, padding: '0.65rem',
            background: isWatchlisted ? 'rgba(239, 68, 68, 0.05)' : '#fff',
            border: isWatchlisted ? '1.5px solid rgba(239, 68, 68, 0.3)' : '1.5px solid var(--color-border-subtle)',
            borderRadius: '10px',
            fontSize: '0.85rem', fontWeight: 600,
            color: isWatchlisted ? '#ef4444' : 'var(--color-brand-primary)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = isWatchlisted ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = isWatchlisted ? 'rgba(239, 68, 68, 0.05)' : '#fff'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={isWatchlisted ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {isWatchlisted ? 'Watchlisted' : 'Watchlist'}
        </button>
        <button
          id="btn-share"
          onClick={() => navigator.share?.({ title: item.title, url: window.location.href })}
          style={{
            flex: 1, padding: '0.65rem',
            background: '#fff',
            border: '1.5px solid var(--color-border-subtle)',
            borderRadius: '10px',
            fontSize: '0.85rem', fontWeight: 600,
            color: 'var(--color-text-rich)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      </div>

      {/* ── Escrow assurance ── */}
      {isActive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.65rem 0.85rem',
          background: 'rgba(254,206,68,0.08)',
          border: '1px solid rgba(254,206,68,0.3)',
          borderRadius: '10px',
        }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2" ry="2" />
            <circle cx="12" cy="16" r="1.5" fill="var(--color-brand-primary)" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg></span>
          <p style={{ margin: 0, fontSize: '0.77rem', color: '#856100', lineHeight: 1.4 }}>
            <strong>Escrow Protected:</strong> Your bid deposit is held securely until both parties confirm handoff.
          </p>
        </div>
      )}
    </div>
  );
}
