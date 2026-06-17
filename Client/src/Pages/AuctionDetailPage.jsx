import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../Components/Global/Header';
import MediaGallery from '../Components/Detail/MediaGallery';
import BiddingStatsCard from '../Components/Detail/BiddingStatsCard';
import SellerCredibilityCard from '../Components/Detail/SellerCredibilityCard';
import BidConsoleButton from '../Components/Detail/BidConsoleButton';
import { getAuctionById } from '../services/auctionService';
import { useSocket } from '../hooks/useSocket';

/* ─────────────────────────────────────────────────────────────
   P03: Auction Detail Page — /auction/:id
   
   Layout:
     Breadcrumb → Two-column (gallery | right panel)
                → Right panel: BiddingStatsCard + SellerCredibilityCard + CTA
     Below fold: Description + Bidding Rules
───────────────────────────────────────────────────────────── */

/* ── Skeleton ── */
function DetailSkeleton() {
  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }}>
        <div style={{ background: '#f3f4f6', borderRadius: '16px', aspectRatio: '4/3' }} className="animate-pulse" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: i === 0 ? '180px' : '80px', background: '#f3f4f6', borderRadius: '12px' }} className="animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Status badge ── */
function StatusBadge({ status }) {
  const cfg = {
    ACTIVE:    { label: '⚡ Live',       bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
    SOLD:      { label: '🔒 Sold',       bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
    CANCELLED: { label: '❌ Cancelled',  bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
    DRAFT:     { label: '📝 Draft',      bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  }[status] ?? { label: status, bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.3rem 0.8rem',
      background: cfg.bg, color: cfg.color,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: '20px',
      fontSize: '0.78rem', fontWeight: 700,
      letterSpacing: '0.04em',
    }}>
      {status === 'ACTIVE' && (
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%', background: '#10b981',
          animation: 'bid-pulse 1.2s ease-out infinite', display: 'inline-block', flexShrink: 0,
        }} />
      )}
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

/* ── Main Page ── */
export default function AuctionDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [item,    setItem]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const { currentBid } = useSocket(id, item?.currentHighestBid ?? 0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    getAuctionById(id)
      .then(data => setItem(data))
      .catch(() => setError('Auction not found or an error occurred.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <><Header /><DetailSkeleton /></>;

  if (error) {
    return (
      <>
        <Header />
        <div style={{
          maxWidth: '600px', margin: '5rem auto', textAlign: 'center',
          padding: '0 1.5rem',
        }}>
          <span style={{ fontSize: '3.5rem' }}>⚠️</span>
          <h2 style={{ color: 'var(--color-brand-primary)' }}>Auction Not Found</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          <button
            onClick={() => navigate('/auctions')}
            style={{ padding: '0.75rem 2rem', marginTop: '1rem', borderRadius: '10px', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}
          >
            ← Back to Auctions
          </button>
        </div>
      </>
    );
  }

  const seller = item?.sellerId;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <Header />

      {/* ── Breadcrumb ── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid var(--color-border-subtle)',
        padding: '0.75rem 0',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            <Link to="/" style={{ color: 'var(--color-brand-primary)', fontWeight: 500, textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link to="/auctions" style={{ color: 'var(--color-brand-primary)', fontWeight: 500, textDecoration: 'none' }}>Auctions</Link>
            <span>›</span>
            <span style={{ color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
              {item?.title ?? 'Item Detail'}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Title + status row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <StatusBadge status={item?.status} />
              {item?.endTime && (
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Ends: {formatDate(item.endTime)}
                </span>
              )}
            </div>
            <h1 id="auction-title" style={{
              margin: 0,
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 800,
              color: 'var(--color-brand-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              {item?.title}
            </h1>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 370px',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Left: Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <MediaGallery photos={item?.photos ?? []} title={item?.title} />

            {/* Description Card */}
            <div style={{
              background: '#fff',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,35,102,0.04)',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                About This Item
              </h3>
              <p style={{ margin: 0, fontSize: '0.93rem', color: 'var(--color-text-muted)', lineHeight: 1.75 }}>
                {item?.description ?? 'No description provided.'}
              </p>

              {/* Auction details table */}
              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Starting Price',  value: `₹${item?.startingPrice?.toLocaleString('en-IN') ?? '—'}` },
                  { label: 'Auction Start',   value: formatDate(item?.startTime) },
                  { label: 'Auction End',     value: formatDate(item?.endTime)   },
                  { label: 'Item Status',     value: item?.status ?? '—'         },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    padding: '0.65rem 0.85rem',
                    background: 'var(--color-surface-bg)',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border-subtle)',
                  }}>
                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                      {label}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.87rem', fontWeight: 600, color: 'var(--color-text-rich)' }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bidding rules */}
            <div style={{
              background: 'rgba(0,35,102,0.03)',
              border: '1px solid rgba(0,35,102,0.1)',
              borderRadius: '14px',
              padding: '1.25rem',
            }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                📋 Bidding Rules
              </h4>
              <ul style={{ margin: 0, padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {[
                  'A 10% refundable deposit is required to enter the bidding console.',
                  'Your bid must be higher than the current highest bid.',
                  'The auction closes at the exact end time — no extensions.',
                  'Winner has 48 hours to complete the escrow payment.',
                  'KYC verification required before placing any bid.',
                ].map((rule, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Bid stats + seller + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '84px' }}>
            <BiddingStatsCard item={item} />
            <BidConsoleButton item={item} currentBid={currentBid} />
            <SellerCredibilityCard seller={seller} item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}
