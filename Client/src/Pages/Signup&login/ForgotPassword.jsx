import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import api from '../../../Config/interceptor'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { deleteCookie } from '../../Components/Global/CookieIT'
import LongLogo from '../../assets/LongLogo.png'

/* ─── tokens (mirrors index.css) ────────── */
const C = {
  navy: '#002366', navyL: '#1a3c7a', navyD: '#00153d',
  gold: '#fece44', goldD: '#e5b630',
  rich: '#0a0a0a', muted: '#525252',
  border: '#e5e7eb', white: '#ffffff',
  err: '#dc2626', errBg: '#fef2f2',
}
const font = "'Inter', system-ui, sans-serif"

/* ─── Glow orbs ──────────────────────────── */
const orbs = [
  { w: 480, h: 480, x: '-8%',  y: '-12%', opacity: 0.18, delay: 0,   dur: 12 },
  { w: 340, h: 340, x: '68%',  y: '58%',  opacity: 0.13, delay: 3,   dur: 15 },
  { w: 220, h: 220, x: '78%',  y: '-8%',  opacity: 0.09, delay: 6,   dur: 10 },
  { w: 180, h: 180, x: '4%',   y: '72%',  opacity: 0.09, delay: 1.5, dur: 18 },
]
const Orb = ({ w, h, x, y, opacity, delay, dur }) => (
  <motion.div
    animate={{ scale: [1, 1.12, 1], rotate: [0, 15, 0] }}
    transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
    style={{
      position: 'absolute', width: w, height: h, left: x, top: y,
      borderRadius: '50%', pointerEvents: 'none', filter: 'blur(2px)',
      background: `radial-gradient(circle, rgba(254,206,68,${opacity}) 0%, transparent 70%)`,
    }}
  />
)

