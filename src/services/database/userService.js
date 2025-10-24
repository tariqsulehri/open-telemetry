const { OTP_EXPIRY_DURATION_MINS } = require("../../config/app.config");
const { executeQuery } = require("./databaseService");

/**
 * Creates a new user account in the database.
 *
 * @param {string} username - The username of the new user.
 * @param {string} email - The email of the new user.
 * @param {string} password - The password of the new user.
 * @param {string} role - The role of the new user.
 *
 * @returns {number|null} The ID of the newly created user or null if the creation failed.
 *
 * @throws Will throw an error if the database query fails.
 */
exports.createUserAccount = async (username, email, password, role, user_source, user_id="") => {
  const sql = "INSERT INTO users (username, password, role, email, user_source, user_id) VALUES (?, ?, ?, ?, ?, ?)";
  try {
    const result = await executeQuery(sql, [username, password, role, email, user_source, user_id]);
    return result.insertId ? result.insertId : null;
  } catch (err) {
    return null;
  }
};

/**
 * Fetches all active users from the database.
 *
 * @returns {Users} List of active users in JSON format if successful,
 * or null if there are no active users or an error occurred during the database query.
 *
 * @throws Will throw an null if the database query fails.
 */

exports.getUsers = async () => {
  const sql = `   SELECT u.id, u.username, u.email, u.role as role_id ,r.rolename as role 
                  FROM users as u
                  INNER JOIN roles as r
                  ON r.id =  u.role`;
  try {
    const resp = await executeQuery(sql);
    return resp.length > 0 ? resp : null; // Return all active users or null
  } catch (err) {
    return null;
  }
};

exports.getInActiveUsers = async () => {
  const sql = `SELECT u.id, u.username, u.email, u.role as role_id ,r.rolename as role 
               FROM users as u
               INNER JOIN roles as r
               ON r.id =  u.role  
               WHERE u.is_active = 0`;
  try {
    const resp = await executeQuery(sql);
    return resp.length > 0 ? resp : null; // Return all in active users or null
  } catch (err) {
    return null;
  }
};

exports.getActiveUsers = async () => {
  const sql = `SELECT u.id, u.username, u.email, u.role as role_id ,r.rolename as role 
               FROM users as u
               INNER JOIN roles as r
               ON r.id =  u.role  
               WHERE u.is_active = 1`;
  try {
    const resp = await executeQuery(sql);
    return resp.length > 0 ? resp : null; // Return all in active users or null
  } catch (err) {
    return null;
  }
};
/**
 * Updates the password of a user in the database.
 *
 * @param {number} userId - The ID of the user whose password needs to be updated.
 * @param {string} password - The new password for the user.
 *
 * @returns {boolean} Returns true if the password update was successful, false otherwise.
 * @throws Will throw an boolean false if the database query fails.
 *
 */
exports.updateUserPassword = async (userId, password) => {
  const sql = `UPDATE users SET password = ? WHERE id = ?`;
  try {
    const resp = await executeQuery(sql, [password, userId]);
    return resp.affectedRows > 0; // Return true if the update was successful
  } catch (err) {
    return false; // Return null in case of an error
  }
};
/**
 * Updates the isVerified status of a user in the database.
 *
 * @param {number} userId - The ID of the user whose password needs to be updated.
 * @param {string} password - The new password for the user.
 *
 * @returns {boolean} Returns true if the isVerified was updated successful, false otherwise.
 * @throws Will throw an boolean false if the database query fails.
 *
 */
exports.updateIsVerified = async (userId, isVerified) => {
  const sql = `UPDATE users SET is_otp_verfied = ? WHERE id = ?`;
  try {
    const resp = await executeQuery(sql, [isVerified, userId]);
    return resp.affectedRows > 0; // Return true if the update was successful
  } catch (err) {
    return false; // Return null in case of an error
  }
};

/**
 * Deletes a user from the database by setting their 'is_active' status to 0.
 *
 * @param {number} userId - The ID of the user to be deleted.
 * @returns {boolean} Returns true if the user deletion was successful, false otherwise.
 * @throws Will throw an boolean false if the database query fails.
 *
 */

exports.deleteUser = async (userId) => {
  const sql = `UPDATE users SET is_active = 0 WHERE id = ?`;
  try {
    const resp = await executeQuery(sql, [userId]);
    return resp.affectedRows > 0; // Return true if the update was successful
  } catch (err) {
    return false; // Return false in case of an error
  }
};

