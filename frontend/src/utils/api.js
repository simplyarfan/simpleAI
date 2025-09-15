import axios from 'axios';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

// Environment-based API URL configuration
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return process.env.NEXT_PUBLIC_API_URL || 'https://thesimpleai.vercel.app/api';
  }
  
  // Client-side
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:5000/api';
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'https://thesimpleai.vercel.app/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create optimized axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Retry configuration
  retry: 3,
  retryDelay: 1000,
});

// Token management utility
export const tokenManager = {
  getAccessToken: () => Cookies.get('accessToken'),
  getRefreshToken: () => Cookies.get('refreshToken'),
  
  setTokens: (accessToken, refreshToken) => {
    const isProduction = typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1';
    
    const cookieOptions = {
      expires: 7,
      path: '/',
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    };
    
    Cookies.set('accessToken', accessToken, cookieOptions);
    Cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: 30
    });
  },
  
  clearTokens: () => {
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token && !tokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = Math.random().toString(36).substring(7);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
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
          console.error('❌ Token refresh failed');
          tokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      } else {
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    
    console.error(`❌ ${error.response?.status || 'Network'} Error:`, error.message);
    return Promise.reject(error);
  }
);

// API Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  checkAuth: () => api.get('/auth/check'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const cvAPI = {
  createBatch: (formData) => api.post('/cv-intelligence', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getBatches: (params) => api.get('/cv-intelligence/my-batches', { params }),
  getBatchDetails: (batchId) => api.get(`/cv-intelligence/batches/${batchId}`),
  exportBatch: (batchId, format = 'json') => api.get(`/cv-intelligence/batches/${batchId}/export`, {
    params: { format }
  }),
  deleteBatch: (batchId) => api.delete(`/cv-intelligence/batches/${batchId}`)
};

export const supportAPI = {
  createTicket: (ticketData) => api.post('/support', ticketData),
  getMyTickets: (params) => api.get('/support/my-tickets', { params }),
  getAllTickets: (params) => api.get('/support', { params }),
  getTicket: (ticketId) => api.get(`/support/${ticketId}`),
  addComment: (ticketId, comment, isInternal = false) => api.post(`/support/${ticketId}/comments`, {
    comment,
    is_internal: isInternal
  }),
  updateTicket: (ticketId, updateData) => api.put(`/support/${ticketId}`, updateData),
  deleteTicket: (ticketId) => api.delete(`/support/${ticketId}`),
  getStats: (timeframe = '30d') => api.get(`/support/admin/stats?timeframe=${timeframe}`)
};

export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`)
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUserAnalytics: (params) => api.get('/analytics/users', { params }),
  getAgentAnalytics: (params) => api.get('/analytics/agents', { params }),
  exportAnalytics: (params) => api.get('/analytics/export', { params })
};

export const healthAPI = {
  check: () => api.get('/health')
};

// Error handling utility
export const handleAPIError = (error) => {
  if (error.response) {
    return error.response.data?.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    return 'Unable to connect to server. Please check your internet connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

export default api;
