import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Existing pages
import Home from './Pages/Home'
import SignUp from './Pages/Signup&login/SignUp'
import VerifyEmail from './Pages/Signup&login/VerifyEmail'
import Login from './Pages/Signup&login/Login'
import ForgotPassword from './Pages/Signup&login/ForgotPassword'
import Footer from './Components/Global/Footer'

// Phase 1 — Discovery & Hype
import ListingGridPage from './Pages/ListingGridPage'
import AuctionDetailPage from './Pages/AuctionDetailPage'

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

        {/* Auth pages */}
        <Route path="/sign-up"          element={<SignUp />} />
        <Route path="/Verify-email"     element={<VerifyEmail />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App