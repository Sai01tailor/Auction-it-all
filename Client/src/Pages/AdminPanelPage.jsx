import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../Config/Axios';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pulse');
  const [loading, setLoading] = useState(false);

  // States
  const [pulse, setPulse] = useState({ totalLiveAuctions: 0, pendingKYC: 0, totalHeldDeposits: 0, totalRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [kycUsers, setKycUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Search state
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

  const loadAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setAuditLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    }
  };

  // Sync tab loading
  useEffect(() => {
    loadPulseMetrics();
    if (activeTab === 'pulse') loadPulseMetrics();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'kyc') loadKYC();
    if (activeTab === 'disputes') loadDisputes();
    if (activeTab === 'audits') loadAuditLogs();
  }, [activeTab]);

  // Handle Search Trigger
  const handleUserSearch = (e) => {
    e.preventDefault();
    loadUsers();
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

      <div style={{ maxWidth: '1200px', margin: '2.5rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-primary-dark) 100%)', color: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,35,102,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>Master Admin Command Center</h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
            Restricted Dashboard: Manage user states, manually override KYC, and arbitrate dispute mediation queues
          </p>
        </div>

        {/* Tab Controls (Responsive flex rows) */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1rem' }}>
          {[
            { id: 'pulse', label: '📈 Global Pulse' },
            { id: 'users', label: '👤 User Directory' },
            { id: 'kyc', label: '🛡️ KYC Approvals' },
            { id: 'disputes', label: '⚖️ Disputes mediation' },
            { id: 'audits', label: '📋 Tech Audit Logs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.65rem 1.25rem',
                border: 'none',
                background: activeTab === tab.id ? 'var(--color-brand-primary)' : '#fff',
                color: activeTab === tab.id ? '#fff' : 'var(--color-text-rich)',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                transition: 'all 0.25s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panels */}
        <div style={{ minHeight: '400px' }}>
          
          {/* TAB 1: Global Pulse (Responsive Stacking: flex-col on mobile, grid on desktop) */}
          {activeTab === 'pulse' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="md:grid-cols-2 lg:grid-cols-4">
                
                {/* Live Auctions */}
                <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Total Live Auctions</span>
                  <h2 style={{ margin: '0.4rem 0 0', fontSize: '2rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>{pulse.totalLiveAuctions}</h2>
                </div>

                {/* HELD Deposits */}
                <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Total HELD Escrow (INR)</span>
                  <h2 style={{ margin: '0.4rem 0 0', fontSize: '2rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
                    ₹{pulse.totalHeldDeposits?.toLocaleString('en-IN')}
                  </h2>
                </div>

                {/* Pending KYC */}
                <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Pending KYC Requests</span>
                  <h2 style={{ margin: '0.4rem 0 0', fontSize: '2rem', fontWeight: 900, color: 'var(--color-brand-accent-dark)' }}>{pulse.pendingKYC}</h2>
                </div>

                {/* Plattform revenue */}
                <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Net Platform Fee Captured</span>
                  <h2 style={{ margin: '0.4rem 0 0', fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>
                    ₹{pulse.totalRevenue?.toLocaleString('en-IN')}
                  </h2>
                </div>

              </div>

              <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-brand-primary)', fontWeight: 800 }}>Escrow Capture Rules Summary</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.6', margin: 0 }}>
                  Escrow deposits are initialized at 10% of the item hammer value, held securely in the platform balance. Once handoff receipt is finalized by both parties, the platform captures a **2% processing commission fee** from the deposit escrow, and unlocks the remaining offline balance exchange. If disputes arise, mediator override release commands control allocation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: User Directory */}
          {activeTab === 'users' && (
            <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
              
              {/* Search form */}
              <form onSubmit={handleUserSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Search user profile directory (Username / Email)..."
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem 1rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
                />
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Search</button>
              </form>

              {/* Users Directory Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
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
                        <td style={{ padding: '0.75rem', fontWeight: 700 }}>{u.username}</td>
                        <td style={{ padding: '0.75rem' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem' }}>{u.role}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            background: u.kycStatus === 'Verified' ? '#ecfdf5' : u.kycStatus === 'Pending' ? '#fff7ed' : '#fef2f2',
                            color: u.kycStatus === 'Verified' ? '#047857' : u.kycStatus === 'Pending' ? '#c2410c' : '#b91c1c',
                            fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px'
                          }}>{u.kycStatus}</span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleToggleBlock(u._id)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: u.isBlocked ? '#ecfdf5' : '#fee2e2',
                              color: u.isBlocked ? '#047857' : '#b91c1c',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            {u.isBlocked ? 'Activate User' : 'Ban User'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: KYC Approvals */}
          {activeTab === 'kyc' && (
            <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0 }}>Pending KYC Requests Queue</h2>

              {kycUsers.length === 0 ? (
                <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  No pending verification requests in the queue.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
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
                          <td style={{ padding: '0.75rem', fontWeight: 700 }}>{ku.username}</td>
                          <td style={{ padding: '0.75rem' }}>{ku.email}</td>
                          <td style={{ padding: '0.75rem' }}>{new Date(ku.kycLastAttemptAt || Date.now()).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleKycResolve(ku._id, 'Verified')}
                              style={{ padding: '0.35rem 0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Approve Verify
                            </button>
                            <button
                              onClick={() => handleKycResolve(ku._id, 'Failed')}
                              style={{ padding: '0.35rem 0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Reject Failure
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

          {/* TAB 4: Disputes mediation (Responsive layout: stacks flex-col on mobile) */}
          {activeTab === 'disputes' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="lg:grid-cols-[340px_1fr]">
              
              {/* Disputes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0 }}>Mediation Queues</h2>
                
                {disputes.length === 0 ? (
                  <div style={{ background: '#fff', border: '1px dashed var(--color-border-subtle)', borderRadius: '20px', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    No mediation disputes in the queue.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {disputes.map(disp => {
                      const isSelected = selectedDispute?._id === disp._id;
                      return (
                        <div
                          key={disp._id}
                          onClick={() => setSelectedDispute(disp)}
                          style={{
                            background: '#fff',
                            border: isSelected ? '2px solid #ef4444' : '1px solid var(--color-border-subtle)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0,35,102,0.01)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span style={{
                            background: disp.status === 'RESOLVED' ? '#ecfdf5' : disp.status === 'REJECTED' ? '#fef2f2' : '#fff7ed',
                            color: disp.status === 'RESOLVED' ? '#047857' : disp.status === 'REJECTED' ? '#b91c1c' : '#c2410c',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase'
                          }}>
                            {disp.status}
                          </span>
                          <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: 'var(--color-brand-primary)', fontWeight: 800 }}>{disp.itemId?.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-rich)', fontWeight: 600 }}>Reporter: {disp.reporterId?.username}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mediation Detail / resolution tool */}
              <div>
                {selectedDispute ? (
                  <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-brand-primary)', fontWeight: 800 }}>Mediating: {selectedDispute.itemId?.title}</h3>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Filed by **{selectedDispute.reporterId?.username}** against **{selectedDispute.opponentId?.username}**
                      </p>
                    </div>

                    <div style={{ background: 'var(--color-surface-bg)', padding: '1rem', borderRadius: '12px', fontSize: '0.82rem', border: '1px solid var(--color-border-subtle)' }}>
                      <p style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>Mediation Claim details:</p>
                      <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>"{selectedDispute.description}"</p>
                    </div>

                    {selectedDispute.status !== 'RESOLVED' && selectedDispute.status !== 'REJECTED' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                            Mediation Verdict Comments
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Write mediation notes and justification before releasing/refund command..."
                            value={mediationNotes}
                            onChange={e => setMediationNotes(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.82rem', outline: 'none', resize: 'none' }}
                          />
                        </div>

                        {/* Verdict Settlement options */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button
                            disabled={resolvingDispute || !mediationNotes.trim()}
                            onClick={() => handleResolveDispute('RESOLVED')}
                            style={{
                              flex: 1, padding: '0.85rem', background: '#10b981', color: '#fff', border: 'none',
                              borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer'
                            }}
                          >
                            Scenario A: Refund Buyer (10% back)
                          </button>
                          <button
                            disabled={resolvingDispute || !mediationNotes.trim()}
                            onClick={() => handleResolveDispute('REJECTED')}
                            style={{
                              flex: 1, padding: '0.85rem', background: '#ef4444', color: '#fff', border: 'none',
                              borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer'
                            }}
                          >
                            Scenario B: Pay Seller penalty fee (10% release)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '12px', fontSize: '0.82rem', color: '#047857' }}>
                        <p style={{ margin: '0 0 0.25rem' }}><strong>✔ Dispute Mediation Resolved</strong></p>
                        <p style={{ margin: 0 }}>Ruling Verdict: "{selectedDispute.resolutionDetails}"</p>
                      </div>
                    )}

                  </div>
                ) : (
                  <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '6rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
                    Select a dispute case from the queue to execute mediation controls.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: Tech Audit Logs */}
          {activeTab === 'audits' && (
            <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 15px rgba(0,35,102,0.01)' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0 }}>Technical Audit Trail Logs</h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '2px solid var(--color-border-subtle)' }}>
                      <th style={{ padding: '0.5rem' }}>Timestamp</th>
                      <th style={{ padding: '0.5rem' }}>Action</th>
                      <th style={{ padding: '0.5rem' }}>User</th>
                      <th style={{ padding: '0.5rem' }}>IP Address</th>
                      <th style={{ padding: '0.5rem' }}>Device Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, lIdx) => (
                      <tr key={log._id || lIdx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '0.5rem', fontWeight: 700 }}>{log.action}</td>
                        <td style={{ padding: '0.5rem' }}>{log.userId?.username || 'Guest'}</td>
                        <td style={{ padding: '0.5rem' }}>{log.ipAddress}</td>
                        <td style={{ padding: '0.5rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{log.deviceInfo || 'Chrome'}</td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No audit logs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