/* ─── Spinner ────────────────────────────── */
const Spin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    style={{ animation: 'fpSpin 0.75s linear infinite', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

/* ─── Shared input focus hook ────────────── */
const useInput = (hasErr) => {
  const [f, setF] = useState(false)
  return {
    onFocus: () => setF(true),
    onBlur:  () => setF(false),
    style: {
      width: '100%', boxSizing: 'border-box',
      padding: '0.7rem 1rem', borderRadius: 10, fontFamily: font,
      fontSize: '0.9375rem', color: C.rich, outline: 'none',
      border: `1.5px solid ${f ? (hasErr ? C.err : C.navy) : (hasErr ? C.err : '#d1d5db')}`,
      background: hasErr ? '#fef2f2' : C.white,
      boxShadow: f ? `0 0 0 3px ${hasErr ? 'rgba(220,38,38,0.1)' : 'rgba(0,35,102,0.1)'}` : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
  }
}

/* ─── Field wrapper ──────────────────────── */
const F = ({ label, id, err, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label htmlFor={id} style={{
      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: '#374151', fontFamily: font,
    }}>{label}</label>
    {children}
    <AnimatePresence>
      {err && (
        <motion.p key={err} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ margin: 0, fontSize: '0.76rem', color: C.err, fontFamily: font }}>
          {err}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
)

/* ─── Primary button ─────────────────────── */
const PrimaryBtn = ({ children, busy, busyLabel = 'Please wait…', disabled, type = 'submit' }) => (
  <motion.button type={type}
    disabled={busy || disabled}
    whileHover={!busy && !disabled ? { scale: 1.018 } : {}}
    whileTap={!busy && !disabled ? { scale: 0.982 } : {}}
    style={{
      width: '100%', padding: '0.82rem', borderRadius: 12, border: 'none',
      background: busy || disabled ? 'rgba(0,35,102,0.35)' : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
      color: '#fff', fontFamily: font, fontSize: '0.9375rem', fontWeight: 700,
      cursor: busy || disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: busy || disabled ? 'none' : '0 4px 18px rgba(0,35,102,0.28)',
      letterSpacing: '0.01em', transition: 'background 0.2s, box-shadow 0.2s',
    }}
  >{busy ? <><Spin />{busyLabel}</> : children}</motion.button>
)

/* ─── Password strength ──────────────────── */
const strScore = (pw) => {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strColor = ['#e5e7eb', '#ef4444', '#f97316', '#eab308', '#22c55e']
const strLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']

/* ═══════════════════════════════════════════
   STEP 1 — Enter Email
═══════════════════════════════════════════ */
const StepEmail = ({ onNext }) => {
  const [email, setEmail] = useState('')
  const [busy, setBusy]   = useState(false)
  const [err, setErr]     = useState('')
  const iI = useInput(!!err)

  const submit = async (ev) => {
    ev.preventDefault()
    if (!email.trim()) { setErr('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Enter a valid email'); return }
    setBusy(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('OTP sent to your email!')
      onNext(email)
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Failed to send OTP')
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <F label="Registered Email" id="fp-email" err={err}>
        <input id="fp-email" type="email" placeholder="name@example.com" value={email}
          onChange={e => { setEmail(e.target.value); setErr('') }} {...iI} />
      </F>
      <PrimaryBtn busy={busy} busyLabel="Sending OTP…">Send Reset Code</PrimaryBtn>
    </form>
  )
}

/* ═══════════════════════════════════════════
   STEP 2 — OTP + New Password
═══════════════════════════════════════════ */
const StepReset = ({ email, onBack }) => {
  const nav = useNavigate()
  const [otp, setOtp]       = useState('')
  const [pw, setPw]         = useState('')
  const [cpw, setCpw]       = useState('')
  const [show, setShow]     = useState(false)
  const [busy, setBusy]     = useState(false)
  const [cd, setCd]         = useState(0)
  const [resending, setRes] = useState(false)
  const [err, setErr]       = useState({})
  const str = strScore(pw)

  const pI  = useInput(!!err.pw)
  const cpI = useInput(!!err.cpw)

  useEffect(() => {
    if (cd <= 0) return
    const t = setTimeout(() => setCd(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cd])

  const resend = async () => {
    setRes(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('New OTP sent!')
      setCd(60)
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Could not resend')
    } finally { setRes(false) }
  }

  const validate = () => {
    const e = {}
    if (otp.length < 6) e.otp = 'Enter the complete 6-digit code'
    if (!pw) e.pw = 'New password is required'
    else if (pw.length < 8) e.pw = 'Minimum 8 characters'
    if (!cpw) e.cpw = 'Please confirm your password'
    else if (pw !== cpw) e.cpw = 'Passwords do not match'
    setErr(e)
    return !Object.keys(e).length
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setBusy(true)
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: pw })
      toast.success('Password reset! You can now log in.')
      nav('/login', { replace: true })
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Reset failed. Check your OTP.')
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Email chip (read-only context) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0.6rem 0.9rem', borderRadius: 10,
        background: 'rgba(0,35,102,0.05)', border: '1.5px solid rgba(0,35,102,0.12)',
      }}>
        <span style={{ fontSize: '1rem' }}>📧</span>
        <span style={{ fontSize: '0.875rem', fontFamily: font, color: C.navy, fontWeight: 600, wordBreak: 'break-all' }}>{email}</span>
        <button type="button" onClick={onBack}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#9ca3af', fontFamily: font, flexShrink: 0 }}>
          Change
        </button>
      </div>

      {/* OTP */}
      <div>
        <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', fontFamily: font }}>
          Reset Code
        </p>
        <OtpInput value={otp} onChange={v => { setOtp(v); setErr(p => ({ ...p, otp: '' })) }}
          numInputs={6}
          renderSeparator={<span style={{ width: 6 }} />}
          containerStyle={{ display: 'flex', justifyContent: 'center' }}
          renderInput={(props) => (
            <input {...props} style={{
              width: 44, height: 52, textAlign: 'center', fontFamily: font,
              fontSize: '1.3rem', fontWeight: 800, borderRadius: 10,
              border: `2px solid ${props.value ? C.navy : '#d1d5db'}`,
              background: props.value ? 'rgba(0,35,102,0.05)' : C.white,
              color: C.navy, outline: 'none',
              transition: 'border-color 0.2s, background 0.2s',
              boxShadow: props.value ? '0 2px 8px rgba(0,35,102,0.12)' : 'none',
            }} />
          )}
        />
        {/* Dot progress */}
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div key={i}
              animate={{ scale: i < otp.length ? 1.35 : 1, background: i < otp.length ? C.navy : '#d1d5db' }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              style={{ width: 7, height: 7, borderRadius: '50%' }}
            />
          ))}
        </div>
        <AnimatePresence>
          {err.otp && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ margin: '6px 0 0', fontSize: '0.76rem', color: C.err, fontFamily: font, textAlign: 'center' }}>
            {err.otp}
          </motion.p>}
        </AnimatePresence>

        {/* Resend */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button type="button" onClick={resend} disabled={resending || cd > 0}
            style={{
              background: 'none', border: 'none', cursor: cd > 0 ? 'default' : 'pointer',
              color: cd > 0 ? '#9ca3af' : C.navy, fontWeight: 600,
              fontSize: '0.8rem', fontFamily: font, padding: 0,
            }}>
            {resending ? 'Sending…' : cd > 0 ? `Resend in ${cd}s` : '↺ Resend OTP'}
          </button>
        </div>
      </div>

      {/* New password */}
      <F label="New Password" id="fp-pw" err={err.pw}>
        <>
          <div style={{ position: 'relative' }}>
            <input id="fp-pw" type={show ? 'text' : 'password'} placeholder="••••••••" value={pw}
              onChange={e => { setPw(e.target.value); setErr(p => ({ ...p, pw: '' })) }}
              style={{ ...pI.style, paddingRight: '2.8rem' }} onFocus={pI.onFocus} onBlur={pI.onBlur} />
            <button type="button" onClick={() => setShow(v => !v)} style={{
              position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0, color: '#9ca3af',
            }}>{show ? '🙈' : '👁️'}</button>
          </div>
          {pw && (
            <div style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4].map(i => (
                  <motion.div key={i}
                    animate={{ background: i <= str ? strColor[str] : '#e5e7eb' }}
                    transition={{ duration: 0.3 }}
                    style={{ flex: 1, height: 3, borderRadius: 99 }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: strColor[str], fontFamily: font, marginTop: 3, display: 'block', fontWeight: 600 }}>
                {strLabel[str]}
              </span>
            </div>
          )}
        </>
      </F>

      {/* Confirm password */}
      <F label="Confirm Password" id="fp-cpw" err={err.cpw}>
        <input id="fp-cpw" type={show ? 'text' : 'password'} placeholder="••••••••" value={cpw}
          onChange={e => { setCpw(e.target.value); setErr(p => ({ ...p, cpw: '' })) }}
          style={cpI.style} onFocus={cpI.onFocus} onBlur={cpI.onBlur} />
      </F>

      <PrimaryBtn busy={busy} busyLabel="Resetting password…">Reset Password</PrimaryBtn>
    </form>
  )
}

/* ─── Step metadata ──────────────────────── */
const stepMeta = [
  { badge: '🔑', title: 'Forgot password?',  sub: 'Enter your registered email and we\'ll send you a reset code.' },
  { badge: '🔒', title: 'Reset your password', sub: 'Enter the code from your email and choose a new password.' },
]

/* ═══════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════ */
const ForgotPassword = () => {
  const nav = useNavigate()
  const [step, setStep]   = useState(0)   // 0 = email, 1 = otp+reset
  const [email, setEmail] = useState('')

  /* Parallax mouse tracking */
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const onMove = e => {
    mx.set((e.clientX / window.innerWidth  - 0.5) * 30)
    my.set((e.clientY / window.innerHeight - 0.5) * 30)
  }

  const { badge, title, sub } = stepMeta[step]

  return (
    <div onMouseMove={onMove} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(145deg, ${C.navyD} 0%, ${C.navy} 45%, ${C.navyL} 100%)`,
      fontFamily: font, padding: '1.5rem', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fpSpin    { to { transform: rotate(360deg); } }
        @keyframes fpFloat   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>

      {/* Orbs */}
      <motion.div style={{ position: 'absolute', inset: 0, x: sx, y: sy, pointerEvents: 'none' }}>
        {orbs.map((o, i) => <Orb key={i} {...o} />)}
      </motion.div>

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Floating badge */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div key={step + '-badge'}
            initial={{ opacity: 0, scale: 0.5, y: -80 }}
            animate={{ opacity: 1, scale: 1, y: -260 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={{
              width: 64, height: 64, borderRadius: 20, fontSize: '1.75rem',
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              animation: 'fpFloat 3s ease-in-out infinite',
            }}>
            {badge}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: 460, borderRadius: 24,
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.15)',
          overflow: 'hidden', position: 'relative', zIndex: 10,
        }}
      >
        {/* Gold stripe */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.gold}, ${C.goldD}, ${C.gold})` }} />

        {/* Header */}
        <div style={{ padding: '2rem 2rem 0' }}>
          {/* Logo + step pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src={LongLogo} alt="BidKar Logo" style={{ width: 110, height: 'auto', objectFit: 'contain' }} />
            </a>

            {/* Step pills */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1].map(i => (
                <motion.div key={i}
                  animate={{ width: i === step ? 24 : 8, background: i < step ? C.goldD : i === step ? C.navy : '#d1d5db' }}
                  transition={{ duration: 0.35 }}
                  style={{ height: 8, borderRadius: 99 }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.div key={step + '-title'}
              initial={{ opacity: 0, x: step === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800, color: C.navy, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                {title}
              </h1>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>{sub}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Body */}
        <div style={{ padding: '0 2rem 1.5rem' }}>
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: step === 0 ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step === 0 ? 24 : -24 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {step === 0 && (
                <StepEmail onNext={(em) => { setEmail(em); setStep(1) }} />
              )}
              {step === 1 && (
                <StepReset email={email} onBack={() => setStep(0)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #f3f4f6', padding: '1rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <button type="button" onClick={() => nav('/login')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: font, fontWeight: 600,
              color: C.navy, padding: 0, display: 'flex', alignItems: 'center', gap: 6,
            }}>
            ← Back to Login
          </button>
        </div>
      </motion.div>

      {/* Attribution */}
      <p style={{
        position: 'absolute', bottom: '1.25rem', left: 0, right: 0,
        textAlign: 'center', fontSize: '0.72rem',
        color: 'rgba(255,255,255,0.3)', margin: 0, fontFamily: font,
      }}>
        © {new Date().getFullYear()} BidKar.in · Regulated under IT Act 2000
      </p>
    </div>
  )
}

export default ForgotPassword
