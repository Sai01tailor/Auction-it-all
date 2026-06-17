import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import { setCookie, getCookie, deleteCookie } from '../../Components/Global/CookieIT'
import api from '../../../Config/interceptor'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import OtpInput from 'react-otp-input'

/* ─── tokens ─────────────────────────────── */
const C = {
  navy:    '#002366', navyL: '#1a3c7a', navyD: '#00153d',
  gold:    '#fece44', goldD: '#e5b630', goldL: '#feda75',
  rich:    '#0a0a0a', muted: '#525252',
  border:  '#e5e7eb', white: '#ffffff', bg: '#f8fafc',
  err:     '#dc2626', errBg: '#fef2f2',
}
const font = "'Inter', system-ui, sans-serif"

/* ─── Glow orbs (decorative background) ──── */
const orbs = [
  { w: 520, h: 520, x: '-10%', y: '-15%', opacity: 0.18, delay: 0,   dur: 12 },
  { w: 380, h: 380, x: '65%',  y: '60%',  opacity: 0.14, delay: 3,   dur: 15 },
  { w: 260, h: 260, x: '80%',  y: '-5%',  opacity: 0.10, delay: 6,   dur: 10 },
  { w: 200, h: 200, x: '5%',   y: '70%',  opacity: 0.10, delay: 1.5, dur: 18 },
]

const Orb = ({ w, h, x, y, opacity, delay, dur }) => (
  <motion.div
    animate={{ scale: [1, 1.12, 1], rotate: [0, 15, 0] }}
    transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
    style={{
      position: 'absolute', width: w, height: h,
      left: x, top: y, borderRadius: '50%',
      background: `radial-gradient(circle, rgba(254,206,68,${opacity}) 0%, transparent 70%)`,
      pointerEvents: 'none', filter: 'blur(2px)',
    }}
  />
)

