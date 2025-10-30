const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const database = require('../models/database');
const googleCalendarService = require('../services/googleCalendarService');
const { 
  authenticateToken, 
  validateCompanyDomain, 
  trackActivity,
  cleanupExpiredSessions,
  requireSuperAdmin,
  requireAdmin
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
  validateEmailOnly,
  validateUserCreation,
  validateUserId,
  validatePagination,
  validateSearch,
  validateRole,
  validatePasswordChange
} = require('../middleware/validation');

// Public routes (no authentication required)

// User registration
router.post('/register', 
  authLimiter,
  validateRegistration,
  AuthController.register
);

// User login
router.post('/login', 
  authLimiter,
  validateLogin,
  AuthController.login
);

// Verify 2FA code
router.post('/verify-2fa',
  authLimiter,
  trackActivity('2fa_verification'),
  AuthController.verify2FA
);

// Resend 2FA code
router.post('/resend-2fa',
  authLimiter,
  trackActivity('2fa_resend'),
  AuthController.resend2FACode
);

// Email verification during registration
router.post('/verify-email',
  authLimiter,
  trackActivity('email_verification'),
  AuthController.verifyEmail
);

// Resend verification code during registration
router.post('/resend-verification',
  emailVerificationLimiter,
  trackActivity('verification_resend'),
  AuthController.resendVerificationCode
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

// Change password
router.put('/change-password',
  authenticateToken,
  validatePasswordChange,
  trackActivity('password_changed'),
  AuthController.changePassword
);

// Enable 2FA
router.post('/enable-2fa',
  authenticateToken,
  trackActivity('2fa_enabled'),
  AuthController.enable2FA
);

// Disable 2FA
router.post('/disable-2fa',
  authenticateToken,
  trackActivity('2fa_disabled'),
  AuthController.disable2FA
);

// Check authentication status
router.get('/check', 
  authenticateToken,
  AuthController.checkAuth
);

// Get all users (superadmin only)
router.get('/users',
  authenticateToken,
  requireSuperAdmin,
  validatePagination,
  validateSearch,
  validateRole,
  trackActivity('users_viewed'),
  AuthController.getAllUsers
);

// Get user statistics (superadmin only)
router.get('/stats',
  authenticateToken,
  requireSuperAdmin,
  trackActivity('user_stats_viewed'),
  AuthController.getUserStats
);

// Get specific user (superadmin only)
router.get('/users/:user_id',
  authenticateToken,
  requireSuperAdmin,
  validateUserId,
  trackActivity('user_details_viewed'),
  AuthController.getUser
);

// Create new user (superadmin only)
router.post('/users',
  authenticateToken,
  requireSuperAdmin,
  validateUserCreation,
  trackActivity('user_created'),
  AuthController.createUser
);

// Update user (superadmin only)
router.put('/users/:user_id',
  authenticateToken,
  requireSuperAdmin,
  validateUserId,
  trackActivity('user_updated'),
  AuthController.updateUser
);

// Delete user (superadmin only)
router.delete('/users/:user_id',
  authenticateToken,
  requireSuperAdmin,
  validateUserId,
  trackActivity('user_deleted'),
  AuthController.deleteUser
);

// Admin route to reset user password (for debugging)
router.post('/admin/reset-password', authenticateToken, async (req, res) => {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Superadmin role required.'
      });
    }

    await AuthController.adminResetUserPassword(req, res);
  } catch (error) {
    console.error('Admin reset password route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

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

/**
 * POST /outlook/connect - Save Outlook tokens
 */
router.post('/outlook/connect', authenticateToken, async (req, res) => {
  try {
    const { accessToken, refreshToken, expiresAt, email } = req.body;
    
    if (!accessToken || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: accessToken, email'
      });
    }

    await database.connect();
    
    await database.run(`
      UPDATE users 
      SET outlook_access_token = $1,
          outlook_refresh_token = $2,
          outlook_token_expires_at = $3,
          outlook_email = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [accessToken, refreshToken, expiresAt, email, req.user.id]);

    res.json({
      success: true,
      message: 'Outlook account connected successfully'
    });

  } catch (error) {
    console.error('Outlook connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect Outlook account',
      error: error.message
    });
  }
});

/**
 * GET /google/auth - Initiate Google OAuth flow
 */
router.get('/google/auth', authenticateToken, trackActivity('google_oauth_initiated'), async (req, res) => {
  try {
    const authUrl = googleCalendarService.getAuthUrl(req.user.id);
    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('❌ Google OAuth initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Google OAuth',
      error: error.message
    });
  }
});

/**
 * GET /google/callback - Handle Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Exchange code for tokens
    const tokens = await googleCalendarService.getTokensFromCode(code);
    
    // Store tokens in database
    if (userId) {
      await googleCalendarService.storeUserTokens(userId, tokens);
    }

    // Redirect back to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'https://thesimpleai.netlify.app';
    res.redirect(`${frontendUrl}/profile?google_calendar=connected`);

  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'https://thesimpleai.netlify.app';
    res.redirect(`${frontendUrl}/profile?google_calendar=error`);
  }
});

/**
 * GET /google/status - Check if user has connected Google Calendar
 */
router.get('/google/status', authenticateToken, async (req, res) => {
  try {
    const isConnected = await googleCalendarService.isUserConnected(req.user.id);
    res.json({
      success: true,
      isConnected
    });
  } catch (error) {
    console.error('❌ Google status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check Google Calendar connection status',
      error: error.message
    });
  }
});

/**
 * POST /google/disconnect - Disconnect Google Calendar
 */
router.post('/google/disconnect', authenticateToken, trackActivity('google_calendar_disconnected'), async (req, res) => {
  try {
    await googleCalendarService.disconnectUser(req.user.id);
    res.json({
      success: true,
      message: 'Google Calendar disconnected successfully'
    });
  } catch (error) {
    console.error('❌ Google disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Google Calendar',
      error: error.message
    });
  }
});

module.exports = router;
