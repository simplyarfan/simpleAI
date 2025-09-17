import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenManager } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get the API base URL (without /api since we'll add the full path)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  // Cache busting timestamp to force fresh deployments
  const CACHE_BUSTER = Date.now();

  console.log('🔗 API Base URL:', API_BASE);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (!token || tokenManager.isTokenExpired(token)) {
        setLoading(false);
        return;
      }

      console.log('🔐 Checking auth status...');
      const response = await fetch(`${API_BASE}/api/auth/check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          setIsAuthenticated(true);
          console.log('✅ Auth check successful');
        }
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      tokenManager.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('📝 Starting registration...', { email: userData.email });

      // Use the proper authentication endpoint
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      console.log('📝 Registration response status:', response.status);
      const data = await response.json();
      console.log('📝 Registration response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Handle successful registration
      if (data.success) {
        // Registration now includes automatic login
        if (data.data?.token && data.data?.user) {
          // Store tokens
          tokenManager.setTokens(data.data.token, null);
          
          // Update state with user data
          setUser(data.data.user);
          setIsAuthenticated(true);
          
          toast.success(data.message || 'Registration successful! You are now logged in.');
          return {
            success: true,
            message: data.message,
            user: data.data.user,
            autoLogin: true
          };
        } else {
          toast.success(data.message || 'Registration successful!');
        }
        
        return {
          success: true,
          message: data.message
        };
      }

      return {
        success: true,
        message: data.message
      };
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMessage = err.message || 'Registration failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('🔐 Starting login...', { 
        email: credentials.email,
        apiBase: API_BASE,
        endpoint: `${API_BASE}/api/login-simple`,
        cacheBuster: CACHE_BUSTER
      });

      // Use the proper authentication endpoint
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(credentials),
      });

      console.log('🔐 Login response status:', response.status);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Invalid server response format');
      }
      
      console.log('🔐 Login response data:', data);

      if (!response.ok) {
        const errorMessage = data.message || `Login failed with status ${response.status}`;
        console.error('Login failed:', { status: response.status, error: errorMessage });
        throw new Error(errorMessage);
      }

      // Handle successful login
      if (data.success) {
        // Backend returns accessToken, not sessionToken
        const accessToken = data.accessToken;
        
        if (!accessToken) {
          console.error('No access token in response:', data);
          throw new Error('Authentication failed: No access token received');
        }

        // Store tokens
        tokenManager.setTokens(accessToken, data.refreshToken);

        // Update state with user data - backend returns user directly
        const userData = data.user;
        if (!userData) {
          console.error('No user data in response:', data);
          throw new Error('Authentication failed: No user data received');
        }

        setUser(userData);
        setIsAuthenticated(true);

        toast.success('Login successful!');
        console.log('✅ Login successful', { user: userData });
        return { success: true, user: userData };
      } else {
        console.error('Login failed - success flag is false:', data);
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.message || 'Login failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token) => {
    try {
      console.log('📧 Verifying email with token...');
      const response = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      console.log('📧 Email verification response:', data);

      if (data.success) {
        toast.success('Email verified successfully!');
        return { success: true };
      } else {
        throw new Error(data.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('❌ Email verification error:', error);
      const errorMessage = error.message || 'Email verification failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resendVerification = async (email) => {
    try {
      console.log('📧 Resending verification email...');
      const response = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verification email sent!');
        return { success: true };
      } else {
        throw new Error(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      const errorMessage = error.message || 'Failed to resend verification email';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (logoutAll = false) => {
    try {
      const token = tokenManager.getAccessToken();
      const endpoint = logoutAll ? '/api/auth/logout-all' : '/api/auth/logout';
      
      await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      toast.success(logoutAll ? 'Logged out from all devices' : 'Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Clear tokens and state regardless of API call success
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    checkAuthStatus,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;