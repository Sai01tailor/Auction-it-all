import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Existing pages
import Home from './Pages/Home'
import SignUp from './Pages/Signup&login/SignUp'
import VerifyEmail from './Pages/Signup&login/VerifyEmail'
import Login from './Pages/Signup&login/Login'
import ForgotPassword from './Pages/Signup&login/ForgotPassword'
import GoogleSuccess from './Pages/Signup&login/GoogleSuccess'
import GoogleFailure from './Pages/Signup&login/GoogleFailure'
import Footer from './Components/Global/Footer'

// Phase 1 — Discovery & Hype
import ListingGridPage from './Pages/ListingGridPage'
import AuctionDetailPage from './Pages/AuctionDetailPage'

// Phase 2 — Bidding Terminal Console
import BiddingConsolePage from './Pages/BiddingConsolePage'

// Phase 3 — User Verification & Wallet
import WalletPage from './Pages/WalletPage'
import TransactionLedgerPage from './Pages/TransactionLedgerPage'
import KYCPage from './Pages/KYCPage'
import BidderDashboardPage from './Pages/BidderDashboardPage'

// Phase 4 — Seller Management
import CreateListingPage from './Pages/CreateListingPage'
import SellerStudioPage from './Pages/SellerStudioPage'
import SellerProfilePage from './Pages/SellerProfilePage'

// Phase 5 — Closing & Operations
import HandoffRoomPage from './Pages/HandoffRoomPage'
import DisputeCenterPage from './Pages/DisputeCenterPage'
import AdminPanelPage from './Pages/AdminPanelPage'
import LegalHubPage from './Pages/LegalHubPage'
import SitemapPage from './Pages/SitemapPage'
import InvoicePage from './Pages/InvoicePage'
import ContactUS from './Pages/ContactUS'
import HowItWorksPage from './Pages/HowItWorksPage'
import { NotFoundPage, WithdrawnPage, MaintenancePage } from './Pages/ErrorStatePages'
import UserSettingsPage from './Pages/UserSettingsPage'

const App = () => {
  return (
    <>
      <Routes>
        {/* P01 — Home */}
        <Route path="/" element={<Home />} />

        {/* P02 — Listing Grid */}
        <Route path="/auctions" element={<ListingGridPage />} />

        {/* P03 — Auction Detail */}
        <Route path="/auction/:id" element={<AuctionDetailPage />} />

        {/* Phase 2 — Bidding Terminal Console */}
        <Route path="/auction/:id/console" element={<BiddingConsolePage />} />

        {/* Phase 3 — User Verification & Wallet */}
        <Route path="/wallet"           element={<WalletPage />} />
        <Route path="/ledger"           element={<TransactionLedgerPage />} />
        <Route path="/kyc"              element={<KYCPage />} />
        <Route path="/dashboard"        element={<BidderDashboardPage />} />
        <Route path="/settings"         element={<UserSettingsPage />} />

        {/* Phase 4 — Seller Management */}
        <Route path="/seller/create"    element={<CreateListingPage />} />
        <Route path="/seller/studio"    element={<SellerStudioPage />} />
        <Route path="/seller/:id"       element={<SellerProfilePage />} />

        {/* Phase 5 — Closing & Operations */}
        <Route path="/handoff/:itemId"  element={<HandoffRoomPage />} />
        <Route path="/disputes"         element={<DisputeCenterPage />} />
        <Route path="/admin"            element={<AdminPanelPage />} />
        <Route path="/legal/:section"   element={<LegalHubPage />} />
        <Route path="/contact/:type"    element={<ContactUS />} />
        <Route path="/contact"          element={<ContactUS />} />
        <Route path="/how-it-works"     element={<HowItWorksPage />} />
        <Route path="/sitemap"          element={<SitemapPage />} />
        <Route path="/invoice/:itemId"  element={<InvoicePage />} />
        <Route path="/withdrawn"        element={<WithdrawnPage />} />
        <Route path="/maintenance"      element={<MaintenancePage />} />

        {/* Auth pages */}
        <Route path="/sign-up"          element={<SignUp />} />
        <Route path="/Verify-email"     element={<VerifyEmail />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/auth/google/success" element={<GoogleSuccess />} />
        <Route path="/auth/google/failure" element={<GoogleFailure />} />

        {/* Catch all 404 */}
        <Route path="*"                 element={<NotFoundPage />} />
      </Routes>

      <Footer />
      <ToastContainer position="bottom-right" autoClose={3500} theme="colored" />
    </>
  )
}

export default App