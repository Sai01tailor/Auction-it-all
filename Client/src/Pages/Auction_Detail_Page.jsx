import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../Config/Axios'

/* ─────────────────────────────────────────────────────────────
   HELPER UTILITIES
───────────────────────────────────────────────────────────── */
function useCountdown(endTime) {
  const calc = useCallback(() => {
    const diff = new Date(endTime) - Date.now()
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, ended: true }
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      ended: false,
    }
  }, [endTime])

  const [time, setTime] = useState(calc)
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(t)
  }, [calc])
  return time
}

function formatINR(num) {
  if (!num && num !== 0) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(num)
}

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (mirrors index.css variables)
───────────────────────────────────────────────────────────── */
const C = {
  navy:        '#002366',
  navyLight:   '#1a3c7a',
  navyDark:    '#00153d',
  gold:        '#fece44',
  goldLight:   '#feda75',
  goldDark:    '#e5b630',
  textRich:    '#0a0a0a',
  textMuted:   '#525252',
  surface:     '#ffffff',
  surfaceBg:   '#f8fafc',
  border:      '#e5e7eb',
}

const font = "'Inter', system-ui, -apple-system, sans-serif"

/* ─────────────────────────────────────────────────────────────
   SKELETON SHIMMER
───────────────────────────────────────────────────────────── */
const   Shimmer = ({ w = '100%', h = 200, radius = 8 }) => (
  <div style={{
    width: w, height: h, borderRadius: radius,
    background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.5s infinite linear',
  }} />
)

/* ─────────────────────────────────────────────────────────────
   COUNTDOWN BLOCK
───────────────────────────────────────────────────────────── */
const TimerBox = ({ label, value }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: C.navy, borderRadius: 10, padding: '0.75rem 1.1rem',
    minWidth: 60,
  }}>
    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: C.gold, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
      {String(value).padStart(2, '0')}
    </span>
    <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>
      {label}
    </span>
  </div>
)

