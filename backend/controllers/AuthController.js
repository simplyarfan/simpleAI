const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const database = require('../models/database');
const { validationResult } = require('express-validator');


class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      console.log('🔐 [AUTH] Registration attempt started:', req.body.email);
      
      // Ensure database is connected and tables are initialized
      console.log('🔗 [AUTH] Ensuring database connection...');
      await database.connect();
      console.log('✅ [AUTH] Database connection confirmed');
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password, first_name, last_name, department, job_title } = req.body;
      console.log('🔐 [AUTH] Registration data validated for:', email);

      // Check if user already exists
      console.log('🔍 [AUTH] Checking if user exists...');
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        console.log('⚠️ [AUTH] User already exists:', email);
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please try logging in instead.'
        });
      }
      console.log('✅ [AUTH] User does not exist, proceeding with creation');

      // Hash password
      console.log('🔒 [AUTH] Hashing password...');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log('✅ [AUTH] Password hashed successfully');

      console.log('👤 [AUTH] Creating new user account...');

      // Create user (verified by default since no email verification needed)
      const userId = await User.create({
        first_name,
        last_name,
        email,
        password_hash: hashedPassword, // Changed from password to password_hash to match the schema
        department: department || null,
        job_title: job_title || null,
        is_verified: true // Auto-verify since no email verification
      });

      console.log('✅ [AUTH] User created with ID:', userId);

      // Get the created user
      console.log('🔍 [AUTH] Fetching created user...');
      const user = await User.findById(userId);
      
      if (!user) {
        console.error('❌ [AUTH] User not found after creation with ID:', userId);
        throw new Error(`User not found after creation with ID: ${userId}`);
      }
      console.log('✅ [AUTH] User fetched successfully:', user.email);

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Create session
      const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await database.run(`
        INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [
        user.id,
        accessToken,
        refreshToken,
        sessionExpiry.toISOString(),
        req.ip,
        req.get('User-Agent')
      ]);

      console.log('Session created for user:', userId);

      // Return success with tokens (auto-login after registration)
      res.status(201).json({
        success: true,
        message: 'Registration successful! You are now logged in.',
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          department: user.department,
          job_title: user.job_title,
          role: user.role
        },
        accessToken,
        refreshToken
      });

    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        errno: error.errno
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
        error: error.message,
        details: error.code || error.errno
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      console.log('=== LOGIN ATTEMPT START ===');
      console.log('Request body:', req.body);
      
      // Ensure database is connected
      await database.connect();
      console.log('Database connected successfully');
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      console.log('Login attempt for email:', email);

      // Find user with enhanced error handling
      console.log('Looking up user by email...');
      let user;
      try {
        user = await User.findByEmail(email);
        console.log('User lookup result:', user ? 'User found' : 'User not found');
      } catch (dbError) {
        console.error('Database error during user lookup:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error during login'
        });
      }
      
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Enhanced password verification with detailed debugging
      console.log('Verifying password...');
      console.log('User password_hash length:', user.password_hash ? user.password_hash.length : 'none');
      console.log('Password hash starts with $2b$:', user.password_hash ? user.password_hash.startsWith('$2b$') : false);
      console.log('Input password:', password);
      console.log('Input password length:', password ? password.length : 'none');
      
      let isPasswordValid = false;
      try {
        if (user.password_hash) {
          // Direct bcrypt comparison for debugging
          const bcrypt = require('bcryptjs');
          isPasswordValid = await bcrypt.compare(password, user.password_hash);
          console.log('Direct bcrypt.compare result:', isPasswordValid);
          
          // Also try the user method
          const userMethodResult = await user.verifyPassword(password);
          console.log('User.verifyPassword result:', userMethodResult);
          
          // Use the direct result
          isPasswordValid = isPasswordValid || userMethodResult;
        } else {
          console.log('No password hash found for user');
        }
      } catch (passwordError) {
        console.error('Password verification error:', passwordError);
        return res.status(500).json({
          success: false,
          message: 'Authentication error'
        });
      }
      
      if (!isPasswordValid) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Skip email verification check for now
      console.log('Password verified successfully');

      // Generate tokens with error handling
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
      const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret-change-in-production';

      let sessionToken, refreshToken;
      try {
        sessionToken = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          jwtSecret,
          { expiresIn: jwtExpiresIn }
        );

        refreshToken = jwt.sign(
          { userId: user.id, type: 'refresh' },
          refreshSecret,
          { expiresIn: '30d' }
        );
        console.log('Tokens generated successfully');
      } catch (tokenError) {
        console.error('Token generation error:', tokenError);
        return res.status(500).json({
          success: false,
          message: 'Token generation failed'
        });
      }

      // Prepare user data for response
      const userResponse = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || 'user',
        department: user.department || null,
        job_title: user.job_title || null,
        is_verified: true,
        created_at: user.created_at || new Date().toISOString()
      };

      console.log('=== LOGIN SUCCESS ===');
      console.log('Sending response for user:', user.email);

      // Return success with tokens and user data
      res.status(200).json({
        success: true,
        message: 'Login successful',
        accessToken: sessionToken,
        refreshToken: refreshToken,
        user: userResponse
      });

    } catch (error) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
        error: error.message
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

      // Generate reset token (simplified - no email sending)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      await database.run(`
        UPDATE users 
        SET reset_token = $1, reset_token_expiry = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [resetToken, resetExpiry.toISOString(), user.id]);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Admin reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { firstName, lastName, email, currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, and email are required'
        });
      }

      // Get current user data
      const currentUser = await database.get(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to change password'
          });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password_hash);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update with new password
        await database.run(
          'UPDATE users SET first_name = $1, last_name = $2, email = $3, password_hash = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
          [firstName, lastName, email, hashedNewPassword, userId]
        );
      } else {
        // Update without password change
        await database.run(
          'UPDATE users SET first_name = $1, last_name = $2, email = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
          [firstName, lastName, email, userId]
        );
      }

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Update profile error:', error);
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
      const user = await database.get(
        'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [token]
      );
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Update password and clear reset token
      await database.run(`
        UPDATE users 
        SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [hashedPassword, user.id]);

      // Invalidate all sessions for this user (force re-login)
      await database.run('DELETE FROM user_sessions WHERE user_id = $1', [user.id]);

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
        'SELECT * FROM user_sessions WHERE refresh_token = $1 AND expires_at > NOW()',
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
        'UPDATE user_sessions SET session_token = $1 WHERE id = $2',
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
        await database.run('DELETE FROM user_sessions WHERE session_token = $1', [token]);
        
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
      await database.run('DELETE FROM user_sessions WHERE user_id = $1', [req.user.id]);

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

      res.json({
        success: true,
        data: {
          user: {
            id: req.user.id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            department: req.user.department,
            job_title: req.user.job_title,
            role: req.user.role
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
      await database.run(`
        UPDATE users 
        SET first_name = $1, last_name = $2, department = $3, job_title = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `, [first_name, last_name, department, job_title, req.user.id]);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: req.user.id,
            first_name,
            last_name,
            email: req.user.email,
            department,
            job_title,
            role: req.user.role
          }
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
          user: {
            id: req.user.id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            department: req.user.department,
            job_title: req.user.job_title,
            role: req.user.role
          },
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

  // Admin method to reset user password (for debugging)
  static async adminResetUserPassword(req, res) {
    try {
      const { email, newPassword } = req.body;
      
      if (!email || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email and new password are required'
        });
      }

      // Check if user exists
      const user = await database.get(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update the password
      await database.run(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, email]
      );

      res.json({
        success: true,
        message: 'Password updated successfully',
        data: {
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Admin reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AuthController;