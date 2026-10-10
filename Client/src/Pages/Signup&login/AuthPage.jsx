import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { setCookie, getCookie, deleteCookie } from '../../Components/Global/CookieIT'
import api from '../../../Config/interceptor'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import OtpInput from 'react-otp-input'
import EyeOff from '../../assets/Icons/EyeOff.svg'
import EyeOn from '../../assets/Icons/EyeOn.svg'
import { useAuth } from '../../Context/AuthContext'
import LongLogo from '../../assets/LongLogo.png'
import { Mail, Lock, User, ShieldCheck, CheckCircle2, Zap, ArrowRight } from 'lucide-react'

/* ─── Design Tokens & Constants ───────────────────────── */
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
  borderFocus: '#002366',
  white: '#ffffff',
  bg: '#f8fafc',
  err: '#dc2626',
  success: '#16a34a',
}
const font = "'Inter', system-ui, -apple-system, sans-serif"

/* ─── Spinner Component ───────────────────────────────── */
const Spin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    style={{ animation: 'authSpin 0.75s linear infinite', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

/* ─── Google SVG Icon ─────────────────────────────────── */
const GIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

/* ─── Form Input Field with Icon & Label ─────────────── */
const FormField = ({ label, id, icon: Icon, type = 'text', value, onChange, placeholder, hasErr, err, aside, rightElement, ...props }) => {
  const [f, setF] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && (
          <label htmlFor={id} style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#1e293b',
            fontFamily: font,
            letterSpacing: '0.01em',
          }}>
            {label}
          </label>
        )}
        {aside}
      </div> */}

      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '0.9rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            color: f ? C.navy : (hasErr ? C.err : '#94a3b8'),
            transition: 'color 0.2s',
            zIndex: 2,
          }}>
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
            paddingRight: rightElement ? '2.75rem' : '1rem',
            borderRadius: 10,
            fontFamily: font,
            fontSize: '0.9375rem',
            color: C.rich,
            outline: 'none',
            border: `1.5px solid ${f ? (hasErr ? C.err : C.navy) : (hasErr ? C.err : '#d1d5db')}`,
            background: hasErr ? '#fef2f2' : C.white,
            boxShadow: f ? `0 0 0 3px ${hasErr ? 'rgba(220,38,38,0.1)' : 'rgba(0,35,102,0.08)'}` : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
          }}
          {...props}
        />
        {rightElement && (
          <div style={{
            position: 'absolute',
            right: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 2,
          }}>
            {rightElement}
          </div>
        )}
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
  )
}

/* ─── Primary Submit Button ───────────────────────────── */
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
)

/* ─── OR Separator ────────────────────────────────────── */
const Or = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0.25rem 0' }}>
    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: font }}>OR</span>
    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
  </div>
)

/* ─── Google Authentication Button ────────────────────── */
const GBtn = ({ onClick, busy }) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={busy}
    whileHover={!busy ? { scale: 1.012, borderColor: '#94a3b8', background: '#fafbfc' } : {}}
    whileTap={!busy ? { scale: 0.988 } : {}}
    style={{
      width: '100%',
      padding: '0.78rem',
      borderRadius: 10,
      border: '1.5px solid #e2e8f0',
      background: C.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      fontFamily: font,
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#1e293b',
      cursor: busy ? 'not-allowed' : 'pointer',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'border-color 0.2s, background 0.2s',
    }}
  >
    <GIcon />
    <span>Continue with Google</span>
  </motion.button>
)

