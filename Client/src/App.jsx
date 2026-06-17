import React from 'react'
import Home from './pages/Home'
import {Routes, Route } from 'react-router-dom'
import SignUp from './Pages/Signup&login/SignUp'
import VerifyEmail from './Pages/Signup&login/VerifyEmail'
import Login from './Pages/Signup&login/Login'
import Footer from './Components/Global/Footer'
import Auction_Detail_Page from './Pages/Auction_Detail_Page'
import ForgotPassword from './Pages/Signup&login/ForgotPassword'
const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/contact" element={<ContactUS />} /> */}
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/Verify-email" element={<VerifyEmail />} />
      <Route path='/login' element={<Login />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/auction/:id' element={<Auction_Detail_Page />} />

    </Routes>
    <Footer /></>
  )
}

export default App