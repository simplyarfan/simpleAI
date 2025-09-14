import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, tokenManager, handleAPIError } from '../utils/api';
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

      const response = await authAPI.checkAuth();
      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenManager.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Registration successful! Please check your email to verify your account.');
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = handleAPIError(error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Store tokens
        tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
        return { success: true, user };
      }
    } catch (error) {
      const message = handleAPIError(error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (logoutAll = false) => {
    try {
      if (logoutAll) {
        await authAPI.logoutAll();
        toast.success('Logged out from all devices');
      } else {
        await authAPI.logout();
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and state regardless of API call success
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);
      
      if (response.data.success) {
        toast.success('Email verified successfully! You can now log in.');
        return { success: true };
      }
    } catch (error) {
      const message = handleAPIError(error);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await authAPI.resendVerification(email);
      
      if (response.data.success) {
        toast.success('Verification email sent successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = handleAPIError(error);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.data.success) {
        toast.success('Password reset email sent successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = handleAPIError(error);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, password);
      
      if (response.data.success) {
        toast.success('Password reset successfully! You can now log in.');
        return { success: true };
      }
    } catch (error) {
      const message = handleAPIError(error);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(userData);
      
      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success('Profile updated successfully!');
        return { success: true, user: response.data.data.user };
      }
    } catch (error) {
      const message = handleAPIError(error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUser(response.data.data.user);
        return response.data.data.user;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshUserData,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;