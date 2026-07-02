import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function formatINR(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function getTimer(startTime, endTime) {
  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) {
    const diff = start - now;
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    return { phase: 'upcoming', text: `Starts in ${h}h ${m}m`, pct: 0 };
  }
  if (now >= end) {
    return { phase: 'ended', text: 'Ended', pct: 100 };
  }

  const remaining = end - now;
  const total = end - start;
  const pct = Math.min(100, Math.round(((now - start) / total) * 100));

  let text;
  if (remaining >= 86_400_000) {
    const d = Math.floor(remaining / 86_400_000)
    const h = Math.floor((remaining % 86_400_000) / 3_600_000);
    text = `${d}d ${h}h left`;
  } else if (remaining >= 3_600_000) {
    const h = Math.floor(remaining / 3_600_000);
    const m = Math.floor((remaining % 3_600_000) / 60_000);
    text = `${h}h ${m}m left`;
  } else if (remaining >= 60_000) {
    const m = Math.floor(remaining / 60_000);
    const s = Math.floor((remaining % 60_000) / 1_000);
    text = `${m}m ${s}s left`;
  } else {
    const s = Math.floor(remaining / 1_000);
    text = `${s}s left`;
  }

  return { phase: 'live', text, pct, urgent: remaining < 5 * 60_000 };
}

/* ─────────────────────────────────────────
   STATUS CONFIG  (matches Item schema enum)
───────────────────────────────────────── */
const STATUS = {
  ACTIVE: { label: 'Live', bg: '#10b981', text: '#fff' },
  SOLD: { label: 'Sold', bg: '#6b7280', text: '#fff' },
  CANCELLED: { label: 'Cancelled', bg: '#ef4444', text: '#fff' },
  DRAFT: { label: 'Draft', bg: '#f59e0b', text: '#fff' },
};

/* ─────────────────────────────────────────
   PRODUCT CARD
   Props from Item schema:
     item._id, item.title, item.description,
     item.startingPrice, item.currentHighestBid,
     item.photos[], item.status,
     item.startTime, item.endTime
───────────────────────────────────────── */
export default function ProductCard({ item = {} }) {
  const navigate = useNavigate();
  const prevBid = useRef(item.currentHighestBid);

  const [timer, setTimer] = useState(() => getTimer(item.startTime, item.endTime));
  const [bidPulse, setBidPulse] = useState(false);

  // Live countdown
  useEffect(() => {
    const id = setInterval(
      () => setTimer(getTimer(item.startTime, item.endTime)),
      1000,
    );
    return () => clearInterval(id);
  }, [item.startTime, item.endTime]);

  // Bid price pulse when updated via socket / prop change
  useEffect(() => {
    if (item.currentHighestBid !== prevBid.current) {
      prevBid.current = item.currentHighestBid;
      setBidPulse(true);
      const t = setTimeout(() => setBidPulse(false), 800);
      return () => clearTimeout(t);
    }
  }, [item.currentHighestBid]);

  const photo = item.photos?.[0] || null;
  const status = STATUS[item.status] ?? STATUS.ACTIVE;
  const isActive = item.status === 'ACTIVE';
  const isSold = item.status === 'SOLD';
  const canBid = isActive && timer.phase === 'live';

  /* ── timer colour ── */
  let timerColor = '#10b981';                           // green  — plenty of time
  if (timer.phase === 'ended' || isSold) timerColor = '#9ca3af';
  else if (timer.urgent) timerColor = '#ef4444'; // red < 5 min
  else if (timer.pct >= 70) timerColor = '#f59e0b'; // orange

  const go = () => navigate(`/auction/${item._id}`);

  return (
    <article
      className="bg-white rounded-xl border border-[var(--color-border-subtle)] overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{ boxShadow: '0 2px 10px rgba(0,35,102,0.06)' }}
      onClick={go}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-[var(--color-surface-bg)]">
        {photo ? (
          <img
            src={photo}
            alt={item.title}
            className="w-full object-cover transition-transform duration-300 hover:scale-105"
            style={{ aspectRatio: '4/3' }}
            loading="lazy"
          />
        ) : (
          <div
            className="w-full flex items-center justify-center text-[var(--color-text-muted)] text-sm"
            style={{ aspectRatio: '4/3', background: '#f0f4ff' }}
          >
            No photo
          </div>
        )}

        {/* Status pill */}
        <span
          className="absolute top-2.5 left-2.5 text-[0.62rem] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1"
          style={{ background: status.bg, color: status.text }}
        >
          {status.label === 'Live' && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-white"
              style={{ animation: 'bid-pulse 1s ease-out infinite' }}
            />
          )}
          {status.label}
        </span>
      </div>

      {/* ── Time progress bar ── */}
      <div className="h-[3px] bg-[var(--color-border-subtle)]">
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${timer.pct}%`,
            background: timerColor,
            animation: timer.urgent ? 'progress-pulse 1.2s ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* ── Body ── */}
      <div className="p-3.5 flex flex-col flex-1 gap-2" onClick={go}>

        {/* Timer label */}
        <p
          className="text-[0.68rem] font-bold uppercase tracking-wider m-0"
          style={{ color: timerColor }}
        >
          {timer.phase === 'live' && '⏱ '}
          {timer.phase === 'upcoming' && '🕐 '}
          {timer.phase === 'ended' && '● '}
          {timer.text}
        </p>

        {/* Title */}
        <h3
          className="text-[0.9rem] font-bold text-[var(--color-text-rich)] m-0 leading-snug line-clamp-2"
        >
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-[0.75rem] text-[var(--color-text-muted)] m-0 leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {/* Prices */}
        <div
          className="flex items-end justify-between mt-auto pt-2.5"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <div>
            <div className="text-[0.6rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">
              Starting
            </div>
            <div className="text-[0.88rem] font-semibold text-[var(--color-text-rich)]">
              {formatINR(item.startingPrice)}
            </div>
          </div>

          {item.currentHighestBid > 0 && (
            <div className="text-right">
              <div className="text-[0.6rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">
                Top bid
              </div>
              <div
                className="text-[0.88rem] font-extrabold transition-all duration-300"
                style={{
                  color: bidPulse ? '#10b981' : 'var(--color-brand-primary)',
                  transform: bidPulse ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {formatINR(item.currentHighestBid)}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); go(); }}
          disabled={!canBid && !isSold}
          id={`bid-btn-${item._id}`}
          className="w-full py-2 rounded-lg text-[0.8rem] font-bold tracking-wide transition-all duration-200 mt-1"
          style={{
            background: canBid
              ? 'var(--color-brand-primary)'
              : '#f3f4f6',
            color: canBid ? '#fff' : 'var(--color-text-muted)',
            cursor: canBid ? 'pointer' : 'default',
          }}
        >
          {isSold
            ? ' Sold'
            : timer.phase === 'ended'
              ? ' Auction Closed'
              : timer.phase === 'upcoming'
                ? ' Not Started'
                : ' Place Bid'}
        </button>
      </div>
    </article>
  );
}