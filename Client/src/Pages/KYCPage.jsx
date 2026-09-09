import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { kycAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function KYCPage() {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState('dashboard'); // dashboard, verification, success
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    otp: '',
    bankAccountNumber: '',
    bankIfsc: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await kycAPI.getStatus();
      setKycStatus(response.data);
      if (response.data.kycStatus === 'Verified') {
        setStep('success');
      }
    } catch (error) {
      toast.error('Failed to fetch KYC status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('aadhaarNumber', formData.aadhaarNumber);
      formDataObj.append('otp', formData.otp);
      formDataObj.append('bankAccountNumber', formData.bankAccountNumber);
      formDataObj.append('bankIfsc', formData.bankIfsc);

      await kycAPI.submitKYC(formDataObj);
      setStep('success');
      toast.success('KYC submitted for verification');
    } catch (error) {
      toast.error(error.message || 'Failed to submit KYC');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <span className="material-symbols-outlined text-4xl">loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container-main py-8">
        {/* Dashboard Step */}
        {step === 'dashboard' && kycStatus?.kycStatus !== 'Verified' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-headline-lg mb-2">KYC Verification</h1>
            <p className="text-body-lg text-on-surface-variant mb-8">
              Complete your Know Your Customer (KYC) profile to unlock full bidding capabilities
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Card */}
              <div className="card bg-primary text-on-primary">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-timer-warning animate-pulse"></div>
                  <span className="font-label-caps text-label-caps uppercase">
                    {kycStatus?.kycStatus || 'Not Started'}
                  </span>
                </div>
                <h3 className="text-headline-lg text-on-primary mb-3">
                  Instant Verification
                </h3>
                <p className="text-on-primary/80 mb-6">
                  Verify your identity using Aadhaar OTP and bank details. Takes about 2 minutes.
                </p>
                <button
                  onClick={() => setStep('verification')}
                  className="btn-primary bg-gold-dark text-[#0A0A0A] hover:bg-secondary-container"
                >
                  Start Verification
                </button>
              </div>

              {/* Requirements Card */}
              <div className="card">
                <h3 className="text-headline-lg mb-4">What You'll Need</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="material-symbols-outlined text-success-pulse">
                      check_circle
                    </span>
                    <div>
                      <p className="font-body-md font-medium text-primary">
                        Aadhaar Number
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        12-digit unique ID
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="material-symbols-outlined text-success-pulse">
                      check_circle
                    </span>
                    <div>
                      <p className="font-body-md font-medium text-primary">
                        Mobile with OTP
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Aadhaar-linked phone number
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="material-symbols-outlined text-success-pulse">
                      check_circle
                    </span>
                    <div>
                      <p className="font-body-md font-medium text-primary">
                        Bank Details
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Account and IFSC code
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Verification Form Step */}
        {step === 'verification' && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep('dashboard')}
              className="flex items-center gap-2 text-primary font-bold mb-8 hover:underline"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back
            </button>

            <h1 className="text-headline-lg mb-2">Aadhaar Verification</h1>
            <p className="text-body-lg text-on-surface-variant mb-8">
              Verify your identity using Aadhaar OTP
            </p>

            <form onSubmit={handleSubmit} className="card space-y-6">
              {/* Aadhaar Section */}
              <div>
                <h3 className="font-body-lg font-bold text-primary mb-4 pb-2 border-b border-border-subtle">
                  Aadhaar OTP Verification
                </h3>

                <div>
                  <label className="text-primary-label">Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    placeholder="0000 0000 0000"
                    className="input-field"
                    pattern="[0-9\s]{12,14}"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="text-primary-label">6-Digit OTP</label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="000 000"
                    className="input-field"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required
                  />
                  <p className="text-xs text-on-surface-variant mt-1">
                    OTP sent to your registered mobile number
                  </p>
                </div>

                <button type="button" className="text-primary font-bold text-sm mt-3 hover:underline">
                  Resend OTP
                </button>
              </div>

              {/* Bank Details Section */}
              <div>
                <h3 className="font-body-lg font-bold text-primary mb-4 pb-2 border-b border-border-subtle border-t pt-4">
                  Bank Account Details
                </h3>

                <div>
                  <label className="text-primary-label">Account Number</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    placeholder="1234567890123456"
                    className="input-field"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="text-primary-label">IFSC Code</label>
                  <input
                    type="text"
                    name="bankIfsc"
                    value={formData.bankIfsc}
                    onChange={handleChange}
                    placeholder="SBIN0001234"
                    className="input-field"
                    pattern="[A-Z]{4}0[A-Z0-9]{6}"
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end pt-6 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setStep('dashboard')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-bid"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Submit'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="max-w-md mx-auto text-center">
            <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-success-pulse/10 animate-ping"></div>
              <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-surface rounded-full border border-success-pulse/30 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-success-pulse">
                  check_circle
                </span>
              </div>
            </div>

            <h1 className="text-headline-lg mb-2">Verification Successful</h1>
            <p className="text-body-lg text-on-surface-variant mb-8">
              Your identity has been verified. You now have full access to bid on all live auctions.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/browse')}
                className="btn-bid w-full flex items-center justify-center gap-2"
              >
                Explore Auctions
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-secondary w-full"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
