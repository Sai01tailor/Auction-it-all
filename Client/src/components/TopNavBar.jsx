import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function TopNavBar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/auth/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="bg-navy-dark border-b border-navy-light sticky top-0 z-50">
      {/* Desktop NavBar */}
      <div className="hidden md:flex items-center justify-between px-margin-desktop py-4 max-w-container-max mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-gold-light font-bold text-2xl">BidKar</span>
        </Link>

        <nav className="flex gap-6 items-center">
          <Link to="/browse" className="text-white/80 hover:text-gold-light transition-colors font-body-md">
            Auctions
          </Link>
          <Link to="/my-bids" className="text-white/80 hover:text-gold-light transition-colors font-body-md">
            My Bids
          </Link>
          {user?.role === 'SELLER' && (
            <Link to="/create-listing" className="text-white/80 hover:text-gold-light transition-colors font-body-md">
              Sell
            </Link>
          )}
          <Link to="/kyc" className="text-white/80 hover:text-gold-light transition-colors font-body-md">
            KYC
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/wallet" className="px-6 h-12 rounded-lg bg-gold-dark text-navy-dark font-body-md font-bold hover:bg-gold-light transition-colors flex items-center justify-center">
            Wallet
          </Link>
          {user ? (
            <div className="flex items-center gap-2 ml-4">
              <button className="material-symbols-outlined p-2 text-white/80 hover:text-gold-light rounded-full transition-colors">
                notifications
              </button>
              <div className="w-10 h-10 rounded-full bg-gold-dark flex items-center justify-center text-navy-dark font-bold text-sm">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-gold-light transition-colors ml-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth/login" className="px-6 h-12 rounded-lg bg-gold-dark text-navy-dark font-body-md font-bold hover:bg-gold-light transition-colors flex items-center justify-center">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile NavBar */}
      <div className="md:hidden flex items-center justify-between px-margin-mobile py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-gold-light font-bold text-xl">BidKar</span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="material-symbols-outlined p-2 text-white">
            notifications
          </button>
          {user ? (
            <div className="w-10 h-10 rounded-full bg-gold-dark flex items-center justify-center text-navy-dark font-bold text-sm">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          ) : (
            <Link to="/auth/login" className="text-gold-dark font-bold">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
