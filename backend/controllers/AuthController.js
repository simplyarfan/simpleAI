const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const database = require('../models/database');
const { validationResult } = require('express-validator');

// Helper function to generate secure JWT tokens
const generateTokens = (userId, email, role) => {
  const accessToken = jwt.sign(
    { userId, email, role, type: 'access' },
    process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Register new user - Enterprise Grade
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, department, jobTitle } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }

    // Ensure database connection
    await database.connect();

    // Check if user already exists
    const existingUser = await database.get(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Hash password with enterprise-grade security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with proper transaction handling
    const result = await database.run(`
      INSERT INTO users (
        email, password_hash, first_name, last_name, 
        department, job_title, role, is_active, is_verified,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, email, first_name, last_name, role, is_active
    `, [
      email.toLowerCase(),
      hashedPassword,
      firstName,
      lastName,
      department || null,
      jobTitle || null,
      'user', // Default role
      true,   // Active by default
      true    // Verified by default for company domain
    ]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to create user account');
    }

    const newUser = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      newUser.id,
      newUser.email,
      newUser.role
    );

    // Create session record
    await database.run(`
      INSERT INTO user_sessions (user_id, session_token, refresh_token, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      newUser.id,
      accessToken,
      refreshToken,
      req.ip,
      req.get('User-Agent') || 'Unknown',
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    ]);

    // Log successful registration
    await database.run(`
      INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      newUser.id,
      'user_registered',
      'user',
      req.ip,
      req.get('User-Agent') || 'Unknown'
    ]);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role,
          isActive: newUser.is_active
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Login user - Enterprise Grade
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    await database.connect();

    // Get user with security checks
    const user = await database.get(`
      SELECT id, email, password_hash, first_name, last_name, role, 
             department, job_title, is_active, failed_login_attempts, account_locked_until
      FROM users WHERE email = $1
    `, [email.toLowerCase()]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.account_locked_until && new Date() < new Date(user.account_locked_until)) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to failed login attempts'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
      let lockUntil = null;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (newFailedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      
      await database.run(`
        UPDATE users SET 
          failed_login_attempts = $1,
          account_locked_until = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [newFailedAttempts, lockUntil, user.id]);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset failed login attempts on successful login
    await database.run(`
      UPDATE users SET 
        failed_login_attempts = 0,
        account_locked_until = NULL,
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [user.id]);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    // Create session record
    await database.run(`
      INSERT INTO user_sessions (user_id, session_token, refresh_token, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      user.id,
      accessToken,
      refreshToken,
      req.ip,
      req.get('User-Agent') || 'Unknown',
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ]);

    // Log successful login
    await database.run(`
      INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      user.id,
      'user_login',
      'user',
      req.ip,
      req.get('User-Agent') || 'Unknown'
    ]);

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        department: user.department,
        job_title: user.job_title
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await database.connect();
      
      // Deactivate session
      await database.run(`
        UPDATE user_sessions SET is_active = false WHERE session_token = $1
      `, [token]);
      
      // Log logout
      if (req.user) {
        await database.run(`
          INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          req.user.id,
          'user_logout',
          'user',
          req.ip,
          req.get('User-Agent') || 'Unknown'
        ]);
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
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
          email: req.user.email,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          role: req.user.role,
          department: req.user.department,
          job_title: req.user.job_title,
          is_active: req.user.is_active
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
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
          email: req.user.email,
          firstName: req.user.first_name,
          lastName: req.user.last_name,
          role: req.user.role,
          department: req.user.department,
          jobTitle: req.user.job_title,
          isActive: req.user.is_active
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, department, jobTitle } = req.body;
    const userId = req.user.id;

    await database.connect();
    
    await database.run(`
      UPDATE users SET 
        first_name = $1,
        last_name = $2,
        department = $3,
        job_title = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [firstName, lastName, department, jobTitle, userId]);

    const updatedUser = await database.get(
      'SELECT id, email, first_name, last_name, role, department, job_title, is_active FROM users WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Check authentication status
const checkAuth = async (req, res) => {
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
          email: req.user.email,
          firstName: req.user.first_name,
          lastName: req.user.last_name,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication check failed'
    });
  }
};

// Get all users (superadmin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    await database.connect();

    let query = `
      SELECT id, email, first_name, last_name, role, department, job_title, 
             is_active, created_at, last_login
      FROM users 
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND role = $${paramIndex}`;
      countQuery += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (search) {
      query += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      countQuery += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [users, totalResult] = await Promise.all([
      database.all(query, params),
      database.get(countQuery, params.slice(0, -2))
    ]);

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    await database.connect();

    const stats = await database.all(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'superadmin' THEN 1 END) as superadmin_count,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d
      FROM users
    `);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
};

// Get specific user
const getUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    await database.connect();
    const user = await database.get(
      'SELECT id, email, first_name, last_name, role, department, job_title, is_active, created_at, last_login FROM users WHERE id = $1',
      [user_id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { email, firstName, lastName, role = 'user', department, jobTitle } = req.body;

    await database.connect();

    // Check if user exists
    const existingUser = await database.get('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(12).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const result = await database.run(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, department, job_title, is_active, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [email.toLowerCase(), hashedPassword, firstName, lastName, role, department, jobTitle, true, true]);

    const newUser = await database.get(
      'SELECT id, email, first_name, last_name, role, department, job_title, is_active FROM users WHERE id = $1',
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser,
        temporaryPassword: tempPassword
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { firstName, lastName, email, role, department, jobTitle, isActive } = req.body;

    await database.connect();

    const user = await database.get('SELECT * FROM users WHERE id = $1', [user_id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await database.run(`
      UPDATE users SET 
        first_name = $1,
        last_name = $2,
        email = $3,
        role = $4,
        department = $5,
        job_title = $6,
        is_active = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `, [firstName, lastName, email, role, department, jobTitle, isActive, user_id]);

    const updatedUser = await database.get(
      'SELECT id, email, first_name, last_name, role, department, job_title, is_active FROM users WHERE id = $1',
      [user_id]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (parseInt(user_id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await database.connect();

    const user = await database.get('SELECT * FROM users WHERE id = $1', [user_id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await database.run('DELETE FROM users WHERE id = $1', [user_id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    await database.connect();

    const user = await database.get('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await database.run('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedNewPassword, userId]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Logout all sessions
const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;

    await database.connect();
    await database.run('DELETE FROM user_sessions WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout from all devices'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production');
    
    await database.connect();
    const user = await database.get(
      'SELECT id, email, role FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.email, user.role);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Request password reset (placeholder)
const requestPasswordReset = async (req, res) => {
  res.json({
    success: true,
    message: 'Password reset functionality not implemented yet'
  });
};

// Reset password (placeholder)
const resetPassword = async (req, res) => {
  res.json({
    success: true,
    message: 'Password reset functionality not implemented yet'
  });
};

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  getCurrentUser,
  getProfile,
  updateProfile,
  checkAuth,
  getAllUsers,
  getUserStats,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  refreshToken,
  requestPasswordReset,
  resetPassword
};