/* ─── Password Strength Helper ────────────────────────── */
const strength = (pw) => {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strColor = ['#e2e8f0', '#ef4444', '#f97316', '#eab308', '#22c55e']
const strLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']

/* ═══════════════════════════════════════════════════════
   1. LOGIN VIEW
═══════════════════════════════════════════════════════ */
const LoginView = ({ go }) => {
  const nav = useNavigate()
  const { setUser } = useAuth()
  const submittingRef = useRef(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState({})

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address'
    if (!pw) e.pw = 'Password is required'
    else if (pw.length < 8) e.pw = 'Minimum 8 characters'
    setErr(e)
    return !Object.keys(e).length
  }

  const submit = (ev) => {
    ev.preventDefault()
    if (submittingRef.current) return
    if (!validate()) return
    submittingRef.current = true
    setBusy(true)
    api.post('/auth/login', { email, password: pw })
      .then((r) => {
        if (r.data?.token) {
          setCookie('auth_token', r.data.token, { days: 7 })
          try { localStorage.setItem('auth_token', r.data.token) } catch (_) {}
          setUser(r.data.user ?? null)
        }
        toast.success('Welcome back! 🎉')
        nav('/dashboard', { replace: true })
      })
      .catch((e) => toast.error(e.response?.data?.message ?? 'Invalid credentials'))
      .finally(() => {
        submittingRef.current = false
        setBusy(false)
      })
  }

  const handleGoogleClick = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    window.location.href = `${apiBase}/auth/google`
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      <FormField
        label="Email"
        id="l-email"
        type="email"
        icon={Mail}
        placeholder="name@example.com"
        value={email}
        hasErr={!!err.email}
        err={err.email}
        onChange={(e) => { setEmail(e.target.value); setErr((p) => ({ ...p, email: '' })) }}
      />

      <FormField
        label="Password"
        id="l-pw"
        type={show ? 'text' : 'password'}
        icon={Lock}
        placeholder="••••••••"
        value={pw}
        hasErr={!!err.pw}
        err={err.pw}
        aside={
          <a
            href="/forgot-password"
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: C.navy,
              textDecoration: 'none',
              fontFamily: font,
            }}
          >
            Forgot password?
          </a>
        }
        onChange={(e) => { setPw(e.target.value); setErr((p) => ({ ...p, pw: '' })) }}
        rightElement={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            <img src={show ? EyeOff : EyeOn} alt="toggle password" style={{ width: '20px', height: '20px', opacity: 0.7 }} />
          </button>
        }
      />

      <PrimaryBtn busy={busy} busyLabel="Signing in…">
        Log In
      </PrimaryBtn>

      <Or />

      <GBtn onClick={handleGoogleClick} busy={busy} />

      <p style={{ textAlign: 'center', margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b', fontFamily: font }}>
        No account?{' '}
        <button
          type="button"
          onClick={() => go('signup')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            color: C.navy,
            fontFamily: font,
            fontSize: '0.875rem',
            padding: 0,
            textDecoration: 'none',
          }}
        >
          Create one →
        </button>
      </p>
    </form>
  )
}

/* ═══════════════════════════════════════════════════════
   2. SIGNUP VIEW
═══════════════════════════════════════════════════════ */
const SignupView = ({ go }) => {
  const nav = useNavigate()
  const submittingRef = useRef(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [show, setShow] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [terms, setTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState({})
  const str = strength(pw)

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Username is required'
    else if (name.trim().length < 3) e.name = 'Minimum 3 characters'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email'
    if (!pw) e.pw = 'Password is required'
    else if (pw.length < 8) e.pw = 'Minimum 8 characters'
    if (!confirmPw) e.confirmPw = 'Please confirm your password'
    else if (confirmPw !== pw) e.confirmPw = 'Passwords do not match'
    if (!terms) e.terms = 'Please accept the terms'
    setErr(e)
    return !Object.keys(e).length
  }

  const submit = (ev) => {
    ev.preventDefault()
    if (submittingRef.current) return
    if (!validate()) return

    if (getCookie('auth_token')) {
      nav('/dashboard', { replace: true })
      return
    }
    const pendingEmail = getCookie('Otp_Email')
    if (pendingEmail && pendingEmail.toLowerCase() === email.toLowerCase()) {
      toast.info('OTP already sent to this email. Please verify.')
      go('verify')
      return
    }

    submittingRef.current = true
    setBusy(true)
    api.post('/auth/register', { username: name, email, password: pw, role: 'USER' })
      .then(() => {
        toast.success('Account created! Check your inbox.')
        setCookie('Otp_Email', email, { days: 1, secure: true, sameSite: 'Strict' })
        go('verify')
      })
      .catch((e) => {
        const msg = e.response?.data?.message ?? 'Sign-up failed'
        if (e.response?.status === 400) {
          toast.info('This email is already registered. Please log in.', { autoClose: 2500 })
          go('login')
        } else {
          toast.error(msg)
        }
      })
      .finally(() => {
        submittingRef.current = false
        setBusy(false)
      })
  }

  const handleGoogleClick = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    window.location.href = `${apiBase}/auth/google`
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <FormField
        label="Username"
        id="su-name"
        type="text"
        icon={User}
        placeholder="e.g. bidmaster99"
        value={name}
        hasErr={!!err.name}
        err={err.name}
        onChange={(e) => { setName(e.target.value); setErr((p) => ({ ...p, name: '' })) }}
      />

      <FormField
        label="Email"
        id="su-email"
        type="email"
        icon={Mail}
        placeholder="name@example.com"
        value={email}
        hasErr={!!err.email}
        err={err.email}
        onChange={(e) => { setEmail(e.target.value); setErr((p) => ({ ...p, email: '' })) }}
      />

      <div>
        <FormField
          label="Password"
          id="su-pw"
          type={show ? 'text' : 'password'}
          icon={Lock}
          placeholder="••••••••"
          value={pw}
          hasErr={!!err.pw}
          err={err.pw}
          onChange={(e) => { setPw(e.target.value); setErr((p) => ({ ...p, pw: '' })) }}
          rightElement={
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              <img src={show ? EyeOff : EyeOn} alt="toggle password" style={{ width: '20px', height: '20px', opacity: 0.7 }} />
            </button>
          }
        />
        {pw && (
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ background: i <= str ? strColor[str] : '#e2e8f0' }}
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
      </div>

      <FormField
        label="Confirm Password"
        id="su-cpw"
        type={showConfirm ? 'text' : 'password'}
        icon={Lock}
        placeholder="••••••••"
        value={confirmPw}
        hasErr={!!err.confirmPw}
        err={err.confirmPw}
        onChange={(e) => { setConfirmPw(e.target.value); setErr((p) => ({ ...p, confirmPw: '' })) }}
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            <img src={showConfirm ? EyeOff : EyeOn} alt="toggle password" style={{ width: '20px', height: '20px', opacity: 0.7 }} />
          </button>
        }
      />

      {/* Terms */}
      <div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => { setTerms(e.target.checked); setErr((p) => ({ ...p, terms: '' })) }}
            style={{ marginTop: 3, accentColor: C.navy, width: 15, height: 15, flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, fontFamily: font, userSelect: 'none' }}>
            I agree to the <a href="/legal/terms" style={{ color: C.navy, fontWeight: 700, textDecoration: 'none' }}>Terms</a>, <a href="/legal/privacy" style={{ color: C.navy, fontWeight: 700, textDecoration: 'none' }}>Privacy Policy</a>, and <a href="/legal/terms" style={{ color: C.goldD, fontWeight: 800, textDecoration: 'none' }}>10% Escrow Rule</a>.
          </span>
        </label>
        <AnimatePresence>
          {err.terms && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ margin: '4px 0 0', fontSize: '0.75rem', color: C.err, fontFamily: font }}
            >
              {err.terms}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <PrimaryBtn busy={busy} busyLabel="Creating account…">
        Create Account
      </PrimaryBtn>

      <Or />

      <GBtn onClick={handleGoogleClick} busy={busy} />

      <p style={{ textAlign: 'center', margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b', fontFamily: font }}>
        Already a member?{' '}
        <button
          type="button"
          onClick={() => go('login')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            color: C.navy,
            fontFamily: font,
            fontSize: '0.875rem',
            padding: 0,
            textDecoration: 'none',
          }}
        >
          Log in →
        </button>
      </p>
    </form>
  )
}

