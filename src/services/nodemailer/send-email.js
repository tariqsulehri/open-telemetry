const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const MAIL_TRANSPORT_CONFIG = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

/**
 * Generates HTML content for the email.
 *
 * @param {string} type - Type of email ("otp" or "reset").
 * @param {Object} params - Parameters for the email content.
 * @returns {string} - HTML content for the email.
 */
const generateEmailHTML = (type, params) => {
  if (type === "otp") {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="color: #4CAF50;">Verify Your Account</h2>
        <p>Hello,</p>
        <p>We received a request to verify your account. Use the OTP below to confirm your identity:</p>
        <p style="font-size: 1.5rem; font-weight: bold;">${params.otp}</p>
        <p>This OTP was generated on ${params.dateTime}.</p>
        <p>If you did not request this, please ignore this email or contact our support team.</p>
        <p>Best regards,<br>[Your Company Name]</p>
      </div>
    `;
  } else if (type === "reset") {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="color: #4CAF50;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Please use the link below to complete the process:</p>
        <a href="${params.link}" style="color: #1E90FF;">Reset Password</a>
        <p>This link was generated on ${params.dateTime}.</p>
        <p>If you did not request this, please ignore this email or contact our support team.</p>
        <p>Best regards,<br>[Your Company Name]</p>
      </div>
    `;
  }
  return "";
};

/**
 * Sends an email with OTP or reset link.
 *
 * @param {string} userEmail - Recipient's email address.
 * @param {string | number} otpOrLink - The OTP or reset link to include in the email.
 * @param {string} type - Type of email ("otp" or "reset").
 * @returns {Promise<boolean>} - True if email sent successfully, otherwise false.
 */
exports.sendEmail = async (userEmail, otpOrLink, type) => {
  try {
    const mailTransporter = nodemailer.createTransport(MAIL_TRANSPORT_CONFIG);

    const dateTime = new Date().toLocaleString();
    const emailParams = type === "otp" ? { otp: otpOrLink, dateTime } : { link: otpOrLink, dateTime };

    const mailDetails = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: type === "otp" ? "Verify Your Account" : "Reset Your Password",
      html: generateEmailHTML(type, emailParams),
    };

    await mailTransporter.sendMail(mailDetails);
    return true;
  } catch (err) {
    return false;
  }
};
