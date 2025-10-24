const { adapterRequest } = require("../helpers/adapterRequest");
const userRoleService = require("../services/database/userRoleService");
const authHelper = require("../helpers/authHelper");
const AppMessages = require("../constants/appMessages");

const {
  successResponse,
  internalServerError,
  genericErrorResponse,
  customSuccessResponse,
  badRequestResponse,
} = require("../helpers/responseHelper");

/**
 * Utility to check null or invalid database responses.
 */
const isValidDbResponse = (response) =>
  response && Object.keys(response).length > 0;

/**
 * @function createRole
 * @description Handles the creation of a new user role. Validates role name and description,
 *              checks for duplicate role names, and creates new role in database with creator information.
 * @param {Object} req - Express request object containing role data (role, description, createdBy)
 * @param {Object} res - Express response object to send role creation response
 * @returns {Object} Returns success response with created role details, or error response for validation/creation failures
 */
exports.createRole = async (req, res) => {
  const httpRequest = adapterRequest(req); // Adapt the request for internal use

  try {
    const { role, description, createdBy } = httpRequest.body;

    // Check required fields
    if (!role || !description || !createdBy) {
      return badRequestResponse(res, AppMessages.APP_BAD_REQUEST);
    }

    // Check if role already exists by email
    const roleExists = await userRoleService.getRoleByName(role);
    if (isValidDbResponse(roleExists)) {
      return genericErrorResponse(res, AppMessages.APP_DUPLICATE);
    }

    // Encrypt the role's password
    const newRole = await userRoleService.createRole(
      role,
      description,
      createdBy
    );

    if (!newRole) {
      return genericErrorResponse(
        res,
        AppMessages.APP_RESOURCE_CREATION_FAILED
      );
    }

    return successResponse(res, newRole);
  } catch (error) {
    // Handle any errors and return an internal server error response
    return internalServerError(res);
  }
};

/**
 * @function rolesList
 * @description Retrieves list of all active roles from database. Fetches role details including
 *              role name, description, and status information. Requires authentication.
 * @param {Object} req - Express request object (authentication required)
 * @param {Object} res - Express response object to send roles list
 * @returns {Object} Returns success response with array of role objects, or error response if no roles found
 */
exports.rolesList = async (req, res) => {
  try {
    const roles = await userRoleService.getActiveRoles();
    if (!isValidDbResponse(roles)) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    return successResponse(res, roles);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function rolesDeletedList
 * @description Retrieves list of all soft-deleted roles from database. Fetches role details including
 *              role name, description, and deletion status information. Requires authentication.
 * @param {Object} req - Express request object (authentication required)
 * @param {Object} res - Express response object to send deleted roles list
 * @returns {Object} Returns success response with array of deleted role objects, or error response if no deleted roles found
 */
exports.rolesDeletedList = async (req, res) => {
  try {
    const roles = await userRoleService.getDeletedRoles();
    if (!isValidDbResponse(roles)) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    return successResponse(res, roles);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function getRole
 * @description Retrieves role details by role ID. Fetches complete role information including
 *              role name, description, status, and creation/update timestamps. Requires authentication.
 * @param {Object} req - Express request object containing role ID parameter in URL path
 * @param {Object} res - Express response object to send role details
 * @returns {Object} Returns success response with role object, or error response if role not found
 */
exports.getRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    if (!roleId) {
      return badRequestResponse(res, AppMessages.APP_BAD_REQUEST);
    }

    const role = await userRoleService.getRoleById(roleId);
    if (!isValidDbResponse(role)) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    return successResponse(res, role);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function deleteRole
 * @description Soft deletes a role by setting is_active to 0. Validates role exists,
 *              prevents deletion of already deleted roles, and returns confirmation.
 *              Requires authentication.
 * @param {Object} req - Express request object containing role ID parameter in URL path
 * @param {Object} res - Express response object to send deletion confirmation
 * @returns {Object} Returns success response with deletion confirmation, or error response if role not found/already deleted
 */
exports.deleteRole = async (req, res) => {
  try {
    const id = req.params["id"];

    // Check if the role exists
    const role = await userRoleService.getRoleById(id);
    if (!role) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    // Check if the role is already deleted
    if (role.is_active == 0) {
      return genericErrorResponse(res, AppMessages.USER_ALREADY_DELETED);
    }

    await userRoleService.deleteRole(id);

    return successResponse(res, AppMessages.RECORD_SUCCESSFULY_DELETED);
  } catch (error) {
    return internalServerError(res);
  }
};

/**
 * @function updateRole
 * @description Updates role information. Validates role exists, processes update data,
 *              and updates role record in database. Currently returns success message (update logic to be implemented).
 * @param {Object} req - Express request object containing role ID and updated data in body
 * @param {Object} res - Express response object to send update confirmation
 * @returns {Object} Returns success response with update confirmation, or error response if role not found/invalid data
 */
exports.updateRole = async (req, res) => {
  const httpRequest = adapterRequest(req);

  try {
    const { id, ...updateData } = httpRequest.body;

    if (!id || !isValidDbResponse(updateData)) {
      return badRequestResponse(res, AppMessages.APP_BAD_REQUEST);
    }

    const existingRole = await roleRoleService.updateRole(id);

    if (!isValidDbResponse(existingRole)) {
      return genericErrorResponse(res, AppMessages.APP_RESOURCE_NOT_FOUND);
    }

    // Here, implement the update logic with the provided data
    // e.g., `await userRoleService.updateRole(id, updateData)`
    return successResponse(res, AppMessages.RECORD_SUCCESSFULY_UPDATED);
  } catch (error) {
    return internalServerError(res);
  }
};
