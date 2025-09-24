import axios from 'axios';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

// Direct axios for health checks (used once)

// Environment-based API URL configuration
const getApiBaseUrl = () => {
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return 'https://thesimpleai.vercel.app/api';
  }
  
  // Client-side fallback
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Production fallback
  return 'https://thesimpleai.vercel.app/api';
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
  getAccessToken: () => {
    const token = Cookies.get('accessToken');
    console.log('🔍 [TOKEN] Retrieved access token:', token ? 'present' : 'missing');
    return token;
  },
  getRefreshToken: () => {
    const token = Cookies.get('refreshToken');
    console.log('🔍 [TOKEN] Retrieved refresh token:', token ? 'present' : 'missing');
    return token;
  },
  
  setTokens: (accessToken, refreshToken) => {
    console.log('🍪 [TOKENS] Setting tokens:', {
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing'
    });
    
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
    
    console.log('🍪 [TOKENS] Tokens saved to cookies');
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
    console.log('🔍 [API] Request interceptor - Token exists:', !!token);
    console.log('🔍 [API] Request to:', config.url);
    
    if (token && !tokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 [API] Added Bearer token to request');
    } else {
      console.log('🔍 [API] No token or token expired');
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = Math.random().toString(36).substring(7);
    
    return config;
  },
  (error) => {
    console.error('🔍 [API] Request interceptor error:', error);
    return Promise.reject(error);
  }
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
  updateProfile: (data) => api.put('/auth/profile', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
  
  // Admin/Superadmin user management
  getAllUsers: (params) => api.get('/auth/users', { params }),
  getUser: (userId) => api.get(`/auth/users/${userId}`),
  createUser: (userData) => api.post('/auth/users', userData),
  updateUser: (userId, userData) => api.put(`/auth/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`),
  getStats: () => api.get('/auth/stats')
};

export const cvAPI = {
  createBatch: (data) => api.post('/cv-intelligence', data),
  getBatches: (params) => api.get('/cv-intelligence/batches', { params }),
  getBatchDetails: (batchId) => api.get(`/cv-intelligence/batch/${batchId}`),
  getCandidates: (batchId) => api.get(`/cv-intelligence/batch/${batchId}/candidates`),
  processBatch: (batchId, jdFile, cvFiles, onProgress = null) => {
    const formData = new FormData();
    
    // Add JD file
    if (jdFile) {
      formData.append('jdFile', jdFile);
    }
    
    // Add CV files
    if (cvFiles && cvFiles.length > 0) {
      cvFiles.forEach((file) => {
        formData.append('cvFiles', file);
      });
    }
    
    return api.post(`/cv-intelligence/batch/${batchId}/process`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    });
  },
  exportBatch: (batchId, format = 'json') => api.get(`/cv-intelligence/batch/${batchId}/export`, {
    params: { format }
  }),
  deleteBatch: (batchId) => api.delete(`/cv-intelligence/batch/${batchId}`)
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
  getDetailedAnalytics: () => api.get('/analytics/detailed'),
  getUserAnalytics: (params) => api.get('/analytics/users', { params }),
  getAgentAnalytics: (params) => api.get('/analytics/agents', { params }),
  getCVAnalytics: (params) => api.get('/analytics/cv-intelligence', { params }),
  getSystemAnalytics: (params) => api.get('/analytics/system', { params }),
  exportAnalytics: (params) => api.get('/analytics/export', { params })
};

export const systemAPI = {
  getHealth: () => api.get('/system/health'),
  getMetrics: () => api.get('/system/metrics'),
  getServices: () => api.get('/system/services')
};

export const adminAPI = {
  seedDatabase: () => api.post('/admin/seed-database')
};

export const supportAPI = {
  createTicket: (ticketData) => api.post('/support', ticketData),
  getMyTickets: (params) => api.get('/support/my-tickets', { params }),
  getAllTickets: (params) => api.get('/support/admin/all', { params }),
  getTicket: (ticketId) => api.get(`/support/${ticketId}`),
  addComment: (ticketId, comment, isInternal = false) => api.post(`/support/${ticketId}/comments`, {
    comment,
    is_internal: isInternal
  }),
  updateTicket: (ticketId, updateData) => api.put(`/support/${ticketId}`, updateData),
  deleteTicket: (ticketId) => api.delete(`/support/${ticketId}`),
  getStats: (timeframe = '30d') => api.get('/support/admin/stats', { params: { timeframe } })
};

export const healthAPI = {
  check: () => axios.get('https://thesimpleai.vercel.app/health', {
    headers: {
      'Content-Type': 'application/json'
    }
  })
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
