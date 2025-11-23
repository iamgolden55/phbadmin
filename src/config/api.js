// API Configuration for Platform Admin Dashboard

// Base API URL - Update these based on your environment
const API_CONFIG = {
  development: {
    baseURL: 'http://127.0.0.1:8000/api',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://your-domain.com/api', // Update with your production domain
    timeout: 15000,
  }
};

// Get current environment
const isDevelopment = process.env.NODE_ENV === 'development';
const config = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// API Endpoints for Platform Admin
export const API_ENDPOINTS = {
  // Base configuration
  BASE_URL: config.baseURL,
  TIMEOUT: config.timeout,
  
  // Authentication endpoints
  AUTH: {
    LOGIN: '/token/', // JWT login
    REFRESH: '/token/refresh/',
    LOGOUT: '/logout/',
  },
  
  // Platform Admin endpoints - using admin endpoints for superuser access
  PLATFORM: {
    STATS: '/admin/platform/stats/', // Real platform admin stats endpoint
    USERS: '/admin/platform/users/', 
    HOSPITALS: '/admin/platform/hospitals/', // Real platform admin hospitals endpoint
    PAYMENTS: '/admin/platform/payments/', // Real platform admin payments endpoint
    APPOINTMENTS: '/appointments/', // Use main appointments endpoint
    CONTACTS: '/admin/platform/contacts/',
    ANALYTICS: '/admin/platform/analytics/', // Real platform admin analytics
  },
  
  // Additional endpoints you might need
  HOSPITALS: {
    LIST: '/hospitals/',
    DETAIL: (id) => `/hospitals/${id}/`,
    REGISTRATIONS: '/hospitals/registrations/',
  },
  
  APPOINTMENTS: {
    LIST: '/appointments/',
    DETAIL: (id) => `/appointments/${id}/`,
  },
  
  USERS: {
    PROFILE: '/profile/',
    LIST: '/users/', // If you have a users endpoint
  },
  
  // Messaging endpoints
  MESSAGING: {
    CONVERSATIONS: '/messaging/conversations/',
    CREATE_CONVERSATION: '/messaging/conversations/create/',
    EMERGENCY_CONVERSATION: '/messaging/conversations/emergency/',
    SEND_MESSAGE: (conversationId) => `/messaging/conversations/${conversationId}/send/`,
    GET_MESSAGES: (conversationId) => `/messaging/conversations/${conversationId}/messages/`,
    GET_PARTICIPANTS: (conversationId) => `/messaging/conversations/${conversationId}/participants/`,
    STORAGE_INFO: '/messaging/storage/info/',
  }
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// Request headers configuration
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// API request helper function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${config.baseURL}${endpoint}`;
  
  const defaultOptions = {
    method: HTTP_METHODS.GET,
    headers: getAuthHeaders(),
    timeout: config.timeout,
  };
  
  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    // Handle authentication errors
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        // Retry the request with new token
        requestOptions.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
        const retryResponse = await fetch(url, requestOptions);
        if (retryResponse.ok) {
          return await retryResponse.json();
        }
      }
      // If refresh failed, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Token refresh helper
