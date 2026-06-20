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
        otpExpiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
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

// ** New additions-1 for forget Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Security tip: Don't explicitly say "User not found" to prevent email enumeration attacks,
      // but for an internal app, a clear message helps debugging.
      return res.status(404).json({ success: false, message: "User with this email does not exist" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "Please verify your email first before resetting password" });
    }

    // 2. Generate and assign OTP
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes
    await user.save();

    // 3. Send email to user (FIXED PARAMETERS)
    const subject = "Password Reset Request - BidKar";
    const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>Your OTP for resetting your BidKar password is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>This code is valid for exactly 10 minutes. If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(email, subject, htmlContent);
    
    res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully to your email",
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reset Password (Verify & Update)
exports.resetPassword=async(req,res)=>{
  try{
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields (email, otp, newPassword) are required" });
    }

    // 1. Find user by email and match OTP
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Validate OTP accuracy and timeline
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one" });
    }

    // 3. update Password
    user.password = newPassword;

    // 4. Clear Otp so that it cannot be reused 
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login with your new password",
    });
  }catch(err){
    res.status(500).json({ success: false, message: err.message });
  }
}

// ================= RESEND OTP =================
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found. Please sign up first." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "This email is already verified. Please login." });
    }

    // Generate a new OTP and reset the 10-minute timer
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; 
    await user.save();

    // Use your existing mailer utility
    const subject = `Your New OTP is ${otp} (Valid for 10 Minutes)`;
    const htmlContent = `
      <h2>Hello ${user.username},</h2>
      <p>Your new account verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>This code will expire in exactly 10 minutes. Do not share it with anyone.</p>
    `;

    await sendEmail(email, subject, htmlContent);

    res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email",
    });

  } catch (error) {
    console.error("❌ RESEND OTP ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};