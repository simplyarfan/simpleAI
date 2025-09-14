const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { 
  authenticateToken, 
  validateCompanyDomain, 
  trackActivity,
  cleanupExpiredSessions 
} = require('../middleware/auth');
const {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter
} = require('../middleware/rateLimiting');
const {
  validateRegistration,
  validateLogin,
  validateEmailVerification,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateProfileUpdate,
  validateEmailOnly
} = require('../middleware/validation');

// Public routes (no authentication required)

// User registration
router.post('/register', 
  authLimiter,
  validateCompanyDomain,
  validateRegistration,
  trackActivity('registration_attempt'),
  AuthController.register
);

// User login
router.post('/login', 
  authLimiter,
  validateLogin,
  cleanupExpiredSessions,
  trackActivity('login_attempt'),
  AuthController.login
);

// Email verification
router.post('/verify-email', 
  emailVerificationLimiter,
  validateEmailVerification,
  trackActivity('email_verification_attempt'),
  AuthController.verifyEmail
);

// Resend verification email
router.post('/resend-verification', 
  emailVerificationLimiter,
  validateEmailOnly,
  validateCompanyDomain,
  trackActivity('resend_verification_attempt'),
  AuthController.resendVerification
);

// Request password reset
router.post('/forgot-password', 
  passwordResetLimiter,
  validatePasswordResetRequest,
  validateCompanyDomain,
  trackActivity('password_reset_request'),
  AuthController.requestPasswordReset
);

// Reset password
router.post('/reset-password', 
  passwordResetLimiter,
  validatePasswordReset,
  trackActivity('password_reset_attempt'),
  AuthController.resetPassword
);

// Refresh access token
router.post('/refresh-token', 
  cleanupExpiredSessions,
  AuthController.refreshToken
);

// Protected routes (authentication required)

// Get current user profile
router.get('/profile', 
  authenticateToken,
  trackActivity('profile_viewed'),
  AuthController.getProfile
);

// Update user profile
router.put('/profile', 
  authenticateToken,
  validateProfileUpdate,
  trackActivity('profile_updated'),
  AuthController.updateProfile
);

// Check authentication status
router.get('/check', 
  authenticateToken,
  AuthController.checkAuth
);

// Logout (current session)
router.post('/logout', 
  authenticateToken,
  trackActivity('logout'),
  AuthController.logout
);

// Logout from all devices
router.post('/logout-all', 
  authenticateToken,
  trackActivity('logout_all_devices'),
  AuthController.logoutAll
);

module.exports = router;