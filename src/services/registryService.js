/**
 * Registry Service
 *
 * API service for Professional Registry Admin operations.
 * Handles application review, document verification, and user management.
 */

import { apiRequest, HTTP_METHODS } from '../config/api';

// Registry API Endpoints
const REGISTRY_ENDPOINTS = {
  // Application Management
  APPLICATIONS: {
    LIST: '/registry/admin/applications/',
    DETAIL: (id) => `/registry/admin/applications/${id}/`,
    START_REVIEW: (id) => `/registry/admin/applications/${id}/start-review/`,
    APPROVE: (id) => `/registry/admin/applications/${id}/approve/`,
    REJECT: (id) => `/registry/admin/applications/${id}/reject/`,
    REQUEST_DOCUMENTS: (id) => `/registry/admin/applications/${id}/request-documents/`,
  },

  // Document Verification
  DOCUMENTS: {
    VERIFY: (appId, docId) => `/registry/admin/applications/${appId}/documents/${docId}/verify/`,
    REJECT: (appId, docId) => `/registry/admin/applications/${appId}/documents/${docId}/reject/`,
    CLARIFY: (appId, docId) => `/registry/admin/applications/${appId}/documents/${docId}/clarify/`,
  },

  // Registry Management
  REGISTRY: {
    LIST: '/registry/admin/registry/',
    SUSPEND: (licenseNumber) => `/registry/admin/registry/${licenseNumber}/suspend/`,
    REACTIVATE: (licenseNumber) => `/registry/admin/registry/${licenseNumber}/reactivate/`,
    REVOKE: (licenseNumber) => `/registry/admin/registry/${licenseNumber}/revoke/`,
    DISCIPLINARY: (licenseNumber) => `/registry/admin/registry/${licenseNumber}/disciplinary/`,
  },

  // User Management (Platform Admin only)
  USERS: {
    LIST: '/registry/admin/users/',
    CREATE: '/registry/admin/users/create/',
    UPDATE_ROLE: (userId) => `/registry/admin/users/${userId}/role/`,
    DEACTIVATE: (userId) => `/registry/admin/users/${userId}/deactivate/`,
    REACTIVATE: (userId) => `/registry/admin/users/${userId}/reactivate/`,
  },

  // Roles
  ROLES: {
    LIST: '/registry/admin/roles/',
  },
};

/**
 * Registry Service - Application Management
 */
