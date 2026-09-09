import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, getProfile, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        navigate('/auth/login');
      } catch (error) {
        toast.error('Logout failed');
      }
    }
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
      <div className="container-main py-8 max-w-2xl">
        <h1 className="text-headline-lg mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="card text-center">
              <div className="w-24 h-24 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary font-display-bid text-display-bid mx-auto mb-4">
                {profile?.username?.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-headline-lg mb-1">{profile?.username}</h2>
              <p className="text-body-md text-on-surface-variant mb-4">
                {profile?.email}
              </p>

              <div className="space-y-2 text-sm border-t border-border-subtle pt-4">
                <div>
                  <p className="text-xs text-on-surface-variant">Member Since</p>
                  <p className="font-body-md font-medium text-primary">
                    {new Date(profile?.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Role</p>
                  <span className="badge badge-success">
                    {profile?.role || 'USER'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-secondary w-full mt-6"
              >
                <span className="material-symbols-outlined mr-2">logout</span>
                Logout
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="card">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-subtle">
                <h3 className="font-body-lg font-bold text-primary">
                  Account Information
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  {isEditing ? 'Done' : 'Edit'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-primary-label">Email Address</label>
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className="input-field opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-on-surface-variant mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="text-primary-label">Username</label>
                  <input
                    type="text"
                    value={profile?.username}
                    disabled={!isEditing}
                    className={isEditing ? 'input-field' : 'input-field opacity-50 cursor-not-allowed'}
                  />
                </div>

                {isEditing && (
                  <button className="btn-primary w-full">
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* KYC Status */}
            <div className="card">
              <h3 className="font-body-lg font-bold text-primary mb-4 pb-4 border-b border-border-subtle">
                KYC Verification
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">
                    Verification Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        profile?.kycStatus === 'Verified'
                          ? 'bg-success-pulse'
                          : 'bg-timer-warning'
                      }`}
                    ></span>
                    <p className="font-body-md font-medium text-primary">
                      {profile?.kycStatus || 'Not Verified'}
                    </p>
                  </div>
                </div>

                {profile?.kycVerifiedAt && (
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">
                      Verified On
                    </p>
                    <p className="font-body-md font-medium text-primary">
                      {new Date(profile.kycVerifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {profile?.kycStatus !== 'Verified' && (
                  <button
                    onClick={() => navigate('/kyc')}
                    className="btn-bid w-full mt-4"
                  >
                    Complete KYC Verification
                  </button>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card border-error">
              <h3 className="font-body-lg font-bold text-error mb-4 pb-4 border-b border-error">
                Danger Zone
              </h3>
              <p className="text-body-md text-on-surface-variant mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="btn-secondary border-error text-error w-full">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
