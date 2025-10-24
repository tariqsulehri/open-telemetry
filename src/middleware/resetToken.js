const authHelper = require("../helpers/authHelper");
const HttpCodes = require("../constants/httpCodes");
const AppMessages = require("../constants/appMessages");
const ErrorResponse = require("../composer/error-response");
const features = require("../helpers/featuresHelper");
const { decryptString } = require("../services/encrypt_decrypt/encrypt");

/**
 * Middleware to handle authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function resetTokenAuth(req, res, next) {
  const token = req.body.token;
  try {
    if (!token) {
      return res
        .status(HttpCodes.FORBIDDEN)
        .send(new ErrorResponse(AppMessages.APP_ACCESS_DENIED));
    }
    const decodedToken = decodeURIComponent(await decryptString(token));
    const userData = await authHelper.decodeToken(decodedToken);

    req.user = userData;
    next();
  } catch (ex) {
    return res
      .status(HttpCodes.FORBIDDEN)
      .send(new ErrorResponse(AppMessages.APP_ACCESS_DENIED));
  }
}

module.exports = resetTokenAuth;
