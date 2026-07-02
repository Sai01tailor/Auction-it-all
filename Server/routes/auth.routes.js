const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const passport = require('../strategies/google.strategy');

// ── Local Auth ──────────────────────────────────────────────
router.post('/register', authController.sendSignupOtp);
router.post('/verify', authController.verifySignupOtp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// ── Password Reset ──────────────────────────────────────────
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// ── Google OAuth ────────────────────────────────────────────
// Step 1: Redirect user to Google consent screen
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2: Google redirects back here with a code
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failure', session: false }),
  authController.googleCallback
);

// Called if Google auth fails
router.get('/google/failure', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientUrl}/auth/google/failure?error=google_failed`);
});

// ── Protected ───────────────────────────────────────────────
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
