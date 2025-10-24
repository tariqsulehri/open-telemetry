const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const utils = require("./utils");
const features = require("../helpers/featuresHelper");
const configurePasswordPolicy = require("../validators/passwordPolicyValidator");

/**
 * Adds an authentication token to the response header.
 *
 * @param {Object} data - The user data object.
 * @param {Object} resObject - The response object.
 * @param {string} data.id - The user ID.
 * @param {string} data.role - The user role.
 * @param {string} data.email - The user email.
 * @returns {Promise<Object>} - A promise that resolves to the updated response object.
 *
 * @example
 * const res = await addAuthTokensInResponse({ id: '123', role: 'admin', email: 'user@example.com' }, res);
 * console.log(res); // Outputs the response object with the added "x-auth-token" header
 */
exports.addAuthTokensInResponse = async (data, res) => {
  try {
    await addAuthTokenInResponseHeader(data, res);
    return res;
  } catch (error) {
    return new Error(error.message);
  }
};

/**
 * Adds an authentication token to the response header.
 *
 * @param {Object} data - The user data object.
 * @param {Object} resObject - The response object.
 * @param {string} data.id - The user ID.
 * @param {string} data.role - The user role.
 * @param {string} data.email - The user email.
 * @returns {Promise<Object>} - A promise that resolves to the updated response object.
 *
 * @example
 * const res = await addAuthTokenInResponseHeader({ id: '123', role: 'admin', email: 'user@example.com' }, res);
 * console.log(res); // Outputs the response object with the added "x-auth-token" header
 */
const addAuthTokenInResponseHeader = async (data, res) => {
  try {
    let accessToken = await this.generateAuthTokens(data);
    res.header("x-auth-token", accessToken);
    return res;
  } catch (error) {
    throw new Error("Error generating auth tokens:" + error.message);
  }
};

/**
 * Generates an authentication token using JWT with the provided user data.
 *
 * @param {Object} data - The user data object.
 * @param {string} data.id - The user ID.
 * @param {string} data.role - The user role.
 * @param {string} data.email - The user email.
 * @returns {Promise<string>} - A promise that resolves to the generated JWT token.
 *
 * @example
 * const token = await generateAuthTokens({ id: '123', role: 'admin', email: 'user@example.com' });
 * console.log(token); // Outputs the JWT token
 */

exports.generateAuthTokens = async (data) => {
  /**  Generate an access token */
  const { id, email, role } = data;
  const accessTokenLimitHrs = await utils.convertMin2Hrs(
    features.accessTokenLimitMinutes()
  ); // Access Token Limit
  return jwt.sign(
    {
      id,
      role,
      email,
    },
    process.env.SECRET_ACCESS_TOKEN,
    {
      expiresIn: `${accessTokenLimitHrs}h`,
    }
  );
};

/**
 * Generates an authentication token using JWT with the provided user data.
 *
 * @param {Object} data - The user data object.
 * @param {string} data.id - The user ID.
 * @param {string} data.role - The user role.
 * @param {string} data.email - The user email.
 * @returns {Promise<string>} - A promise that resolves to the generated JWT token.
 *
 * @example
 * const token = await generateRefreshTokens({ id: '123', role: 'admin', email: 'user@example.com' });
 * console.log(token); // Outputs the JWT token
 */

exports.decodeToken = async (token) => {
  if (!token) {
    return null;
  }
  try {
    let tokenData = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
    return tokenData;
  } catch (ex) {
    return null;
  }
};

/**
 * Validates if the provided password matches the encrypted password.
 *
 * @param {string} requestPassword - The password provided by the user.
 * @param {string} encryptedPassword - The encrypted password stored in the database.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the password is valid.
 *
 * @example
 * const isValid = await isValidUser('userPassword', 'encryptedPasswordFromDB');
 * console.log(isValid); // Outputs true or false
 */
exports.isValidUser = async (
  requestPassword,
  encryptedPassword,
  responseObject
) => {
  return bcrypt.compare(requestPassword, encryptedPassword);
};

exports.encryptString = async (sourceString) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(sourceString, salt);
};

/**
 * Encrypts a given string using bcrypt.
 *
 * @param {string} sourceString - The string to be encrypted.
 * @returns {Promise<string>} - A promise that resolves to the encrypted string.
 *
 * @example
 * const hashedString = await encryptString('myPassword123');
 * console.log(hashedString); // Outputs the encrypted string
 */
exports.encryptString = async (sourceString) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(sourceString, salt);
};

/**
 * Generates a 4-digit one-time password (OTP).
 *
 * @returns {Promise<number>} - A promise that resolves 4 digit random pin.
 *
 * @example
 * const otp = await generateOTP();
 * console.log(otp); // Outputs a 4-digit OTP
 */
exports.generateOTP = async () => {
  return crypto.randomInt(1000, 10000);
};

/**
 * Generates a unique six-digit OTP using randomness and timestamp.
 * @returns {number} A unique six-digit OTP.
 */
exports.generateUniqueSixDigitOTP = () => {
  const timestamp = Date.now().toString();
  const randomValue = crypto.randomBytes(3).toString("hex"); // Generate randomness
  const hash = crypto
    .createHash("sha256")
    .update(timestamp + randomValue)
    .digest("hex");

  const otp = (parseInt(hash.substring(0, 6), 16) % 900000) + 100000;

  return otp;
};

/**
 * Validates the strength of a given password based on configured policies.
 *
 * @param {string} password - The password to validate.
 * @returns {Promise<boolean>} - Returns `true` if the password is valid and meets the policy requirements
 *                               otherwise, returns `false`.
 *
 * Dependencies:
 * - `features.checkPasswordStrictnessFeatures`: A function that determines whether password strictness checks should be enforced.
 * - `features.pwdOptions`: A function that provides the configuration options for password policies.
 * - `configurePasswordPolicy`: A function that sets up and returns the password validation schema.
 */
exports.validatePassword = async (password) => {
  // Check if the password is provided
  if (!password) {
    return false;
  }

  // Skip validation if strictness features are disabled and simply return true
  if (!features.checkPasswordStrictnessFeature()) {
    return true;
  }

  // Retrieve password policy options and configure the validation schema
  const options = features.pwdOptions();
  const passwordPolicy = configurePasswordPolicy(options);

  // Validate the password against the configured policy
  const validationErrors = passwordPolicy.validate(password, { list: true });

  // Return true if no validation errors, otherwise false
  return validationErrors.length === 0;
};
