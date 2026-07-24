import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../Config/Axios';
import { useAuth } from '../Context/AuthContext';
import Header from '../Components/Global/Header';
import SEO from '../Components/Global/SEO';
import AuthController from '../Components/Global/AuthController';
import { toast } from 'react-toastify';
import { deleteCookie } from '../Components/Global/CookieIT';

export default function UserSettingsPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Backend logout failed:', e.message);
    }
    deleteCookie('auth_token');
    setUser(null);
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  // Profile fields
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading and Submitting states
  const [submitting, setSubmitting] = useState(false);

  // Pre-populate user settings on mount
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setCurrentAvatarUrl(user.avatar || '');
    }
  }, [user]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('username', username);

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      if (currentPassword && newPassword) {
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
      }

      const res = await api.patch('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success || res.data.user) {
        setUser(res.data.user || res.data);
        toast.success('Settings updated successfully!');
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.data.message || 'Failed to update settings.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating settings. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <SEO
        title="Account Settings & Security"
        description="Update profile information, change passwords, and manage security credentials on BidKar.in."
      />
      <AuthController />
      <Header />

      {/* ── FULL-WIDTH HERO BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg,var(--color-brand-primary-dark) 0%,var(--color-brand-primary) 55%,#1a3c7a 100%)',
        padding: '2.5rem 2rem 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dot grid overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            Account Settings
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
            Configure your profile identity, security credentials, and view account roles and verification status
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT (overlaps hero) ── */}
      <div style={{ maxWidth: '800px', margin: '-2rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Form wrapper */}
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Card 1: Profile Edits & Account Details */}
            <div style={{
              background: 'var(--color-surface-main)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Profile Information
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-brand-accent)', background: 'var(--color-surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : currentAvatarUrl ? (
                    <img src={currentAvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  )}
                </div>
                <div>
                  <label htmlFor="avatar-upload" className="btn btn-accent" style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    Upload Photo
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    Supports JPG, PNG up to 5MB.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="mobile-stack">
                <div>
                  <label htmlFor="display-name-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                    Display Name
                  </label>
                  <input
                    id="display-name-input"
                    type="text"
                    required
                    placeholder="Ramesh Kumar"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                    Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    style={{ width: '100%', background: 'var(--color-surface-bg)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }} className="mobile-stack">
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>Role</span>
                  <span style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(0,35,102,0.06)', color: 'var(--color-brand-primary)' }}>
                    {user?.role || 'USER'}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>Verification Status</span>
                  {(() => {
                    const status = user?.kycStatus || 'Unverified';
                    const colors = {
                      'Verified': { bg: '#ecfdf5', color: '#10b981' },
                      'Pending': { bg: '#fffbeb', color: '#f59e0b' },
                      'Unverified': { bg: '#f3f4f6', color: '#6b7280' },
                      'Failed': { bg: '#fef2f2', color: '#ef4444' }
                    }[status] || { bg: '#f3f4f6', color: '#6b7280' };
                    return (
                      <span style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, background: colors.bg, color: colors.color }}>
                        {status}
                      </span>
                    );
                  })()}
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>Authentication Method</span>
                  <span style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(0,35,102,0.06)', color: 'var(--color-brand-primary)', textTransform: 'capitalize' }}>
                    {user?.authProvider || 'Local'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Security & Credentials */}
            <div style={{
              background: 'var(--color-surface-main)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Security Settings
              </h3>

              {user?.authProvider === 'google' ? (
                <div style={{ padding: '1rem', background: 'rgba(0,35,102,0.03)', borderRadius: '12px', border: '1px solid rgba(0,35,102,0.06)', fontSize: '0.85rem', color: 'var(--color-text-rich)', lineHeight: 1.5 }}>
                  <strong>🔒 Google Single Sign-On Active</strong>
                  <p style={{ margin: '0.25rem 0 0', opacity: 0.8 }}>Your account authentication is secured via Google OAuth. Password modifications and account settings are managed directly within your Google Account settings.</p>
                </div>
              ) : (
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-rich)', marginBottom: '1rem' }}>
                    Update Password
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label htmlFor="current-pw" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                        Current Password
                      </label>
                      <input
                        id="current-pw"
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="mobile-stack">
                      <div>
                        <label htmlFor="new-pw" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                          New Password
                        </label>
                        <input
                          id="new-pw"
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-pw" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                          Confirm New Password
                        </label>
                        <input
                          id="confirm-pw"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Buttons */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: '1.5px solid #f87171',
                  color: '#f87171',
                  fontWeight: 700,
                  padding: '0.75rem 1.75rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  marginRight: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Log Out
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--color-border-subtle)',
                  color: 'var(--color-text-rich)',
                  fontWeight: 700,
                  padding: '0.75rem 2rem',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-accent"
                style={{
                  padding: '0.75rem 2.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(254,206,68,0.3)',
                  minWidth: '180px',
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
