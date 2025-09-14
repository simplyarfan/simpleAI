import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  getAccessToken: () => Cookies.get('accessToken'),
  getRefreshToken: () => Cookies.get('refreshToken'),
  
  setTokens: (accessToken, refreshToken) => {
    Cookies.set('accessToken', accessToken, { expires: 7, secure: true, sameSite: 'strict' });
    Cookies.set('refreshToken', refreshToken, { expires: 30, secure: true, sameSite: 'strict' });
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
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
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
          tokenManager.clearTokens();
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        tokenManager.clearTokens();
        window.location.href = '/auth/login';
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

// Error handling helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Unable to connect to server. Please check your internet connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export default api;