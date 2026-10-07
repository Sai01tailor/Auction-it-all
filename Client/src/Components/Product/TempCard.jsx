import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* -----------------------------------------
   HELPERS
----------------------------------------- */
function formatINR(n) {
    if (n == null) return '�';
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
        return { phase: 'upcoming', text: `${h}H ${m}M`, pct: 0 };
    }
    if (now >= end) {
        return { phase: 'ended', text: 'Ended', pct: 100 };
    }

    const remaining = end - now;
    const total = end - start;
    const pct = Math.min(100, Math.round(((now - start) / total) * 100));

    let text;
    if (remaining >= 86_400_000) {
        const d = Math.floor(remaining / 86_400_000);
        const h = Math.floor((remaining % 86_400_000) / 3_600_000);
        text = `${d}D ${h}H`;
    } else if (remaining >= 3_600_000) {
        const h = Math.floor(remaining / 3_600_000);
        const m = Math.floor((remaining % 3_600_000) / 60_000);
        text = `${h}H ${m}M`;
    } else if (remaining >= 60_000) {
        const m = Math.floor(remaining / 60_000);
        const s = Math.floor((remaining % 60_000) / 1_000);
        text = `${m}M ${s}S`;
    } else {
        const s = Math.floor(remaining / 1_000);
        text = `${s}S`;
    }

    return { phase: 'live', text, pct, urgent: remaining < 5 * 60_000 };
}

/* -- Derive a short lot identifier from the item ID -- */
function lotNumber(id) {
    if (!id) return 'LOT �';
    return 'LOT ' + id.toString().slice(-4).toUpperCase();
}

/* -----------------------------------------
   STATUS CONFIG  (matches Item schema enum)
----------------------------------------- */
const STATUS = {
    ACTIVE: { label: 'Live', bg: '#002366', text: '#fff' },
    SOLD: { label: 'Sold', bg: '#6b7280', text: '#fff' },
    CANCELLED: { label: 'Cancelled', bg: '#ef4444', text: '#fff' },
    DRAFT: { label: 'Draft', bg: '#f59e0b', text: '#fff' },
};

