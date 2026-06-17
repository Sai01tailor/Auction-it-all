import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const C = {
  navy:      '#002366',
  navyLight: '#1a3c7a',
  gold:      '#fece44',
  goldLight: '#feda75',
  goldDark:  '#e5b630',
  textRich:  '#0a0a0a',
  textMuted: '#525252',
  surface:   '#ffffff',
  surfaceBg: '#f0f4ff',
  border:    '#e5e7eb',
  green:     '#10b981',
  orange:    '#f59e0b',
  red:       '#ef4444',
};
const font = "'Inter', system-ui, -apple-system, sans-serif";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function formatINR(num) {
  if (!num && num !== 0) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(num);
}

function getTimeInfo(startTime, endTime) {
  const now   = Date.now();
  const start = new Date(startTime).getTime();
  const end   = new Date(endTime).getTime();

  if (now < start) {
    const diff = start - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { label: `Starts in ${h}h ${m}m`, status: 'upcoming', pct: 0, color: C.navy };
  }
  if (now > end) {
    return { label: 'Auction Ended', status: 'ended', pct: 100, color: C.textMuted };
  }

  const total     = end - start;
  const elapsed   = now - start;
  const remaining = end - now;
  const pct = Math.min(100, Math.round((elapsed / total) * 100));

  let label, color;
  if (remaining > 7200000) {       // > 2h  → green
    const d = Math.floor(remaining / 86400000);
    const h = Math.floor((remaining % 86400000) / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    label = d > 0 ? `${d}d ${h}h left` : `${h}h ${m}m left`;
    color = C.green;
  } else if (remaining > 600000) { // > 10m → orange
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    label = h > 0 ? `${h}h ${m}m left` : `${m}m left`;
    color = C.orange;
  } else {                         // ≤ 10m → red
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    label = `${m}m ${s}s`;
    color = C.red;
  }

  return { label, status: 'live', pct, color };
}

/* ─────────────────────────────────────────────────────────────
   AUCTION TYPE CONFIG
───────────────────────────────────────────────────────────── */
const TYPE_STYLE = {
  ENGLISH: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', icon: '📈', label: 'English' },
  DUTCH:   { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', icon: '📉', label: 'Dutch' },
  BLIND:   { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff', icon: '🎭', label: 'Blind' },
};

/* ─────────────────────────────────────────────────────────────
   PRODUCT CARD  (Auction Card)
   Props:
     product    – auction object from API
     watchlist  – string[] of watched auction IDs
     onWatch    – (id) => void   toggle watchlist
───────────────────────────────────────────────────────────── */
const ProductCard = ({ product, watchlist = [], onWatch }) => {
  const navigate  = useNavigate();
  const prevBid   = useRef(product.currentHighestBid);
  const [timeInfo, setTimeInfo]   = useState(() => getTimeInfo(product.startTime, product.endTime));
  const [pricePulse, setPricePulse] = useState(false);

  // ── Live countdown ──────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(
      () => setTimeInfo(getTimeInfo(product.startTime, product.endTime)),
      1000
    );
    return () => clearInterval(t);
  }, [product.startTime, product.endTime]);

  // ── Bid-update pulse ────────────────────────────────────────
  useEffect(() => {
    if (product.currentHighestBid !== prevBid.current) {
      prevBid.current = product.currentHighestBid;
      setPricePulse(true);
      const t = setTimeout(() => setPricePulse(false), 950);
      return () => clearTimeout(t);
    }
  }, [product.currentHighestBid]);

  const isWatched  = watchlist.includes(product._id);
  const typeStyle  = TYPE_STYLE[product.auctionType] || TYPE_STYLE.ENGLISH;
  const photo      = product.photos?.[0]
    || `https://placehold.co/400x300/002366/fece44?text=No+Image`;
  const barPulse   = timeInfo.color === C.red && timeInfo.status === 'live';

  const goToDetail = () => navigate(`/auction/${product._id}`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,35,102,0.15)' }}
      transition={{ duration: 0.2 }}
      style={{
        background: C.surface,
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(0,35,102,0.06)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: font,
      }}
    >
      {/* ── Image Section ────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }} onClick={goToDetail}>
        <img
          src={photo}
          alt={product.title}
          style={{
            width: '100%',
            aspectRatio: '4/3',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.35s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        />

        {/* Auction type badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: typeStyle.bg, color: typeStyle.color,
          border: `1px solid ${typeStyle.border}`,
          fontSize: '0.68rem', fontWeight: 700,
          padding: '3px 9px', borderRadius: 20,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          backdropFilter: 'blur(4px)',
        }}>
          {typeStyle.icon} {typeStyle.label}
        </div>

        {/* Live / Soon / Ended status badge */}
        {timeInfo.status === 'live' && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(16,185,129,0.9)', color: '#fff',
            fontSize: '0.65rem', fontWeight: 700,
            padding: '3px 9px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 5,
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#fff',
              display: 'inline-block',
              animation: 'bid-pulse 0.9s ease-out infinite',
            }} />
            LIVE
          </div>
        )}
        {timeInfo.status === 'upcoming' && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(0,35,102,0.82)', color: C.goldLight,
            fontSize: '0.65rem', fontWeight: 700,
            padding: '3px 9px', borderRadius: 20,
            backdropFilter: 'blur(4px)',
          }}>
            SOON
          </div>
        )}
        {timeInfo.status === 'ended' && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(239,68,68,0.88)', color: '#fff',
            fontSize: '0.65rem', fontWeight: 700,
            padding: '3px 9px', borderRadius: 20,
            backdropFilter: 'blur(4px)',
          }}>
            ENDED
          </div>
        )}

        {/* Quick Watch button */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={e => { e.stopPropagation(); onWatch?.(product._id); }}
          id={`watch-btn-${product._id}`}
          aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          style={{
            position: 'absolute', bottom: 10, right: 10,
            width: 34, height: 34, borderRadius: '50%',
            background: isWatched ? C.gold : 'rgba(255,255,255,0.92)',
            border: `1.5px solid ${isWatched ? C.goldDark : C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.2s ease',
          }}
        >
          {isWatched ? '★' : '☆'}
        </motion.button>
      </div>

      {/* ── Time Progress Bar ────────────────────────────────── */}
      <div style={{ height: 4, background: '#e5e7eb' }}>
        <motion.div
          style={{
            height: '100%',
            background: timeInfo.color || C.green,
            width: `${timeInfo.pct}%`,
            borderRadius: '0 2px 2px 0',
          }}
          animate={barPulse ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
          transition={barPulse ? { duration: 1.1, repeat: Infinity } : {}}
        />
      </div>

      {/* ── Card Body ────────────────────────────────────────── */}
      <div
        style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', flex: 1 }}
        onClick={goToDetail}
      >
        {/* Timer label */}
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: 5,
          color: timeInfo.color || C.textMuted,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {timeInfo.status === 'live'     && '⏱'}
          {timeInfo.status === 'upcoming' && '🕐'}
          {timeInfo.status === 'ended'    && '🔴'}
          {' '}{timeInfo.label}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '0.925rem', fontWeight: 700, color: C.textRich,
          margin: '0 0 0.35rem 0', lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.title}
        </h3>

        {/* Description (2-line clamp) */}
        <p style={{
          fontSize: '0.78rem', color: C.textMuted,
          margin: '0 0 0.5rem 0', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.description}
        </p>

        {/* Condition + Location chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          {product.condition && (
            <span style={{
              fontSize: '0.67rem', color: C.textMuted,
              background: C.surfaceBg, border: `1px solid ${C.border}`,
              padding: '2px 7px', borderRadius: 4, fontWeight: 500,
            }}>
              {product.condition}
            </span>
          )}
          {product.location && (
            <span style={{ fontSize: '0.67rem', color: C.textMuted }}>
              📍 {product.location}
            </span>
          )}
        </div>

        {/* Price row */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 'auto',
          borderTop: `1px solid ${C.border}`, paddingTop: '0.75rem', marginBottom: '0.75rem',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.63rem', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              Starting
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.textRich }}>
              {formatINR(product.startingPrice)}
            </div>
          </div>

          {product.currentHighestBid > 0 && (
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontSize: '0.63rem', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                Current Bid
              </div>
              {/* Live bid — pulses when socket updates the price */}
              <motion.div
                key={product.currentHighestBid}
                animate={pricePulse
                  ? { scale: [1, 1.15, 1], color: [C.navy, C.green, C.navy] }
                  : { scale: 1 }
                }
                transition={{ duration: 0.4 }}
                style={{
                  fontSize: '0.9rem', fontWeight: 800, color: C.navy,
                  ...(pricePulse ? { animation: 'bid-pulse 0.9s ease-out' } : {}),
                }}
              >
                {formatINR(product.currentHighestBid)}
              </motion.div>
            </div>
          )}
        </div>

        {/* CTA — Enter Warroom */}
        <motion.button
          whileHover={timeInfo.status !== 'ended' ? { scale: 1.02 } : {}}
          whileTap={timeInfo.status !== 'ended'   ? { scale: 0.97 } : {}}
          onClick={e => { e.stopPropagation(); goToDetail(); }}
          id={`warroom-btn-${product._id}`}
          style={{
            width: '100%', padding: '0.55rem',
            background: timeInfo.status === 'ended'
              ? '#f3f4f6'
              : `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
            color: timeInfo.status === 'ended' ? C.textMuted : '#fff',
            border: 'none', borderRadius: 8,
            fontSize: '0.82rem', fontWeight: 700,
            cursor: timeInfo.status === 'ended' ? 'default' : 'pointer',
            fontFamily: font, letterSpacing: '0.02em',
            transition: 'all 0.2s ease',
          }}
        >
          {timeInfo.status === 'ended' ? '🔒 Auction Closed' : '⚡ Enter Warroom'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;