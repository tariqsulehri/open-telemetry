const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const userValidator = require("../validators/userValidator");
const router = express.Router();
const usersController = require("../controllers/usersController");
const resetTokenAuth = require("../middleware/resetToken");
/**
 * @swagger
 * /api/user/create:
 *   post:
 *     summary: Create a new user or admin
 *     tags: [Users]
 *     requestBody:
 *       description: User or admin creation data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: integer
 *                 description: "1 for admin, 2 for user"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/register",
  [userValidator.validateCreateUser],
  usersController.createAppUser
);

router.post(
  "/create",
  [auth, admin, userValidator.validateCreateUser],
  usersController.createUser
);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login as a user or admin
 *     tags: [Users]
 *     requestBody:
 *       description: Login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", userValidator.validateUserLogin, usersController.login);

/**
 * @swagger
 * /api/user/getuser/{id}:
 *   get:
 *     summary: Get user details by ID (Admin token required)
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/getuser/:id", [auth, admin], usersController.getUser);

/**
 * @swagger
 * /api/user/user_by_email/{email}:
 *   get:
 *     summary: Get user details by email (Admin token required)
 *     tags: [Users]
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         description: User email
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/user_by_email/:email", [auth, admin], usersController.userByEmail);

/**
 * @swagger
 * /api/user/delete/{id}:
 *   get:
 *     summary: Delete a user by ID (Admin or user token required)
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.get("/delete/:id", [auth], usersController.deleteUser);

/**
 * @swagger
 * /api/user/list:
 *   get:
 *     summary: Get a list of all users (Admin token required)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
router.get("/list", [auth, admin], usersController.usersList);

/**
 * @swagger
 * /api/user/change_password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Old and new password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post(
  "/change_password",
  [auth, userValidator.validateChangePassword],
  usersController.changeUserPassword
);

/**
 * @swagger
 * /api/user/reset_password:
 *   post:
 *     summary: Reset password
 *     tags: [Users]
 *     requestBody:
 *       description: Email and new password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post("/reset_password", [resetTokenAuth], usersController.resetPassword);

router.post("/send_reset_link", usersController.sendResetToken);

/**
 * @swagger
 * /api/user/send_otp:
 *   post:
 *     summary: Send OTP to user's email
 *     tags: [Users]
 *     requestBody:
 *       description: User email
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post(
  "/send_otp",
  userValidator.validateOTPEmail,
  usersController.sendOTP
);

/**
 * @swagger
 * /api/user/confirm_otp:
 *   post:
 *     summary: Confirm OTP
 *     tags: [Users]
 *     requestBody:
 *       description: Email and OTP
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP confirmed successfully
 */
router.post(
  "/confirm_otp",
  userValidator.validateOTPEmail,
  usersController.confirmOTP
);

router.get(
  "/temporarily_delete/:id",
  [auth, admin],
  usersController.temporarilyDeleteUser
);

module.exports = router;
