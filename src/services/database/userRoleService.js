const { executeQuery } = require("./databaseService");

/**
 * Creates a new role in the database.
 *
 * @param {string} role - The role name.
 * @param {string} description - The description of the new role.
 * @param {string} createdBy -  The role Id who is creating role.
 *
 * @returns {object} The newly created role or null if the creation failed.
 *
 * @throws Will throw an error if the database query fails.
 */
exports.createRole = async (role, description, createdBy) => {
  const sql = "INSERT INTO roles (roleName, description, createdBy ) VALUES (?, ?, ?)";
  try {
    const result = await executeQuery(sql, [role, description, createdBy]);
    return result.insertId ? result.insertId : null;
  } catch (err) {
    return null;
  }
};

/**
 * Fetches all active roles from the database.
 *
 * @returns {Roles} List of active roles in JSON format if successful,
 * or null if there are no active roles or an error occurred during the database query.
 *
 * @throws Will throw an null if the database query fails.
 */

exports.getRoles = async () => {
  const sql = `SELECT id, rolename, description, createdBy
               FROM roles 
               WHERE is_active = 1`;

  try {
    const resp = await executeQuery(sql);
    return resp.length > 0 ? resp : null; // Return all active roles or null
  } catch (err) {
    return null;
  }
};

/**
 * Updates the password of a role in the database.
 *
 * @param {number} roleId - The roleId of the role's role whose detail's needs to be updated.
 * @param {string} roleName - The roleName for the role.
 * @param {string} description - The description for the role.
 * @param {string} is_active - The active or 'in active' flag for the role .
 * @param {string} updated_by - The role id who updated the role.
 *
 * @returns {boolean} Returns true if the details update was successful, false otherwise.
 * @throws Will throw an boolean false if the database query fails.
 *
 */
exports.updateRole = async (roleId, roleName, description, is_active, updated_by) => {
  const sql = `UPDATE  roles 
                  SET  rolename = ?,
                       description= ?,
                       is_active=?,
                       updated_by=?,
                       updated_at=curtime(6)
                WHERE id = ?`;
  try {
    const resp = await executeQuery(sql, [roleId, roleName, description, is_active, updated_by]);
    return resp.affectedRows > 0; // Return true if the update was successful
  } catch (err) {
    return false; // Return null in case of an error
  }
};

/**
 *  a role from the database by setting their 'is_active' status to 0.
 *
 * @param {number} roleId - The ID of the role to be deleted.
 * @returns {boolean} Returns true if the role deletion was successful, false otherwise.
 * @throws Will throw an boolean false if the database query fails.
 *
 */
exports.deleteRole = async (roleId, userId) => {
  const sql = `UPDATE   roles
                  SET   is_active = 0,
                        updated_by = ?
                        updated_at = curtime(6)
                  WHERE id = ?`;
  try {
    const resp = await executeQuery(sql, [userId, roleId]);
    /**  Return true if the update was successful */
    return resp.affectedRows > 0; 
  } catch (err) {
    /**  Return false in case of any unexpected error */
    return false;
  }
};


exports.getRoleById = async (roleId) => {
  const sql = `SELECT  id, rolename, description, is_active  
                 FROM  roles 
                WHERE  id = ?
                  AND  is_active=1`; // Use a parameterized query

  try {
    const resp = await executeQuery(sql, [roleId]);
    return resp.length > 0 ? resp[0] : null;
  } catch (error) {
    return null;
  }
};

exports.getRoleByName = async (role) => {
  const sql = `SELECT id, rolename, description, is_active
                 FROM roles 
                WHERE rolename=? 
                  AND is_active=1`; // Use a parameterized query
  try {
    const resp = await executeQuery(sql, [role]);
    return resp.length > 0 ? resp[0] : null;
  } catch (error) {
    return null;
  }
};


exports.getActiveRoles = async () => {
  const sql = `SELECT id, rolename, description, is_active
                 FROM roles 
                WHERE is_active = 1 `; // Use parameterized queries
  try {

    const resp = await executeQuery(sql, [email, password]);
    return resp.length > 0 ? resp[0] : null;

  } catch (error) {
    return null;
  }
};

exports.getDeletedRoles = async () => {
  const sql = `SELECT id, rolename, description, is_active
                 FROM roles 
                WHERE is_active = 0 `; // Use parameterized queries
  try {

    const resp = await executeQuery(sql, [email, password]);
    return resp.length > 0 ? resp[0] : null;
  } catch (error) {
    return null;
  }
};
