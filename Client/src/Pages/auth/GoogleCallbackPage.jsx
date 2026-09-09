import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/auth/login');
      return;
    }

    if (token) {
      try {
        // Store token
        localStorage.setItem('token', token);
        setToken(token);

        // Decode JWT to get user info (basic decode)
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          setUser({
            userId: decoded.userId,
            username: 'Google User',
            email: decoded.email || '',
            role: decoded.role || 'USER',
          });
        } catch (decodeErr) {
          console.log('Token decoded with basic info');
        }

        toast.success('Logged in with Google!');
        navigate('/');
      } catch (err) {
        console.error('Error processing Google auth:', err);
        toast.error('Authentication failed');
        navigate('/auth/login');
      }
    } else {
      navigate('/auth/login');
    }
  }, [searchParams, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="font-body-lg text-on-surface-variant">Signing you in...</p>
      </div>
    </div>
  );
}
