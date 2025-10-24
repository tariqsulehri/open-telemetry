const HttpCodes = require("../constants/httpCodes"); // Import HTTP status code constants
const SuccessResponse = require("../composer/success-response.js"); // Import the success response composer
const ErrorResponse = require("../composer/error-response.js"); // Import the error response composer
const AppMessages = require("../constants/appMessages"); // Import application message constants

/**
 * Sends a standard success response.
 *
 * @param {object} res - The response object from Express.
 * @param {any} data - The data to include in the success response.
 * @returns {object} - The response with status 200 and a success message.
 */
exports.successResponse = (res, data) => {
  return res
    .status(HttpCodes.OK) // Set status code to 200
    .send(new SuccessResponse(AppMessages.SUCCESS, data || null)); // Send success response with optional data
};

/**
 * Sends a bad request response.
 *
 * @param {object} res - The response object from Express.
 * @returns {object} - The response with status 400 and an error message.
 */
exports.badRequestResponse = (res) => {
  return res
    .status(HttpCodes.BAD_REQUEST) // Set status code to 400
    .send(new ErrorResponse(AppMessages.APP_BAD_REQUEST)); // Send error response with a bad request message
};

/**
 * Sends a custom success response with a specific message and data.
 *
 * @param {object} res - The response object from Express.
 * @param {any} data - The data to include in the response.
 * @param {string} message - The custom message to include in the response.
 * @returns {object} - The response with status 200 and a custom message.
 */
exports.customSuccessResponse = (res, data, message) => {
  return res
    .status(HttpCodes.OK) // Set status code to 200
    .send(new SuccessResponse(message, data || null)); // Send success response with custom message and optional data
};

/**
 * Sends an internal server error response.
 *
 * @param {object} res - The response object from Express.
 * @returns {object} - The response with status 500 and an error message.
 */
exports.internalServerError = (res) => {
  return res
    .status(HttpCodes?.INTERNAL_SERVER_ERROR) // Set status code to 500
    .send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR)); // Send error response with internal server error message
};

/**
 * Sends a generic error response with a custom message.
 *
 * @param {object} res - The response object from Express.
 * @param {string} message - The custom error message.
 * @returns {object} - The response with status 400 and a custom error message.
 */
exports.genericErrorResponse = (res, message) => {
  return res
    .status(HttpCodes.BAD_REQUEST) // Set status code to 400
    .send(new ErrorResponse(message)); // Send error response with custom message
};

/**
 * Sends a forbidden response with a custom or default message.
 *
 * @param {object} res - The response object from Express.
 * @param {string|null} [message=null] - The custom error message, defaults to a predefined message.
 * @returns {object} - The response with status 403 and a custom or default error message.
 */
exports.genericForbiddenResponse = (res, message = null) => {
  message = message || AppMessages.INTERNAL_FORBIDDEN; // Use provided message or default to INTERNAL_FORBIDDEN
  return res
    .status(HttpCodes.FORBIDDEN) // Set status code to 403
    .send(new ErrorResponse(message)); // Send forbidden response with message
};
