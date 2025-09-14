const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');
const { validationResult } = require('express-validator');

// Simple verification system without email
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password, first_name, last_name, department, job_title } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Determine role (first user becomes superadmin)
      let role = 'user';
      const userCount = await database.get('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      
      if (userCount.count === 0) {
        role = 'superadmin';
      }

      // Create user
      const user = await User.create({
        email,
        password,
        first_name,
        last_name,
        role,
        department,
        job_title
      });

      // Generate 6-digit verification code
      const verificationCode = generateVerificationCode();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification code in database
      await database.run(
        'UPDATE users SET verification_token = ?, verification_expiry = ?, email_verified = 0 WHERE id = ?',
        [verificationCode, verificationExpiry.toISOString(), user.id]
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful. Use the verification code to verify your account.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            is_verified: user.is_verified
          },
          verificationCode: verificationCode, // In production, you'd send this via SMS/email service
          requiresVerification: true,
          note: 'In a production environment, this code would be sent via SMS or email service'
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if email is verified
      if (!user.is_verified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email address before logging in',
          requires_verification: true
        });
      }

      // Generate tokens
      const sessionToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
      );

      // Store session in database
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const deviceInfo = req.get('User-Agent') || 'Unknown Device';
      
      await database.run(`
        INSERT INTO user_sessions (user_id, session_token, refresh_token, device_info, ip_address, user_agent, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        user.id,
        sessionToken,
        refreshToken,
        deviceInfo,
        req.ip,
        req.get('User-Agent'),
        expiresAt.toISOString()
      ]);

      // Update last login
      await user.update({ last_login: new Date().toISOString() });

      // Track login activity
      await database.run(`
        INSERT INTO user_analytics (user_id, action, metadata, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
      `, [
        user.id,
        'login',
        JSON.stringify({ device: deviceInfo }),
        req.ip,
        req.get('User-Agent')
      ]);

      // Send login alert email (optional, for security)
      try {
        await emailService.sendLoginAlertEmail(user, {
          loginTime: new Date(),
          device: deviceInfo,
          ipAddress: req.ip
        });
      } catch (emailError) {
        console.error('Error sending login alert:', emailError);
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken: sessionToken,
            refreshToken: refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  // Verify email with code
  static async verifyEmail(req, res) {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: 'Email and verification code are required'
        });
      }
      
      // Find user with verification code
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (user.verification_token !== code) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }
      
      // Check if code is expired
      const now = new Date();
      const expiry = new Date(user.verification_expiry);
      
      if (now > expiry) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired'
        });
      }
      
      // Update user as verified
      await database.run(
        'UPDATE users SET is_verified = 1, verification_token = NULL, verification_expiry = NULL WHERE id = ?',
        [user.id]
      );
      
      res.json({
        success: true,
        message: 'Email verified successfully'
      });
      
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during verification'
      });
    }
  }

  // Resend verification code
  static async resendVerification(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({
          success: true,
          message: 'If an account with this email exists and is not verified, a verification email has been sent.'
        });
      }

      if (user.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'This account is already verified'
        });
      }

      // Generate new verification token if expired
      if (!user.verification_token || new Date(user.verification_expires) <= new Date()) {
        const newToken = uuidv4();
        const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        await database.run(`
          UPDATE users 
          SET verification_token = ?, verification_expires = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [newToken, newExpires.toISOString(), user.id]);
        
        user.verification_token = newToken;
      }

      // Send verification email
      await emailService.sendVerificationEmail(user, user.verification_token);

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Request password reset
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({
          success: true,
          message: 'If an account with this email exists, a password reset email has been sent.'
        });
      }

      // Generate reset token
      const resetToken = await user.setPasswordResetToken();

      // Send password reset email
      await emailService.sendPasswordResetEmail(user, resetToken);

      // Track password reset request
      await database.run(`
        INSERT INTO user_analytics (user_id, action, ip_address, user_agent)
        VALUES (?, ?, ?, ?)
      `, [
        user.id,
        'password_reset_requested',
        req.ip,
        req.get('User-Agent')
      ]);

      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { token, password } = req.body;

      // Find user by reset token
      const user = await User.findByResetToken(token);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update password
      await user.updatePassword(password);

      // Invalidate all sessions for this user (force re-login)
      await database.run('DELETE FROM user_sessions WHERE user_id = ?', [user.id]);

      // Track password reset
      await database.run(`
        INSERT INTO user_analytics (user_id, action, ip_address, user_agent)
        VALUES (?, ?, ?, ?)
      `, [
        user.id,
        'password_reset_completed',
        req.ip,
        req.get('User-Agent')
      ]);

      res.json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during password reset'
      });
    }
  }

  // Refresh access token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      // Check if session exists
      const session = await database.get(
        'SELECT * FROM user_sessions WHERE refresh_token = ? AND expires_at > datetime("now")',
        [refreshToken]
      );

      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Update session with new access token
      await database.run(
        'UPDATE user_sessions SET session_token = ? WHERE id = ?',
        [newAccessToken, session.id]
      );

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn: process.env.JWT_EXPIRES_IN
        }
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error during token refresh'
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        // Remove session from database
        await database.run('DELETE FROM user_sessions WHERE session_token = ?', [token]);
        
        // Track logout activity
        if (req.user) {
          await database.run(`
            INSERT INTO user_analytics (user_id, action, ip_address, user_agent)
            VALUES (?, ?, ?, ?)
          `, [
            req.user.id,
            'logout',
            req.ip,
            req.get('User-Agent')
          ]);
        }
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  }

  // Logout from all devices
  static async logoutAll(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Remove all sessions for this user
      await database.run('DELETE FROM user_sessions WHERE user_id = ?', [req.user.id]);

      // Track logout all activity
      await database.run(`
        INSERT INTO user_analytics (user_id, action, ip_address, user_agent)
        VALUES (?, ?, ?, ?)
      `, [
        req.user.id,
        'logout_all_devices',
        req.ip,
        req.get('User-Agent')
      ]);

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });

    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user preferences
      const preferences = await database.get(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [req.user.id]
      );

      res.json({
        success: true,
        data: {
          user: req.user.toJSON(),
          preferences: preferences || {
            theme: 'light',
            notifications_email: true,
            notifications_browser: true,
            language: 'en',
            timezone: 'UTC'
          }
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { first_name, last_name, department, job_title } = req.body;

      // Update user
      await req.user.update({
        first_name,
        last_name,
        department,
        job_title
      });

      // Track profile update
      await database.run(`
        INSERT INTO user_analytics (user_id, action, ip_address, user_agent)
        VALUES (?, ?, ?, ?)
      `, [
        req.user.id,
        'profile_updated',
        req.ip,
        req.get('User-Agent')
      ]);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: req.user.toJSON()
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Check authentication status
  static async checkAuth(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      res.json({
        success: true,
        data: {
          user: req.user.toJSON(),
          authenticated: true
        }
      });

    } catch (error) {
      console.error('Check auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AuthController;