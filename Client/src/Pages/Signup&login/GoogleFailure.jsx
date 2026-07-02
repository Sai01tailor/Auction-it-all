import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function GoogleFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error') || 'unknown';

  const getErrorMessage = () => {
    switch (errorCode) {
      case 'google_failed':
        return 'Google OAuth handshake failed on the server.';
      case 'cancelled':
        return 'Google sign-in was cancelled or aborted.';
      case 'unauthorized':
        return 'You are not authorized to access this account.';
      default:
        return 'An unexpected error occurred during Google authentication.';
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      background: 'var(--color-surface-bg)',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'var(--color-surface-main)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          maxWidth: '450px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: '#ef4444'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, color: 'var(--color-brand-primary)', fontSize: '1.4rem' }}>
          Authentication Failed
        </h3>
        
        <p style={{ margin: '0 0 2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          {getErrorMessage()}
        </p>

        <button
          onClick={() => navigate('/login')}
          className="btn btn-accent"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(254,206,68,0.2)'
          }}
        >
          Back to Login
        </button>
      </motion.div>
    </div>
  );
}
