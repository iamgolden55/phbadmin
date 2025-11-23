/**
 * Practice Page Service
 *
 * API service for Professional Practice Pages Admin operations.
 * Handles practice page review, verification, and management.
 */

import { apiRequest, HTTP_METHODS } from '../config/api';

// Practice Page API Endpoints
const PRACTICE_PAGE_ENDPOINTS = {
  // Practice Page Management
  PAGES: {
    LIST: '/practice-pages/admin/pages/',
    DETAIL: (pageId) => `/practice-pages/admin/pages/${pageId}/`,
    VERIFY: (pageId) => `/practice-pages/admin/pages/${pageId}/verify/`,
    FLAG: (pageId) => `/practice-pages/admin/pages/${pageId}/flag/`,
    SUSPEND: (pageId) => `/practice-pages/admin/pages/${pageId}/suspend/`,
  },
};

/**
 * Practice Page Service - Page Management
 */
export const practicePageAPI = {
  /**
   * List all practice pages with filters
   * @param {Object} params - Query parameters (verification_status, service_type, search, page)
   * @returns {Promise} Practice pages list with pagination
   */
  listPages: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${PRACTICE_PAGE_ENDPOINTS.PAGES.LIST}?${queryString}`);
  },

  /**
   * Get detailed information about a specific practice page
   * @param {string} pageId - Practice Page UUID
   * @returns {Promise} Practice page details
   */
  getPageDetail: async (pageId) => {
    return apiRequest(PRACTICE_PAGE_ENDPOINTS.PAGES.DETAIL(pageId));
  },

  /**
   * Verify a practice page (approve, reject, flag, or suspend)
   * @param {string} pageId - Practice Page UUID
   * @param {Object} data - Verification data (verification_status: 'verified'|'rejected'|'flagged'|'suspended', verification_notes)
   * @returns {Promise} Updated practice page
   */
  verifyPage: async (pageId, data) => {
    return apiRequest(PRACTICE_PAGE_ENDPOINTS.PAGES.VERIFY(pageId), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(data),
    });
  },

  /**
   * Flag a practice page for review
   * @param {string} pageId - Practice Page UUID
   * @param {Object} data - Flag data (flag_reason, has_penalty, penalty_amount)
   * @returns {Promise} Updated practice page
   */
  flagPage: async (pageId, data) => {
    return apiRequest(PRACTICE_PAGE_ENDPOINTS.PAGES.VERIFY(pageId), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({
        verification_status: 'flagged',
        verification_notes: data.flag_reason,
        has_penalty: data.has_penalty || false,
        penalty_amount: data.penalty_amount || null,
      }),
    });
  },

  /**
   * Suspend a practice page
   * @param {string} pageId - Practice Page UUID
   * @param {Object} data - Suspension data (suspension_reason, has_penalty, penalty_amount)
   * @returns {Promise} Updated practice page
   */
  suspendPage: async (pageId, data) => {
    return apiRequest(PRACTICE_PAGE_ENDPOINTS.PAGES.VERIFY(pageId), {
      method: HTTP_METHODS.POST,
      body: JSON.stringify({
        verification_status: 'suspended',
        verification_notes: data.suspension_reason,
        has_penalty: data.has_penalty || false,
        penalty_amount: data.penalty_amount || null,
      }),
    });
  },
};

// Export combined practice page service
export const practicePageService = {
  pages: practicePageAPI,
};

export default practicePageService;
