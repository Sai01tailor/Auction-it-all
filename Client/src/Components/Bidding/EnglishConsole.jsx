import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { placeBid } from '../../services/auctionService';
import LiveLeaderboard from './LiveLeaderboard';
import Header from '../Global/Header';
import { useWallet } from '../../Context/WalletContext';
import { useAuth } from '../../Context/AuthContext';

export default function EnglishConsole({ item }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Socket state hook
  const {
    currentBid,
    totalBids,
    lastBidder,
    placeBidSocket,
    socketError,
    setSocketError,
    bidHistoryList,
    viewerCount
  } = useSocket(item._id, item.currentHighestBid, 'ENGLISH', item);

  const bidderName = typeof lastBidder === 'object' ? lastBidder?.username : lastBidder;
  const isHighestBidder = bidderName === 'You' || bidderName === 'you' || (user?.username && bidderName === user.username);

  // UI state
  const [customBid, setCustomBid] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [activePhoto, setActivePhoto] = useState(item.photos?.[0] || '');

  useEffect(() => {
    if (socketError) {
      setErrorMsg(socketError);
      setShake(true);
    }
  }, [socketError]);

  // Time remaining tracking
  const [timeLeft, setTimeLeft] = useState(0);
  const [endTime, setEndTime] = useState(new Date(item.endTime).getTime());

  const { biddingPower, walletBalance } = useWallet();
  const TOTAL_BIDDING_POWER = biddingPower;
  const [userBid, setUserBid] = useState(0);

  // Compute locked deposit (10% of user's highest placed bid)
  const lockedDeposit = Math.floor(userBid * 0.1);
  const usedBiddingPower = userBid; // User locks the full bid value against their power limit
  const remainingPower = TOTAL_BIDDING_POWER - usedBiddingPower;

  // Determine current price bracket increment
  const getMinIncrement = (price) => {
    if (price < 10000) return 250;
    if (price < 50000) return 500;
    return 1000;
  };

  const minIncrement = getMinIncrement(currentBid);

  // Pre-calculated smart increments
  const smartIncrements = [
    currentBid + minIncrement,
    currentBid + (minIncrement * 2),
    currentBid + (minIncrement * 4)
  ];

  // Tick down timer
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  // Synchronize outbid alert when leading bidder changes
  useEffect(() => {
    if (bidHistoryList.length > 1) {
      const lastBid = bidHistoryList[0];
      const prevBid = bidHistoryList[1];
      if (prevBid.bidder === 'You' && lastBid.bidder !== 'You') {
        triggerAlert('You have been outbid! Place a higher bid.');
      }
    }
  }, [bidHistoryList]);

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 5000);
  };

  // Format time (DDd HH:MM:SS)
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00:00 (ENDED)';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
  };

  // Bidding execution handler
  const handlePlaceBid = async (amount) => {
    setErrorMsg('');
    setShake(false);

    // 1. Validation checks
    if (isHighestBidder) {
      setErrorMsg('You are already the highest bidder! Bidding is locked until you are outbid.');
      setShake(true);
      return;
    }

    if (amount <= currentBid) {
      setErrorMsg(`Bid must be greater than current highest bid (₹${currentBid.toLocaleString()})`);
      setShake(true);
      return;
    }

    if (amount - currentBid < minIncrement) {
      setErrorMsg(`Minimum increment for this bracket is ₹${minIncrement}`);
      setShake(true);
      return;
    }

    if (amount > TOTAL_BIDDING_POWER) {
      setErrorMsg(`Bid exceeds your total Bidding Power (₹${TOTAL_BIDDING_POWER.toLocaleString()})`);
      setShake(true);
      return;
    }

    // 2. Execute bid placement
    try {
      placeBidSocket(amount);
      setUserBid(amount);
      setCustomBid('');

      // Simulating popcorn bidding: extend timer by 2 minutes if bid is placed within last 60 seconds
      if (timeLeft < 60) {
        setEndTime(prev => prev + 120 * 1000); // add 2 mins
        triggerAlert('Bid placed in final minute! Auction extended by 2 minutes.');
      }
    } catch (err) {
      setErrorMsg('Failed to broadcast bid. Please retry.');
      setShake(true);
    }
  };

  const submitCustomBid = (e) => {
    e.preventDefault();
    const parsed = parseInt(customBid.replace(/,/g, ''), 10);
    if (isNaN(parsed)) {
      setErrorMsg('Please enter a valid bid amount.');
      setShake(true);
      return;
    }
    handlePlaceBid(parsed);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-brand-primary-dark)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Inline System Alert Bar */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              background: '#fece44',
              color: 'var(--color-brand-primary-dark)',
              textAlign: 'center',
              padding: '0.75rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              zIndex: 100,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{alertMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Grid Container */}
      <div style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Back navigation & Title bar */}
        <div className="console-top-bar">
          <button
            onClick={() => navigate(`/auction/${item._id}`)}
            className="console-exit-btn"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Exit Live Console
          </button>
          <div className="console-header-title-box">
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{item.title}</h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>English Bidding Console · Live Room</p>
          </div>
        </div>

        {/* Console layout */}
        <div className="console-grid-layout" style={{ alignItems: 'stretch' }}>

          {/* Left panel: Media, Input, status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Focus Gallery + Countdown Box */}
            <div className="gallery-grid-layout" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1rem' }}>
              {/* Vertical thumbnail strip */}
              <div className="gallery-thumbnails">
                {item.photos?.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt=""
                    onClick={() => setActivePhoto(photo)}
                    style={{
                      width: '65px',
                      height: '55px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: activePhoto === photo ? '2px solid #fece44' : '2px solid transparent',
                      opacity: activePhoto === photo ? 1 : 0.6,
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>

              {/* Central Main active photo and countdown timer overlay */}
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '200px' }}>
                <img src={activePhoto} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                {/* Real-time pulsing timer overlay */}
                <div style={{
                  position: 'absolute', bottom: '10px', right: '10px',
                  background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.95)' : 'rgba(0, 35, 102, 0.9)',
                  color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px',
                  fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace',
                  border: timeLeft < 60 ? '1px solid #fca5a5' : '1px solid rgba(255,255,255,0.2)',
                  animation: timeLeft < 60 ? 'bid-pulse 1s ease-out infinite' : 'none',
                  display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            {/* Bidding Power Meter Card */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fece44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Bidding Power Limit
                </span>
                <span style={{ color: '#fff', fontWeight: 700 }}>
                  ₹{(TOTAL_BIDDING_POWER - usedBiddingPower).toLocaleString('en-IN')} Available
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                <div style={{
                  height: '100%',
                  width: `${TOTAL_BIDDING_POWER > 0 ? (usedBiddingPower / TOTAL_BIDDING_POWER) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #fece44 0%, #10b981 100%)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>
                <span>Used Power: ₹{usedBiddingPower.toLocaleString()}</span>
                <span>Total Limit: ₹{TOTAL_BIDDING_POWER.toLocaleString()}</span>
              </div>
              <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'rgba(254, 206, 68, 0.85)', background: 'rgba(254, 206, 68, 0.05)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(254, 206, 68, 0.15)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Placed bids lock a 10% cash equivalent deposit (e.g. ₹{lockedDeposit.toLocaleString()} locked of your wallet balance) on win.</span>
              </div>
            </div>

            {/* Live Bid Input Zone */}
            <motion.div
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '1.25rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
              }}
            >
              <h3 style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', fontWeight: 800, color: '#fece44', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fece44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Quick Bid Actions
              </h3>

              {/* Presets Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {smartIncrements.map((price, idx) => {
                  const cannotBid = price > TOTAL_BIDDING_POWER || isHighestBidder;
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePlaceBid(price)}
                      disabled={cannotBid}
                      style={{
                        background: cannotBid ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.08)',
                        border: cannotBid ? '1.5px solid rgba(239, 68, 68, 0.2)' : '1.5px solid rgba(16, 185, 129, 0.3)',
                        color: cannotBid ? '#fca5a5' : '#34d399',
                        borderRadius: '12px',
                        padding: '0.75rem 0.5rem',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        cursor: cannotBid ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: cannotBid ? 0.6 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                      }}
                      onMouseEnter={e => {
                        if (!cannotBid) {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!cannotBid) {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      + ₹{(price - currentBid).toLocaleString()}
                      <span style={{ display: 'block', fontSize: '0.68rem', color: cannotBid ? '#fca5a5' : 'rgba(255,255,255,0.4)', marginTop: '0.1rem', fontWeight: 500 }}>
                        {isHighestBidder ? 'LEADING' : cannotBid ? 'LOCKED' : `₹${price.toLocaleString()}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom manual bid field */}
              <form onSubmit={submitCustomBid} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label htmlFor="custom-bid-input" style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Or Enter Custom Bid Amount (₹)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>₹</span>
                    <input
                      id="custom-bid-input"
                      type="text"
                      disabled={TOTAL_BIDDING_POWER < (currentBid + minIncrement) || isHighestBidder}
                      placeholder={
                        isHighestBidder
                          ? 'YOU ARE THE HIGHEST BIDDER'
                          : TOTAL_BIDDING_POWER < (currentBid + minIncrement)
                            ? 'INSUFFICIENT POWER'
                            : `Min: ${(currentBid + minIncrement).toLocaleString()}`
                      }
                      value={customBid}
                      onChange={e => setCustomBid(e.target.value.replace(/[^0-9]/g, ''))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1.5px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        opacity: (TOTAL_BIDDING_POWER < (currentBid + minIncrement) || isHighestBidder) ? 0.5 : 1,
                      }}
                      onFocus={e => e.target.style.borderColor = '#fece44'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                </div>

                {isHighestBidder && (
                  <div style={{ color: '#10b981', fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.6rem 0.85rem', borderRadius: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>You are currently the highest bidder (Leading). Bidding is locked until someone outbids you.</span>
                  </div>
                )}

                {errorMsg && (
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {errorMsg}
                  </p>
                )}

                {TOTAL_BIDDING_POWER < (currentBid + minIncrement) && !isHighestBidder && (
                  <div style={{ color: '#fca5a5', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'start', gap: '0.4rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>Bidding locked. Your Bidding Power is lower than the minimum required bid (₹{(currentBid + minIncrement).toLocaleString()}). Please top up your wallet.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isHighestBidder || TOTAL_BIDDING_POWER < (currentBid + minIncrement) || (customBid && parseInt(customBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER)}
                  style={{
                    background: (isHighestBidder || TOTAL_BIDDING_POWER < (currentBid + minIncrement) || (customBid && parseInt(customBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER)) ? '#1f2937' : 'var(--color-brand-primary)',
                    color: (isHighestBidder || TOTAL_BIDDING_POWER < (currentBid + minIncrement) || (customBid && parseInt(customBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER)) ? 'rgba(255,255,255,0.3)' : '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.8rem',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: (isHighestBidder || TOTAL_BIDDING_POWER < (currentBid + minIncrement) || (customBid && parseInt(customBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER)) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: (isHighestBidder || TOTAL_BIDDING_POWER < (currentBid + minIncrement) || (customBid && parseInt(customBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER)) ? 'none' : '0 4px 12px rgba(0,35,102,0.3)',
                  }}
                  onMouseEnter={e => {
                    if (!(isHighestBidder || TOTAL_BIDDING_POWER < (currentBid + minIncrement) || (customBid && parseInt(customBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER))) {
                      e.currentTarget.style.background = 'var(--color-brand-primary-light)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,35,102,0.4)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!(isHighestBidder || TOTAL_BIDDING_POWER < (currentBid + minIncrement) || (customBid && parseInt(customBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER))) {
                      e.currentTarget.style.background = 'var(--color-brand-primary)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,35,102,0.3)';
                    }
                  }}
                >
                  {isHighestBidder ? 'Bidding Locked (You are Leading)' : 'Confirm Bidding Order'}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right Panel: Live Leaderboard */}
          <div>
            <LiveLeaderboard
              currentBid={currentBid}
              totalBids={totalBids}
              lastBidder={lastBidder}
              bidHistory={bidHistoryList}
              viewerCount={viewerCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