const CountdownTimer = ({ endTime }) => {
  const { d, h, m, s, ended } = useCountdown(endTime)
  if (ended) return (
    <div style={{
      background: '#fef2f2', border: `1px solid #fecaca`, borderRadius: 10,
      padding: '0.75rem 1.25rem', color: '#991b1b', fontWeight: 700, fontSize: '1rem',
      textAlign: 'center',
    }}>
      🔴 Auction Ended
    </div>
  )
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <TimerBox label="Days" value={d} />
      <span style={{ color: C.gold, fontWeight: 800, fontSize: '1.5rem', marginBottom: 14 }}>:</span>
      <TimerBox label="Hrs"  value={h} />
      <span style={{ color: C.gold, fontWeight: 800, fontSize: '1.5rem', marginBottom: 14 }}>:</span>
      <TimerBox label="Min"  value={m} />
      <span style={{ color: C.gold, fontWeight: 800, fontSize: '1.5rem', marginBottom: 14 }}>:</span>
      <TimerBox label="Sec"  value={s} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   IMAGE GALLERY
───────────────────────────────────────────────────────────── */
const ZOOM_SCALE = 2.4

const Gallery = ({ photos, loading }) => {
  const [active, setActive] = useState(0)
  const [zoom, setZoom]     = useState(false)
  const [pos, setPos]       = useState({ x: 50, y: 50 })
  const imgRef              = useRef(null)

  useEffect(() => { setActive(0) }, [photos])

  const handleMouseMove = (e) => {
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width)  * 100
    const y = ((e.clientY - rect.top)  / rect.height) * 100
    setPos({ x, y })
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Shimmer h={440} />
      <div style={{ display: 'flex', gap: 8 }}>
        {[0,1,2].map(i => <Shimmer key={i} w={80} h={80} radius={8} />)}
      </div>
    </div>
  )

  const imgs = photos?.length ? photos : ['https://placehold.co/800x600/002366/fece44?text=No+Image']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Main image with zoom */}
      <div
        ref={imgRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 14,
          border: `2px solid ${C.border}`, cursor: zoom ? 'crosshair' : 'default',
          background: C.surfaceBg, aspectRatio: '4/3',
        }}
      >
        <motion.img
          key={active}
          src={imgs[active]}
          alt="Auction item"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transformOrigin: `${pos.x}% ${pos.y}%`,
            transform: zoom ? `scale(${ZOOM_SCALE})` : 'scale(1)',
            transition: zoom ? 'transform 0.15s ease' : 'transform 0.25s ease',
            display: 'block',
          }}
        />
        {zoom && (
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            fontSize: '0.7rem', padding: '3px 8px', borderRadius: 20,
            backdropFilter: 'blur(4px)',
          }}>
            🔍 Hover to zoom
          </div>
        )}
        {!zoom && (
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'rgba(0,0,0,0.45)', color: '#fff',
            fontSize: '0.7rem', padding: '3px 8px', borderRadius: 20,
            backdropFilter: 'blur(4px)',
          }}>
            🔍 Hover to zoom
          </div>
        )}
        {/* photo count badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(0,35,102,0.75)', color: '#fff',
          fontSize: '0.72rem', fontWeight: 600,
          padding: '3px 10px', borderRadius: 20, backdropFilter: 'blur(4px)',
        }}>
          {active + 1} / {imgs.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {imgs.map((img, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActive(i)}
            style={{
              flexShrink: 0, width: 72, height: 72, borderRadius: 8,
              overflow: 'hidden', cursor: 'pointer',
              border: `2px solid ${i === active ? C.gold : C.border}`,
              transition: 'border-color 0.2s',
            }}
          >
            <img src={img} alt={`thumb-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   BIDDING STATS CARD
───────────────────────────────────────────────────────────── */
const BiddingCard = ({ data, loading }) => {
  if (loading) return <Shimmer h={220} />
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '1.5rem',
      boxShadow: '0 4px 24px rgba(0,35,102,0.07)',
    }}>
      {/* Status badge */}
      <div style={{ marginBottom: '1rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.07em',
          ...(data?.status === 'ACTIVE'
            ? { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }
            : { background: '#f0f4ff', color: C.navy, border: `1px solid rgba(0,35,102,0.15)` }),
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: data?.status === 'ACTIVE' ? '#10b981' : C.gold,
            display: 'inline-block',
            animation: data?.status === 'ACTIVE' ? 'bid-pulse 0.9s ease-out infinite' : 'none',
          }} />
          {data?.status ?? 'ACTIVE'}
        </span>
      </div>

      <h1 style={{ color: C.navy, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3 }}>
        {data?.title ?? '—'}
      </h1>

      {/* Price row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.25rem' }}>
        <div style={{
          background: C.surfaceBg, borderRadius: 10, padding: '0.875rem',
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: '0.72rem', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Current Bid
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy }}>
            {formatINR(data?.currentHighestBid || data?.startingPrice)}
          </div>
        </div>
        <div style={{
          background: 'rgba(254,206,68,0.08)', borderRadius: 10, padding: '0.875rem',
          border: `1px solid rgba(254,206,68,0.3)`,
        }}>
          <div style={{ fontSize: '0.72rem', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Starting Price
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.goldDark }}>
            {formatINR(data?.startingPrice)}
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.72rem', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>
          ⏰ Time Remaining
        </div>
        {data?.endTime
          ? <CountdownTimer endTime={data.endTime} />
          : <Shimmer h={72} radius={10} />
        }
      </div>

      {/* Bidder count */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0.625rem 1rem', background: C.surfaceBg,
        borderRadius: 8, border: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: '1.1rem' }}>👥</span>
        <span style={{ fontSize: '0.875rem', color: C.textMuted }}>
          <strong style={{ color: C.navy }}>{data?.bidderCount ?? 0}</strong> bidders watching
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SELLER CREDIBILITY CARD
───────────────────────────────────────────────────────────── */
const StarRating = ({ rating = 0 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? C.gold : '#d1d5db', fontSize: '1rem' }}>★</span>
    ))}
  </div>
)

