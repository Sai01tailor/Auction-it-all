import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './Pages/HomePage';
import BrowsePage from './Pages/BrowsePage';
import AuctionDetailPage from './Pages/AuctionDetailPage';
import CreateListingPage from './Pages/CreateListingPage';
import MyBidsPage from './Pages/MyBidsPage';
import ProfilePage from './Pages/ProfilePage';
import WalletPage from './Pages/WalletPage';
import KYCPage from './Pages/KYCPage';
import LoginPage from './Pages/auth/LoginPage';
import RegisterPage from './Pages/auth/RegisterPage';
import VerifyPage from './Pages/auth/VerifyPage';
import GoogleCallbackPage from './Pages/auth/GoogleCallbackPage';
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
