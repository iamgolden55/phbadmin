/**
 * User Management Service
 *
 * API service for admin user management operations.
 * Platform Admin only - handles user creation, role assignment, and activation.
 */

import { apiRequest, HTTP_METHODS } from '../config/api';

const USER_MANAGEMENT_ENDPOINTS = {
  USERS: {
    LIST: '/registry/admin/users/',
    CREATE: '/registry/admin/users/create/',
    UPDATE_ROLE: (userId) => `/registry/admin/users/${userId}/role/`,
    DEACTIVATE: (userId) => `/registry/admin/users/${userId}/deactivate/`,
    REACTIVATE: (userId) => `/registry/admin/users/${userId}/reactivate/`,
  },
  ROLES: {
    LIST: '/registry/admin/roles/',
  },
};

/**
 * User Management API Service
 */
export const userManagementAPI = {
  /**
   * Get all admin users with their roles
   * @returns {Promise} List of admin users
   */
  listAdminUsers: async () => {
    return apiRequest(USER_MANAGEMENT_ENDPOINTS.USERS.LIST);
  },

  /**
   * Create a new admin user and assign role
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.first_name - First name
   * @param {string} userData.last_name - Last name
   * @param {number} userData.role_id - Role ID to assign
   * @returns {Promise} Created user with temporary password
   */
  createAdminUser: async (userData) => {
    return apiRequest(USER_MANAGEMENT_ENDPOINTS.USERS.CREATE, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update user's role
   * @param {number} userId - User ID
   * @param {number} roleId - New role ID
   * @returns {Promise} Updated user
   */
  updateUserRole: async (userId, roleId) => {
    return apiRequest(USER_MANAGEMENT_ENDPOINTS.USERS.UPDATE_ROLE(userId), {
      method: HTTP_METHODS.PATCH,
      body: JSON.stringify({ role_id: roleId }),
    });
  },

  /**
   * Deactivate an admin user
   * @param {number} userId - User ID
   * @returns {Promise} Success message
   */
  deactivateUser: async (userId) => {
    return apiRequest(USER_MANAGEMENT_ENDPOINTS.USERS.DEACTIVATE(userId), {
      method: HTTP_METHODS.POST,
    });
  },

  /**
   * Reactivate a deactivated admin user
   * @param {number} userId - User ID
   * @returns {Promise} Success message
   */
  reactivateUser: async (userId) => {
    return apiRequest(USER_MANAGEMENT_ENDPOINTS.USERS.REACTIVATE(userId), {
      method: HTTP_METHODS.POST,
    });
  },

  /**
   * List all available roles with permissions
   * @returns {Promise} List of roles
   */
  listRoles: async () => {
    return apiRequest(USER_MANAGEMENT_ENDPOINTS.ROLES.LIST);
  },
};

// Export combined user management service
export const userManagementService = {
  users: userManagementAPI,
};

export default userManagementService;
