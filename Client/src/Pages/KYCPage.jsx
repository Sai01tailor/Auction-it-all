import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../Config/Axios';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';
import AuthController from '../Components/Global/AuthController';
import { useAuth } from '../Context/AuthContext';

export default function KYCPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Step state: 1 = Aadhaar Input, 2 = OTP Verification, 3 = Completed
  const [step, setStep] = useState(1);
  
  // Aadhaar inputs & API states
  const [aadhaarNum, setAadhaarNum] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [kycResult, setKycResult] = useState(null);

  // Fetch current user KYC status on mount
  useEffect(() => {
    api.get('/kyc/status')
      .then(res => {
        if (res.data && res.data.kycStatus === 'Verified') {
          setStep(3);
          setKycResult({ kycStatus: 'Verified', verifiedAt: res.data.verifiedAt });
          setUser(prev => ({
            ...prev,
            kycStatus: 'Verified',
            role: 'SELLER'
          }));
        }
      })
      .catch(() => {});
  }, [setUser]);

  // Aadhaar Submit Step 1: Initiate
  const handleAadhaarSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (aadhaarNum.length !== 12) {
      setErrorMsg('Aadhaar must be exactly 12 digits.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/kyc/initiate', { aadhaarNumber: aadhaarNum });
      if (data.success) {
        setVerificationId(data.verificationRequestId);
        setStep(2);
      } else {
        setErrorMsg(data.message || 'Verification initialization failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to connect to verification server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Aadhaar Submit Step 2: Verify OTP
  const handleAadhaarOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (aadhaarOtp.length !== 6) {
      setErrorMsg('OTP must be exactly 6 digits.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/kyc/verify-otp', {
        verificationRequestId: verificationId,
        otp: aadhaarOtp
      });
      if (data.success) {
        setUser(prev => ({
          ...prev,
          kycStatus: 'Verified',
          role: 'SELLER'
        }));
        setKycResult(data);
        setStep(3);
      } else {
        setErrorMsg(data.message || 'OTP verification failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <SEO
        title="Bidder Identity Verification & Instant KYC"
        description="Verify your identity with instant Aadhaar OTP verification on BidKar.in to unlock high-value auctions and seller features."
      />
      <AuthController />
      <Header />

      {/* ── FULL-WIDTH GRADIENT HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 55%, #1a3c7a 100%)',
        padding: '4rem 2rem 5rem',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        {/* Dot grid overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛡️</span>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            Identity Verification (KYC)
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)' }}>
            Comply with RBI deposit regulations to authorize active bidding power and seller tools.
          </p>
        </div>
      </div>

      {/* ── OVERLAPPING CONTENT WRAPPER ── */}
      <div style={{ maxWidth: '550px', margin: '-2.5rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* Core Card Container */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 8px 30px rgba(0,35,102,0.06)', color: 'var(--color-text-rich)' }}>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: INITIAL AADHAAR ENTRY */}
            {step === 1 && (
              <motion.div
                key="step-entry"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>Aadhaar Card OTP Verification</h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Verify instantly using the OTP sent to your Aadhaar-registered mobile number
                  </p>
                </div>

                <form onSubmit={handleAadhaarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label htmlFor="aadhaar-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                      12-Digit Aadhaar Card Number
                    </label>
                    <input
                      id="aadhaar-input"
                      type="text"
                      maxLength="12"
                      placeholder="0000 0000 0000"
                      value={aadhaarNum}
                      onChange={e => setAadhaarNum(e.target.value.replace(/[^0-9]/g, ''))}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        height: '46px',
                        padding: '0.75rem 1rem',
                        border: '1.5px solid var(--color-border-subtle)',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        outline: 'none',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                        letterSpacing: '0.08em'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                    />
                  </div>

                  {errorMsg && <p style={{ margin: 0, fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>❌ {errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={isLoading || aadhaarNum.length !== 12}
                    style={{
                      height: '46px', border: 'none', borderRadius: '10px',
                      background: 'var(--color-brand-primary)', color: '#fff',
                      fontWeight: 800, fontSize: '0.9rem', cursor: (isLoading || aadhaarNum.length !== 12) ? 'not-allowed' : 'pointer',
                      opacity: aadhaarNum.length === 12 ? 1 : 0.65, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {isLoading ? 'Sending Request...' : 'Send Verification OTP'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: AADHAAR OTP ENTER WINDOW */}
            {step === 2 && (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form onSubmit={handleAadhaarOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>Enter OTP Code</h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      A 6-digit security code was dispatched to your Aadhaar-registered mobile/email.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="aadhaar-otp-field" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      id="aadhaar-otp-field"
                      type="text"
                      maxLength="6"
                      placeholder="0 0 0 0 0 0"
                      value={aadhaarOtp}
                      onChange={e => setAadhaarOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        height: '48px',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        letterSpacing: '0.25em',
                        border: '1.5px solid var(--color-border-subtle)',
                        borderRadius: '12px',
                        outline: 'none',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                    />
                  </div>

                  {errorMsg && <p style={{ margin: 0, fontSize: '0.78rem', color: '#dc2626', fontWeight: 600, textAlign: 'center' }}>❌ {errorMsg}</p>}

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => { setStep(1); setErrorMsg(''); }}
                      style={{ flex: 1, height: '46px', background: '#fff', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || aadhaarOtp.length !== 6}
                      style={{
                        flex: 2, height: '46px', border: 'none', borderRadius: '10px',
                        background: 'var(--color-brand-primary)', color: '#fff',
                        fontWeight: 800, fontSize: '0.9rem', cursor: (isLoading || aadhaarOtp.length !== 6) ? 'not-allowed' : 'pointer',
                        opacity: aadhaarOtp.length === 6 ? 1 : 0.6
                      }}
                    >
                      {isLoading ? 'Verifying...' : '✓ Complete Verification'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 3: SUCCESS PANEL */}
            {step === 3 && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ecfdf5', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <span style={{ fontSize: '2.5rem', color: '#10b981' }}>✓</span>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0 }}>KYC Verified successfully</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: '0.4rem' }}>
                    Your account is fully compliant. Bidding power and seller tools have been unlocked!
                  </p>
                </div>

                <div style={{ background: 'var(--color-surface-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border-subtle)', textAlign: 'left', fontSize: '0.78rem' }}>
                  <p style={{ margin: 0 }}><strong>Compliance Node ID:</strong> BK-KYC-{kycResult?._id || kycResult?.verificationRequestId || 'verified'}</p>
                  <p style={{ margin: '0.3rem 0 0' }}><strong>Verified Date:</strong> {new Date(kycResult?.verifiedAt || Date.now()).toLocaleDateString()}</p>
                  <p style={{ margin: '0.3rem 0 0' }}><strong>Features Authorized:</strong> Wallet Escrows, English/Dutch/Blind bidding terminals.</p>
                </div>

                <button
                  onClick={() => navigate('/wallet')}
                  style={{ height: '46px', border: 'none', borderRadius: '10px', background: 'var(--color-brand-primary)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Go to Wallet Dashboard
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