/**
 * Authenticates a user by fetching their record from the database using their email and password.
 *
 * @param {string} email - The email of the user attempting to log in.
 * @param {string} password - The password of the user attempting to log in.
 *
 * @returns {User|null} The user object if the login is successful, null otherwise.
 * @throws Will throw an error if the database query fails.
 *
 */
exports.login = async (email, password) => {
  // Fetch user by email and password
  const user = await this.getUser(email, password);
  return user;
};

exports.getUserByEmail = async (email) => {
  const sql = ` SELECT u.id, 
                u.username,
                u.user_source, 
                u.email, 
                u.password, 
                u.is_active,
                u.is_otp_verfied,
                u.role as role_id,
                r.rolename as role 
                FROM users as u
                INNER JOIN roles as r
                ON r.id =  u.role  
                WHERE u.email = ? 
                AND u.is_active = 1`;

  try {
    const resp = await executeQuery(sql, [email]);
    return resp.length > 0 ? resp[0] : null;
  } catch (error) {
    return null;
  }
};

exports.getOTPByEmail = async (email) => {
  const sql = ` SELECT id, 
                username,
                email, 
                otp
                FROM users
                WHERE email = ? 
                AND is_active = 1`;

  try {
    const resp = await executeQuery(sql, [email]);
    return resp.length > 0 ? resp[0] : null;
  } catch (error) {
    return null;
  }
};

exports.getUserByEmailAndSource = async (email, source) => {
  const sql = ` SELECT u.id, 
                u.username,
                u.user_source, 
                u.email, 
                u.password,  
                u.role as role_id,
                r.rolename as role 
                FROM users as u
                INNER JOIN roles as r
                ON r.id =  u.role  
                WHERE u.email = ? AND u.user_source=? 
                AND u.is_active = 1`; 
  try {
    const resp = await executeQuery(sql, [email, source]);
    return resp.length > 0 ? resp[0] : null;
  } catch (error) {
    return null;
  }
};

exports.getUser = async (email, password) => {
  const sql = `SELECT u.id, 
               u.username, 
               u.email, 
               u.role as role_id,
               r.rolename as role 
               FROM users as u
               INNER JOIN roles as r
               ON r.id =  u.role  
               WHERE u.email = ? 
               AND u.password = ? 
               AND u.is_active = 1`;

  try {
    const resp = await executeQuery(sql, [email, password]);
    return resp.length > 0 ? resp[0] : null;
  } catch (error) {
    return null;
  }
};

exports.getUserByID = async (userID) => {
  const sql = `SELECT u.id, 
               u.username, 
               u.email, 
               u.role as role_id,
               r.rolename as role 
               FROM users as u
               INNER JOIN roles as r
               ON r.id = u.role
               WHERE u.id = ? 
               AND u.is_active = 1`;

  try {
    const resp = await executeQuery(sql, [userID]);
    return resp.length > 0 ? resp[0] : null; // Return the user object or null if not found
  } catch (error) {
    return null; // Return null in case of an error
  }
};

exports.getUserAllDataByID = async (userID) => {
  const sql = `SELECT u.id, 
                      u.username, 
                      u.email, 
                      u.password,
                      u.role as role_id,
                      r.rolename as role 
                      FROM users as u
                      INNER JOIN roles as r
                      WHERE u.id = ? 
                      AND u.is_active = 1`; 

  try {
    const resp = await executeQuery(sql, [userID]);
    return resp.length > 0 ? resp[0] : null; // Return the user object or null if not found
  } catch (error) {
    return null; // Return null in case of an error
  }
};

/**
 * Updates the OTP and its expiry in the database for a given user ID.
 *
 * @param {number} userId - The ID of the user to associate the OTP with.
 * @param {string} otp - The OTP to store.
 * @returns {Promise<boolean>} - Returns true if the OTP was successfully updated, false otherwise.
 */
exports.updateOTP = async (userId, otp) => {
  try {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + parseInt(OTP_EXPIRY_DURATION_MINS, 10));

    const query = `
      UPDATE users
      SET otp = ?, otp_expiry_at = ?, is_otp_verfied = 0
      WHERE id = ?
    `;

    const resp = await executeQuery(query, [otp, expiryTime, userId]);
    return resp.affectedRows > 0 ? true : null; 
  } catch (error) {
    console.error('Error updating OTP:', error);
    return null; 
  }
};