/* -----------------------------------------
   PRODUCT CARD
   Props from Item schema:
     item._id, item.title, item.description,
     item.startingPrice, item.currentHighestBid,
     item.photos[], item.status, item.category,
     item.startTime, item.endTime
----------------------------------------- */
export default function ProductCard({ item = {} }) {
    const navigate = useNavigate();
    const prevBid = useRef(item.currentHighestBid);

    const [timer, setTimer] = useState(() => getTimer(item.startTime, item.endTime));
    const [bidPulse, setBidPulse] = useState(false);

    // Live countdown � unchanged
    useEffect(() => {
        const id = setInterval(
            () => setTimer(getTimer(item.startTime, item.endTime)),
            1000,
        );
        return () => clearInterval(id);
    }, [item.startTime, item.endTime]);

    // Bid price pulse when updated via socket / prop change � unchanged
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

    /* -- timer colour � unchanged logic -- */
    let timerColor = '#C8A951'; // antique gold
    if (timer.phase === 'ended' || isSold) timerColor = '#7A7F87'; // slate
    else if (timer.phase === 'upcoming') timerColor = '#8C6F2D'; // muted gold
    else if (timer.urgent) timerColor = '#8B2635'; // deep burgundy
    else if (timer.pct >= 70) timerColor = '#B88A2E'; // rich brass

    /* -- timer phase label -- */
    const timerPhaseLabel =
        timer.phase === 'live' ? 'Live Auction' :
            timer.phase === 'upcoming' ? 'Upcoming' : 'Closed';

    /* -- category label from data field, not hardcoded -- */
    const categoryLabel = item.category
        ? item.category.replace(/_/g, ' ').toUpperCase()
        : null;

    const go = () => navigate(`/auction/${item._id}`);

    return (
        <article
            className="bg-white rounded-xl border border-[var(--color-border-subtle)] overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{ boxShadow: '0 2px 10px rgba(0,35,102,0.06)' }}
            onClick={go}
        >
            {/* -- Image -- */}
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

                {/* Status pill � unchanged */}
                <span
                    className="absolute top-2.5 left-2.5 text-[0.62rem] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: status.bg, color: status.text }}
                >
                    {status.label === 'Live' && (
                        <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ background: '#FECE44', animation: 'bid-pulse 1s ease-out infinite' }}
                        />
                    )}
                    {status.label}
                </span>

                {/* Lot number � auction-house catalog identifier */}
                {/* <span style={{
          position: 'absolute', top: '0.6rem', right: '0.6rem',
          fontSize: '0.58rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.92)',
          background: 'rgba(0,15,40,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          padding: '2px 7px',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}>
          {lotNumber(item._id)}
        </span> */}
            </div>

            {/* -- Time progress bar � unchanged -- */}
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

            {/* -- Body -- */}
            <div className="p-3.5 flex flex-col flex-1 gap-2" onClick={go}>

                {/* Timer row � SVG clock icon, no emoji; phase label right-aligned */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <p
                        className="text-[0.68rem] font-bold uppercase tracking-wider m-0"
                        style={{ color: timerColor, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        {timer.phase !== 'ended' && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                        )}
                        {timer.phase === 'ended' ? 'Closed' : `${timer.text} Left`}
                    </p>
                    <span style={{
                        fontSize: '0.58rem', fontWeight: 700,
                        letterSpacing: '0.09em', textTransform: 'uppercase',
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                    }}>
                        {timerPhaseLabel}
                    </span>
                </div>

                {/* Category micro-label with thin gold accent line */}
                {categoryLabel && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{
                            width: '14px', height: '1px',
                            background: 'var(--color-brand-accent)',
                            flexShrink: 0,
                        }} />
                        <span style={{
                            fontSize: '0.58rem', fontWeight: 700,
                            letterSpacing: '0.13em', textTransform: 'uppercase',
                            color: 'var(--color-text-muted)',
                        }}>
                            {categoryLabel}
                        </span>
                    </div>
                )}

                {/* Title � unchanged */}
                <h3 className="text-[0.9rem] font-bold text-[var(--color-text-rich)] m-0 leading-snug line-clamp-2">
                    {item.title}
                </h3>

                {/* Description � unchanged */}
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
                            Starting Bid
                        </div>
                        <div className="text-[0.88rem] font-semibold text-[var(--color-text-rich)]">
                            {formatINR(item.startingPrice)}
                        </div>
                    </div>

                    {item.currentHighestBid > 0 && (
                        <div className="text-right">
                            <div className="text-[0.6rem] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">
                                Current Bid
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
                            {canBid && (
                                <div style={{
                                    fontSize: '0.55rem', fontWeight: 700,
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                    color: 'var(--color-brand-accent)',
                                    marginTop: '2px',
                                    display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end',
                                }}>
                                    <span style={{
                                        display: 'inline-block', width: '5px', height: '5px',
                                        borderRadius: '50%', background: 'var(--color-brand-accent)',
                                        animation: 'bid-pulse 1s ease-out infinite',
                                    }} />
                                    Live Bidding
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* CTA � unchanged logic; arrow only when canBid */}
                <button
                    onClick={e => { e.stopPropagation(); go(); }}
                    disabled={!canBid && !isSold}
                    id={`bid-btn-${item._id}`}
                    className="w-full py-2 rounded-lg text-[0.8rem] font-bold tracking-wide transition-all duration-200 mt-1"
                    style={{
                        background: canBid ? 'var(--color-brand-primary)' : '#f3f4f6',
                        color: canBid ? '#fff' : 'var(--color-text-muted)',
                        cursor: canBid ? 'pointer' : 'default',
                    }}
                >
                    {isSold
                        ? 'Sold'
                        : timer.phase === 'ended'
                            ? 'Auction Closed'
                            : timer.phase === 'upcoming'
                                ? 'Not Started'
                                : 'Place Bid '}
                </button>
            </div>
        </article>
    );
}