/* ─── Spinner ────────────────────────────── */
const Spin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    style={{ animation: 'authSpin 0.75s linear infinite', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

/* ─── Google logo ────────────────────────── */
const GIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

/* ─── Shared input with focus ring ──────── */
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
const F = ({ label, id, err, aside, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label htmlFor={id} style={{
        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#374151', fontFamily: font,
      }}>{label}</label>
      {aside}
    </div>
    {children}
    <AnimatePresence>
      {err && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ margin: 0, fontSize: '0.76rem', color: C.err, fontFamily: font }}>
          {err}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
)

/* ─── Primary button ─────────────────────── */
const PrimaryBtn = ({ children, busy, busyLabel = 'Please wait…', disabled, onClick, type = 'submit' }) => (
  <motion.button type={type} onClick={onClick}
    disabled={busy || disabled}
    whileHover={!busy && !disabled ? { scale: 1.018 } : {}}
    whileTap={!busy && !disabled ? { scale: 0.982 } : {}}
    style={{
      width: '100%', padding: '0.82rem', borderRadius: 12, border: 'none',
      background: busy || disabled
        ? 'rgba(0,35,102,0.35)'
        : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyL} 100%)`,
      color: '#fff', fontFamily: font, fontSize: '0.9375rem', fontWeight: 700,
      cursor: busy || disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: busy || disabled ? 'none' : '0 4px 18px rgba(0,35,102,0.28)',
      letterSpacing: '0.01em', transition: 'background 0.2s, box-shadow 0.2s',
    }}
  >{busy ? <><Spin />{busyLabel}</> : children}</motion.button>
)

/* ─── Divider ────────────────────────────── */
const Or = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: font }}>or</span>
    <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
  </div>
)

/* ─── Google button ──────────────────────── */
const GBtn = ({ onClick, busy }) => (
  <motion.button type="button" onClick={onClick} disabled={busy}
    whileHover={!busy ? { scale: 1.018, borderColor: '#9ca3af' } : {}}
    whileTap={!busy ? { scale: 0.982 } : {}}
    style={{
      width: '100%', padding: '0.75rem', borderRadius: 12,
      border: '1.5px solid #d1d5db', background: C.white,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontFamily: font, fontSize: '0.9rem', fontWeight: 600, color: C.rich,
      cursor: busy ? 'not-allowed' : 'pointer',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)', transition: 'border-color 0.2s',
    }}
  ><GIcon /> Continue with Google</motion.button>
)

/* ─── Password strength ──────────────────── */
const strength = (pw) => {
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
   LOGIN VIEW
═══════════════════════════════════════════ */
const LoginView = ({ go }) => {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw]       = useState('')
  const [show, setShow]   = useState(false)
  const [busy, setBusy]   = useState(false)
  const [err, setErr]     = useState({})

  const eI = useInput(!!err.email)
  const pI = useInput(!!err.pw)

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address'
    if (!pw) e.pw = 'Password is required'
    else if (pw.length < 8) e.pw = 'Minimum 8 characters'
    setErr(e); return !Object.keys(e).length
  }

  const submit = ev => {
    ev.preventDefault(); if (!validate()) return
    setBusy(true)
    api.post('/login', { email, password: pw })
      .then(r => { if (r.data?.token) setCookie('auth_token', r.data.token, { days: 7 }); toast.success('Welcome back! 🎉'); nav('/dashboard', { replace: true }) })
      .catch(e => toast.error(e.response?.data?.message ?? 'Invalid credentials'))
      .finally(() => setBusy(false))
  }

  const gLogin = useGoogleLogin({
    onSuccess: async t => {
      setBusy(true)
      try { const r = await api.post('/auth/google', { token: t.access_token }); if (r.data?.token) setCookie('auth_token', r.data.token, { days: 7 }); toast.success('Signed in!'); nav('/dashboard', { replace: true }) }
      catch (e) { toast.error(e.response?.data?.message ?? 'Google sign-in failed') }
      finally { setBusy(false) }
    },
    onError: () => toast.error('Google sign-in cancelled'),
  })

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <F label="Email" id="l-email" err={err.email}>
        <input id="l-email" type="email" placeholder="name@example.com" value={email}
          onChange={e => { setEmail(e.target.value); setErr(p => ({ ...p, email: '' })) }} {...eI} />
      </F>

      <F label="Password" id="l-pw" err={err.pw}
        aside={<a href="/forgot-password" style={{ fontSize: '0.75rem', fontWeight: 600, color: C.navy, textDecoration: 'none', fontFamily: font }}>Forgot?</a>}
      >
        <div style={{ position: 'relative' }}>
          <input id="l-pw" type={show ? 'text' : 'password'} placeholder="••••••••" value={pw}
            onChange={e => { setPw(e.target.value); setErr(p => ({ ...p, pw: '' })) }}
            style={{ ...pI.style, paddingRight: '2.8rem' }} onFocus={pI.onFocus} onBlur={pI.onBlur} />
          <button type="button" onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0, color: '#9ca3af' }}>{show ? '🙈' : '👁️'}</button>
        </div>
      </F>

      <PrimaryBtn busy={busy} busyLabel="Signing in…">Log In</PrimaryBtn>
      <Or />
      <GBtn onClick={gLogin} busy={busy} />

      <p style={{ textAlign: 'center', margin: 0, fontSize: '0.875rem', color: '#6b7280', fontFamily: font }}>
        No account?{' '}
        <button type="button" onClick={() => nav('/sign-up')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: C.navy, fontFamily: font, fontSize: '0.875rem', padding: 0 }}>
          Create one →
        </button>
      </p>
    </form>
  )
}

/* ═══════════════════════════════════════════
   SIGNUP VIEW
═══════════════════════════════════════════ */
const SignupView = ({ go }) => {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw]       = useState('')
  const [show, setShow]   = useState(false)
  const [terms, setTerms] = useState(false)
  const [busy, setBusy]   = useState(false)
  const [err, setErr]     = useState({})
  const str = strength(pw)

  const nI = useInput(!!err.name)
  const eI = useInput(!!err.email)
  const pI = useInput(!!err.pw)

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Username is required'
    else if (name.trim().length < 3) e.name = 'Minimum 3 characters'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email'
    if (!pw) e.pw = 'Password is required'
    else if (pw.length < 8) e.pw = 'Minimum 8 characters'
    if (!terms) e.terms = 'Please accept the terms'
    setErr(e); return !Object.keys(e).length
  }

  const submit = ev => {
    ev.preventDefault(); if (!validate()) return
    setBusy(true)
    api.post('/signup', { username: name, email, password: pw, role: 'USER' })
      .then(() => {
        toast.success('Account created! Check your inbox.')
        setCookie('Otp_Email', email, { days: 1, secure: true, sameSite: 'Strict' })
        go('verify')
      })
      .catch(e => toast.error(e.response?.data?.message ?? 'Sign-up failed'))
      .finally(() => setBusy(false))
  }

  const gLogin = useGoogleLogin({
    onSuccess: async t => {
      setBusy(true)
      try { const r = await api.post('/auth/google', { token: t.access_token }); if (r.data?.token) setCookie('auth_token', r.data.token, { days: 7 }); toast.success('Signed up!'); nav('/dashboard', { replace: true }) }
      catch (e) { toast.error(e.response?.data?.message ?? 'Google sign-up failed') }
      finally { setBusy(false) }
    },
    onError: () => toast.error('Google sign-in cancelled'),
  })

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <F label="Username" id="su-name" err={err.name}>
        <input id="su-name" type="text" placeholder="e.g. bidmaster99" value={name}
          onChange={e => { setName(e.target.value); setErr(p => ({ ...p, name: '' })) }} {...nI} />
      </F>

      <F label="Email" id="su-email" err={err.email}>
        <input id="su-email" type="email" placeholder="name@example.com" value={email}
          onChange={e => { setEmail(e.target.value); setErr(p => ({ ...p, email: '' })) }} {...eI} />
      </F>

      <F label="Password" id="su-pw" err={err.pw}>
        <>
          <div style={{ position: 'relative' }}>
            <input id="su-pw" type={show ? 'text' : 'password'} placeholder="••••••••" value={pw}
              onChange={e => { setPw(e.target.value); setErr(p => ({ ...p, pw: '' })) }}
              style={{ ...pI.style, paddingRight: '2.8rem' }} onFocus={pI.onFocus} onBlur={pI.onBlur} />
            <button type="button" onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0, color: '#9ca3af' }}>{show ? '🙈' : '👁️'}</button>
          </div>
          {pw && (
            <div style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4].map(i => (
                  <motion.div key={i} animate={{ background: i <= str ? strColor[str] : '#e5e7eb' }}
                    transition={{ duration: 0.3 }}
                    style={{ flex: 1, height: 3, borderRadius: 99 }} />
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: strColor[str], fontFamily: font, marginTop: 3, display: 'block', fontWeight: 600 }}>{strLabel[str]}</span>
            </div>
          )}
        </>
      </F>

      {/* Terms */}
      <div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); setErr(p => ({ ...p, terms: '' })) }}
            style={{ marginTop: 2, accentColor: C.navy, width: 16, height: 16, flexShrink: 0 }} />
          <span style={{ fontSize: '0.81rem', color: '#6b7280', lineHeight: 1.5, fontFamily: font, userSelect: 'none' }}>
            I agree to the{' '}<a href="/terms" style={{ color: C.navy, fontWeight: 700, textDecoration: 'none' }}>Terms</a>
            {' '}&amp;{' '}<a href="/privacy" style={{ color: C.navy, fontWeight: 700, textDecoration: 'none' }}>Privacy Policy</a>
          </span>
        </label>
        <AnimatePresence>{err.terms && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ margin: '4px 0 0', fontSize: '0.76rem', color: C.err, fontFamily: font }}>{err.terms}</motion.p>}</AnimatePresence>
      </div>

      <PrimaryBtn busy={busy} busyLabel="Creating account…">Create Account</PrimaryBtn>
      <Or />
      <GBtn onClick={gLogin} busy={busy} />

      <p style={{ textAlign: 'center', margin: 0, fontSize: '0.875rem', color: '#6b7280', fontFamily: font }}>
        Already a member?{' '}
        <button type="button" onClick={() => nav('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: C.navy, fontFamily: font, fontSize: '0.875rem', padding: 0 }}>
          Log in →
        </button>
      </p>
    </form>
  )
}

/* ═══════════════════════════════════════════
   VERIFY VIEW
═══════════════════════════════════════════ */
const VerifyView = ({ go }) => {
  const nav = useNavigate()
  const [otp, setOtp]       = useState('')
  const [busy, setBusy]     = useState(false)
  const [cd, setCd]         = useState(0)
  const [resending, setRes] = useState(false)

  useEffect(() => {
    if (cd <= 0) return
    const t = setTimeout(() => setCd(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cd])

  const verify = ev => {
    ev.preventDefault()
    if (otp.length < 6) { toast.warn('Enter the complete 6-digit code'); return }
    const email = getCookie('Otp_Email')
    if (!email) { toast.error('Session expired'); go('signup'); return }
    setBusy(true)
    api.post('/verify', { email, otp })
      .then(() => { toast.success('Email verified! 🎉'); deleteCookie('Otp_Email'); nav('/dashboard', { replace: true }) })
      .catch(e => toast.error(e.response?.data?.message ?? 'Invalid or expired code'))
      .finally(() => setBusy(false))
  }

  const resend = async () => {
    const email = getCookie('Otp_Email')
    if (!email) { toast.error('Session expired'); go('signup'); return }
    setRes(true)
    try { await api.post('/resend-otp', { email }); toast.success('New code sent!'); setCd(60) }
    catch (e) { toast.error(e.response?.data?.message ?? 'Could not resend') }
    finally { setRes(false) }
  }

  return (
    <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
      {/* OTP grid */}
      <div style={{ width: '100%' }}>
        <p style={{ margin: '0 0 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', fontFamily: font }}>
          Enter 6-digit code
        </p>
        <OtpInput value={otp} onChange={setOtp} numInputs={6}
          renderSeparator={<span style={{ width: 8 }} />}
          containerStyle={{ display: 'flex', justifyContent: 'center' }}
          renderInput={(props) => (
            <input {...props} style={{
              width: 46, height: 56, textAlign: 'center', fontFamily: font,
              fontSize: '1.4rem', fontWeight: 800, borderRadius: 10,
              border: `2px solid ${props.value ? C.navy : '#d1d5db'}`,
              background: props.value ? 'rgba(0,35,102,0.05)' : C.white,
              color: C.navy, outline: 'none',
              transition: 'border-color 0.2s, background 0.2s',
              boxShadow: props.value ? '0 2px 8px rgba(0,35,102,0.12)' : 'none',
            }} />
          )}
        />
      </div>

      {/* Dot progress */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div key={i}
            animate={{ scale: i < otp.length ? 1.3 : 1, background: i < otp.length ? C.navy : '#d1d5db' }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{ width: 8, height: 8, borderRadius: '50%' }}
          />
        ))}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <PrimaryBtn busy={busy} busyLabel="Verifying…" disabled={otp.length < 6}>
          {otp.length === 6 ? '✓  Verify & Continue' : `Enter ${6 - otp.length} more digit${6 - otp.length !== 1 ? 's' : ''}`}
        </PrimaryBtn>

        <p style={{ textAlign: 'center', margin: 0, fontSize: '0.875rem', color: '#6b7280', fontFamily: font }}>
          Didn't get it?{' '}
          <button type="button" onClick={resend} disabled={resending || cd > 0}
            style={{ background: 'none', border: 'none', cursor: cd > 0 ? 'default' : 'pointer', fontWeight: 700, color: cd > 0 ? '#9ca3af' : C.navy, fontFamily: font, fontSize: '0.875rem', padding: 0 }}>
            {resending ? 'Sending…' : cd > 0 ? `Resend in ${cd}s` : 'Resend code'}
          </button>
        </p>

        <button type="button" onClick={() => nav('/sign-up')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontFamily: font, fontSize: '0.82rem', padding: 0, textAlign: 'center' }}>
          ← Back to Sign Up
        </button>
      </div>
    </form>
  )
}

/* ─── View metadata ──────────────────────── */
const meta = {
  login:  { step: 0, badge: '👋', title: 'Welcome back',    sub: 'Sign in to your BidKar account' },
  signup: { step: 1, badge: '🚀', title: 'Join BidKar.in',  sub: 'Create your free bidder account' },
  verify: { step: 2, badge: '📬', title: 'Check your inbox',sub: 'Enter the 6-digit code we emailed you' },
}

/* ═══════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════ */
const AuthPage = ({ initialView = 'login' }) => {
  const [view, setView] = useState(initialView)
  const { step, badge, title, sub } = meta[view]
  const dir = useRef(0)

  const go = (next) => {
    const steps = { login: 0, signup: 1, verify: 2 }
    dir.current = steps[next] > steps[view] ? 1 : -1
    setView(next)
  }

  /* Parallax mouse tracking for orbs */
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })

  const onMove = e => {
    mx.set((e.clientX / window.innerWidth  - 0.5) * 30)
    my.set((e.clientY / window.innerHeight - 0.5) * 30)
  }

  return (
    <div onMouseMove={onMove} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(145deg, ${C.navyD} 0%, ${C.navy} 45%, ${C.navyL} 100%)`,
      fontFamily: font, padding: '1.5rem', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes authSpin { to { transform: rotate(360deg); } }
        @keyframes floatUp  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>

      {/* Animated orbs */}
      <motion.div style={{ position: 'absolute', inset: 0, x: sx, y: sy, pointerEvents: 'none' }}>
        {orbs.map((o, i) => <Orb key={i} {...o} />)}
      </motion.div>

      {/* Fine grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Floating badge above card */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <motion.div
          key={view + '-badge'}
          initial={{ opacity: 0, scale: 0.5, y: -80 }}
          animate={{ opacity: 1, scale: 1, y: -230 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{
            width: 64, height: 64, borderRadius: 20, fontSize: '1.75rem',
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: 'floatUp 3s ease-in-out infinite',
          }}
        >
          {badge}
        </motion.div>
      </div>

      {/* ── Card ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: 460, borderRadius: 24,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.15)',
          overflow: 'hidden', position: 'relative', zIndex: 10,
        }}
      >
        {/* Gold top stripe */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.gold}, ${C.goldD}, ${C.gold})`, backgroundSize: '200% 100%' }} />

        {/* Card header */}
        <div style={{ padding: '2rem 2rem 0' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: C.navy }}>B</span>
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: C.navy, letterSpacing: '-0.03em' }}>
                BidKar<span style={{ color: C.gold }}>.in</span>
              </span>
            </div>

            {/* Step pills */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {['login', 'signup', 'verify'].map((v, i) => (
                <motion.div key={v}
                  animate={{
                    width: v === view ? 24 : 8,
                    background: v === view ? C.navy : (i < step ? C.goldD : '#d1d5db'),
                  }}
                  transition={{ duration: 0.35 }}
                  style={{ height: 8, borderRadius: 99 }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.div key={view + '-title'}
              initial={{ opacity: 0, x: dir.current * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir.current * 20 }}
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

        {/* Card body — form */}
        <div style={{ padding: '0 2rem 2rem' }}>
          <AnimatePresence mode="wait">
            <motion.div key={view}
              initial={{ opacity: 0, x: dir.current * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir.current * 32 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {view === 'login'  && <LoginView  go={go} />}
              {view === 'signup' && <SignupView go={go} />}
              {view === 'verify' && <VerifyView go={go} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card footer */}
        <div style={{
          borderTop: '1px solid #f3f4f6', padding: '1rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
        }}>
          {['🔒 Secure Escrow', '✅ KYC Verified', '⚡ Live Bidding'].map(t => (
            <span key={t} style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: font, fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </motion.div>

      {/* Bottom attribution */}
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

export default AuthPage
