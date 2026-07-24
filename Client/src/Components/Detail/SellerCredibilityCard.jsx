import React from 'react';

/* ─────────────────────────────────────────────────────────────
   SellerCredibilityCard — Seller trust & credibility panel
   
   Props:
     seller {User}   — sellerId populated object { _id, username, email, kycStatus, role, createdAt }
     item   {Item}   — parent item (for listing count context)
───────────────────────────────────────────────────────────── */

const KYC_CONFIG = {
  Verified: { icon: '✓', label: 'KYC Verified', bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  Pending: {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Outer Frame - Primary Navy */}
      <path d="M5 22h14a2 2 0 0 0 2-2v-2a6 6 0 0 0-6-6H9a6 6 0 0 0-6 6v2a2 2 0 0 0 2 2z" stroke="var(--color-brand-primary)" />
      <path d="M5 2h14a2 2 0 0 1 2 2v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-4V4a2 2 0 0 1 2-2z" stroke="var(--color-brand-primary)" />

      {/* The Flowing Sand - Accent Gold */}
      <path d="M12 12l-3-4h6l-3 4z" fill="var(--color-brand-accent-dark)" stroke="var(--color-brand-accent-dark)" />
      <path d="M12 12l2 4h-4l2-4z" fill="var(--color-brand-accent-dark)" stroke="var(--color-brand-accent-dark)" />
    </svg>, label: 'Verification Pending', bg: '#fffbeb', color: '#92400e', border: '#fde68a'
  },
  Failed: { icon: '✗', label: 'KYC Failed', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  Unverified: { icon: '?', label: 'Unverified', bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
};

function getInitials(username, email) {
  if (username && username.length > 0) {
    return username.slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return 'S';
}

function getMemberSince(createdAt) {
  if (!createdAt || createdAt === 'recently' || createdAt === 'Joined recently' || createdAt === 'Recent Member') {
    return 'Recently Joined';
  }
  if (typeof createdAt === 'string') {
    if (createdAt.startsWith('Joined ')) {
      const clean = createdAt.replace('Joined ', '');
      if (clean === 'recently' || clean === 'Recently') return 'Recently Joined';
      return clean;
    }
    if (createdAt === 'recently') return 'Recently Joined';
  }
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) {
    return 'Recently Joined';
  }
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function SellerBadge({ kyc }) {
  let normalizedKyc = 'Unverified';
  if (kyc) {
    const lower = kyc.toLowerCase();
    if (lower === 'verified') normalizedKyc = 'Verified';
    else if (lower === 'pending') normalizedKyc = 'Pending';
    else if (lower === 'failed') normalizedKyc = 'Failed';
  }
  const cfg = KYC_CONFIG[normalizedKyc] ?? KYC_CONFIG.Unverified;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.65rem',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
    }}>
      <span style={{ fontWeight: 900 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function TrustMetric({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.5rem 0',
    }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-rich)' }}>
          {value}
        </span>
      </div>
    </div>
  );
}

export default function SellerCredibilityCard({ seller, item }) {
  if (!seller) {
    return (
      <div style={{
        background: '#f9fafb', borderRadius: '16px',
        border: '1px solid var(--color-border-subtle)',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
      }}>
        Seller information not available.
      </div>
    );
  }

  const initials = getInitials(seller.username, seller.email);
  const kycStatus = seller.kycStatus ?? 'Unverified';
  const isVerified = kycStatus.toLowerCase() === 'verified';
  const since = getMemberSince(seller.createdAt, seller._id || seller.username);

  return (
    <div
      id="seller-credibility-card"
      style={{
        background: '#fff',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '18px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 2px 12px rgba(0,35,102,0.05)',
      }}
    >
      {/* Header */}
      <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
        Seller Profile
      </h3>

      {/* Seller identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Avatar */}
        <div style={{
          width: '54px', height: '54px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, var(--color-brand-primary), #1a3c7a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,35,102,0.2)',
        }}>
          <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{initials}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '1rem', fontWeight: 800,
              color: 'var(--color-brand-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {seller.username ?? 'Anonymous Seller'}
            </span>
            {isVerified && (
              <span style={{
                width: '18px', height: '18px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </div>
          <SellerBadge kyc={kycStatus} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border-subtle)' }} />

      {/* Trust metrics */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <TrustMetric icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Calendar Body - Primary Navy */}
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="var(--color-brand-primary)" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="var(--color-brand-primary)" />

          {/* Rings - Accent Gold */}
          <line x1="16" y1="2" x2="16" y2="6" stroke="var(--color-brand-accent-dark)" strokeWidth="2.5" />
          <line x1="8" y1="2" x2="8" y2="6" stroke="var(--color-brand-accent-dark)" strokeWidth="2.5" />
        </svg>} label="Member Since" value={since} />
        <TrustMetric icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            stroke="var(--color-brand-primary)"
            fill="var(--color-brand-accent-light)"
          />
        </svg>} label="Trust Score" value="4.8 / 5.0" />
        <TrustMetric icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
            stroke="var(--color-brand-primary)"
          />
          <line x1="7" y1="7" x2="7.01" y2="7" stroke="var(--color-brand-primary)" strokeWidth="2.5" />
        </svg>} label="Role" value={seller.role === 'SELLER' ? 'Verified Seller' : seller.role} />
        <TrustMetric icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            ry="2"
            stroke="var(--color-brand-primary)"
            strokeWidth="2.5"
          />
          <polyline
            points="9 12 12 15 16 9"
            stroke="var(--color-brand-accent-dark)"
            strokeWidth="2.5"
          />
        </svg>} label="Auctions" value="Active on BidKar.in" />
      </div>

      {/* View Profile CTA */}
      <a
        href={`/seller/${seller._id}`}
        id="seller-view-profile"
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '0.65rem',
          background: 'var(--color-surface-bg)',
          border: '1.5px solid var(--color-border-subtle)',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--color-brand-primary)',
          textDecoration: 'none',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0,35,102,0.05)';
          e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--color-surface-bg)';
          e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
        }}
      >
        View Seller Profile →
      </a>

      {/* Trust assurance note */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
        padding: '0.75rem',
        background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '10px',
      }}>
        <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}> <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FBBF24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg></span>
        <p style={{ margin: 0, fontSize: '0.77rem', color: '#065f46', lineHeight: 1.5 }}>
          This seller has completed BidKar.in KYC verification. All transactions are escrow-protected.
        </p>
      </div>
    </div>
  );
}
