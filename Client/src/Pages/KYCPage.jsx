import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../Config/Axios';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';

export default function KYCPage() {
  const navigate = useNavigate();

  // KYC configuration states
  const [kycType, setKycType] = useState('AADHAAR'); // AADHAAR | PAN
  const [step, setStep] = useState(1); // 1 = Input, 2 = Verify / Uploading, 3 = Completed
  
  // Aadhaar inputs & API states
  const [aadhaarNum, setAadhaarNum] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [kycResult, setKycResult] = useState(null);

  // PAN & Liveness states
  const [panNum, setPanNum] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [capturedSelfie, setCapturedSelfie] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [panStep, setPanStep] = useState('UPLOAD'); // UPLOAD | REVIEW | SUCCESS

  // Video element references for liveness snap
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch current user KYC status on mount
  useEffect(() => {
    api.get('/kyc/status')
      .then(res => {
        if (res.data && res.data.kycStatus === 'Verified') {
          setStep(3);
          setKycResult({ kycStatus: 'Verified', verifiedAt: res.data.verifiedAt });
        }
      })
      .catch(() => {});
  }, []);

  // Cleanup webcam stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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

  // PAN Submit — POST /api/kyc/pan (multipart/form-data)
  const handlePanSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (panNum.length !== 10) {
      setErrorMsg('PAN must be exactly 10 alphanumeric characters.');
      return;
    }
    if (!frontImage || !backImage) {
      setErrorMsg('Please upload both Front and Back card photos.');
      return;
    }
    if (!capturedSelfie) {
      setErrorMsg('Webcam liveness photo is required.');
      return;
    }

    setPanStep('REVIEW');
    setIsLoading(true);
    try {
      // Convert captured selfie (base64 dataURL) to a Blob for multipart upload
      const selfieBlob = await fetch(capturedSelfie).then(r => r.blob());
      const selfieFile = new File([selfieBlob], 'selfie.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('panNumber', panNum);
      formData.append('frontImage', frontImage);
      formData.append('backImage', backImage);
      formData.append('selfie', selfieFile);

      const { data } = await api.post('/kyc/pan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        setStep(3);
        setKycResult({ kycStatus: 'Verified', verifiedAt: data.verifiedAt || new Date().toISOString() });
      } else {
        setErrorMsg(data.message || 'PAN verification failed.');
        setPanStep('UPLOAD');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'PAN submission failed. Please try again.');
      setPanStep('UPLOAD');
    } finally {
      setIsLoading(false);
    }
  };

  // Webcam hooks
  const startCamera = async () => {
    setUseWebcam(true);
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setUseWebcam(false);
      setErrorMsg('Unable to access webcam. Please upload a profile photo instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUseWebcam(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setCapturedSelfie(canvas.toDataURL('image/jpeg'));
    stopCamera();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <AuthController />
      <Header />

      <div style={{ maxWidth: '650px', margin: '3rem auto', padding: '0 1.5rem' }}>
        
        {/* Core Card Container */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 8px 32px rgba(0,35,102,0.02)', color: 'var(--color-text-rich)' }}>
          
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🛡️</span>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>Identity Verification (KYC)</h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Comply with RBI deposit regulations to authorize active bidding power
            </p>
          </div>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: INITIAL SELECTION / ENTRY */}
            {step === 1 && (
              <motion.div
                key="step-entry"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                {/* KYC Type Tab Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--color-surface-bg)', padding: '0.3rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                  <button
                    onClick={() => { setKycType('AADHAAR'); setErrorMsg(''); }}
                    style={{ padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', background: kycType === 'AADHAAR' ? '#fff' : 'none', color: kycType === 'AADHAAR' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)', boxShadow: kycType === 'AADHAAR' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                  >
                    Aadhaar Card OTP (Instant)
                  </button>
                  <button
                    onClick={() => { setKycType('PAN'); setErrorMsg(''); }}
                    style={{ padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', background: kycType === 'PAN' ? '#fff' : 'none', color: kycType === 'PAN' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)', boxShadow: kycType === 'PAN' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                  >
                    PAN Document Upload
                  </button>
                </div>

                {/* AADHAAR FLOW PANEL */}
                {kycType === 'AADHAAR' && (
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
                          height: '46px',
                          padding: '0.75rem 1rem',
                          border: '1.5px solid var(--color-border-subtle)',
                          borderRadius: '10px',
                          fontSize: '1rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          outline: 'none',
                          transition: 'all 0.2s',
                        }}
                        className="focus:ring-2 focus:ring-[var(--color-brand-accent)] focus:border-transparent"
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
                )}

                {/* PAN FLOW PANEL */}
                {kycType === 'PAN' && (
                  <form onSubmit={handlePanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label htmlFor="pan-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                        Permanent Account Number (PAN)
                      </label>
                      <input
                        id="pan-input"
                        type="text"
                        maxLength="10"
                        placeholder="ABCDE1234F"
                        value={panNum}
                        onChange={e => setPanNum(e.target.value.toUpperCase())}
                        style={{
                          width: '100%',
                          height: '46px',
                          padding: '0.75rem 1rem',
                          border: '1.5px solid var(--color-border-subtle)',
                          borderRadius: '10px',
                          fontSize: '1rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          outline: 'none',
                        }}
                        className="focus:ring-2 focus:ring-[var(--color-brand-accent)] focus:border-transparent"
                      />
                    </div>

                    {/* Drag and Drop uploads */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {/* Front Upload */}
                      <div style={{ border: '2px dashed var(--color-border-subtle)', borderRadius: '12px', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px', position: 'relative' }}>
                        {frontImage ? (
                          <>
                            <img src={URL.createObjectURL(frontImage)} alt="Front preview" style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '6px' }} />
                            <button type="button" onClick={() => setFrontImage(null)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.65rem' }}>×</button>
                          </>
                        ) : (
                          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.5rem' }}>📤</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>Front Photo</span>
                            <input type="file" accept="image/*" onChange={e => setFrontImage(e.target.files[0])} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>

                      {/* Back Upload */}
                      <div style={{ border: '2px dashed var(--color-border-subtle)', borderRadius: '12px', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px', position: 'relative' }}>
                        {backImage ? (
                          <>
                            <img src={URL.createObjectURL(backImage)} alt="Back preview" style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '6px' }} />
                            <button type="button" onClick={() => setBackImage(null)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.65rem' }}>×</button>
                          </>
                        ) : (
                          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.5rem' }}>📤</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>Back Photo</span>
                            <input type="file" accept="image/*" onChange={e => setBackImage(e.target.files[0])} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Webcam Liveness Check Zone */}
                    <div style={{ background: 'var(--color-surface-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border-subtle)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>📸 Webcam Liveness Selfie Check</span>
                      
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                        {useWebcam ? (
                          <div style={{ position: 'relative', width: '200px', height: '150px', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={capturePhoto}
                              style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: '#fece44', border: 'none', borderRadius: '20px', padding: '0.35rem 1rem', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', color: '#002366' }}
                            >
                              📸 Snap Snapshot
                            </button>
                          </div>
                        ) : capturedSelfie ? (
                          <div style={{ position: 'relative', width: '150px', height: '120px', borderRadius: '8px', overflow: 'hidden' }}>
                            <img src={capturedSelfie} alt="Selfie preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => setCapturedSelfie(null)}
                              style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.65rem' }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={startCamera}
                            style={{ padding: '0.5rem 1rem', border: '1.5px solid var(--color-border-subtle)', background: '#fff', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            📹 Connect Webcam for Liveness Check
                          </button>
                        )}
                      </div>
                    </div>

                    {errorMsg && <p style={{ margin: 0, fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>❌ {errorMsg}</p>}

                    <button
                      type="submit"
                      style={{
                        height: '46px', border: 'none', borderRadius: '10px',
                        background: 'var(--color-brand-primary)', color: '#fff',
                        fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer'
                      }}
                    >
                      🚀 Submit Documents for Review
                    </button>
                  </form>
                )}

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
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      OTP code dispatched to Aadhaar registered email.
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
                      className="focus:ring-2 focus:ring-[var(--color-brand-accent)] focus:border-transparent"
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
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0 }}>KYC Verified successfully</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
                    Your account is fully compliant. Bidding and wallet deposit limits have been unlocked!
                  </p>
                </div>

                <div style={{ background: 'var(--color-surface-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border-subtle)', textAlign: 'left', fontSize: '0.8rem' }}>
                  <p style={{ margin: 0 }}><strong>Compliance Node ID:</strong> BK-KYC-{item ? item._id : 'verified'}</p>
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