const SellerCard = ({ seller, loading }) => {
  if (loading) return <Shimmer h={160} />
  const s = seller ?? {}
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '1.25rem',
      boxShadow: '0 4px 24px rgba(0,35,102,0.07)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '1.25rem', fontWeight: 800, color: C.gold,
        }}>
          {(s.name ?? 'S')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, color: C.textRich, fontSize: '1rem' }}>
              {s.name ?? 'Seller'}
            </span>
            {s.verified && (
              <span style={{
                background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0',
                fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                ✓ Verified
              </span>
            )}
          </div>
          <StarRating rating={s.rating ?? 4} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
        <div style={{
          background: C.surfaceBg, borderRadius: 8, padding: '0.625rem',
          border: `1px solid ${C.border}`, textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: C.navy }}>
            {s.successRate ?? '—'}%
          </div>
          <div style={{ fontSize: '0.7rem', color: C.textMuted, marginTop: 2 }}>Success Rate</div>
        </div>
        <div style={{
          background: C.surfaceBg, borderRadius: 8, padding: '0.625rem',
          border: `1px solid ${C.border}`, textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: C.navy }}>
            {s.handoffs ?? 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: C.textMuted, marginTop: 2 }}>Handoffs Done</div>
        </div>
      </div>

      <Link
        to={`/sellers/${s._id ?? ''}`}
        style={{
          display: 'block', textAlign: 'center',
          padding: '0.5rem 1rem', borderRadius: 8,
          border: `1px solid ${C.navy}`, color: C.navy,
          fontWeight: 600, fontSize: '0.85rem',
          textDecoration: 'none', transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { e.target.style.background = C.navy; e.target.style.color = '#fff' }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = C.navy }}
      >
        View Seller Profile →
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   INFO TABS
───────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'description', label: '📄 Description' },
  { id: 'handoff',     label: '📍 Handoff Location' },
  { id: 'rules',       label: '📋 Platform Rules' },
]

