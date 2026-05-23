const {sendEmail}=require('../utils/mailer')

//as of now sample

/**
 * KYC Notification Methods
 */

/**
 * Send OTP verification initiated email
 */
const sendKYCInitiatedEmail = async (user, aadhaarMasked, otp) => {
  try {
    const subject = 'KYC Verification - OTP Sent';
    const html = `
      <h2>KYC Verification Started</h2>
      <p>Hi ${user.username},</p>
      <p>Your KYC verification has been initiated.</p>
      <p><strong>Aadhaar Number:</strong> ${aadhaarMasked}</p>
      <p><strong>Your OTP:</strong> <h3 style="color: #2563eb; font-size: 24px;">${otp}</h3></p>
      <p><strong>OTP Expires In:</strong> 10 minutes</p>
      <p>Please enter this OTP in the verification form to complete your KYC.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br/>Auction Platform Team</p>
    `;
    
    await sendEmail(user.email, subject, html);
    console.log(`[Notification] KYC initiated email sent to ${user.email}`);
  } catch (error) {
    console.error('[Notification] Error sending KYC initiated email:', error);
    // Don't throw - email failure shouldn't block main flow
  }
};

/**
 * Send KYC verification success email
 */
const sendKYCSuccessEmail = async (user) => {
  try {
    const subject = 'KYC Verification Successful';
    const html = `
      <h2>KYC Verification Completed</h2>
      <p>Hi ${user.username},</p>
      <p>Congratulations! Your KYC verification has been successfully completed.</p>
      <p><strong>Verification Status:</strong> Verified</p>
      <p><strong>Verified At:</strong> ${new Date().toLocaleString()}</p>
      <p>You can now access all features on the auction platform:</p>
      <ul>
        <li>Create auctions</li>
        <li>Place bids on high-value items</li>
        <li>Access premium features</li>
      </ul>
      <p>Thank you for completing your KYC verification!</p>
      <p>Best regards,<br/>Auction Platform Team</p>
    `;
    
    await sendEmail(user.email, subject, html);
    console.log(`[Notification] KYC success email sent to ${user.email}`);
  } catch (error) {
    console.error('[Notification] Error sending KYC success email:', error);
  }
};

/**
 * Send KYC verification failed email
 */
const sendKYCFailedEmail = async (user, reason) => {
  try {
    const subject = 'KYC Verification Failed';
    const html = `
      <h2>KYC Verification Failed</h2>
      <p>Hi ${user.username},</p>
      <p>Unfortunately, your KYC verification could not be completed.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>You can retry your KYC verification after 7 days.</p>
      <p>If you believe this is an error, please contact our support team.</p>
      <p>Best regards,<br/>Auction Platform Team</p>
    `;
    
    await sendEmail(user.email, subject, html);
    console.log(`[Notification] KYC failed email sent to ${user.email}`);
  } catch (error) {
    console.error('[Notification] Error sending KYC failed email:', error);
  }
};

/**
 * Send KYC lockout notification email
 */
const sendKYCLockoutEmail = async (user, unlockTime) => {
  try {
    const subject = 'KYC Verification - Too Many Failed Attempts';
    const html = `
      <h2>KYC Verification Locked</h2>
      <p>Hi ${user.username},</p>
      <p>Your KYC verification has been temporarily locked due to too many failed OTP attempts.</p>
      <p><strong>Reason:</strong> 3 failed OTP verification attempts</p>
      <p><strong>Locked Until:</strong> ${new Date(unlockTime).toLocaleString()}</p>
      <p>Please try again after the lockout period expires.</p>
      <p>For security reasons, we limit the number of OTP verification attempts.</p>
      <p>Best regards,<br/>Auction Platform Team</p>
    `;
    
    await sendEmail(user.email, subject, html);
    console.log(`[Notification] KYC lockout email sent to ${user.email}`);
  } catch (error) {
    console.error('[Notification] Error sending KYC lockout email:', error);
  }
};

module.exports = {
  sendEmail,
  sendKYCInitiatedEmail,
  sendKYCSuccessEmail,
  sendKYCFailedEmail,
  sendKYCLockoutEmail
};
