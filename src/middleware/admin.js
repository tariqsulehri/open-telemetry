const HttpCodes = require("../constants/httpCodes");
const AppMessages = require("../constants/appMessages");
const ErrorResponse = require("../composer/error-response");
const userService = require("../services/database/userService");

/**
 * Middleware to check if the authenticated user has admin privileges.
 *
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The callback to the next middleware function.
 * @returns {Promise<void>} - Proceeds to the next middleware if the user has admin privileges; otherwise, sends an appropriate error response.
 *
 * @throws {Error} - If an unexpected error occurs, it responds with a 500 status and an internal server error message.
 */
async function admin(req, res, next) {
  try {
    // Validate the presence of user credentials in the request
    if (!req.user || !req.user.id || !req.user.email) {
      return res
        .status(HttpCodes.FORBIDDEN)
        .send(new ErrorResponse(AppMessages.APP_ACCESS_DENIED));
    }

    // Fetch user details from the database using the user ID
    const user = await userService.getUserByID(req.user.id);

    // Check if the user exists and has the 'admin' role
    if (!user || user.role !== "admin") {
      return res
        .status(HttpCodes.FORBIDDEN)
        .send(new ErrorResponse(AppMessages.APP_ACCESS_DENIED));
    }

    // Proceed to the next middleware
    next();
  } catch (error) {
    // Handle unexpected errors
    return res
      .status(HttpCodes.INTERNAL_SERVER_ERROR)
      .send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
}

module.exports = admin;

