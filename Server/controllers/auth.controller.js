const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const generateOtp = require("../utils/generateOtp");
const { sendEmail } = require("../utils/mailer"); // Importing your exact mailer utility

// Helper to enforce strict JWT payload naming
const createToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: "1d" }
  );
};

// ================= SEND OTP =================
exports.sendSignupOtp = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    let user = await User.findOne({ email });

    // If they already exist and are verified, stop them.
    if (user && user.isVerified) {
      return res.status(400).json({ success: false, message: "User already exists and is verified." });
    }

    const otp = generateOtp();

    if (!user) {
      // Create an unverified user
      user = await User.create({
        username,
        email,
        password,
        role: role || "USER", // Defaults to USER if not provided
        otp,
        otpExpiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes
      });
    } else {
      // If they tried to sign up before but didn't verify, update their details and new OTP
      user.username = username;
      user.password = password;
      user.otp = otp;
      user.otpExpiresAt = Date.now() + 2 * 60 * 1000;
      await user.save();
    }

    // 🔥 Using your custom mailer.js utility here
    const subject = `Your OTP is ${otp} (Valid for 2 Minutes)`;
    const htmlContent = `
      <h2>Welcome to the Auction Platform, ${username}!</h2>
      <p>Your account verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>This code will expire in exactly 2 minutes. Do not share it with anyone.</p>
    `;

    await sendEmail(email, subject, htmlContent);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });

  } catch (error) {
    console.error("❌ OTP ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ================= VERIFY OTP =================
exports.verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Verify user and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token: createToken(user),
      user: {
        userId: user._id,       // STRICT NAMING: userId
        username: user.username,
        email: user.email,
        role: user.role
      },
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: createToken(user),
      user: {
        userId: user._id,       // STRICT NAMING: userId
        username: user.username,
        email: user.email,
        role: user.role
      },
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
  // Since you are using stateless JWTs, true logout happens on the frontend by deleting the token.
  // This endpoint is mostly a polite confirmation for the client.
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ================= GET PROFILE (ME) =================
exports.getProfile = async (req, res) => {
  try {
    // req.user is populated by your auth.middleware.js
    res.status(200).json({
      success: true,
      user: {
        userId: req.user._id,   // STRICT NAMING: userId
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};