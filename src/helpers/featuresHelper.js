const appConfigs = require("../config/app.config");

/**
 * Checks whether the password strictness feature is enabled in the application configuration.
 *
 * @returns {boolean} - `true` if password strictness is enabled, otherwise `false`.
 */
exports.checkPasswordStrictnessFeature = function () {
  return appConfigs.ENABLE_PASSWORD_STRICTNESS || false; // Returns the value of ENABLE_PASSWORD_STRICTNESS or `false` if undefined.
};

/**
 * Retrieves the access token expiry time in minutes from the application configuration.
 *
 * @returns {number} - The access token limit in minutes. Defaults to 60 if not specified in the configuration.
 */
exports.accessTokenLimitMinutes = function () {
  return appConfigs.ACCESS_TOKEN_LIMIT_MIN || 60; // Returns the access token expiry time or a default of 60 minutes.
};

/**
 * Retrieves the password options from the application configuration.
 *
 * @returns {object} - An object containing the password policy options. Defaults to an empty object if not specified.
 */
exports.pwdOptions = function () {
  return appConfigs.pwdOptions || {}; // Returns the password options object or an empty object as a fallback.
};
