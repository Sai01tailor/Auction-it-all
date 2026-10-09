import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../Config/Axios';
import SEO from '../Components/Global/SEO';
import AuthController from '../Components/Global/AuthController';
import { useAuth } from '../Context/AuthContext';
import LongLogo from '../assets/LongLogo.png';
import OtpInput from 'react-otp-input';
import { toast } from 'react-toastify';
import { ShieldCheck, CheckCircle2, Zap, CreditCard, ArrowLeft, ArrowRight, Lock, Check } from 'lucide-react';

/* ─── Design Tokens & Constants (Matching AuthPage.jsx) ─── */
const C = {
  navy: '#002366',
  navyL: '#1a3c7a',
  navyD: '#00153d',
  gold: '#fece44',
  goldD: '#e5b630',
  goldL: '#feda75',
  rich: '#0a0a0a',
  muted: '#64748b',
  border: '#e2e8f0',
  white: '#ffffff',
  bg: '#f8fafc',
  err: '#dc2626',
  success: '#16a34a',
};
const font = "'Inter', system-ui, -apple-system, sans-serif";

/* ─── Spinner Component ───────────────────────────────── */
const Spin = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: 'kycSpin 0.75s linear infinite', flexShrink: 0 }}
  >
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ─── Form Input Field with Icon ──────────────────────── */
const FormField = ({ label, id, icon: Icon, type = 'text', value, onChange, placeholder, hasErr, err, ...props }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#1e293b',
            fontFamily: font,
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '0.9rem',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: f ? C.navy : hasErr ? C.err : '#94a3b8',
              transition: 'color 0.2s',
              zIndex: 2,
            }}
          >
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setF(true)}
          onBlur={() => setF(false)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.78rem 1rem',
            paddingLeft: Icon ? '2.55rem' : '1rem',
            borderRadius: 10,
            fontFamily: font,
            fontSize: '0.9375rem',
            color: C.rich,
            outline: 'none',
            border: `1.5px solid ${f ? (hasErr ? C.err : C.navy) : hasErr ? C.err : '#d1d5db'}`,
            background: hasErr ? '#fef2f2' : C.white,
            boxShadow: f ? `0 0 0 3px ${hasErr ? 'rgba(220,38,38,0.1)' : 'rgba(0,35,102,0.08)'}` : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
          }}
          {...props}
        />
      </div>

      <AnimatePresence>
        {err && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ margin: 0, fontSize: '0.75rem', color: C.err, fontFamily: font, fontWeight: 500 }}
          >
            {err}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Primary Action Button ───────────────────────────── */
const PrimaryBtn = ({ children, busy, busyLabel = 'Please wait…', disabled, onClick, type = 'submit' }) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={busy || disabled}
    whileHover={!busy && !disabled ? { scale: 1.012, translateY: -1 } : {}}
    whileTap={!busy && !disabled ? { scale: 0.988, translateY: 0 } : {}}
    style={{
      width: '100%',
      padding: '0.85rem',
      borderRadius: 10,
      border: 'none',
      background: busy || disabled
        ? 'rgba(0,35,102,0.35)'
        : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
      color: '#ffffff',
      fontFamily: font,
      fontSize: '0.9375rem',
      fontWeight: 700,
      cursor: busy || disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      boxShadow: busy || disabled ? 'none' : '0 4px 14px rgba(0,35,102,0.22)',
      letterSpacing: '0.01em',
      transition: 'background 0.2s, box-shadow 0.2s',
    }}
  >
    {busy ? <><Spin />{busyLabel}</> : children}
  </motion.button>
);

