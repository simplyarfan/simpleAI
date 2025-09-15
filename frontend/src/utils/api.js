import axios from 'axios';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode'; // v3 syntax: default import

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  getAccessToken: () => Cookies.get('accessToken'),
  getRefreshToken: () => Cookies.get('refreshToken'),
  
  setTokens: (accessToken, refreshToken) => {
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const cookieOptions = {
      expires: 7, // 7 days
      path: '/',
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    };
    
    console.log('Setting tokens with options:', cookieOptions);
    
    Cookies.set('accessToken', accessToken, cookieOptions);
    Cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: 30 // 30 days for refresh token
    });
  },
  
  clearTokens: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  },
  
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
  
  getUserFromToken: (token) => {
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token && !tokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.response?.status, error.message);
    
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken && !tokenManager.isTokenExpired(refreshToken)) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          const { accessToken } = response.data.data;
          tokenManager.setTokens(accessToken, refreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          tokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  checkAuth: () => api.get('/auth/check')
};

// CV Intelligence API methods
export const cvAPI = {
  createBatch: (formData) => api.post('/cv-intelligence', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getBatches: (params) => api.get('/cv-intelligence/my-batches', { params }),
  getBatchDetails: (batchId) => api.get(`/cv-intelligence/batches/${batchId}`),
  getCandidateDetails: (candidateId) => api.get(`/cv-intelligence/candidates/${candidateId}`),
  exportBatch: (batchId, format = 'json') => api.get(`/cv-intelligence/batches/${batchId}/export`, {
    params: { format }
  }),
  deleteBatch: (batchId) => api.delete(`/cv-intelligence/batches/${batchId}`)
};

// Support API methods
export const supportAPI = {
  createTicket: (ticketData) => api.post('/support', ticketData),
  getMyTickets: (params) => api.get('/support/my-tickets', { params }),
  getTicket: (ticketId) => api.get(`/support/${ticketId}`),
  updateTicket: (ticketId, updates) => api.put(`/support/${ticketId}`, updates),
  addComment: (ticketId, comment, isInternal = false) => api.post(`/support/${ticketId}/comments`, {
    comment,
    is_internal: isInternal
  })
};

// Analytics API methods (superadmin only)
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUserAnalytics: (params) => api.get('/analytics/users', { params }),
  getAgentAnalytics: (params) => api.get('/analytics/agents', { params }),
  getCVAnalytics: (params) => api.get('/analytics/cv-intelligence', { params }),
  getSystemAnalytics: (params) => api.get('/analytics/system', { params }),
  getUserActivity: (userId, params) => api.get(`/analytics/users/${userId}/activity`, { params }),
  exportAnalytics: (params) => api.get('/analytics/export', { params })
};

// Health check
export const healthAPI = {
  check: () => api.get('/health')
};

// Error handling helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || `Server error: ${error.response.status}`;
    console.error('❌ Server Error:', message);
    return message;
  } else if (error.request) {
    // Request made but no response
    const message = 'Unable to connect to server. Please check your internet connection.';
    console.error('❌ Network Error:', message);
    return message;
  } else {
    // Something else happened
    const message = error.message || 'An unexpected error occurred';
    console.error('❌ Unknown Error:', message);
    return message;
  }
};

export default api;