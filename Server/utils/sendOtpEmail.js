const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "User Signup OTP",
    html: `<h2>Your OTP is ${otp}</h2><p>Valid for 2 minutes</p>`
  });
};

module.exports = sendOtpEmail;