export const registryApplicationAPI = {
  /**
   * List all professional applications with filters
   * @param {Object} params - Query parameters (status, professional_type, search, page)
   * @returns {Promise} Applications list with pagination
   */
  listApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${REGISTRY_ENDPOINTS.APPLICATIONS.LIST}?${queryString}`);
  },

  /**
   * Get detailed information about a specific application
   * @param {string} applicationId - Application UUID
   * @returns {Promise} Application details
   */
  getApplicationDetail: async (applicationId) => {
    return apiRequest(REGISTRY_ENDPOINTS.APPLICATIONS.DETAIL(applicationId));
  },

  /**
   * Start reviewing an application (changes status from 'submitted' to 'under_review')
   * @param {string} applicationId - Application UUID
   * @param {Object} data - Review data (optional notes)
   * @returns {Promise} Updated application
   */
  startReview: async (applicationId, data = {}) => {
    return apiRequest(REGISTRY_ENDPOINTS.APPLICATIONS.START_REVIEW(applicationId), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Approve an application and issue PHB license
   * @param {string} applicationId - Application UUID
   * @param {Object} data - Approval data (review_notes, practice_type, public_email, public_phone, biography)
   * @returns {Promise} Registry entry with license number
   */
  approveApplication: async (applicationId, data) => {
    return apiRequest(REGISTRY_ENDPOINTS.APPLICATIONS.APPROVE(applicationId), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Reject an application
   * @param {string} applicationId - Application UUID
   * @param {Object} data - Rejection data (rejection_reason)
   * @returns {Promise} Updated application
   */
  rejectApplication: async (applicationId, data) => {
    return apiRequest(REGISTRY_ENDPOINTS.APPLICATIONS.REJECT(applicationId), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Request additional documents from applicant
   * @param {string} applicationId - Application UUID
   * @param {Object} data - Request data (notes, documents_needed)
   * @returns {Promise} Updated application
   */
  requestAdditionalDocuments: async (applicationId, data) => {
    return apiRequest(REGISTRY_ENDPOINTS.APPLICATIONS.REQUEST_DOCUMENTS(applicationId), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },
};

/**
 * Registry Service - Document Verification
 */
export const registryDocumentAPI = {
  /**
   * Verify a document as authentic
   * @param {string} applicationId - Application UUID
   * @param {string} documentId - Document UUID
   * @param {Object} data - Verification data (notes)
   * @returns {Promise} Updated document
   */
  verifyDocument: async (applicationId, documentId, data = {}) => {
    return apiRequest(REGISTRY_ENDPOINTS.DOCUMENTS.VERIFY(applicationId, documentId), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Reject a document as invalid
   * @param {string} applicationId - Application UUID
   * @param {string} documentId - Document UUID
   * @param {Object} data - Rejection data (reason)
   * @returns {Promise} Updated document
   */
  rejectDocument: async (applicationId, documentId, data) => {
    return apiRequest(REGISTRY_ENDPOINTS.DOCUMENTS.REJECT(applicationId, documentId), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Request clarification on a document
   * @param {string} applicationId - Application UUID
   * @param {string} documentId - Document UUID
   * @param {Object} data - Clarification data (clarification_needed)
   * @returns {Promise} Updated document
   */
  requestClarification: async (applicationId, documentId, data) => {
    return apiRequest(REGISTRY_ENDPOINTS.DOCUMENTS.CLARIFY(applicationId, documentId), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },
};

/**
 * Registry Service - User Management (Platform Admin only)
 */
export const registryUserAPI = {
  /**
   * List all admin users with their roles
   * @returns {Promise} List of admin users
   */
  listAdminUsers: async () => {
    return apiRequest(REGISTRY_ENDPOINTS.USERS.LIST);
  },

  /**
   * Create a new admin user and assign role
   * @param {Object} data - User data (email, first_name, last_name, role_id)
   * @returns {Promise} Created user with temporary password
   */
  createAdminUser: async (data) => {
    return apiRequest(REGISTRY_ENDPOINTS.USERS.CREATE, {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Update user's role
   * @param {number} userId - User ID
   * @param {number} roleId - New role ID
   * @returns {Promise} Updated user
   */
  updateUserRole: async (userId, roleId) => {
    return apiRequest(REGISTRY_ENDPOINTS.USERS.UPDATE_ROLE(userId), {
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
    return apiRequest(REGISTRY_ENDPOINTS.USERS.DEACTIVATE(userId), {
      method: HTTP_METHODS.POST,
    });
  },

  /**
   * Reactivate a deactivated admin user
   * @param {number} userId - User ID
   * @returns {Promise} Success message
   */
  reactivateUser: async (userId) => {
    return apiRequest(REGISTRY_ENDPOINTS.USERS.REACTIVATE(userId), {
      method: HTTP_METHODS.POST,
    });
  },

  /**
   * List all available roles
   * @returns {Promise} List of roles with permissions
   */
  listRoles: async () => {
    return apiRequest(REGISTRY_ENDPOINTS.ROLES.LIST);
  },
};

/**
 * Registry Service - Registry Management
 */
export const registryManagementAPI = {
  /**
   * List all registry entries with filters
   * @param {Object} params - Query parameters (license_status, professional_type, state, search)
   * @returns {Promise} Registry entries list
   */
  listRegistry: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${REGISTRY_ENDPOINTS.REGISTRY.LIST}?${queryString}`);
  },

  /**
   * Suspend a professional license
   * @param {string} licenseNumber - PHB license number
   * @param {Object} data - Suspension data (suspension_reason, suspension_notes)
   * @returns {Promise} Updated registry entry
   */
  suspendLicense: async (licenseNumber, data) => {
    return apiRequest(REGISTRY_ENDPOINTS.REGISTRY.SUSPEND(licenseNumber), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Reactivate a suspended license
   * @param {string} licenseNumber - PHB license number
   * @param {Object} data - Reactivation data (reactivation_notes)
   * @returns {Promise} Updated registry entry
   */
  reactivateLicense: async (licenseNumber, data = {}) => {
    return apiRequest(REGISTRY_ENDPOINTS.REGISTRY.REACTIVATE(licenseNumber), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Revoke a professional license
   * @param {string} licenseNumber - PHB license number
   * @param {Object} data - Revocation data (revocation_reason, revocation_notes)
   * @returns {Promise} Updated registry entry
   */
  revokeLicense: async (licenseNumber, data) => {
    return apiRequest(REGISTRY_ENDPOINTS.REGISTRY.REVOKE(licenseNumber), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Add disciplinary record to a professional
   * @param {string} licenseNumber - PHB license number
   * @param {Object} data - Disciplinary data (incident_type, description, severity, action_taken)
   * @returns {Promise} Created disciplinary record
   */
  addDisciplinaryRecord: async (licenseNumber, data) => {
    return apiRequest(REGISTRY_ENDPOINTS.REGISTRY.DISCIPLINARY(licenseNumber), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },
};

// Export combined registry service
export const registryService = {
  applications: registryApplicationAPI,
  documents: registryDocumentAPI,
  users: registryUserAPI,
  registry: registryManagementAPI,
};

export default registryService;
