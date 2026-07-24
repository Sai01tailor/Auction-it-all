import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';
import { toast } from 'react-toastify';
import api from '../../Config/Axios';

export default function ContactUS() {
  const { type = 'email' } = useParams();
  const navigate = useNavigate();

  // Contact Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Account & KYC Support');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tabs = [
    {
      id: 'email',
      name: 'Email Ticket',
      desc: 'Direct ticket corridor',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      )
    },
    {
      id: 'helpline',
      name: 'Emergency Helpline',
      desc: 'Toll-free voice support',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    },
    {
      id: 'grievance',
      name: 'Grievance Officer',
      desc: 'IT Act compliance escalation',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
          <path d="M9 22V12h6v10" />
          <path d="M2 9h20L12 2z" />
        </svg>
      )
    },
    {
      id: 'address',
      name: 'Office Address',
      desc: 'Surat physical coordinates',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    }
  ];

  // POST /api/contact — submits a real support ticket
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.warn('Please fill out all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/contact', { name, email, subject, message });
      const ticketId = data.ticketId ?? data.ticket?.id ?? 'BK-' + Date.now();
      toast.success(`Ticket ${ticketId} created! We'll reply within 2 hours.`);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <SEO
        title="Contact Customer Support & Help Desk"
        description="Get in touch with BidKar.in customer service via email, phone, or live support chat for assistance with auctions, deposits, and verification."
      />
      <Header />

      {/* Banner - Full Bleed Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 60%, #001f5c 100%)',
        color: '#fff',
        padding: '2.5rem 0.65rem 4.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-brand-accent)', background: 'rgba(254,206,68,0.12)', border: '1px solid rgba(254,206,68,0.25)', padding: '0.3rem 0.75rem', borderRadius: '20px', display: 'inline-block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Official Helpdesk & Support
          </span>
          <h1 style={{ color: 'var(--color-brand-accent)', margin: 0, fontSize: 'clamp(1.6rem, 4.5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Help & Support Hub
          </h1>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            Official customer assistance corridor. Lodge direct support tickets, reach our emergency helpline, connect with the grievance cell, or view physical coordinates.
          </p>
        </div>
      </section>

      {/* Main Grid Container - Overlapping with absolute z-index stacking */}
      <div style={{ maxWidth: '1100px', margin: '-2.5rem auto 4.5rem', padding: '0 0.65rem', position: 'relative', zIndex: 20 }}>

        {/* Main Split Grid */}
        <div className="contact-grid">

          {/* Sidebar Navigation */}
          <div className="contact-sidebar">
            {tabs.map(tab => {
              const isActive = type === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/contact/${tab.id}`)}
                  className="contact-tab-btn"
                  style={{
                    textAlign: 'left',
                    border: '1.5px solid',
                    borderColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                    background: isActive ? 'var(--color-brand-primary)' : '#fff',
                    color: isActive ? '#fff' : 'var(--color-text-rich)',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 8px 20px rgba(0,35,102,0.08)' : '0 2px 8px rgba(0,35,102,0.01)',
                    transition: 'all 0.2s',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: isActive ? '#fff' : 'var(--color-brand-primary)', display: 'inline-flex', flexShrink: 0 }}>
                      {tab.icon}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.name}</span>
                  </div>
                  <span className="hidden sm:block" style={{
                    fontSize: '0.68rem',
                    fontWeight: 500,
                    opacity: isActive ? 0.8 : 0.6,
                    paddingLeft: '1.4rem'
                  }}>
                    {tab.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Support Workspace */}
          <div className="contact-workspace" style={{
            background: '#fff',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 8px 30px rgba(0,35,102,0.02)',
            minHeight: '380px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>

            {/* ── Tab 1: Email Ticket ── */}
            {type === 'email' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                    <span>Send an Support Ticket</span>
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Our helpdesk responds within an average of 2 hours for active escrow transactions.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="md:grid-cols-2">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-subtle)', color: 'var(--color-brand-primary)', fontWeight: 600 }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. ramesh@gmail.com"
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-subtle)', color: 'var(--color-brand-primary)', fontWeight: 600 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Category / Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-subtle)', color: 'var(--color-brand-primary)', fontWeight: 600, background: '#fff' }}
                    >
                      <option>Account & KYC Support</option>
                      <option>Payment & Wallet Issues</option>
                      <option>Active Escrow & Handoff</option>
                      <option>Dispute Appeal</option>
                      <option>General Feedback</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Message Body</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Describe your issue or question in detail. If this relates to an active auction, please include the Auction ID."
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-subtle)', resize: 'none', color: 'var(--color-text-rich)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: 'var(--color-brand-primary)',
                      color: '#fff',
                      fontWeight: 700,
                      padding: '0.85rem',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,35,102,0.15)',
                      transition: 'background 0.2s'
                    }}
                  >
                    {submitting ? 'Creating support case...' : 'Submit Support Ticket'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Tab 2: Emergency Helpline ── */}
            {type === 'helpline' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Emergency Helpline Voice Desk</span>
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    As a regulated e-commerce auction platform in India, we operate a direct hotline for payment failures or wallet lock emergencies.
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--color-surface-bg)',
                  border: '1.5px dashed var(--color-brand-accent-dark)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  marginTop: '1rem',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>TOLL-FREE NUMBER</span>
                    <strong style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      Will be update soon
                    </strong>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard('Will be updated soon', 'Helpline')}
                    style={{
                      background: '#fff',
                      color: 'var(--color-brand-primary)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    Copy Number
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--color-text-muted)' }}>
                  <h4 style={{ margin: '0.5rem 0 0', fontWeight: 800, color: 'var(--color-text-rich)' }}>Support Service SLA Hours:</h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-brand-primary)' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span><strong>Escrow Hold & Theft Alerts:</strong> 24 hours a day, 7 days a week.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-brand-primary)' }}>
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      <span><strong>Razorpay & Wallet Top-ups:</strong> 9:00 AM to 6:00 PM (Monday to Saturday).</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-brand-primary)' }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span><strong>Handoff Coordination Assistance:</strong> 10:00 AM to 7:00 PM (All days).</span>
                    </li>
                  </ul>
                  <p style={{ fontStyle: 'italic', margin: '0.5rem 0 0', fontSize: '0.78rem' }}>
                    *Note: Voice calls are recorded for verification audit trails in compliance with the IT Act 2000.*
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Tab 3: Grievance Officer ── */}
            {type === 'grievance' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                      <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
                      <path d="M9 22V12h6v10" />
                      <path d="M2 9h20L12 2z" />
                    </svg>
                    <span>Grievance Redressal Escalation Desk</span>
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    In accordance with the Information Technology Act 2000 and consumer protection e-commerce rules, please contact our grievance officer.
                  </p>
                </div>

                <div style={{
                  background: '#fff',
                  border: '1.5px solid var(--color-brand-primary)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  boxShadow: '0 8px 24px rgba(0,35,102,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative compliance badge background element */}
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: 'var(--color-brand-accent)',
                    transform: 'rotate(45deg)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '6px'
                  }}>
                    <span style={{ fontSize: '0.85rem', transform: 'rotate(-45deg)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-primary-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
                        <path d="M9 22V12h6v10" />
                        <path d="M2 9h20L12 2z" />
                      </svg>
                    </span>
                  </div>

                  <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-brand-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>APPOINTED COMPLIANCE OFFICER</span>
                    <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.15rem', color: 'var(--color-brand-primary)', fontWeight: 900 }}>Mr. Sai Tailor</h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Grievance Redressal Lead & Arbitration Head</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Email:</span>
                      <strong style={{ color: 'var(--color-brand-primary)', cursor: 'pointer' }} onClick={() => handleCopyToClipboard('support@bidkar.in', 'Grievance Email')}>
                        support@bidkar.in
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>Office:</span>
                      <strong style={{ color: 'var(--color-text-rich)', textAlign: 'right', maxWidth: '240px' }}>
                        Surat, Gujarat
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '12px', fontSize: '0.78rem', color: '#065f46', lineHeight: 1.5, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, color: '#10b981' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>
                    <strong>Escalation SLA Check:</strong> All formal disputes lodged via Mr. Sai Tailor are legally acknowledged within 48 hours and resolved strictly within a <strong>30-day window</strong> as required under Consumer Protection Rules.
                  </span>
                </div>
              </motion.div>
            )}

            {/* ── Tab 4: Office Address ── */}
            {type === 'address' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-brand-primary)', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-accent-dark)' }}>
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>BidKar Surat Corporate Headquarters</span>
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Our centralized coordination office is located in Surat's commercial tech hub.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ background: 'var(--color-surface-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border-subtle)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, color: 'var(--color-brand-primary)' }}>
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                      <line x1="9" y1="22" x2="15" y2="22" />
                      <line x1="8" y1="6" x2="16" y2="6" />
                      <line x1="16" y1="14" x2="16" y2="18" />
                    </svg>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-rich)', display: 'block', marginBottom: '0.2rem' }}>
                        BidKar.in Private Limited
                      </strong>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                        Landmark Arcade, Third Floor,<br />
                        Near Diamond Corridor, Surat - 395006,<br />
                        Gujarat, India
                      </p>
                    </div>
                  </div>

                  {/* Stylized CSS Mini-Map Component */}
                  <div style={{
                    height: '160px',
                    borderRadius: '16px',
                    border: '1.5px solid var(--color-border-subtle)',
                    background: 'radial-gradient(circle at 70% 40%, rgba(254,206,68,0.15) 0%, transparent 60%), linear-gradient(135deg, #001a52 0%, #002366 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Simulated grid lines */}
                    <div style={{
                      position: 'absolute', inset: 0, opacity: 0.1,
                      backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />

                    {/* Pulsing location point */}
                    <div style={{
                      position: 'absolute',
                      top: '40%',
                      left: '70%',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{
                        position: 'absolute', width: '24px', height: '24px', borderRadius: '50%',
                        background: 'var(--color-brand-accent)', opacity: 0.5,
                        animation: 'bid-pulse 1.5s ease-out infinite'
                      }} />
                      <span style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: 'var(--color-brand-accent)', border: '2px solid #fff', zIndex: 2
                      }} />
                    </div>

                    <span style={{ color: '#fff', fontSize: '0.76rem', fontWeight: 700, zIndex: 3, position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.4)', padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Coordinates: Surat, Gujarat
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyToClipboard('BidKar.in, Landmark Arcade, Surat, Gujarat - 395006', 'Address')}
                    style={{
                      padding: '0.75rem',
                      background: 'var(--color-brand-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    Copy Full Address
                  </button>
                </div>
              </motion.div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}