export default function KYCPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Step state: 1 = Aadhaar Input, 2 = OTP Verification, 3 = Completed
  const [step, setStep] = useState(1);
  const dir = useRef(1);
  const [cursor, setCursor] = useState({ x: -9999, y: -9999 });

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
          dir.current = 1;
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
    const cleanNum = aadhaarNum.replace(/\s+/g, '');
    if (cleanNum.length !== 12) {
      setErrorMsg('Aadhaar must be exactly 12 digits.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/kyc/initiate', { aadhaarNumber: cleanNum });
      if (data.success) {
        setVerificationId(data.verificationRequestId);
        dir.current = 1;
        setStep(2);
        toast.success('Verification code dispatched to your registered phone!');
      } else {
        setErrorMsg(data.message || 'Verification initialization failed.');
        toast.error(data.message || 'Verification initialization failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to connect to verification server.';
      setErrorMsg(msg);
      toast.error(msg);
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
        dir.current = 1;
        setStep(3);
        toast.success('Identity Verified Successfully! 🎉');
      } else {
        setErrorMsg(data.message || 'OTP verification failed.');
        toast.error(data.message || 'OTP verification failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to verify OTP.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAadhaar = (val) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 12);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    return parts.join(' ');
  };

  const metaByStep = {
    1: {
      title: 'Identity Verification',
      sub: 'Enter your 12-digit Aadhaar number to verify with UIDAI',
    },
    2: {
      title: 'Check your phone',
      sub: 'Enter the 6-digit OTP code sent to your Aadhaar mobile',
    },
    3: {
      title: 'Verification Complete',
      sub: 'Your identity is fully verified & institutional compliance is active',
    },
  };

  const { title, sub } = metaByStep[step];

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setCursor({ x: -9999, y: -9999 })}
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(155deg, #001233 0%, #002366 50%, #00102b 100%)',
        fontFamily: font,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes kycSpin { to { transform: rotate(360deg); } }
      `}</style>

      <SEO
        title="Bidder Identity Verification & Instant KYC | BidKar.in"
        description="Verify your identity with instant Aadhaar OTP verification on BidKar.in to unlock 10x bidding leverage and seller showroom tools."
      />
      <AuthController />

      {/* Atmospheric Radial Lighting (Matching AuthPage.jsx) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: `radial-gradient(circle 500px at ${cursor.x}px ${cursor.y}px, rgba(254,206,68,0.12) 0%, rgba(26,60,122,0.08) 50%, transparent 80%)`,
          transition: 'background 0.1s ease-out',
        }}
      />

      {/* Subtle Dot Grid Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Center Two-Panel Container (Matching AuthPage.jsx) ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl flex flex-col-reverse md:flex-row items-stretch justify-center gap-6 lg:gap-8 relative z-10"
      >
        {/* ── LEFT PANEL: BRAND & TRUST SHOWCASE ── */}
        <div
          style={{
            flex: '1 1 0%',
            maxWidth: '440px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          className="md:flex p-8 lg:p-9"
        >
          {/* Gold Vertical Accent Edge on the Left */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 5,
              background: `linear-gradient(180deg, ${C.gold} 0%, ${C.goldD} 100%)`,
            }}
          />

          {/* Top: Brand Logo */}
          <div>
            <a href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '2.5rem' }}>
              <img src={LongLogo} alt="BidKar Logo" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
            </a>

            {/* Headline & Supporting Copy */}
            <h2
              style={{
                margin: '0 0 0.85rem',
                fontSize: '1.95rem',
                fontWeight: 800,
                color: C.navy,
                lineHeight: 1.18,
                letterSpacing: '-0.03em',
              }}
            >
              Verify identity.<br />
              <span style={{ color: C.goldD }}>Unlock 10x leverage.</span>
            </h2>

            <p
              style={{
                margin: '0 0 2rem',
                fontSize: '0.95rem',
                color: '#475569',
                lineHeight: 1.55,
              }}
            >
              UIDAI Aadhaar instant verification regulated under IT Act 2000 &amp; RBI compliance guidelines.
            </p>

            {/* Three Trust Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(22, 163, 74, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.success,
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={15} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                  Instant UIDAI Aadhaar Verification
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(22, 163, 74, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.success,
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={15} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                  Unlock 10x Bidding Leverage
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(22, 163, 74, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.success,
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={15} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                  Authorized Escrow &amp; Seller Showroom
                </span>
              </div>
            </div>
          </div>

          {/* Understated Live Stats / Compliance Badge */}
          <div
            style={{
              marginTop: '2.5rem',
              padding: '0.85rem 1rem',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={15} color={C.goldD} fill={C.gold} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.navy, letterSpacing: '0.01em' }}>
                100% UIDAI &amp; RBI Compliant
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>
              256-Bit SSL Encrypted
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL: KYC INTERACTIVE PROCESSOR ── */}
        <div
          style={{
            flex: '1 1 0%',
            maxWidth: '490px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="w-full p-7 sm:p-9"
        >
          {/* Gold Vertical Accent Edge on the Left */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 5,
              background: `linear-gradient(180deg, ${C.gold} 0%, ${C.goldD} 100%)`,
            }}
          />

          {/* Mobile Logo Display */}
          <div className="flex md:hidden items-center justify-between mb-5">
            <a href="/" style={{ textDecoration: 'none' }}>
              <img src={LongLogo} alt="BidKar Logo" style={{ height: 32, width: 'auto' }} />
            </a>
          </div>

          {/* Form Header with Step Indicator */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  style={{
                    height: '4px',
                    flex: 1,
                    borderRadius: '99px',
                    background: s <= step ? C.goldD : '#e2e8f0',
                    transition: 'background 0.3s ease',
                  }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step + '-header'}
                initial={{ opacity: 0, x: dir.current * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -dir.current * 16 }}
                transition={{ duration: 0.22 }}
              >
                <h1
                  style={{
                    margin: '0 0 4px',
                    fontSize: '1.65rem',
                    fontWeight: 800,
                    color: C.navy,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </h1>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.45 }}>
                  {sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form Body with Animated Step Switching */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {/* ── STEP 1: AADHAAR NUMBER ENTRY ── */}
              {step === 1 && (
                <motion.form
                  key="step-1"
                  onSubmit={handleAadhaarSubmit}
                  noValidate
                  initial={{ opacity: 0, x: dir.current * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -dir.current * 20 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <FormField
                    label="12-Digit Aadhaar Number"
                    id="aadhaar-input"
                    type="text"
                    icon={CreditCard}
                    placeholder="0000 0000 0000"
                    maxLength="14"
                    value={aadhaarNum}
                    hasErr={!!errorMsg}
                    err={errorMsg}
                    onChange={(e) => {
                      setAadhaarNum(formatAadhaar(e.target.value));
                      setErrorMsg('');
                    }}
                  />

                  <div
                    style={{
                      background: 'rgba(0, 35, 102, 0.03)',
                      border: '1px solid rgba(0, 35, 102, 0.08)',
                      borderRadius: '10px',
                      padding: '0.75rem 0.9rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#475569',
                      lineHeight: 1.45,
                    }}
                  >
                    <Lock size={14} style={{ color: C.navy, flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      Your Aadhaar number is processed through encrypted UIDAI government verification pipelines. No biometric data is stored.
                    </span>
                  </div>

                  <PrimaryBtn
                    busy={isLoading}
                    busyLabel="Dispatching OTP…"
                    disabled={aadhaarNum.replace(/\s+/g, '').length !== 12}
                  >
                    Send Verification OTP
                  </PrimaryBtn>

                  <p style={{ textAlign: 'center', margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b', fontFamily: font }}>
                    Need help?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/contact')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        color: C.navy,
                        fontFamily: font,
                        fontSize: '0.85rem',
                        padding: 0,
                      }}
                    >
                      Contact Support →
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── STEP 2: AADHAAR OTP VERIFICATION ── */}
              {step === 2 && (
                <motion.form
                  key="step-2"
                  onSubmit={handleAadhaarOtpSubmit}
                  initial={{ opacity: 0, x: dir.current * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -dir.current * 20 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', alignItems: 'center' }}
                >
                  <div style={{ width: '100%' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', fontFamily: font, textAlign: 'center' }}>
                      Enter the 6-digit verification code
                    </p>
                    <OtpInput
                      value={aadhaarOtp}
                      onChange={setAadhaarOtp}
                      numInputs={6}
                      renderSeparator={<span style={{ width: 8 }} />}
                      containerStyle={{ display: 'flex', justifyContent: 'center' }}
                      renderInput={(props) => (
                        <input
                          {...props}
                          style={{
                            width: 44,
                            height: 52,
                            textAlign: 'center',
                            fontFamily: 'monospace',
                            fontVariantNumeric: 'tabular-nums',
                            fontSize: '1.35rem',
                            fontWeight: 800,
                            borderRadius: 10,
                            border: `2px solid ${props.value ? C.gold : '#cbd5e1'}`,
                            background: props.value ? 'rgba(0,35,102,0.04)' : C.white,
                            color: C.navy,
                            outline: 'none',
                            transition: 'border-color 0.2s, background 0.2s',
                            boxShadow: props.value ? '0 0 0 3px rgba(254, 206, 68, 0.25)' : 'none',
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* Dot Progress Indicator */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: i < aadhaarOtp.length ? 1.25 : 1, background: i < aadhaarOtp.length ? C.navy : '#cbd5e1' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        style={{ width: 7, height: 7, borderRadius: '50%' }}
                      />
                    ))}
                  </div>

                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ margin: 0, fontSize: '0.78rem', color: C.err, fontWeight: 600, textAlign: 'center' }}
                    >
                      {errorMsg}
                    </motion.p>
                  )}

                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <PrimaryBtn
                      busy={isLoading}
                      busyLabel="Verifying OTP…"
                      disabled={aadhaarOtp.length !== 6}
                    >
                      {aadhaarOtp.length === 6 ? 'Verify & Authorize KYC' : `Enter ${6 - aadhaarOtp.length} more digit${6 - aadhaarOtp.length !== 1 ? 's' : ''}`}
                    </PrimaryBtn>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          dir.current = -1;
                          setStep(1);
                          setErrorMsg('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                          fontFamily: font,
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <ArrowLeft size={14} /> Back to Aadhaar
                      </button>

                      <button
                        type="button"
                        onClick={handleAadhaarSubmit}
                        disabled={isLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: C.navy,
                          fontFamily: font,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          padding: 0,
                        }}
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* ── STEP 3: SUCCESS PANEL ── */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}
                >
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'rgba(22, 163, 74, 0.12)',
                      border: '2px solid #16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      color: C.success,
                    }}
                  >
                    <Check size={34} strokeWidth={3} />
                  </div>

                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: C.navy }}>
                      KYC Approved &amp; Active
                    </h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                      Your identity verification is compliant with RBI and IT Act 2000 escrow standards.
                    </p>
                  </div>

                  {/* Compliance Metadata Box */}
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '1rem 1.15rem',
                      borderRadius: 14,
                      border: '1px solid #e2e8f0',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Compliance Node ID:</span>
                      <strong style={{ fontFamily: 'monospace', color: C.navy }}>
                        BK-KYC-{kycResult?._id || kycResult?.verificationRequestId || 'VERIFIED'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Verification Date:</span>
                      <strong style={{ color: '#1e293b' }}>
                        {new Date(kycResult?.verifiedAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Bidding Power:</span>
                      <strong style={{ color: C.success }}>10× Leverage Multiplier Enabled</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => navigate('/dashboard')}
                      style={{
                        flex: 1,
                        padding: '0.8rem',
                        borderRadius: 10,
                        border: '1.5px solid #e2e8f0',
                        background: '#fff',
                        color: C.navy,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.navy;
                        e.currentTarget.style.background = 'rgba(0,35,102,0.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = '#fff';
                      }}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/wallet')}
                      style={{
                        flex: 1,
                        padding: '0.8rem',
                        borderRadius: 10,
                        border: 'none',
                        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(0,35,102,0.22)',
                      }}
                    >
                      My Wallet →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Subtitle Footer Copyright (Matching AuthPage.jsx) ── */}
      <p
        style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'rgba(255, 255, 255, 0.45)',
          fontFamily: font,
          position: 'relative',
          zIndex: 10,
        }}
      >
        © 2026 BidKar.in · Regulated under IT Act 2000 &amp; UIDAI Guidelines
      </p>
    </div>
  );
}

