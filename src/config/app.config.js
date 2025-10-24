const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  // Access token validity duration in minutes.
  ACCESS_TOKEN_LIMIT_MIN: process.env.ACCESS_TOKEN_LIMIT_IN_MIN || 60,

  // OTP validation duration in minutes
  OTP_EXPIRY_DURATION_MINS: process.env.OTP_EXPIRY_DURATION_IN_MINS || 10,

  /**
   * Password policy configuration
   * This object defines the rules for creating secure passwords.
   */
  ENABLE_PASSWORD_STRICTNESS:
    process.env.ENABLE_PASSWORD_STRICTNESS_CHECK || false, // Enables/disables strict password policy.

  pwdOptions: {
    minLength: 8, // Minimum allowed password length.
    maxLength: 20, // Maximum allowed password length.
    requireUppercase: true, // Require at least one uppercase letter in the password.
    requireLowercase: true, // Require at least one lowercase letter in the password.
    requireDigits: true, // Require at least one digit in the password.
    requireSymbols: true, // Require at least one special character in the password.
    disallowedPasswords: [/admin/i], // List of passwords explicitly disallowed.
  },
};
