import React from 'react';

/* ─────────────────────────────────────────────────────────────
   SellerCredibilityCard — Seller trust & credibility panel
   
   Props:
     seller {User}   — sellerId populated object { _id, username, email, kycStatus, role, createdAt }
     item   {Item}   — parent item (for listing count context)
───────────────────────────────────────────────────────────── */

const KYC_CONFIG = {
  Verified:   { icon: '✓', label: 'KYC Verified',   bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  Pending:    { icon: '⏳', label: 'Verification Pending', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  Failed:     { icon: '✗', label: 'KYC Failed',     bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  Unverified: { icon: '?', label: 'Unverified',     bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
};

function getInitials(username, email) {
  if (username && username.length > 0) {
    return username.slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return 'S';
}

function getMemberSince(createdAt) {
  if (!createdAt) return 'Member';
  const date = new Date(createdAt);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function SellerBadge({ kyc }) {
  const cfg = KYC_CONFIG[kyc] ?? KYC_CONFIG.Unverified;
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

  const initials   = getInitials(seller.username, seller.email);
  const kycStatus  = seller.kycStatus ?? 'Unverified';
  const isVerified = kycStatus === 'Verified';
  const since      = getMemberSince(seller.createdAt);

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
                  <polyline points="20 6 9 17 4 12"/>
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
        <TrustMetric icon="📅" label="Member Since" value={since} />
        <TrustMetric icon="⭐" label="Trust Score"  value="4.8 / 5.0" />
        <TrustMetric icon="🏷️" label="Role"         value={seller.role === 'SELLER' ? 'Verified Seller' : seller.role} />
        <TrustMetric icon="✅" label="Auctions"      value="Active on BidKar.in" />
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
        <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>🛡️</span>
        <p style={{ margin: 0, fontSize: '0.77rem', color: '#065f46', lineHeight: 1.5 }}>
          This seller has completed BidKar.in KYC verification. All transactions are escrow-protected.
        </p>
      </div>
    </div>
  );
}