/* ═══════════════════════════════════════════════════════
   3. VERIFY VIEW
═══════════════════════════════════════════════════════ */
const VerifyView = ({ go }) => {
  const nav = useNavigate()
  const { setUser } = useAuth()
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [cd, setCd] = useState(0)
  const [resending, setRes] = useState(false)

  useEffect(() => {
    if (cd <= 0) return
    const t = setTimeout(() => setCd((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cd])

  const verify = (ev) => {
    ev.preventDefault()
    if (otp.length < 6) { toast.warn('Enter the complete 6-digit code'); return }
    const email = getCookie('Otp_Email')
    if (!email) { toast.error('Session expired'); go('signup'); return }
    setBusy(true)
    api.post('/auth/verify', { email, otp })
      .then((r) => {
        toast.success('Email verified! 🎉')
        if (r.data?.token) {
          setCookie('auth_token', r.data.token, { days: 7 })
          try { localStorage.setItem('auth_token', r.data.token) } catch (_) {}
          setUser(r.data.user ?? null)
        }
        deleteCookie('Otp_Email')
        nav('/dashboard', { replace: true })
      })
      .catch((e) => toast.error(e.response?.data?.message ?? 'Invalid or expired code'))
      .finally(() => setBusy(false))
  }

  const resend = async () => {
    const email = getCookie('Otp_Email')
    if (!email) { toast.error('Session expired'); go('signup'); return }
    setRes(true)
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('New code sent!')
      setCd(60)
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Could not resend')
    } finally {
      setRes(false)
    }
  }

  return (
    <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
      <div style={{ width: '100%' }}>
        <p style={{ margin: '0 0 14px', fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', fontFamily: font, textAlign: 'center' }}>
          Enter the 6-digit verification code
        </p>
        <OtpInput
          value={otp}
          onChange={setOtp}
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

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i < otp.length ? 1.25 : 1, background: i < otp.length ? C.navy : '#cbd5e1' }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{ width: 7, height: 7, borderRadius: '50%' }}
          />
        ))}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <PrimaryBtn busy={busy} busyLabel="Verifying…" disabled={otp.length < 6}>
          {otp.length === 6 ? 'Verify & Continue' : `Enter ${6 - otp.length} more digit${6 - otp.length !== 1 ? 's' : ''}`}
        </PrimaryBtn>

        <p style={{ textAlign: 'center', margin: 0, fontSize: '0.84rem', color: '#64748b', fontFamily: font }}>
          Didn't get it?{' '}
          <button
            type="button"
            onClick={resend}
            disabled={resending || cd > 0}
            style={{
              background: 'none',
              border: 'none',
              cursor: cd > 0 ? 'default' : 'pointer',
              fontWeight: 700,
              color: cd > 0 ? '#94a3b8' : C.navy,
              fontFamily: font,
              fontSize: '0.84rem',
              padding: 0,
            }}
          >
            {resending ? 'Sending…' : cd > 0 ? `Resend in ${cd}s` : 'Resend code'}
          </button>
        </p>

        <button
          type="button"
          onClick={() => go('signup')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            fontFamily: font,
            fontSize: '0.82rem',
            padding: 0,
            textAlign: 'center',
          }}
        >
          ← Back to Sign Up
        </button>
      </div>
    </form>
  )
}

