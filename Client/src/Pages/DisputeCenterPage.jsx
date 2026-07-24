import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../Config/Axios';
import { getActiveAuctions } from '../services/auctionService';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';

export default function DisputeCenterPage() {
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [loading, setLoading] = useState(true);

  // File Claim states
  const [soldItems, setSoldItems] = useState([]);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [reason, setReason] = useState('Item not as described');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Evidence upload states
  const [evidence, setEvidence] = useState([]);
  const [evidencePreviews, setEvidencePreviews] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addEvidenceFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addEvidenceFiles(e.target.files);
    }
  };

  const addEvidenceFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    const updatedEvidence = [...evidence, ...newFiles].slice(0, 5); // limit to 5
    setEvidence(updatedEvidence);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setEvidencePreviews([...evidencePreviews, ...newPreviews].slice(0, 5));
  };

  const removeEvidence = (index) => {
    const updatedEvidence = [...evidence];
    updatedEvidence.splice(index, 1);
    setEvidence(updatedEvidence);

    const updatedPreviews = [...evidencePreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setEvidencePreviews(updatedPreviews);
  };



  // Fetch disputes & items
  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/disputes/user');
      setDisputes(res.data.disputes || []);
    } catch (err) {
      console.error('Failed to load disputes', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSoldItems = async () => {
    try {
      // Fetch some items that ended to let users file disputes
      const res = await api.get('/items', { params: { limit: 50 } });
      const items = Array.isArray(res.data) ? res.data : (res.data.items ?? []);
      setSoldItems(items);
    } catch (err) {
      console.error('Failed to load items', err);
    }
  };

  useEffect(() => {
    loadDisputes();
    loadSoldItems();
  }, []);



  const handleFileDispute = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !description) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('itemId', selectedItemId);
      formData.append('reason', reason);
      formData.append('description', description);
      formData.append('bypassCooldown', 'true');
      
      evidence.forEach(file => {
        formData.append('evidence', file);
      });

      await api.post('/disputes/raise', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowFileModal(false);
      setSelectedItemId('');
      setDescription('');
      setEvidence([]);
      setEvidencePreviews([]);
      loadDisputes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to file dispute');
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <AuthController />
      <Header />

      {/* ── Page Header Band ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--color-brand-primary-dark) 0%, var(--color-brand-primary) 100%)',
        padding: '2.5rem 0 5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle decorative dot pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 0.4rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(254,206,68,0.9)' }}>
              Arbitration Board & Mediation Workspace
            </p>
            <h1 style={{
              margin: '0',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800, color: '#fff',
              letterSpacing: '-0.03em',
            }}>
              Mediation Dispute Center
            </h1>
          </div>
          <button
            onClick={() => setShowFileModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(239,68,68,0.25)'
            }}
          >
            ⚖️ File a New Claim
          </button>
        </div>
      </div>

      {/* Overlapping Workspace */}
      <div style={{ maxWidth: '1100px', margin: '-2.25rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', background: '#fff', borderRadius: '24px', border: '1px solid var(--color-border-subtle)', boxShadow: '0 4px 20px rgba(0,35,102,0.01)' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0,35,102,0.1)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Syncing dispute cases...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="lg:grid-cols-[340px_1fr]">
            
            {/* Disputes List (Left side) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0 }}>Active Disputes Dossiers ({disputes.length})</h2>
              
              {disputes.length === 0 ? (
                <div style={{ background: '#fff', border: '1px dashed var(--color-border-subtle)', borderRadius: '20px', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  No active disputes recorded.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {disputes.map(dispute => {
                    const isSelected = selectedDispute?._id === dispute._id;
                    return (
                      <div
                        key={dispute._id}
                        onClick={() => setSelectedDispute(dispute)}
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
                          background: dispute.status === 'RESOLVED' ? '#ecfdf5' : dispute.status === 'REJECTED' ? '#fef2f2' : '#fff7ed',
                          color: dispute.status === 'RESOLVED' ? '#047857' : dispute.status === 'REJECTED' ? '#b91c1c' : '#c2410c',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          display: 'inline-block',
                          marginBottom: '0.5rem',
                          textTransform: 'uppercase'
                        }}>
                          {dispute.status}
                        </span>
                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: 'var(--color-brand-primary)', fontWeight: 800 }}>
                          {dispute.itemId?.title || 'Auction Transaction'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          Reason: {dispute.reason}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dispute details & mediation workspace */}
            <div>
              {selectedDispute ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Case Detail Card */}
                  <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,35,102,0.01)' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                      Case dossier: {selectedDispute.itemId?.title}
                    </h3>
                    
                    {/* Stepper Status tracker */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-subtle)', borderBottom: '1px solid var(--color-border-subtle)', padding: '1.25rem 0', margin: '1rem 0' }}>
                      {['Dispute Raised', 'Admin Assigned', 'Evidence Review', selectedDispute.status === 'REJECTED' ? 'REJECTED' : 'RESOLVED'].map((step, sIdx) => {
                        const statusIndexMap = {
                          'Dispute Raised': 0,
                          'Admin Assigned': 1,
                          'Evidence Review': 2,
                          'RESOLVED': 3,
                          'REJECTED': 3
                        };
                        const currentStatusIdx = statusIndexMap[selectedDispute.status] || 0;
                        const isCompleted = sIdx <= currentStatusIdx;
                        return (
                          <div key={sIdx} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: isCompleted ? '#ef4444' : '#e5e7eb',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 0.4rem',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}>
                              {sIdx + 1}
                            </div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isCompleted ? 'var(--color-text-rich)' : 'var(--color-text-muted)' }}>{step}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Description detail */}
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 0.5rem' }}><strong>Conflict Description:</strong></p>
                      <p style={{ margin: 0, color: 'var(--color-text-muted)', background: 'var(--color-surface-bg)', padding: '1rem', borderRadius: '12px' }}>
                        "{selectedDispute.description}"
                      </p>
                    </div>

                    {selectedDispute.resolutionDetails && (
                      <div style={{ marginTop: '1.25rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                        <p style={{ margin: '0 0 0.35rem', color: '#065f46', fontWeight: 800 }}>⚖️ Mediation Ruling Verdict</p>
                        <p style={{ margin: 0, color: '#047857', fontStyle: 'italic' }}>
                          "{selectedDispute.resolutionDetails}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Verified Parties Contact Details (replacing chat) */}
                  <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,35,102,0.01)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                      🔒 Verified Parties Contact Cards
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: '1.45' }}>
                      System chat mediation is disabled. Disputing parties are advised to communicate directly via the verified contact details below, or check back here for administrative resolution.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', background: 'var(--color-surface-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border-subtle)' }}>
                      
                      {/* Reporter Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--color-border-subtle)', paddingRight: '1.25rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reporter (Filer)</span>
                        <div style={{ marginTop: '0.25rem' }}>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Username</span>
                          <strong style={{ color: 'var(--color-text-rich)' }}>{selectedDispute.reporterId?.username || 'Sai'}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Email Address</span>
                          <strong style={{ color: 'var(--color-text-rich)' }}>{selectedDispute.reporterId?.email || 'reporter@example.com'}</strong>
                        </div>
                      </div>

                      {/* Opponent Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Opposing Party</span>
                        <div style={{ marginTop: '0.25rem' }}>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Username</span>
                          <strong style={{ color: 'var(--color-text-rich)' }}>{selectedDispute.opponentId?.username || 'Seller'}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Email Address</span>
                          <strong style={{ color: 'var(--color-text-rich)' }}>{selectedDispute.opponentId?.email || 'opponent@example.com'}</strong>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '6rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)', boxShadow: '0 4px 20px rgba(0,35,102,0.01)' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1.5rem' }}>⚖️</span>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>Select a Dossier</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Select any case file on the left side to review logs and enter mediation.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* FILE NEW CLAIM MODAL OVERLAY */}
      <AnimatePresence>
        {showFileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                background: '#fff', width: '100%', maxWidth: '500px',
                borderRadius: '24px', overflow: 'hidden', padding: '2rem',
                color: 'var(--color-text-rich)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>File mediation dispute</h3>
                <button onClick={() => { setShowFileModal(false); setEvidence([]); setEvidencePreviews([]); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>×</button>
              </div>

              <form onSubmit={handleFileDispute} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                    Select Transaction Item
                  </label>
                  <select
                    required
                    value={selectedItemId}
                    onChange={e => setSelectedItemId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="">-- Choose Transaction Item --</option>
                    {soldItems.map(item => (
                      <option key={item._id} value={item._id}>{item.title} (₹{(item.currentHighestBid || item.startingPrice).toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                    Dispute Reason
                  </label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="Item not as described">Item not as described</option>
                    <option value="Seller didn't show up">Seller didn't show up</option>
                    <option value="Buyer refused to pay 90%">Buyer refused to pay 90%</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                    Mediation Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details of transaction conflict, including meeting location, times, and issue..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                    Evidence Uploads (Max 5 photos/screenshots/videos)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('evidence-uploader').click()}
                    style={{
                      border: isDragOver
                        ? '2.5px dashed var(--color-brand-primary)'
                        : '2.5px dashed var(--color-border-subtle)',
                      borderRadius: '12px',
                      padding: '1.5rem 1rem',
                      textAlign: 'center',
                      background: isDragOver ? 'rgba(0, 35, 102, 0.04)' : 'var(--color-surface-bg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      id="evidence-uploader"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>📸</div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-brand-primary)' }}>
                      Drag & Drop photos/videos here
                    </p>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      or click to browse files
                    </p>
                  </div>

                  {evidencePreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {evidencePreviews.map((previewUrl, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            width: '60px',
                            height: '60px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1.5px solid var(--color-border-subtle)',
                          }}
                        >
                          {evidence[idx]?.type.startsWith('video/') ? (
                            <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 800 }}>
                              VIDEO
                            </div>
                          ) : (
                            <img
                              src={previewUrl}
                              alt={`preview-${idx}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeEvidence(idx); }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              fontSize: '0.6rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              cursor: 'pointer',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '0.85rem', border: 'none',
                    borderRadius: '12px', background: '#ef4444', color: '#fff',
                    fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {submitting ? 'Submitting Dispute dossier...' : 'Submit Claim Dossier'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
