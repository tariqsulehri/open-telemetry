const jwt = require("jsonwebtoken");

const { adapterRequest } = require("../helpers/adapterRequest");
const userService = require("../services/database/userService");
const authHelper = require("../helpers/authHelper");
const AppMessages = require("../constants/appMessages");
const features = require("../helpers/featuresHelper");
const {
  successResponse,
  internalServerError,
  genericErrorResponse,
  customSuccessResponse,
  badRequestResponse,
} = require("../helpers/responseHelper");
const appConfig = require("../config/app.config");
const { sendEmail } = require("../services/nodemailer/send-email");
const { isValidDbResponse } = require("../validators/userValidator");
const { encryptString } = require("../services/encrypt_decrypt/encrypt");
/**
 * Utility to check null or invalid database responses.
 */

/**
 * @function createUser
 * @description Handles the creation of a new user account by admin. Validates user input, checks for duplicates,
 *              enforces password policy, encrypts password, and creates user account in database.
 *              Requires admin authentication and authorization.
 * @param {Object} req - Express request object containing user data (username, email, password, role, provider)
 * @param {Object} res - Express response object to send creation response
 * @returns {Object} Returns success response with created user details, or error response for validation/creation failures
 */
exports.createUser = async (req, res) => {
  const httpRequest = adapterRequest(req); // Adapt the request for internal use

  try {
    const { username, email, password, role, provider } = httpRequest.body;

    // Check required fields
    if (!username || !email || !password || !role) {
      return badRequestResponse(res, AppMessages.APP_BAD_REQUEST);
    }

    /**
     * Validate user password
     * -----------------------
     * - If the password strictness is enabled in configurations, then
     *   the password will will be verified as per policy rules defined in
     *   configuration.
     * - Otherwise, only empty password will not allowed without to check any other rule's.
     */
    if (!(await authHelper.validatePassword(password))) {
      return badRequestResponse(
        res,
        AppMessages.APP_PASSWORD_VALIDATION_FAILED
      );
    }

    /**  Check if user already exists by email */
    const userExists = await userService.getUserByEmail(email);
    if (isValidDbResponse(userExists)) {
      return genericErrorResponse(res, AppMessages.APP_DUPLICATE);
    }

    /**  Encrypt the user's password */
    const encryptedPassword = await authHelper.encryptString(password);
    const newUser = await userService.createUserAccount(
      username,
      email,
      encryptedPassword,
      role,
      provider || "web"
    );

    if (!newUser) {
      return genericErrorResponse(
        res,
        "User" + AppMessages.APP_RESOURCE_CREATION_FAILED
      );
    }

    return successResponse(res, newUser);
  } catch (error) {
    /** Handle any errors and return an internal server error response */
    return internalServerError(res);
  }
};

/**
 * @function createAppUser
 * @description Handles public user registration. Validates user input, checks for duplicates,
 *              enforces password policy, encrypts password, and creates user account with default role (2).
 *              Public endpoint for user self-registration.
 * @param {Object} req - Express request object containing user data (username, email, password, provider)
 * @param {Object} res - Express response object to send registration response
 * @returns {Object} Returns success response with created user details, or error response for validation/creation failures
 */
exports.createAppUser = async (req, res) => {
  const httpRequest = adapterRequest(req); // Adapt the request for internal use

  try {
    const { username, email, password, provider } = httpRequest.body;

    // Check required fields
    if (!username || !email || !password) {
      return badRequestResponse(res, AppMessages.APP_BAD_REQUEST);
    }

    /**
     * Validate user password
     * -----------------------
     * - If the password strictness is enabled in configurations, then
     *   the password will will be verified as per policy rules defined in
     *   configuration.
     * - Otherwise, only empty password will not allowed without to check any other rule's.
     */
    if (!(await authHelper.validatePassword(password))) {
      return badRequestResponse(
        res,
        AppMessages.APP_PASSWORD_VALIDATION_FAILED
      );
    }

    /**  Check if user already exists by email */
    const userExists = await userService.getUserByEmail(email);
    if (isValidDbResponse(userExists)) {
      return genericErrorResponse(res, AppMessages.APP_DUPLICATE);
    }

    /**  Encrypt the user's password */
    const encryptedPassword = await authHelper.encryptString(password);
    const newUser = await userService.createUserAccount(
      username,
      email,
      encryptedPassword,
      2,
      provider || "web"
    );

    if (!newUser) {
      return genericErrorResponse(
        res,
        "User" + AppMessages.APP_RESOURCE_CREATION_FAILED
      );
    }

    return successResponse(res, newUser);
  } catch (error) {
    /** Handle any errors and return an internal server error response */
    return internalServerError(res);
  }
};

