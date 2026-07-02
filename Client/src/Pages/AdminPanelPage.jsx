import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../Config/Axios';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';
import { useAuth } from '../Context/AuthContext';

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('pulse');
  const [loading, setLoading] = useState(false);

  // States
  const [pulse, setPulse] = useState({ totalLiveAuctions: 0, pendingKYC: 0, totalHeldDeposits: 0, totalRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [kycUsers, setKycUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  
  // Tech Audit Logs States
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilters, setAuditFilters] = useState({
    action: '',
    userId: '',
    auctionId: '',
    startDate: '',
    endDate: '',
  });
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotalLogs, setAuditTotalLogs] = useState(0);
  const auditLimit = 15;

  // Selected Timeline for Tie-Breaking Analysis
  const [selectedTimelineAuction, setSelectedTimelineAuction] = useState('');
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  
  // Search state for users directory
  const [searchUser, setSearchUser] = useState('');

  // Mediation selected dispute details
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [mediationNotes, setMediationNotes] = useState('');
  const [resolvingDispute, setResolvingDispute] = useState(false);

  // Load metrics
  const loadPulseMetrics = async () => {
    try {
      const res = await api.get('/admin/pulse');
      setPulse(res.data.pulse);
    } catch (err) {
      console.error('Failed to load global pulse metrics', err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users', { params: { search: searchUser } });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users directory', err);
    }
  };

  const loadKYC = async () => {
    try {
      const res = await api.get('/admin/kyc/pending');
      setKycUsers(res.data.pendingUsers || []);
    } catch (err) {
      console.error('Failed to load pending KYC requests', err);
    }
  };

  const loadDisputes = async () => {
    try {
      const res = await api.get('/admin/disputes');
      setDisputes(res.data.disputes || []);
    } catch (err) {
      console.error('Failed to load disputes queue', err);
    }
  };

  // Load Audit Logs with backend filters and pagination
  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: auditPage,
        limit: auditLimit,
        ...auditFilters
      };
      // Clean empty string params
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const res = await api.get('/audit-logs', { params });
      setAuditLogs(res.data.logs || []);
      setAuditTotalPages(res.data.pagination?.totalPages || 1);
      setAuditTotalLogs(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  // Load auction bid timeline
  const loadAuctionTimeline = async (auctionId) => {
    if (!auctionId || auctionId.trim() === '') return;
    setTimelineLoading(true);
    try {
      const res = await api.get(`/audit-logs/auction/${auctionId.trim()}`);
      setTimelineEvents(res.data.timeline || []);
      setSelectedTimelineAuction(auctionId.trim());
    } catch (err) {
      console.error('Failed to load auction timeline', err);
      alert('Failed to retrieve timeline for auction: ' + auctionId);
    } finally {
      setTimelineLoading(false);
    }
  };

  // Sync tab loading
  useEffect(() => {
    loadPulseMetrics();
    if (activeTab === 'pulse') loadPulseMetrics();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'kyc') loadKYC();
    if (activeTab === 'disputes') loadDisputes();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'audits') {
      loadAuditLogs();
    }
  }, [activeTab, auditPage]);

  // Handle Search Trigger for User Directory
  const handleUserSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  // Handle Filter Trigger for Audit Logs
  const handleAuditFilterSubmit = (e) => {
    e.preventDefault();
    setAuditPage(1); // reset to page 1
    loadAuditLogs();
  };

  // KYC Manual resolution Action
  const handleKycResolve = async (userId, status) => {
    try {
      await api.post('/admin/kyc/resolve', {
        userId,
        status,
        failureReason: status === 'Failed' ? 'Details mismatch or blurry document uploads.' : null
      });
      loadKYC();
      loadPulseMetrics();
    } catch (err) {
      alert('KYC override failed');
    }
  };

  // User status ban toggle
  const handleToggleBlock = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-block`);
      loadUsers();
    } catch (err) {
      alert('Block toggle failed');
    }
  };

  // Resolve Dispute mediation verdicts
  const handleResolveDispute = async (action) => {
    if (!selectedDispute || !mediationNotes) return;
    setResolvingDispute(true);
    try {
      await api.post('/admin/disputes/resolve', {
        disputeId: selectedDispute._id,
        action,
        resolutionDetails: mediationNotes
      });
      setSelectedDispute(null);
      setMediationNotes('');
      loadDisputes();
      loadPulseMetrics();
    } catch (err) {
      alert('Failed to resolve dispute mediation');
    } finally {
      setResolvingDispute(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <AuthController />
      <Header />

      {/* ── FULL-WIDTH GRADIENT HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 55%, #1a3c7a 100%)',
        padding: '2rem 2rem 3.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dot grid overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', padding: '0.3rem 0.85rem', borderRadius: '20px', marginBottom: '0.75rem' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', animation: 'ping 1s infinite' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Restricted Command Mode</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            Master Admin Command Center
          </h1>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
            Restricted Dashboard: Manage user states, manually override KYC, and arbitrate dispute mediation queues.
          </p>
        </div>
      </div>

      {/* ── OVERLAPPING CONTENT WRAPPER ── */}
      <div style={{ maxWidth: '1200px', margin: '-1.75rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* ── 2-COLUMN GRID LAYOUT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.75rem', alignItems: 'start' }}>
          
          {/* ── LEFT COLUMN (Profile & Tab Sidebar) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Admin Profile Card */}
            <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#7f1d1d)', color: '#fff', fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem', boxShadow: '0 4px 14px rgba(239,68,68,0.2)' }}>
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
                {user?.username || 'System Administrator'}
              </h3>
              <p style={{ margin: '0.2rem 0 0.85rem', fontSize: '0.72rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {user?.email || 'admin@bidkar.in'}
              </p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fee2e2', color: '#991b1b', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid #fca5a5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                Master Root
              </span>
            </div>

            {/* Vertical Tab Navigation */}
            <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '0.5rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)' }}>
              {[
                { id: 'pulse', label: '📈 Global Pulse' },
                { id: 'users', label: '👤 User Directory' },
                { id: 'kyc', label: '🛡️ KYC Approvals' },
                { id: 'disputes', label: '⚖️ Disputes Mediation' },
                { id: 'audits', label: '📋 Tech Audit Logs' }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem 1rem', borderRadius: '12px',
                      border: 'none', background: isActive ? 'var(--color-brand-primary)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--color-text-rich)', fontWeight: 700, fontSize: '0.82rem',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Platform Health Alert */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '20px', padding: '1.25rem', color: '#065f46', boxShadow: '0 4px 20px rgba(16,185,129,0.02)' }}>
              <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>System Status</h4>
              <p style={{ margin: 0, fontSize: '0.7rem', lineHeight: 1.45 }}>
                Core microservices operating normally. Redis lock server response: <strong>1.2ms</strong>.
              </p>
            </div>

          </div>

          {/* ── RIGHT COLUMN (Dynamic Tab Content Panels) ── */}
          <div style={{ minHeight: '400px' }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                
                {/* ── TAB 1: Global Pulse ── */}
                {activeTab === 'pulse' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                      
                      {/* Live Auctions */}
                      <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.03em' }}>Total Live Auctions</span>
                        <h2 style={{ margin: '0.4rem 0 0', fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>{pulse.totalLiveAuctions}</h2>
                      </div>

                      {/* Held Deposits */}
                      <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.03em' }}>Total Held Escrow</span>
                        <h2 style={{ margin: '0.4rem 0 0', fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
                          ₹{pulse.totalHeldDeposits?.toLocaleString('en-IN')}
                        </h2>
                      </div>

                      {/* Pending KYC */}
                      <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.03em' }}>Pending KYC Requests</span>
                        <h2 style={{ margin: '0.4rem 0 0', fontSize: '1.8rem', fontWeight: 900, color: '#d97706' }}>{pulse.pendingKYC}</h2>
                      </div>

                      {/* Platform Revenue */}
                      <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.03em' }}>Net Platform Fees captured</span>
                        <h2 style={{ margin: '0.4rem 0 0', fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>
                          ₹{pulse.totalRevenue?.toLocaleString('en-IN')}
                        </h2>
                      </div>

                    </div>

                    <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-brand-primary)', fontWeight: 800 }}>Escrow Capture Rules Summary</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: '1.6', margin: 0 }}>
                        Escrow deposits are initialized at 10% of the item hammer value, held securely in the platform balance. Once handoff receipt is finalized by both parties, the platform captures a **2% processing commission fee** from the deposit escrow, and unlocks the remaining offline balance exchange. If disputes arise, mediator override release commands control allocation.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: User Directory ── */}
                {activeTab === 'users' && (
                  <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                    
                    {/* Search Form */}
                    <form onSubmit={handleUserSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Search user profile directory (Username / Email)..."
                        value={searchUser}
                        onChange={e => setSearchUser(e.target.value)}
                        style={{ flex: 1, padding: '0.65rem 0.85rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.82rem', outline: 'none' }}
                      />
                      <button type="submit" style={{ padding: '0.65rem 1.25rem', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                        Search
                      </button>
                    </form>

                    {/* Users Table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '2px solid var(--color-border-subtle)' }}>
                            <th style={{ padding: '0.75rem' }}>Username</th>
                            <th style={{ padding: '0.75rem' }}>Email</th>
                            <th style={{ padding: '0.75rem' }}>Role</th>
                            <th style={{ padding: '0.75rem' }}>KYC Status</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>{u.username}</td>
                              <td style={{ padding: '0.75rem' }}>{u.email}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.role}</td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{
                                  background: u.kycStatus === 'Verified' ? '#ecfdf5' : u.kycStatus === 'Pending' ? '#fff7ed' : '#fef2f2',
                                  color: u.kycStatus === 'Verified' ? '#047857' : u.kycStatus === 'Pending' ? '#c2410c' : '#b91c1c',
                                  fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase'
                                }}>{u.kycStatus}</span>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                <button
                                  onClick={() => handleToggleBlock(u._id)}
                                  style={{
                                    padding: '0.3rem 0.65rem',
                                    background: u.isBlocked ? '#ecfdf5' : '#fee2e2',
                                    color: u.isBlocked ? '#047857' : '#b91c1c',
                                    border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer'
                                  }}
                                >
                                  {u.isBlocked ? 'Activate User' : 'Ban User'}
                                </button>
                              </td>
                            </tr>
                          ))}
                          {users.length === 0 && (
                            <tr>
                              <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No profiles found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* ── TAB 3: KYC Approvals ── */}
                {activeTab === 'kyc' && (
                  <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0 }}>Pending KYC Requests Queue</h2>

                    {kycUsers.length === 0 ? (
                      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        No pending verification requests in the queue.
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '2px solid var(--color-border-subtle)' }}>
                              <th style={{ padding: '0.75rem' }}>Username</th>
                              <th style={{ padding: '0.75rem' }}>Email</th>
                              <th style={{ padding: '0.75rem' }}>Submitted At</th>
                              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Mediation Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {kycUsers.map(ku => (
                              <tr key={ku._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                                <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>{ku.username}</td>
                                <td style={{ padding: '0.75rem' }}>{ku.email}</td>
                                <td style={{ padding: '0.75rem' }}>{new Date(ku.kycLastAttemptAt || Date.now()).toLocaleString('en-IN')}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => handleKycResolve(ku._id, 'Verified')}
                                    style={{ padding: '0.3rem 0.65rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleKycResolve(ku._id, 'Failed')}
                                    style={{ padding: '0.3rem 0.65rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}
                                  >
                                    Reject
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 4: Disputes Mediation ── */}
                {activeTab === 'disputes' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lg:grid-cols-[300px_1fr]">
                    
                    {/* Disputes List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0 }}>Mediation Queue</h2>
                      
                      {disputes.length === 0 ? (
                        <div style={{ background: '#fff', border: '1px dashed var(--color-border-subtle)', borderRadius: '20px', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                          No disputes in queue.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {disputes.map(disp => {
                            const isSelected = selectedDispute?._id === disp._id;
                            return (
                              <div
                                key={disp._id}
                                onClick={() => setSelectedDispute(disp)}
                                style={{
                                  background: '#fff',
                                  border: isSelected ? '2px solid #ef4444' : '1px solid var(--color-border-subtle)',
                                  borderRadius: '12px', padding: '1rem', cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(0,35,102,0.01)', transition: 'all 0.15s'
                                }}
                              >
                                <span style={{
                                  background: disp.status === 'RESOLVED' ? '#ecfdf5' : disp.status === 'REJECTED' ? '#fef2f2' : '#fff7ed',
                                  color: disp.status === 'RESOLVED' ? '#047857' : disp.status === 'REJECTED' ? '#b91c1c' : '#c2410c',
                                  fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', marginBottom: '0.35rem', textTransform: 'uppercase'
                                }}>
                                  {disp.status}
                                </span>
                                <h4 style={{ margin: '0 0 0.15rem', fontSize: '0.82rem', color: 'var(--color-brand-primary)', fontWeight: 800 }}>{disp.itemId?.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-rich)', fontWeight: 600 }}>Reporter: {disp.reporterId?.username}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Dispute Detail / Resolution Console */}
                    <div>
                      {selectedDispute ? (
                        <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-brand-primary)', fontWeight: 800 }}>Mediating: {selectedDispute.itemId?.title}</h3>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Filed by <strong>{selectedDispute.reporterId?.username}</strong> against <strong>{selectedDispute.opponentId?.username}</strong>
                            </p>
                          </div>

                          <div style={{ background: 'var(--color-surface-bg)', padding: '0.85rem', borderRadius: '10px', fontSize: '0.78rem', border: '1px solid var(--color-border-subtle)' }}>
                            <p style={{ margin: '0 0 0.35rem', fontWeight: 700 }}>Mediation Claim details:</p>
                            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>"{selectedDispute.description}"</p>
                          </div>

                          {selectedDispute.status !== 'RESOLVED' && selectedDispute.status !== 'REJECTED' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
                                  Mediation Ruling Justification
                                </label>
                                <textarea
                                  required rows={3}
                                  placeholder="Write notes and justification before releasing ruling..."
                                  value={mediationNotes}
                                  onChange={e => setMediationNotes(e.target.value)}
                                  style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '0.78rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                                />
                              </div>

                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                  disabled={resolvingDispute || !mediationNotes.trim()}
                                  onClick={() => handleResolveDispute('RESOLVED')}
                                  style={{ flex: 1, padding: '0.65rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                  Refund Buyer (10% back)
                                </button>
                                <button
                                  disabled={resolvingDispute || !mediationNotes.trim()}
                                  onClick={() => handleResolveDispute('REJECTED')}
                                  style={{ flex: 1, padding: '0.65rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                  Release Escrow to Seller
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.85rem', borderRadius: '10px', fontSize: '0.78rem', color: '#047857' }}>
                              <p style={{ margin: '0 0 0.2rem' }}><strong>✔ Dispute Mediation Closed</strong></p>
                              <p style={{ margin: 0 }}>Verdict: "{selectedDispute.resolutionDetails}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '5rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                          Select a case to view mediation claim controls.
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* ── TAB 5: Tech Audit Logs ── */}
                {activeTab === 'audits' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Filter Panel */}
                    <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>Filter Audit Logs</h3>
                      
                      <form onSubmit={handleAuditFilterSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Action</label>
                          <select
                            value={auditFilters.action}
                            onChange={e => setAuditFilters(prev => ({ ...prev, action: e.target.value }))}
                            style={{ width: '100%', padding: '0.5rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '0.78rem', outline: 'none' }}
                          >
                            <option value="">All Actions</option>
                            <option value="BID_ATTEMPT">BID_ATTEMPT</option>
                            <option value="BID_ACCEPTED">BID_ACCEPTED</option>
                            <option value="BID_REJECTED">BID_REJECTED</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>User ID</label>
                          <input
                            type="text" placeholder="Filter by User ID"
                            value={auditFilters.userId}
                            onChange={e => setAuditFilters(prev => ({ ...prev, userId: e.target.value }))}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '0.78rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Auction ID</label>
                          <input
                            type="text" placeholder="Filter by Auction ID"
                            value={auditFilters.auctionId}
                            onChange={e => setAuditFilters(prev => ({ ...prev, auctionId: e.target.value }))}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '0.78rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Start Date</label>
                          <input
                            type="date"
                            value={auditFilters.startDate}
                            onChange={e => setAuditFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '0.45rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '0.78rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>End Date</label>
                          <input
                            type="date"
                            value={auditFilters.endDate}
                            onChange={e => setAuditFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '0.45rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '0.78rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <button type="submit" style={{ width: '100%', padding: '0.55rem', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
                            Apply Filters
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Timeline Analysis Section (Visible if selected timeline exists) */}
                    {selectedTimelineAuction && (
                      <div style={{ background: '#fff', border: '1.5px solid var(--color-brand-primary)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                              ⚡ Bid Timeline & Tie-Breaking Analysis
                            </h3>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                              Auction ID: <strong>{selectedTimelineAuction}</strong>
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedTimelineAuction('')}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            Close Analysis
                          </button>
                        </div>

                        {timelineLoading ? (
                          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '2.5px solid rgba(0,35,102,0.08)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Analyzing timestamps...</p>
                          </div>
                        ) : timelineEvents.length === 0 ? (
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: '2rem 0' }}>
                            No bidding activity logged for this auction ID.
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid var(--color-border-subtle)' }}>
                            {timelineEvents.map((evt, idx) => {
                              const isAccepted = evt.action === 'BID_ACCEPTED';
                              const isRejected = evt.action === 'BID_REJECTED';
                              const rawDate = new Date(evt.timestamp);
                              const msFormatted = `${rawDate.toLocaleTimeString('en-IN', { hour12: false })}.${String(rawDate.getMilliseconds()).padStart(3, '0')}`;

                              return (
                                <div key={idx} style={{ position: 'relative' }}>
                                  
                                  {/* Timeline Node Icon */}
                                  <div style={{
                                    position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%',
                                    background: isAccepted ? '#10b981' : isRejected ? '#ef4444' : '#f59e0b',
                                    border: '2px solid #fff', boxShadow: '0 0 0 2px rgba(0,0,0,0.05)'
                                  }} />

                                  <div style={{
                                    background: isAccepted ? 'rgba(16,185,129,0.03)' : isRejected ? 'rgba(239,68,68,0.03)' : 'rgba(245,158,11,0.03)',
                                    border: `1px solid ${isAccepted ? '#a7f3d0' : isRejected ? '#fca5a5' : '#fde68a'}`,
                                    borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.75rem'
                                  }}>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                      <span style={{ fontWeight: 800, color: isAccepted ? '#047857' : isRejected ? '#b91c1c' : '#b45309' }}>
                                        {evt.action}
                                      </span>
                                      
                                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-text-rich)' }}>
                                        🕒 {msFormatted} ({evt.serverReceivedAt ? `${evt.serverReceivedAt}ms` : 'N/A'})
                                      </strong>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', color: 'var(--color-text-muted)' }}>
                                      <div>
                                        Bid Amount: <strong style={{ color: 'var(--color-brand-primary)' }}>₹{evt.amount?.toLocaleString('en-IN')}</strong>
                                      </div>
                                      <div>
                                        User: <strong>{evt.username || 'Unknown'}</strong> (ID: {evt.userId})
                                      </div>
                                      <div style={{ fontSize: '0.68rem', marginTop: '0.15rem', display: 'flex', gap: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        <span>Server ID: <code>{evt.serverId || 'N/A'}</code></span>
                                        <span>IP: <code>{evt.ipAddress}</code></span>
                                      </div>

                                      {evt.reason && (
                                        <div style={{ marginTop: '0.35rem', background: '#fee2e2', color: '#b91c1c', padding: '0.3rem 0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.7rem' }}>
                                          ❌ Rejection: {evt.reason}
                                        </div>
                                      )}
                                    </div>

                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audit Logs Table */}
                    <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0 }}>
                          Technical Audit Trail Logs
                        </h2>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          Showing {auditLogs.length} of {auditTotalLogs} entries
                        </span>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '2px solid var(--color-border-subtle)' }}>
                              <th style={{ padding: '0.6rem' }}>Timestamp (Local)</th>
                              <th style={{ padding: '0.6rem' }}>Action</th>
                              <th style={{ padding: '0.6rem' }}>User</th>
                              <th style={{ padding: '0.6rem' }}>Auction ID (Click to analyze)</th>
                              <th style={{ padding: '0.6rem' }}>IP Address</th>
                              <th style={{ padding: '0.6rem' }}>Device Info</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditLogs.map((log, idx) => {
                              const auctionId = log.metadata?.auctionId;
                              return (
                                <tr key={log._id || idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                                  <td style={{ padding: '0.6rem', fontFamily: 'monospace' }}>
                                    {new Date(log.createdAt).toLocaleString('en-IN')}
                                  </td>
                                  <td style={{ padding: '0.6rem' }}>
                                    <span style={{
                                      background: log.action === 'BID_ACCEPTED' ? '#ecfdf5' : log.action === 'BID_REJECTED' ? '#fef2f2' : '#fff7ed',
                                      color: log.action === 'BID_ACCEPTED' ? '#047857' : log.action === 'BID_REJECTED' ? '#b91c1c' : '#c2410c',
                                      padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.62rem', display: 'inline-block'
                                    }}>
                                      {log.action}
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.6rem', fontWeight: 600 }}>{log.userId?.username || 'Guest'}</td>
                                  <td style={{ padding: '0.6rem' }}>
                                    {auctionId ? (
                                      <button
                                        onClick={() => loadAuctionTimeline(auctionId)}
                                        style={{
                                          background: 'none', border: 'none', padding: 0, color: 'var(--color-brand-primary-light)',
                                          fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.72rem'
                                        }}
                                      >
                                        {auctionId}
                                      </button>
                                    ) : (
                                      <span style={{ color: 'var(--color-text-muted)' }}>N/A</span>
                                    )}
                                  </td>
                                  <td style={{ padding: '0.6rem', fontFamily: 'monospace' }}>{log.ipAddress || '—'}</td>
                                  <td style={{ padding: '0.6rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={log.deviceInfo}>
                                    {log.deviceInfo || '—'}
                                  </td>
                                </tr>
                              );
                            })}
                            {auditLogs.length === 0 && (
                              <tr>
                                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                  {loading ? 'Retrieving records...' : 'No audit records match the filters.'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination for Audit Logs */}
                      {auditTotalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button
                            disabled={auditPage === 1}
                            onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                            style={{
                              padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1.5px solid var(--color-border-subtle)',
                              background: '#fff', color: auditPage === 1 ? 'var(--color-text-muted)' : 'var(--color-brand-primary)',
                              fontWeight: 700, fontSize: '0.72rem', cursor: auditPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Prev
                          </button>

                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                            Page {auditPage} of {auditTotalPages}
                          </span>

                          <button
                            disabled={auditPage === auditTotalPages}
                            onClick={() => setAuditPage(p => Math.min(auditTotalPages, p + 1))}
                            style={{
                              padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1.5px solid var(--color-border-subtle)',
                              background: '#fff', color: auditPage === auditTotalPages ? 'var(--color-text-muted)' : 'var(--color-brand-primary)',
                              fontWeight: 700, fontSize: '0.72rem', cursor: auditPage === auditTotalPages ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Next
                          </button>
                        </div>
                      )}

                    </div>

                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