const InfoTabs = ({ data, loading }) => {
  const [active, setActive] = useState('description')

  const tabContent = {
    description: (
      <div style={{ color: C.textMuted, lineHeight: 1.8, fontSize: '0.95rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[100, 80, 90, 60].map((w, i) => <Shimmer key={i} w={`${w}%`} h={18} radius={4} />)}
          </div>
        ) : (
          <p style={{ margin: 0 }}>{data?.description ?? 'No description provided.'}</p>
        )}
      </div>
    ),
    handoff: (
      <div>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '1rem', background: '#f0f4ff',
          borderRadius: 10, border: `1px solid rgba(0,35,102,0.12)`, marginBottom: '1rem',
        }}>
          <span style={{ fontSize: '1.75rem' }}>📍</span>
          <div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: '1rem' }}>
              {data?.handoffLocation ?? 'Public Location — Surat, Gujarat'}
            </div>
            <div style={{ color: C.textMuted, fontSize: '0.875rem', marginTop: 4 }}>
              Handoff must happen in a safe, public area. Both parties must confirm handoff via the app before funds are released.
            </div>
          </div>
        </div>
        <div style={{
          padding: '0.875rem 1rem', background: 'rgba(254,206,68,0.08)',
          border: `1px solid rgba(254,206,68,0.3)`, borderRadius: 10,
          fontSize: '0.875rem', color: C.textMuted,
        }}>
          ⚠️ Never share personal home addresses. Always meet in well-lit public places during daytime.
        </div>
      </div>
    ),
    rules: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: '💰', title: '10% Refundable Deposit', body: 'To enter the bidding console, a 10% deposit of the starting price is required. This is fully refunded if you lose the auction.' },
          { icon: '🏆', title: 'Winner Obligation', body: 'The winning bidder must complete the transaction within 48 hours of auction close, or forfeit their deposit.' },
          { icon: '🤝', title: 'Handoff Verification', body: 'Both buyer and seller must complete the handoff flow inside the app. This protects both parties.' },
          { icon: '⚖️', title: 'Dispute Resolution', body: 'In case of disputes, BidKar.in acts as the escrow authority. All bids are legally binding under IT Act 2000.' },
        ].map(({ icon, title, body }) => (
          <div key={title} style={{
            display: 'flex', gap: 12, padding: '0.875rem',
            background: C.surfaceBg, borderRadius: 10, border: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.9rem', marginBottom: 3 }}>{title}</div>
              <div style={{ color: C.textMuted, fontSize: '0.85rem', lineHeight: 1.6 }}>{body}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  }

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,35,102,0.07)',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', borderBottom: `1px solid ${C.border}`,
        overflowX: 'auto',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{
              flexShrink: 0, padding: '0.875rem 1.25rem',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: active === t.id ? 700 : 500,
              color: active === t.id ? C.navy : C.textMuted,
              borderBottom: active === t.id ? `3px solid ${C.gold}` : '3px solid transparent',
              transition: 'all 0.2s ease', fontFamily: font,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          style={{ padding: '1.5rem' }}
        >
          {tabContent[active]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   WAR ROOM CTA
───────────────────────────────────────────────────────────── */
const WarRoomCTA = ({ auctionId, auctionEnded }) => {
  const navigate = useNavigate()

  // Read auth state — adapt these keys to your actual auth store
  const isLoggedIn  = !!localStorage.getItem('token')
  const isVerified  = localStorage.getItem('isVerified') === 'true'

  const handleClick = () => {
    if (!isLoggedIn)  return navigate('/login',   { state: { returnTo: `/auction/${auctionId}` } })
    if (!isVerified)  return navigate('/Verify-email', { state: { returnTo: `/auction/${auctionId}` } })
    navigate(`/auction/${auctionId}/bidding`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.45 }}
      style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
        borderRadius: 16, padding: '1.75rem',
        boxShadow: `0 8px 32px rgba(0,35,102,0.25)`,
        border: `1px solid rgba(254,206,68,0.2)`,
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: C.goldLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Ready to compete?
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
          Enter the Bidding Console and place your bid live.
        </div>
        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
          A 10% refundable deposit is required to activate your bidding seat.
        </div>
      </div>

      <motion.button
        whileHover={!auctionEnded ? { scale: 1.03, boxShadow: `0 6px 24px rgba(254,206,68,0.4)` } : {}}
        whileTap={!auctionEnded ? { scale: 0.97 } : {}}
        onClick={!auctionEnded ? handleClick : undefined}
        disabled={auctionEnded}
        style={{
          width: '100%', padding: '0.875rem',
          background: auctionEnded ? 'rgba(255,255,255,0.15)' : `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
          color: auctionEnded ? 'rgba(255,255,255,0.4)' : C.navy,
          border: 'none', borderRadius: 10,
          fontSize: '1rem', fontWeight: 800,
          cursor: auctionEnded ? 'not-allowed' : 'pointer',
          letterSpacing: '0.02em', fontFamily: font,
          transition: 'all 0.2s ease',
        }}
      >
        {auctionEnded ? '🔒 Auction Closed' : '⚡ Enter Bidding Console'}
      </motion.button>

      {!isLoggedIn && (
        <p style={{ textAlign: 'center', marginTop: '0.75rem', marginBottom: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
          You will be asked to log in first.
        </p>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ERROR / NOT FOUND STATE
───────────────────────────────────────────────────────────── */
const ErrorState = ({ message }) => (
  <div style={{
    minHeight: '60vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16,
    fontFamily: font,
  }}>
    <span style={{ fontSize: '3.5rem' }}>🔍</span>
    <h2 style={{ color: C.navy, margin: 0 }}>Auction Not Found</h2>
    <p style={{ color: C.textMuted, margin: 0 }}>{message}</p>
    <Link to="/" style={{
      padding: '0.625rem 1.5rem', background: C.navy, color: '#fff',
      borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
    }}>
      ← Back to Home
    </Link>
  </div>
)

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const Auction_Detail_Page = () => {
  const { id } = useParams()
  const [data,    setData]    = useState(null)
  const [seller,  setSeller]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    api.get(`/api/auctions/${id}`)
      .then(res => {
        const auction = res.data?.data ?? res.data
        setData(auction)
        // seller may be populated in the response
        if (auction?.sellerId && typeof auction.sellerId === 'object') {
          setSeller(auction.sellerId)
        }
      })
      .catch(err => {
        console.error('Auction fetch error:', err)
        setError(err?.response?.data?.message ?? 'Failed to load auction. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const auctionEnded = data?.status !== 'ACTIVE' || (data?.endTime && new Date(data.endTime) < Date.now())

  if (error) return <ErrorState message={error} />

  return (
    <div style={{ fontFamily: font, background: '#f0f4ff', minHeight: '100vh' }}>

      {/* ── Breadcrumb ── */}
      <div style={{
        background: C.navy, padding: '0.625rem 0',
        borderBottom: `2px solid ${C.gold}`,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
            <Link to="/"      style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link to="/auctions" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Auctions</Link>
            <span>/</span>
            <span style={{ color: C.goldLight, fontWeight: 600 }}>
              {loading ? 'Loading…' : (data?.title ?? 'Item Detail')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)',
          gap: '2rem',
          alignItems: 'start',
        }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
              <Gallery photos={data?.photos} loading={loading} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
              <InfoTabs data={data} loading={loading} />
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
              <BiddingCard data={data} loading={loading} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.45 }}>
              <SellerCard seller={seller} loading={loading} />
            </motion.div>

            <WarRoomCTA auctionId={id} auctionEnded={auctionEnded} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auction_Detail_Page