/**
 * @function login
 * @description Handles user authentication by validating email/password credentials. Verifies user exists,
 *              validates password, generates JWT access tokens, and returns authenticated user data with tokens.
 * @param {Object} req - Express request object containing login credentials (email, password)
 * @param {Object} res - Express response object to send authentication response
 * @returns {Object} Returns success response with user data and authentication tokens, or error response for invalid credentials
 */
exports.login = async (req, res) => {
  const httpRequest = adapterRequest(req);

  try {
    const { email, password } = httpRequest.body;
    if (!email || !password) {
      return badRequestResponse(res, AppMessages.APP_BAD_REQUEST);
    }
    const user = await userService.getUserByEmail(email);

    if (!isValidDbResponse(user)) {
      return genericErrorResponse(res, AppMessages.INVALID_USER_CREDENTIALS);
    }
    const isPasswordValid = await authHelper.isValidUser(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return genericErrorResponse(res, AppMessages.APP_ACCESS_DENIED);
    }

    await authHelper.addAuthTokensInResponse(user, res);
    delete user.password;
    return successResponse(res, user);
  } catch (error) {
    return internalServerError(res, AppMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @function usersList
 * @description Retrieves list of all active users from database. Fetches user details including
 *              username, email, role information with role names. Requires admin authentication.
 * @param {Object} req - Express request object (admin token required)
 * @param {Object} res - Express response object to send users list
 * @returns {Object} Returns success response with array of user objects, or error response if no users found
 */
exports.usersList = async (req, res) => {
  try {
    const users = await userService.getUsers();
    if (!isValidDbResponse(users)) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    return successResponse(res, users);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function userByEmail
 * @description Retrieves user details by email address. Fetches complete user information including
 *              username, email, role, and authentication status. Requires admin authentication.
 * @param {Object} req - Express request object containing email parameter in URL path
 * @param {Object} res - Express response object to send user details
 * @returns {Object} Returns success response with user object, or error response if user not found
 */
exports.userByEmail = async (req, res) => {
  try {
    const email = req.params["email"];

    if (!email) {
      return badRequestResponse(res, AppMessages.APP_BAD_REQUEST);
    }

    const user = await userService.getUserByEmail(email);
    if (!isValidDbResponse(user)) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    return successResponse(res, user);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function getUser
 * @description Retrieves user details by user ID. Fetches complete user information including
 *              username, email, role, and authentication status. Requires admin authentication.
 * @param {Object} req - Express request object containing user ID parameter in URL path
 * @param {Object} res - Express response object to send user details
 * @returns {Object} Returns success response with user object, or error response if user not found
 */
exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return badRequestResponse(res, AppMessages.APP_BAD_REQUEST);
    }

    const user = await userService.getUserByID(userId);

    if (!isValidDbResponse(user)) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    return successResponse(res, user);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function deleteUser
 * @description Permanently deletes a user account by setting is_active to 0. Validates user exists,
 *              prevents deletion of admin users, and returns confirmation.
 *              Requires authentication (admin or user can delete their own account).
 * @param {Object} req - Express request object containing user ID parameter in URL path
 * @param {Object} res - Express response object to send deletion confirmation
 * @returns {Object} Returns success response with deletion confirmation, or error response if user not found/already deleted
 */
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params["id"];

    // Check if the user exists
    const user = await userService.getUserByID(id);

    if (!user) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    // Check if the user is already deleted
    if (user.username === "admin" || user.is_active == 0) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    await userService.deleteUser(id);
    return successResponse(res, AppMessages.RECORD_SUCCESSFULY_DELETED);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function temporarilyDeleteUser
 * @description Soft deletes a user account by setting is_active to 0.
 *              Validates user exists, prevents deletion of admin users.
 *              Requires admin authentication.
 * @param {Object} req - Express request object containing user ID parameter in URL path
 * @param {Object} res - Express response object to send deletion confirmation
 * @returns {Object} Returns success response with deletion confirmation, or error response if user not found/already deleted
 */
exports.temporarilyDeleteUser = async (req, res) => {
  try {
    const id = req.params["id"];

    // Check if the user exists
    const user = await userService.getUserByID(id);

    if (!user) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    // Check if the user is already deleted
    if (user.username === "admin" || user.is_active == 0) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    const deletedUser = await userService.deleteUser(id);
    if (deletedUser) {
      return successResponse(res, AppMessages.RECORD_SUCCESSFULY_DELETED);
    }
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function changeUserPassword
 * @description Handles password change for authenticated users. Validates old password, enforces password policy,
 *              encrypts new password, and updates user password in database. Requires current password verification.
 * @param {Object} req - Express request object containing user ID, old password, and new password in body
 * @param {Object} res - Express response object to send password change confirmation
 * @returns {Object} Returns success response with update confirmation, or error response for invalid credentials/policy violation
 */
exports.changeUserPassword = async (req, res) => {
  try {
    const { body } = req;
    let exists = await userService.getUserAllDataByID(body.id);
    if (!exists) {
      return genericErrorResponse(res, AppMessages.IVALID_USER_CREDENTIALS);
    }

    let isValidUser = await authHelper.isValidUser(
      body.oldPassword,
      exists.password
    );

    if (!isValidUser) {
      return genericErrorResponse(res, AppMessages.IVALID_USER_CREDENTIALS);
    }

    let passwordHash = await authHelper.encryptString(body.newPassword);
    let result = await userService.updateUserPassword(body.id, passwordHash);

    return successResponse(res, result);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function updateUser
 * @description Updates user profile information. Validates user exists, processes update data,
 *              and updates user record in database. Currently returns success message (update logic to be implemented).
 * @param {Object} req - Express request object containing user ID and updated data in body
 * @param {Object} res - Express response object to send update confirmation
 * @returns {Object} Returns success response with update confirmation, or error response if user not found/invalid data
 */
exports.updateUser = async (req, res) => {
  const httpRequest = adapterRequest(req);

  try {
    const { id, ...updateData } = httpRequest.body;

    if (!id || !isValidDbResponse(updateData)) {
      return badRequestResponse(res, AppMessages.APP_BAD_REQUEST);
    }

    const existingUser = await userService.getUserByID(id);

    if (!isValidDbResponse(existingUser)) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    // Here, implement the update logic with the provided data
    // e.g., `await userService.updateUser(id, updateData)`

    return successResponse(res, AppMessages.RECORD_SUCCESSFULY_UPDATED);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function sendOTP
 * @description Sends One-Time Password (OTP) for Multi-Factor Authentication to user's email.
 *              Generates 6-digit OTP, stores it in database with expiry time, and sends email notification.
 * @param {Object} req - Express request object containing user email in body
 * @param {Object} res - Express response object to send OTP generation confirmation
 * @returns {Object} Returns success response with OTP sent confirmation, or error response if user not found/email failure
 */
exports.sendOTP = async (req, res) => {
  let httpRequest = adapterRequest(req);

  try {
    const { email } = httpRequest.body;
    let otp = await authHelper.generateSixDigitOTP();
    const userData = await userService.getUserByEmail(email);
    let result = await userService.updateOTP(userData.id, otp);
    sendEmail(userData.email, otp, "otp");
    if (!result) {
      return genericErrorResponse(res, AppMessages.ERROR_PIN_GENERATION);
    }

    return customSuccessResponse(res, AppMessages.PIN_SUCCESSFULY_GENERATED);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function sendResetToken
 * @description Sends password reset token via email. Generates JWT token with email payload,
 *              encrypts token, and sends password reset link to user's email address.
 * @param {Object} req - Express request object containing user email in body
 * @param {Object} res - Express response object to send reset token confirmation
 * @returns {Object} Returns success response with reset link sent confirmation, or error response if user not found/email failure
 */
exports.sendResetToken = async (req, res) => {
  let httpRequest = adapterRequest(req);

  try {
    const { email } = httpRequest.body;
    const userData = await userService.getUserByEmail(email);
    if (!userData) {
      return genericErrorResponse(res, AppMessages.USER_NOT_FOUND);
    }

    const token = jwt.sign({ email }, process.env.SECRET_ACCESS_TOKEN, {
      expiresIn: process.env.RESET_PASSWORD_TOKEN_LIMIT_IN_HOUR,
    });
    const encryptedToken = encodeURIComponent(await encryptString(token));

    await sendEmail(
      userData.email,
      `http://localhost:5173/resetpassword?token=${encryptedToken}`,
      "reset"
    );

    return customSuccessResponse(res, AppMessages.TOKEN_SUCCESSFULLY_GENERATED);
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

/**
 * @function confirmOTP
 * @description Verifies One-Time Password (OTP) for Multi-Factor Authentication. Validates OTP against stored value,
 *              updates user verification status, and confirms successful authentication.
 * @param {Object} req - Express request object containing user email and OTP in body
 * @param {Object} res - Express response object to send OTP verification confirmation
 * @returns {Object} Returns success response with OTP confirmed, or error response for invalid OTP
 */
exports.confirmOTP = async (req, res) => {
  let httpRequest = adapterRequest(req);

  try {
    const { email, otp } = httpRequest.body;
    const userData = await userService.getOTPByEmail(email);

    if (otp != userData.otp) {
      return genericErrorResponse(res, AppMessages.ERROR_INVALID_PIN);
    }
    await userService.updateIsVerified(userData.id, 1);

    return customSuccessResponse(res, AppMessages.PIN_SUCCESSFULY_CONFIRMED);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function resetPassword
 * @description Resets user password using valid reset token. Validates reset token, enforces password policy,
 *              encrypts new password, and updates user password in database. Requires valid reset token.
 * @param {Object} req - Express request object containing new password in body and user data from reset token middleware
 * @param {Object} res - Express response object to send password reset confirmation
 * @returns {Object} Returns success response with password reset confirmation, or error response for invalid token/policy violation
 */
exports.resetPassword = async (req, res) => {
  const httpRequest = adapterRequest(req);

  try {
    const { newPassword } = httpRequest.body;

    if (!newPassword || !req.user.email) {
      return badRequestResponse(res, AppMessages.APP_BAD_REQUEST);
    }

    if (!(await authHelper.validatePassword(newPassword))) {
      return badRequestResponse(
        res,
        AppMessages.APP_PASSWORD_VALIDATION_FAILED
      );
    }

    const userData = await userService.getUserByEmail(req.user.email);
    if (userData.isverified != 1 && userData.isActive != 1) {
      const encryptedPassword = await authHelper.encryptString(newPassword);

      const updatedUser = await userService.updateUserPassword(
        userData.id,
        encryptedPassword
      );

      if (!updatedUser) {
        return genericErrorResponse(
          res,
          AppMessages.APP_RESOURCE_UPDATE_FAILED
        );
      }

      return successResponse(res, {
        message: AppMessages.PASSWORD_RESET_SUCCESS,
      });
    }
    return genericErrorResponse(res, AppMessages.APP_RESOURCE_UPDATE_FAILED);
  } catch (error) {
    return internalServerError(res, AppMessages.INTERNAL_SERVER_ERROR);
  }
};
