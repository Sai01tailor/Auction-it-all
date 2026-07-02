import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../Components/Global/Header';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        {/* Soft radial background highlight pulsing softly */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(254,206,68,0.05) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 1
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          style={{
            background: '#fff',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '28px',
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 15px 40px rgba(0,35,102,0.03)',
            zIndex: 2,
            position: 'relative'
          }}
        >
          {/* Vector Search SVG with scanning/floating animation */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              x: [0, 6, -6, 0],
              rotate: [0, 3, -3, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 4.5,
              ease: "easeInOut"
            }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem', color: 'var(--color-brand-accent-dark)' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <path d="M8 11h.01M12 11h.01" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.1 }}
            style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.25rem', letterSpacing: '-0.05em' }}
          >
            404
          </motion.h1>
          
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-rich)', margin: '0 0 1rem' }}
          >
            Lost in Transit
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 2rem' }}
          >
            The page you are looking for does not exist, has been moved, or was closed after auction resolution.
          </motion.p>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auctions')}
            style={{
              padding: '0.85rem 2rem',
              background: 'var(--color-brand-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,35,102,0.12)',
              width: '100%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand-primary-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-brand-primary)'}
          >
            Go Back to Auctions
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export function WithdrawnPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        {/* Soft radial highlight pulsing */}
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.3, 0.45, 0.3]
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 1
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          style={{
            background: '#fff',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '28px',
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 15px 40px rgba(0,35,102,0.03)',
            zIndex: 2,
            position: 'relative'
          }}
        >
          {/* Vector Danger SVG with scaling/alert pulsing */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem' }}>
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </motion.div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.5rem' }}>
            Auction Withdrawn by Seller
          </h2>
          
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1.5rem' }}>
            This auction has been cancelled by the listing seller. Any escrow deposits currently held for bids on this item have been successfully refunded to your wallet balance.
          </p>
          
          {/* Release Badge with a spring entry */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.2 }}
            style={{
              background: '#ecfdf5',
              padding: '0.75rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              border: '1px solid #a7f3d0',
              fontSize: '0.8rem',
              color: '#065f46',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>10% Bid Deposit Released & Credited</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/wallet')}
            style={{
              padding: '0.85rem 2rem',
              background: 'var(--color-brand-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand-primary-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-brand-primary)'}
          >
            Check Wallet Balance
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00153d 0%, #002366 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative dot mesh overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          padding: '2rem',
          zIndex: 2
        }}
      >
        {/* Vector Gear/Wrench SVG with continuous slow rotation */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem' }}>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </motion.div>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 1rem', letterSpacing: '-0.5px', color: 'var(--color-brand-accent)' }}>
          BidKar is Under Maintenance
        </h1>
        
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 2rem' }}>
          We are upgrading our real-time bidding engines and clearing settlement transactions. We will be back online shortly.
        </p>
        
        {/* Pulsing completion time coordinate badge */}
        <motion.div
          animate={{
            borderColor: ['rgba(254,206,68,0.3)', 'rgba(254,206,68,0.6)', 'rgba(254,206,68,0.3)'],
            boxShadow: [
              '0 0 0 0px rgba(254,206,68,0.05)',
              '0 0 0 10px rgba(254,206,68,0)',
              '0 0 0 0px rgba(254,206,68,0.05)'
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(254,206,68,0.1)',
            color: 'var(--color-brand-accent)',
            padding: '0.6rem 1.5rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            border: '1px solid rgba(254,206,68,0.3)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Scheduled Completion: Today at 6:00 PM IST</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
