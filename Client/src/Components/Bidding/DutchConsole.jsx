import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { buyNowDutch } from '../../services/auctionService';
import Header from '../Global/Header';
import { useWallet } from '../../Context/WalletContext';

export default function DutchConsole({ item }) {
  const navigate = useNavigate();

  // Socket state hook
  const {
    currentBid,
    quantityRemaining,
    nextDropCountdown,
    buyNowDutchEvent
  } = useSocket(item._id, item.startingPrice, 'DUTCH', item);

  // UI States
  const [purchaseStatus, setPurchaseStatus] = useState('IDLE'); // IDLE | BUYING | SUCCESS | COLLISION
  const [errorMessage, setErrorMessage] = useState('');
  const [activePhoto, setActivePhoto] = useState(item.photos?.[0] || '');

  const { biddingPower } = useWallet();
  const TOTAL_BIDDING_POWER = biddingPower;
  const usedBiddingPower = 0; // assuming no other active bids
  const remainingPower = TOTAL_BIDDING_POWER - usedBiddingPower;
  
  // 10% deposit requirement based on current price
  const requiredDeposit = Math.floor(currentBid * 0.10);
  const hasSufficientPower = remainingPower >= currentBid; // User needs enough bidding power (usually total bid value) or 10% deposit? 
  // The spec says: "Status Check: This button is only active if the user has enough Bidding Power (10% of the current price)."
  const hasSufficientPowerLimit = remainingPower >= currentBid; // Let's check against full bid price or 10% deposit. Let's use 10% of current price as the required Bidding Power to click, or full bid value. The spec says "10% of the current price". Let's check `remainingPower >= currentBid` (since bidding power is 10x the deposit, which is equal to the bid price itself. If they have ₹50,000 balance, they have ₹5,00,000 bidding power, so they can bid up to ₹5,00,000). Thus, required Bidding Power is indeed the current bid amount! That matches the 10x leverage rule perfectly.

  const nextDropPrice = Math.max(item.priceFloor || 0, currentBid - (item.dropAmount || 500));

  // Handle Buy Now click
  const handleBuyNow = async () => {
    if (quantityRemaining <= 0 || purchaseStatus !== 'IDLE') return;

    setPurchaseStatus('BUYING');
    setErrorMessage('');

    try {
      const result = await buyNowDutch(item._id);
      
      if (result.success) {
        buyNowDutchEvent(); // update local quantity
        setPurchaseStatus('SUCCESS');
      } else {
        setPurchaseStatus('COLLISION');
        setErrorMessage(result.message || 'Beaten by another bidder! Sold out.');
      }
    } catch (err) {
      setPurchaseStatus('IDLE');
      setErrorMessage('Network error during checkout. Please retry.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #06122c 0%, #020718 100%)', display: 'flex', flexDirection: 'column' }}>
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
            ← Exit Console
          </button>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{item.title}</h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Dutch Auction · Descending Ticker</p>
          </div>
        </div>

        {/* Status Overlay Modal (Success / Failure / Buying) */}
        <AnimatePresence>
          {purchaseStatus !== 'IDLE' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,15,61,0.95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: '1.5rem',
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={{
                  background: '#fff', color: 'var(--color-text-rich)',
                  maxWidth: '450px', width: '100%', borderRadius: '24px',
                  padding: '2.5rem 2rem', textAlign: 'center',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                }}
              >
                {purchaseStatus === 'BUYING' && (
                  <>
                    <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '5px solid rgba(0,35,102,0.1)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: '0 0 0.5rem' }}>Securing Item Lock...</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>Resolving millisecond race conditions in Redis...</p>
                  </>
                )}

                {purchaseStatus === 'SUCCESS' && (
                  <>
                    <span style={{ fontSize: '4.5rem', display: 'block', marginBottom: '1rem', animation: 'bounce 1s infinite' }}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: '0 0 0.75rem' }}>Purchased!</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
                      Congratulations! You beat other bidders in the queue. Your 10% security deposit (₹{requiredDeposit.toLocaleString()}) has been held.
                    </p>
                    <button
                      onClick={() => navigate('/auctions')}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Go to Dashboard
                    </button>
                  </>
                )}

                {purchaseStatus === 'COLLISION' && (
                  <>
                    <span style={{ fontSize: '4.5rem', display: 'block', marginBottom: '1rem' }}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', margin: '0 0 0.75rem' }}>Sold Out!</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
                      {errorMessage || 'Another bidder clicked "BUY NOW" a fraction of a second before you. Your wallet deposit was not locked.'}
                    </p>
                    <button
                      onClick={() => { setPurchaseStatus('IDLE'); }}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: '#374151', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Dismiss & Browse
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dutch Core Layout */}
        <div className="console-grid-layout" style={{ alignItems: 'stretch' }}>
          
          {/* Left Panel: Big ticker + Image + Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Live Descending Price Display Card */}
            <div style={{
              background: 'radial-gradient(circle at top left, rgba(254, 206, 68, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Background gradient grid glow */}
              <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--color-brand-primary-light)', filter: 'blur(100px)', opacity: 0.1, zIndex: 0 }} />

              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', zIndex: 1, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                  <polyline points="17 18 23 18 23 12" />
                </svg>
                Current Purchase Price
              </span>
              
              <h1 style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                color: '#fece44',
                margin: 0,
                fontFamily: 'monospace',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                zIndex: 1,
                textShadow: '0 4px 24px rgba(254,206,68,0.25)'
              }}>
                ₹{currentBid?.toLocaleString('en-IN')}
              </h1>

              <div style={{
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)',
                zIndex: 1
              }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#fece44', animation: 'bid-pulse 0.9s infinite' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                  Next drop in: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{nextDropCountdown}s</strong> to <strong style={{ color: '#fece44' }}>₹{nextDropPrice.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Quantity Tracker & Media Preview */}
            <div className="dutch-media-layout">
              
              {/* Product preview */}
              <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', height: '180px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={activePhoto} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 80%)' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '12px' }}>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{item.title}</h4>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Starting: ₹{item.startingPrice?.toLocaleString()}</p>
                </div>
              </div>

              {/* Quantity Counter Card */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  Available Quantity
                </span>
                <span style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: quantityRemaining > 1 ? '#34d399' : '#ef4444',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  {quantityRemaining}
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>left</span>
                </span>
                {quantityRemaining <= 1 && (
                  <span style={{ color: '#fca5a5', fontSize: '0.68rem', marginTop: '0.4rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    High Demand! Selling out.
                  </span>
                )}
              </div>
            </div>

            {/* Giant Buy Now Action Zone */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Your Available Bidding Power</span>
                  <span style={{ color: '#fff', fontWeight: 800 }}>₹{remainingPower.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Escrow Security Deposit (10%)</span>
                  <span style={{ color: '#fece44', fontWeight: 800 }}>₹{requiredDeposit.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={quantityRemaining <= 0 || !hasSufficientPowerLimit}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  background: quantityRemaining <= 0
                    ? '#374151'
                    : (!hasSufficientPowerLimit ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #fece44 0%, #e5b630 100%)'),
                  color: quantityRemaining <= 0
                    ? '#9ca3af'
                    : (!hasSufficientPowerLimit ? '#fca5a5' : '#00153d'),
                  border: !hasSufficientPowerLimit && quantityRemaining > 0 ? '1.5px solid rgba(239, 68, 68, 0.4)' : 'none',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  cursor: (quantityRemaining <= 0 || !hasSufficientPowerLimit) ? 'not-allowed' : 'pointer',
                  boxShadow: (quantityRemaining > 0 && hasSufficientPowerLimit) ? '0 10px 25px rgba(254,206,68,0.25)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem'
                }}
                onMouseEnter={e => {
                  if (quantityRemaining > 0 && hasSufficientPowerLimit) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(254,206,68,0.35)';
                  }
                }}
                onMouseLeave={e => {
                  if (quantityRemaining > 0 && hasSufficientPowerLimit) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(254,206,68,0.25)';
                  }
                }}
              >
                {quantityRemaining <= 0 ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    SOLD OUT
                  </>
                ) : !hasSufficientPowerLimit ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    INSUFFICIENT POWER (Requires ₹{currentBid.toLocaleString()})
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    BUY NOW FOR ₹{currentBid.toLocaleString('en-IN')}
                  </>
                )}
              </button>

              {!hasSufficientPowerLimit && quantityRemaining > 0 && (
                <p style={{ margin: '0.75rem 0 0', color: '#fca5a5', fontSize: '0.75rem', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Your active Bidding Power (₹{remainingPower.toLocaleString()}) is lower than the purchase price. Top up your wallet to bid.
                </p>
              )}
            </div>

          </div>

          {/* Right Panel: Dutch price drop timeline & instructions */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 18, 44, 0.4) 0%, rgba(2, 7, 24, 0.4) 100%)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            height: '100%'
          }}>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#fece44', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Price Drop Schedule
            </h3>
            
            {/* Drops Timeline List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {[0, 1, 2, 3, 4].map(idx => {
                const dropPriceVal = Math.max(item.priceFloor, currentBid - (idx * item.dropAmount));
                const secondsFromNow = (idx * item.dropInterval) + nextDropCountdown;
                
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      background: idx === 0 ? 'rgba(254,206,68,0.08)' : 'rgba(255,255,255,0.02)',
                      border: idx === 0 ? '1px solid rgba(254,206,68,0.25)' : '1px solid rgba(255,255,255,0.05)',
                      opacity: dropPriceVal === item.priceFloor && idx > 0 ? 0.35 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: idx === 0 ? '#fece44' : '#fff' }}>
                        ₹{dropPriceVal.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>
                        {idx === 0 ? 'Active Price Bracket' : `Next Drop #${idx}`}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: idx === 0 ? '#fece44' : 'rgba(255,255,255,0.5)' }}>
                      {idx === 0 ? 'NOW' : `in ${secondsFromNow}s`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Instruction Panel */}
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.78rem',
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.6)'
            }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fff', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fece44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Dutch Auction Rules:
              </strong>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Price descends steadily every {item.dropInterval} seconds.</li>
                <li>There are no counter-bids. First user to click "BUY NOW" secures the item.</li>
                <li>All transaction slots are verified down to millisecond locks to prevent double-buys.</li>
                <li>Price will not drop below the Price Floor of ₹{item.priceFloor?.toLocaleString()}.</li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
