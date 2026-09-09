import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function VerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const error = params.get('error');

    if (error) {
      navigate('/auth/login', { state: { error: 'Google authentication failed' } });
      return;
    }

    if (token) {
      setToken(token);
      navigate('/');
    }
  }, [location, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <span className="material-symbols-outlined text-4xl text-primary">
            loading
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Verifying your account...
        </p>
      </div>
    </div>
  );
}
