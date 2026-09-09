import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [step, setStep] = useState('email'); // email, verify
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register, verify } = useAuthStore();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(formData.email);
      toast.success('OTP sent to your email');
      setStep('verify');
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndCreate = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await verify(
        formData.email,
        formData.otp,
        formData.username,
        formData.password
      );
      toast.success('Account created successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Verification failed');
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
            BidKar
          </h1>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
            Create Account
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Join our premium auction platform
          </p>
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
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

            <button
              type="submit"
              disabled={isLoading}
              className="btn-bid w-full"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <div className="text-center font-body-md text-body-md">
              <span className="text-on-surface-variant">Already have an account? </span>
              <Link to="/auth/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Verify OTP & Create Account */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyAndCreate} className="space-y-6">
            <div>
              <label className="text-primary-label">6-Digit OTP</label>
              <input
                type="text"
                name="otp"
                maxLength="6"
                value={formData.otp}
                onChange={handleChange}
                placeholder="000 000"
                className="input-field"
                required
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Check your email for the OTP
              </p>
            </div>

            <div>
              <label className="text-primary-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="john_doe"
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

            <div>
              <label className="text-primary-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="btn-secondary w-full"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