const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${config.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: HTTP_METHODS.POST,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Platform Admin API methods
export const platformAPI = {
  // Get platform statistics - use single admin endpoint for all real data
  getStats: async () => {
    try {
      console.log('🔍 Fetching REAL platform stats from admin endpoint...');
      
      // Use the platform admin stats endpoint that you can access as superuser
      const platformStats = await apiRequest(API_ENDPOINTS.PLATFORM.STATS);
      console.log('📊 Platform admin stats from backend:', platformStats);
      
      // This endpoint returns the same structure as what we're expecting
      // and calculates all data directly from the database like Django admin does
      return platformStats;
      
    } catch (error) {
      console.error('❌ Failed to get platform admin stats:', error);
      
      // Fallback with zeros - no hardcoded data
      return {
        users: {
          total: 0,
          verified: 0,
          new_this_month: 0,
          growth_rate: 0
        },
        hospitals: {
          total: 0,
          verified: 0,
          pending_registrations: 0,
          verification_rate: 0
        },
        appointments: {
          total: 0,
          completed: 0,
          this_month: 0,
          completion_rate: 0
        },
        payments: {
          total_transactions: 0,
          successful: 0,
          pending: 0,
          failed: 0,
          total_revenue: 0,
          potential_revenue: 0,
          collection_rate: 0,
          success_rate: 0,
          average_transaction: 0
        }
      };
    }
  },
  
  // User management
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.PLATFORM.USERS}?${queryString}`);
  },
  
  updateUser: (userData) => apiRequest(API_ENDPOINTS.PLATFORM.USERS, {
    method: HTTP_METHODS.PATCH,
    body: JSON.stringify(userData),
  }),
  
  // Hospital management - using existing hospitals endpoint
  getHospitals: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.PLATFORM.HOSPITALS}?${queryString}`);
  },
  
  updateHospital: (hospitalData) => apiRequest(API_ENDPOINTS.PLATFORM.HOSPITALS, {
    method: HTTP_METHODS.PATCH,
    body: JSON.stringify(hospitalData),
  }),
  
  // Payment analytics
  getPayments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.PLATFORM.PAYMENTS}?${queryString}`);
  },
  
  // Hospital admin contacts
  getContacts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.PLATFORM.CONTACTS}?${queryString}`);
  },
  
  // Analytics data
  getAnalytics: () => apiRequest(API_ENDPOINTS.PLATFORM.ANALYTICS),
};

// Authentication API methods
export const authAPI = {
  login: (credentials) => apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
    method: HTTP_METHODS.POST,
    body: JSON.stringify(credentials),
  }),
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  },
  
  getCurrentUser: () => apiRequest(API_ENDPOINTS.USERS.PROFILE),
};

// Messaging API methods
export const messagingAPI = {
  // Get conversations
  getConversations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.MESSAGING.CONVERSATIONS}?${queryString}`);
  },
  
  // Create a new conversation
  createConversation: (conversationData) => apiRequest(API_ENDPOINTS.MESSAGING.CREATE_CONVERSATION, {
    method: HTTP_METHODS.POST,
    body: JSON.stringify(conversationData),
  }),
  
  // Create emergency conversation
  createEmergencyConversation: (emergencyData) => apiRequest(API_ENDPOINTS.MESSAGING.EMERGENCY_CONVERSATION, {
    method: HTTP_METHODS.POST,
    body: JSON.stringify(emergencyData),
  }),
  
  // Send a message
  sendMessage: (conversationId, messageData) => apiRequest(API_ENDPOINTS.MESSAGING.SEND_MESSAGE(conversationId), {
    method: HTTP_METHODS.POST,
    body: JSON.stringify(messageData),
  }),
  
  // Get messages for a conversation
  getMessages: (conversationId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${API_ENDPOINTS.MESSAGING.GET_MESSAGES(conversationId)}?${queryString}`);
  },
  
  // Get conversation participants
  getParticipants: (conversationId) => apiRequest(API_ENDPOINTS.MESSAGING.GET_PARTICIPANTS(conversationId)),
  
  // Get storage info
  getStorageInfo: () => apiRequest(API_ENDPOINTS.MESSAGING.STORAGE_INFO),
  
  // Quick message helper for hospital admin communication
  sendQuickMessage: async (recipientId, message, title = null) => {
    try {
      // First create a direct conversation
      const conversationData = {
        title: title || `Direct Message`,
        conversation_type: 'direct',
        participant_ids: [recipientId],
        initial_message: message,
        priority_level: 'routine'
      };
      
      const response = await messagingAPI.createConversation(conversationData);
      return response;
    } catch (error) {
      console.error('Failed to send quick message:', error);
      throw error;
    }
  }
};

const api = {
  platformAPI,
  authAPI,
  messagingAPI,
  apiRequest,
  API_ENDPOINTS,
  HTTP_METHODS,
};

export default api;