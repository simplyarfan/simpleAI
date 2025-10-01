const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
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
  validateRegistration,
  AuthController.register
);

// User login
router.post('/login', 
  validateLogin,
  AuthController.login
);

// Email verification routes removed - no longer needed

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
 * POST /auth/outlook/connect - Save Outlook tokens
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

module.exports = router;
