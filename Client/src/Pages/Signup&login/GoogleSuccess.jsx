import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { setCookie } from '../../Components/Global/CookieIT';
import api from '../../../Config/Axios';
import { toast } from 'react-toastify';

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    if (token) {
      // 1. Set the cookie
      setCookie('auth_token', token, { days: 7 });

      // 2. Fetch the profile details to sync the AuthContext session state
      api.get('/auth/profile')
        .then((res) => {
          setUser(res.data?.user || res.data);
          toast.success('Signed in successfully with Google!');
          navigate('/dashboard', { replace: true });
        })
        .catch((err) => {
          console.error('Google session init failed:', err);
          toast.error('Session initialization failed. Please try logging in again.');
          navigate('/login', { replace: true });
        });
    } else {
      toast.error('Invalid Google Authentication redirect.');
      navigate('/login', { replace: true });
    }
  }, [token, navigate, setUser]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      background: 'var(--color-surface-bg)'
    }}>
      <div className="loading-spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(0,35,102,0.1)',
        borderTopColor: 'var(--color-brand-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--color-brand-primary)' }}>
        Authenticating with Google...
      </h3>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        Please wait while we secure your session.
      </p>
    </div>
  );
}
