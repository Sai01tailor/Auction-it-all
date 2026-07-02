import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   LiveTimer — Atomic countdown component
   
   Props:
     startTime  {string|Date}  — auction start ISO date
     endTime    {string|Date}  — auction end ISO date
     size       {'sm'|'md'|'lg'} — visual size preset
     showBar    {boolean}      — show progress bar below timer
     onExpire   {function}     — called once when timer hits 0
───────────────────────────────────────────────────────────── */

function computeState(startTime, endTime) {
  const now   = Date.now();
  const start = new Date(startTime).getTime();
  const end   = new Date(endTime).getTime();

  if (now < start) {
    const diff = start - now;
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return {
      phase: 'upcoming',
      label: 'Starts in',
      d, h, m, s,
      pct: 0,
      urgent: false,
    };
  }

  if (now >= end) {
    return { phase: 'ended', label: 'Ended', d: 0, h: 0, m: 0, s: 0, pct: 100, urgent: false };
  }

  const remaining = end - now;
  const total     = end - start;
  const pct       = Math.min(100, Math.round(((now - start) / total) * 100));

  return {
    phase: 'live',
    label: 'Ends in',
    d: Math.floor(remaining / 86_400_000),
    h: Math.floor((remaining % 86_400_000) / 3_600_000),
    m: Math.floor((remaining % 3_600_000) / 60_000),
    s: Math.floor((remaining % 60_000) / 1_000),
    pct,
    urgent: remaining < 5 * 60_000,   // < 5 minutes
    warning: remaining < 30 * 60_000, // < 30 minutes
  };
}

// Size presets
const SIZE = {
  sm: { label: '0.6rem',  digit: '0.85rem', gap: '0.2rem', barH: '2px'  },
  md: { label: '0.7rem',  digit: '1.15rem', gap: '0.3rem', barH: '3px'  },
  lg: { label: '0.75rem', digit: '1.75rem', gap: '0.4rem', barH: '4px'  },
};

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function LiveTimer({
  startTime,
  endTime,
  size     = 'md',
  showBar  = false,
  onExpire = null,
}) {
  const [state,    setState]    = useState(() => computeState(startTime, endTime));
  const expiredRef = useRef(false);
  const sz = SIZE[size] ?? SIZE.md;

  useEffect(() => {
    expiredRef.current = false;

    const id = setInterval(() => {
      const next = computeState(startTime, endTime);
      setState(next);

      if (next.phase === 'ended' && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [startTime, endTime]);

  // ── colour logic ─────────────────────────────────────────────
  let color = '#10b981'; // green
  if (state.phase === 'ended')        color = '#9ca3af'; // gray
  else if (state.urgent)              color = '#ef4444'; // red
  else if (state.warning)             color = '#f59e0b'; // amber

  // ── phase icons ──────────────────────────────────────────────
  const icon =
    state.phase === 'upcoming' ? '🕐' :
    state.phase === 'ended'    ? '🔒' :
    state.urgent               ? '🔥' : '⏱';

  if (state.phase === 'ended') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: sz.gap }}>
        <span style={{ fontSize: sz.label, color, fontWeight: 700 }}>🔒 Auction Closed</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {/* Label row */}
      <div
        style={{
          fontSize: sz.label,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
      >
        <span style={{
          display: 'inline-block',
          animation: state.urgent ? 'bid-pulse 0.9s ease-out infinite' : 'none',
        }}>
          {icon}
        </span>
        {state.label}
      </div>

      {/* Digit display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: sz.gap,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {/* Days */}
        {state.d > 0 && (
          <>
            <Segment value={pad(state.d)} label="D" color={color} sz={sz} />
            <Colon color={color} sz={sz} />
          </>
        )}
        {/* Hours */}
        <Segment value={pad(state.h)} label="H" color={color} sz={sz} />
        <Colon color={color} sz={sz} />
        {/* Minutes */}
        <Segment value={pad(state.m)} label="M" color={color} sz={sz} />
        <Colon color={color} sz={sz} />
        {/* Seconds */}
        <Segment value={pad(state.s)} label="S" color={color} sz={sz} />
      </div>


      {/* Progress bar */}
      {showBar && (
        <div style={{ height: sz.barH, background: '#e5e7eb', borderRadius: 9999, overflow: 'hidden', marginTop: '0.25rem' }}>
          <div
            style={{
              height: '100%',
              width: `${state.pct}%`,
              background: color,
              borderRadius: 9999,
              transition: 'width 1s linear',
              animation: state.urgent ? 'progress-pulse 1.2s ease-in-out infinite' : 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */
function Segment({ value, label, color, sz }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{
        fontSize: sz.digit,
        fontWeight: 800,
        color,
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '0.55rem',
        color: 'var(--color-text-muted)',
        fontWeight: 600,
        letterSpacing: '0.1em',
        marginTop: '1px',
      }}>
        {label}
      </span>
    </div>
  );
}

function Colon({ color, sz }) {
  return (
    <span style={{
      fontSize: sz.digit,
      fontWeight: 800,
      color,
      lineHeight: 1,
      opacity: 0.7,
      marginBottom: '6px',
    }}>
      :
    </span>
  );
}
