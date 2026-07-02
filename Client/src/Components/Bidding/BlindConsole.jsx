import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { submitBlindBid } from '../../services/auctionService';
import BlindReveal from './BlindReveal';
import Header from '../Global/Header';
import { useWallet } from '../../Context/WalletContext';

export default function BlindConsole({ item }) {
  const navigate = useNavigate();

  // Load user info from localStorage or use mock name
  const username = 'You';

  // Read existing bid from local storage on mount
  const getSavedBid = () => {
    const data = localStorage.getItem(`blind_bid:${item._id}:${username}`);
    return data ? JSON.parse(data) : null;
  };

  const savedBid = getSavedBid();

  // Socket state hook
  const {
    nextDropCountdown: timerSeconds, // repurposed countdown for deadline/reveal
    blindBidsList,
    isRevealed,
    submitBlindBidEvent
  } = useSocket(item._id, 0, 'BLIND', item);

  // UI States
  const [maxBid, setMaxBid] = useState(savedBid ? String(savedBid.amount) : '');
  const [isMasked, setIsMasked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSealed, setIsSealed] = useState(!!savedBid);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastEdited, setLastEdited] = useState(savedBid ? savedBid.timestamp : null);

  const { biddingPower } = useWallet();
  const TOTAL_BIDDING_POWER = biddingPower;

  // Deadline & Reveal tracking
  const now = Date.now();
  const deadlinePassed = new Date(item.submissionDeadline).getTime() <= now;

  // Format time (DDd HH:MM:SS)
  const formatTime = (totalSec) => {
    if (totalSec <= 0) return '00:00:00';
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
  };

  const handlePlaceBlindBid = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const parsed = parseInt(maxBid.replace(/,/g, ''), 10);
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg('Please enter a valid bid amount.');
      return;
    }

    if (parsed > TOTAL_BIDDING_POWER) {
      setErrorMsg(`Bid exceeds your available Bidding Power (₹${TOTAL_BIDDING_POWER.toLocaleString()})`);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitBlindBid(item._id, parsed, username);
      submitBlindBidEvent(parsed);
      setLastEdited(new Date().toISOString());
      setIsSealed(true);
      triggerCelebrationEffect();
    } catch (err) {
      setErrorMsg('Error sealing bid. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerCelebrationEffect = () => {
    // Custom animation handler
  };

  // If unsealed reveal status is active, redirect display to reveal component
  if (isRevealed) {
    return (
      <BlindReveal
        item={item}
        userBid={savedBid ? savedBid.amount : 0}
        blindBidsList={blindBidsList}
      />
    );
  }

  // If deadline has passed, render unsealing transitional screen
  if (deadlinePassed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-brand-primary-dark)', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ textShadow: '0 4px 10px rgba(0,0,0,0.3)', textAlign: 'center', color: '#fff', maxWidth: '500px' }}>
            <span style={{ fontSize: '5rem', display: 'block', animation: 'spin 4s linear infinite', marginBottom: '1.5rem' }}>🔒</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fece44' }}>Submission Window Closed</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: '0.5rem 0 2rem' }}>
              Bids have been securely encrypted. Initializing multi-sig unsealing protocol and decrypting envelopes.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '16px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                Unsealing Ticker
              </span>
              <h3 style={{ fontSize: '2.5rem', margin: '0.2rem 0 0', fontFamily: 'monospace', fontWeight: 900, color: '#10b981' }}>
                {timerSeconds}s remaining
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-brand-primary-dark)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <button
            onClick={() => navigate(`/auction/${item._id}`)}
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            ← Exit Portal
          </button>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{item.title}</h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Blind Bid Portal · Secure Submission</p>
          </div>
        </div>

        {/* Portal Core Layout */}
        <div className="console-grid-layout" style={{ alignItems: 'stretch' }}>
          
          {/* Left Panel: Envelope Animation and Bidding Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Sealed Status & Animation Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              
              {/* Animated Envelope Representation */}
              <div style={{ position: 'relative', width: '150px', height: '100px', marginBottom: '1.5rem' }}>
                <AnimatePresence mode="wait">
                  {isSealed ? (
                    <motion.div
                      key="sealed"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* Envelope SVG with Wax Seal */}
                      <svg width="150" height="100" viewBox="0 0 150 100" fill="none">
                        <rect width="150" height="100" rx="10" fill="#fece44" />
                        <path d="M0 10 L75 60 L150 10" stroke="#002366" strokeWidth="3" />
                        <path d="M0 90 L55 50" stroke="#002366" strokeWidth="2" />
                        <path d="M150 90 L95 50" stroke="#002366" strokeWidth="2" />
                        {/* Red Wax Seal */}
                        <circle cx="75" cy="55" r="16" fill="#dc2626" />
                        <circle cx="75" cy="55" r="12" fill="#ef4444" />
                        <path d="M72 50 L78 60 M78 50 L72 60" stroke="#fff" strokeWidth="2" />
                      </svg>
                      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#34d399', marginTop: '0.8rem' }}>
                        ✔ BID SEALED & ENCRYPTED
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="unsealed"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* Open Envelope SVG */}
                      <svg width="150" height="100" viewBox="0 0 150 100" fill="none">
                        <rect y="20" width="150" height="80" rx="10" fill="rgba(255,255,255,0.1)" />
                        <path d="M0 20 L75 0 L150 20" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
                        <path d="M0 20 L75 70 L150 20" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                      </svg>
                      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginTop: '0.8rem' }}>
                        WAITING FOR PRIVATE BID ENTRY
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isSealed && lastEdited && (
                <div style={{ background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.78rem', color: '#a7f3d0' }}>
                  🔒 Your sealed bid of <strong>₹{parseInt(maxBid, 10).toLocaleString()}</strong> was recorded on {new Date(lastEdited).toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Submission Input Box */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '1.5rem',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 800, color: '#fece44', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🔒 Secure Bid Input
              </h3>

              <form onSubmit={handlePlaceBlindBid} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label htmlFor="blind-bid-field" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                      Enter Secret Max Bid (₹)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMasked(!isMasked)}
                      style={{ background: 'none', border: 'none', color: '#fece44', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {isMasked ? '👁️ Show Bid' : '🙈 Hide Bid'}
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>₹</span>
                    <input
                      id="blind-bid-field"
                      type={isMasked ? 'password' : 'text'}
                      disabled={TOTAL_BIDDING_POWER < item.startingPrice}
                      placeholder={TOTAL_BIDDING_POWER < item.startingPrice ? 'INSUFFICIENT POWER' : "Enter amount (e.g. 150000)"}
                      value={maxBid}
                      onChange={e => setMaxBid(e.target.value.replace(/[^0-9]/g, ''))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        outline: 'none',
                        letterSpacing: isMasked ? '0.2em' : 'normal',
                        opacity: TOTAL_BIDDING_POWER < item.startingPrice ? 0.5 : 1,
                      }}
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#fca5a5', fontWeight: 600 }}>
                    ❌ {errorMsg}
                  </p>
                )}

                {TOTAL_BIDDING_POWER < item.startingPrice && (
                  <div style={{ color: '#fca5a5', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontWeight: 600 }}>
                    ⚠️ Bidding locked. Your Bidding Power is lower than the starting price (₹{item.startingPrice?.toLocaleString()}). Please top up your wallet.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {isSealed && (
                    <button
                      type="button"
                      onClick={() => setIsSealed(false)}
                      style={{
                        flex: 1, padding: '0.8rem', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.08)', color: '#fff',
                        border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                        fontWeight: 700, fontSize: '0.9rem'
                      }}
                    >
                      ✏️ Edit Bid
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || isSealed || TOTAL_BIDDING_POWER < item.startingPrice || (maxBid && parseInt(maxBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER)}
                    style={{
                      flex: 2, padding: '0.8rem', borderRadius: '12px',
                      background: (isSealed || TOTAL_BIDDING_POWER < item.startingPrice || (maxBid && parseInt(maxBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER)) ? '#1f2937' : 'var(--color-brand-primary)',
                      color: (isSealed || TOTAL_BIDDING_POWER < item.startingPrice || (maxBid && parseInt(maxBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER)) ? 'rgba(255,255,255,0.3)' : '#fff',
                      border: 'none', cursor: (isSealed || TOTAL_BIDDING_POWER < item.startingPrice || (maxBid && parseInt(maxBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER)) ? 'not-allowed' : 'pointer',
                      fontWeight: 800, fontSize: '0.9rem',
                      boxShadow: !(isSealed || TOTAL_BIDDING_POWER < item.startingPrice || (maxBid && parseInt(maxBid.replace(/,/g, ''), 10) > TOTAL_BIDDING_POWER)) ? '0 4px 12px rgba(0,35,102,0.3)' : 'none',
                    }}
                  >
                    {isSubmitting ? 'Encrypting...' : (isSealed ? '🔒 Locked' : (TOTAL_BIDDING_POWER < item.startingPrice ? '🔐 Locked' : 'Stamp & Seal Bid'))}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Panel: Countdown and Educational block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Submission countdown card */}
            <div style={{
              background: 'var(--color-brand-primary-light)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '1.5rem',
              color: '#fff',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>
                ⌛ Time Until Decryption
              </span>
              <h2 style={{ fontSize: '2.5rem', margin: '0.3rem 0 0', fontFamily: 'monospace', fontWeight: 900, color: '#fece44' }}>
                {formatTime(timerSeconds)}
              </h2>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                Closes at: {new Date(item.submissionDeadline).toLocaleTimeString()}
              </p>
            </div>

            {/* Instruction / Rules card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '1.5rem',
              color: '#fff',
              fontSize: '0.8rem',
              lineHeight: 1.5,
            }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#fece44', fontWeight: 800 }}>🛡️ How Blind Auctions Work:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'rgba(255,255,255,0.6)' }}>
                <li>Your bid is private. No other participant can see your amount, preventing strategic price manipulation.</li>
                <li>You can edit and re-submit your bid as many times as you like until the deadline.</li>
                <li>Once the countdown reaches zero, all bids are unmasked automatically during a 15-second reveal cycle.</li>
                <li>A 10% refundable security deposit is calculated based on your submitted bid. Ensure your Bidding Power (₹{TOTAL_BIDDING_POWER.toLocaleString()}) covers this.</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
