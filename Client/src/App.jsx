import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import MyBidsPage from './pages/MyBidsPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import KYCPage from './pages/KYCPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPage from './pages/auth/VerifyPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

function App() {
  const { token } = useAuthStore();

  console.log('🔧 App component rendering');

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/verify" element={<VerifyPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

        {/* Protected Routes with Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/auction/:id" element={<AuctionDetailPage />} />
          
          {/* Protected Pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/my-bids" element={<MyBidsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/kyc" element={<KYCPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
