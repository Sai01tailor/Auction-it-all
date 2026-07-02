import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';
import { getAuctionById } from '../services/auctionService';
import { useAuth } from '../Context/AuthContext';
import { useWallet } from '../Context/WalletContext';

// Bidding engines components (to be created next)
import EnglishConsole from '../Components/Bidding/EnglishConsole';
import DutchConsole from '../Components/Bidding/DutchConsole';
import BlindConsole from '../Components/Bidding/BlindConsole';

export default function BiddingConsolePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { biddingPower } = useWallet();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    getAuctionById(id)
      .then(data => {
        setItem(data);
      })
      .catch(() => {
        setError('Auction room not found or access denied.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!item || !user) return;

    const isKycVerified = (user.kycStatus?.toLowerCase() === 'verified') || 
                          (user.role === 'SELLER') || 
                          (user.role === 'ADMIN');

    if (!isKycVerified) {
      setAuthError('KYC_REQUIRED');
    } else if (biddingPower < item.startingPrice) {
      setAuthError('DEPOSIT_REQUIRED');
    } else {
      setAuthError(null);
    }
  }, [item, user, biddingPower]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-brand-primary-dark)' }}>
        <Header />
        <div style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 1.5rem', color: '#fff', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '5px solid rgba(255,255,255,0.2)', borderTopColor: '#fece44', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Connecting to secure bidding engine...</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>Verifying 10% deposit and KYC status...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
        <Header />
        <div style={{ maxWidth: '600px', margin: '6rem auto', textAlign: 'center', padding: '2.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--color-border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>🚫</span>
          <h2 style={{ color: 'var(--color-brand-primary)', fontWeight: 800, fontSize: '1.8rem', margin: '0 0 1rem' }}>Access Restricted</h2>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '1rem', margin: '0 0 2rem' }}>
            {error || 'You do not have permission to access this trading terminal, or the auction is no longer active.'}
          </p>
          <button
            onClick={() => navigate('/auctions')}
            style={{ padding: '0.8rem 2.5rem', borderRadius: '12px', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(0,35,102,0.25)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (authError) {
    const isKyc = authError === 'KYC_REQUIRED';
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
        <Header />
        <div style={{ maxWidth: '600px', margin: '6rem auto', textAlign: 'center', padding: '2.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--color-border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '4.5rem', display: 'block', marginBottom: '1.5rem' }}>
            {isKyc ? '🛡️' : '👛'}
          </span>
          <h2 style={{ color: 'var(--color-brand-primary)', fontWeight: 800, fontSize: '1.8rem', margin: '0 0 1rem' }}>
            {isKyc ? 'KYC Verification Required' : 'Security Deposit Required'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '1rem', margin: '0 0 2rem' }}>
            {isKyc
              ? 'Identity verification (Aadhaar or PAN) is required before participating in live bidding under Indian e-commerce regulations.'
              : `To enter this console, you need a 10% refundable security deposit of the starting price in your wallet. Minimum required: ₹${Math.floor(item.startingPrice * 0.1).toLocaleString('en-IN')}.`}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/auctions')}
              style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: '#f3f4f6', color: 'var(--color-text-rich)', border: '1px solid #e5e7eb', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}
            >
              Back to Auctions
            </button>
            <button
              onClick={() => navigate(isKyc ? '/kyc' : '/wallet')}
              style={{ padding: '0.8rem 2rem', borderRadius: '12px', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(0,35,102,0.25)' }}
            >
              {isKyc ? 'Complete KYC Verification' : 'Deposit Funds'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate console based on dynamic type
  const renderConsole = () => {
    switch (item.auctionType) {
      case 'ENGLISH':
        return <EnglishConsole item={item} />;
      case 'DUTCH':
        return <DutchConsole item={item} />;
      case 'BLIND':
        return <BlindConsole item={item} />;
      default:
        return (
          <div style={{ color: '#fff', padding: '3rem', textAlign: 'center' }}>
            <h3>Unsupported Auction Format: {item.auctionType}</h3>
          </div>
        );
    }
  };

  return (
    <>
      <AuthController />
      {renderConsole()}
    </>
  );
}
