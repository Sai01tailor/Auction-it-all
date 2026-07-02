import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../Config/Axios';
import { useAuth } from '../Context/AuthContext';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';
import { toast } from 'react-toastify';

export default function UserSettingsPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Profile fields
  const [username, setUsername] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('');

  // Language Preference
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // Security Toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications Toggles
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Loading and Submitting states
  const [submitting, setSubmitting] = useState(false);

  // Pre-populate user settings on mount
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setPreferredLanguage(user.preferredLanguage || 'English');
      setTwoFactorEnabled(!!user.twoFactorEnabled);
      setCurrentAvatarUrl(user.profilePicture || '');
      if (user.notifications) {
        setSmsEnabled(user.notifications.sms !== false);
        setEmailEnabled(user.notifications.email !== false);
        setPushEnabled(!!user.notifications.push);
      }
    }
  }, [user]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
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
      formData.append('preferredLanguage', preferredLanguage);
      formData.append('twoFactorEnabled', String(twoFactorEnabled));
      formData.append('notifications[sms]', String(smsEnabled));
      formData.append('notifications[email]', String(emailEnabled));
      formData.append('notifications[push]', String(pushEnabled));

      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
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
      <AuthController />
      <Header />

      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Page Banner */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-primary-dark) 100%)',
            padding: '2rem',
            borderRadius: '24px',
            boxShadow: '0 8px 30px rgba(0,35,102,0.1)',
            color: '#fff'
          }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brand-accent)', fontWeight: 800 }}>
              Member Preferences
            </span>
            <h1 style={{ margin: '0.2rem 0 0.5rem', fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
              Account Settings
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
              Configure your profile identity, security credentials, and platform notification preferences.
            </p>
          </div>

          {/* Form wrapper */}
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Card 1: Profile Edits */}
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
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                👤 Profile Information
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-brand-accent)', background: 'var(--color-surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : currentAvatarUrl ? (
                    <img src={currentAvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>👤</span>
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
            </div>

            {/* Card 2: Vernacular Preferences */}
            <div style={{
              background: 'var(--color-surface-main)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                🌐 Language Settings (ભાષા / ભાષા)
              </h3>
              
              <div>
                <label htmlFor="lang-select" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                  Preferred System Language
                </label>
                <select
                  id="lang-select"
                  value={preferredLanguage}
                  onChange={e => setPreferredLanguage(e.target.value)}
                  style={{ width: '100%', background: '#fff' }}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                </select>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  The application will display text, notifications, and alerts in your selected language.
                </span>
              </div>
            </div>

            {/* Card 3: Security & Credentials */}
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
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                🔒 Security Settings
              </h3>

              {/* Two-Factor Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1.25rem' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-rich)' }}>
                    Two-Factor Authentication (2FA)
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    Secure high-value bids with an extra mobile OTP confirmation step.
                  </span>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={e => setTwoFactorEnabled(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: twoFactorEnabled ? 'var(--color-brand-primary)' : '#ccc',
                    borderRadius: '24px', transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px',
                      backgroundColor: '#fff', borderRadius: '50%', transition: '0.3s',
                      transform: twoFactorEnabled ? 'translateX(22px)' : 'none'
                    }} />
                  </span>
                </label>
              </div>

              {/* Change Password fields */}
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
            </div>

            {/* Card 4: Notification Preferences */}
            <div style={{
              background: 'var(--color-surface-main)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                🔔 Notification Channels
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Email Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-rich)' }}>Email Alerts</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Send bids, invoices, and outbid reports to email.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={e => setEmailEnabled(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>

                {/* SMS Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-rich)' }}>SMS / WhatsApp Alerts</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Send transactional messages and OTPs to mobile.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={e => setSmsEnabled(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>

                {/* Browser Push Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-rich)' }}>Browser Push Notifications</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Display real-time desktop pop-ups when outbid.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={e => setPushEnabled(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--color-border-subtle)',
                  color: 'var(--color-text-rich)',
                  fontWeight: 700,
                  padding: '0.75rem 2rem',
                  borderRadius: '12px'
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
                  minWidth: '180px'
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