/* ─── Metadata for Views ──────────────────────────────── */
const meta = {
  login: {
    title: 'Welcome back',
    sub: 'Sign in to your BidKar account',
  },
  signup: {
    title: 'Join BidKar.in',
    sub: 'Create your free bidder account',
  },
  verify: {
    title: 'Check your inbox',
    sub: 'Enter the 6-digit code we emailed you',
  },
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT: AuthPage
═══════════════════════════════════════════════════════ */
const AuthPage = ({ initialView = 'login' }) => {
  const [view, setView] = useState(initialView)
  const { title, sub } = meta[view]
  const dir = useRef(0)
  const [cursor, setCursor] = useState({ x: -9999, y: -9999 })

  const go = (next) => {
    const steps = { login: 0, signup: 1, verify: 2 }
    dir.current = steps[next] > steps[view] ? 1 : -1
    setView(next)
  }

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top })
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
        @keyframes authSpin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Subtle Atmospheric Radial Lighting (Matching Home.jsx hero) */}
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

      {/* Extremely Subtle Dot Grid Texture */}
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

      {/* ── Center Two-Panel Container ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl flex flex-col-reverse md:flex-row items-stretch justify-center gap-6 lg:gap-8 relative z-10"
      >
        {/* ── LEFT PANEL: BRAND / TRUST ── */}
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
          className=" md:flex p-8 lg:p-9 "
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

            {/* Headline & Supporting copy */}
            <h2 style={{
              margin: '0 0 0.85rem',
              fontSize: '1.95rem',
              fontWeight: 800,
              color: C.navy,
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
            }}>
              Bid smarter.<br />
              <span style={{ color: C.goldD }}>Win what matters.</span>
            </h2>

            <p style={{
              margin: '0 0 2rem',
              fontSize: '0.95rem',
              color: '#475569',
              lineHeight: 1.55,
            }}>
              Join India's trusted live-auction marketplace.
            </p>

            {/* Three Trust Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(22, 163, 74, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.success, flexShrink: 0,
                }}>
                  <CheckCircle2 size={15} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                  Secure Escrow Protection
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(22, 163, 74, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.success, flexShrink: 0,
                }}>
                  <CheckCircle2 size={15} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                  100% KYC Verified Bidders
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(22, 163, 74, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.success, flexShrink: 0,
                }}>
                  <CheckCircle2 size={15} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                  Real-time Transparent Bidding
                </span>
              </div>
            </div>
          </div>

          {/* Understated Live Stats Element */}
          <div style={{
            marginTop: '2.5rem',
            padding: '0.85rem 1rem',
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={15} color={C.goldD} fill={C.gold} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.navy, letterSpacing: '0.01em' }}>
                ₹48Cr+ Traded Value
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>
              99.1% Success Rate
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL: AUTH FORM (Login / Signup / Verify) ── */}
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

          {/* Mobile Logo Display (When left card is hidden on small screens) */}
          <div className="flex md:hidden items-center justify-between mb-5">
            <a href="/" style={{ textDecoration: 'none' }}>
              <img src={LongLogo} alt="BidKar Logo" style={{ height: 32, width: 'auto' }} />
            </a>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={view + '-title'}
                initial={{ opacity: 0, x: dir.current * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -dir.current * 16 }}
                transition={{ duration: 0.22 }}
              >
                <h1 style={{
                  margin: '0 0 4px',
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: C.navy,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                }}>
                  {title}
                </h1>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.45 }}>
                  {sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form Body with Animated View Switching */}
          <div style={{ flex: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, x: dir.current * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -dir.current * 20 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {view === 'login' && <LoginView go={go} />}
                {view === 'signup' && <SignupView go={go} />}
                {view === 'verify' && <VerifyView go={go} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Subtitle Footer Copyright ── */}
      <p style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'rgba(255, 255, 255, 0.45)',
        fontFamily: font,
        position: 'relative',
        zIndex: 10,
      }}>
        © 2026 BidKar.in · Regulated under IT Act 2000
      </p>
    </div>
  )
}

export default AuthPage
