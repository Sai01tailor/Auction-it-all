import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function BottomNavBar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/browse', label: 'Auctions', icon: 'gavel' },
    { path: '/my-bids', label: 'Bids', icon: 'fact_check', protected: true },
    { path: '/profile', label: 'Profile', icon: 'person', protected: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant flex justify-around items-center px-margin-mobile py-3">
      {navItems.map((item) => {
        if (item.protected && !user) return null;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'text-primary font-bold'
                : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label-caps text-label-caps uppercase mt-1 text-xs">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
