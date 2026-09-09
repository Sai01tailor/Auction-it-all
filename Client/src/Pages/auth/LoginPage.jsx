import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoogleSignIn = () => {
    authAPI.googleInitiate();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
            BidKar
          </h1>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
            Welcome Back
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-primary-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="text-primary-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-bid w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-on-surface-variant">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full btn-secondary"
        >
          <span className="material-symbols-outlined mr-2">account_circle</span>
          Sign in with Google
        </button>

        {/* Links */}
        <div className="space-y-2 text-center">
          <div className="font-body-md text-body-md">
            <span className="text-on-surface-variant">Don't have an account? </span>
            <Link to="/auth/register" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </div>
          <div>
            <Link to="#" className="text-primary text-sm font-bold hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
