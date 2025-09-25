const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const database = require('../models/database');
const { validationResult } = require('express-validator');

// Helper function to generate secure JWT tokens
const generateTokens = (userId, email, role) => {
  // Ensure JWT secrets are configured
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  // Use JWT_SECRET as fallback for refresh token if not set
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

  const accessToken = jwt.sign(
    { userId, email, role, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    refreshSecret,
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

    // Log successful registration (simplified)
    console.log(`✅ User registered: ${newUser.email}`);

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
    console.log('🔐 Login attempt received:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    console.log('🔗 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected');

    // Get user with security checks
    console.log('🔍 Looking for user:', email.toLowerCase());
    const user = await database.get(`
      SELECT id, email, password_hash, first_name, last_name, role, 
             department, job_title, is_active, failed_login_attempts, account_locked_until
      FROM users WHERE email = $1
    `, [email.toLowerCase()]);

    console.log('👤 User found:', user ? 'YES' : 'NO');
    if (!user) {
      console.log('❌ User not found in database');
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
    console.log('🔐 Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('🔐 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
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

    // Log successful login (simplified)
    console.log(`✅ User login: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        department: user.department,
        job_title: user.job_title
      }
    });

  } catch (error) {
    console.error('❌ Login error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
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
      
      // Log logout (simplified)
      if (req.user) {
        console.log(`✅ User logout: ${req.user.email}`);
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
      user: {
        id: req.user.id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        name: `${req.user.first_name} ${req.user.last_name}`,
        role: req.user.role,
        department: req.user.department,
        job_title: req.user.job_title,
        is_active: req.user.is_active
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
    console.log('🔧 Create user request body:', req.body);
    
    // Handle both frontend field name variations
    const { 
      email, 
      password,
      firstName, 
      lastName, 
      first_name, 
      last_name,
      role = 'user', 
      department, 
      jobTitle,
      job_title 
    } = req.body;

    const finalFirstName = firstName || first_name;
    const finalLastName = lastName || last_name;
    const finalJobTitle = jobTitle || job_title;
    const finalPassword = password || crypto.randomBytes(12).toString('hex');

    if (!email || !finalFirstName || !finalLastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, first name, and last name are required'
      });
    }

    await database.connect();

    // Check if user exists
    const existingUser = await database.get('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(finalPassword, 12);

    const result = await database.run(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, department, job_title, is_active, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [email.toLowerCase(), hashedPassword, finalFirstName, finalLastName, role, department, finalJobTitle, true, true]);

    console.log('🔧 Database insert result:', result);

    const userId = result.rows[0]?.id || result.id;
    console.log('🔧 Extracted user ID:', userId);

    const newUser = await database.get(
      'SELECT id, email, first_name, last_name, role, department, job_title, is_active FROM users WHERE id = $1',
      [userId]
    );

    console.log('🔧 Created user:', newUser);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser,
        temporaryPassword: password ? undefined : finalPassword // Only return temp password if we generated it
      }
    });
  } catch (error) {
    console.error('❌ Create user error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    console.log('🔧 [UPDATE USER] Request params:', req.params);
    console.log('🔧 [UPDATE USER] Request body:', req.body);
    console.log('🔧 [UPDATE USER] Request user:', req.user);
    
    const { user_id } = req.params;
    const { 
      first_name, 
      last_name, 
      firstName,
      lastName,
      email, 
      role, 
      department, 
      job_title,
      jobTitle,
      is_active 
    } = req.body;

    // Handle field name variations
    const finalFirstName = firstName || first_name;
    const finalLastName = lastName || last_name;
    const finalJobTitle = jobTitle || job_title;

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
        is_active = COALESCE($7, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `, [finalFirstName, finalLastName, email, role, department, finalJobTitle, is_active, user_id]);

    const updatedUser = await database.get(
      'SELECT id, email, first_name, last_name, role, department, job_title, is_active FROM users WHERE id = $1',
      [user_id]
    );

    console.log('🔧 Updated user:', updatedUser);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('❌ Update user error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    console.log('🗑️ [DELETE USER] Request params:', req.params);
    console.log('🗑️ [DELETE USER] Request user:', req.user);
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

    // Get counts of related data before deletion for audit logging
    const relatedDataCounts = {};
    
    try {
      // Count CV batches
      const batchCount = await database.get('SELECT COUNT(*) as count FROM cv_batches WHERE user_id = $1', [user_id]);
      relatedDataCounts.cvBatches = parseInt(batchCount.count);

      // Count CV candidates (through batches)
      const candidateCount = await database.get(`
        SELECT COUNT(*) as count FROM cv_candidates 
        WHERE batch_id IN (SELECT id FROM cv_batches WHERE user_id = $1)
      `, [user_id]);
      relatedDataCounts.cvCandidates = parseInt(candidateCount.count);

      // Count support tickets
      const ticketCount = await database.get('SELECT COUNT(*) as count FROM support_tickets WHERE user_id = $1', [user_id]);
      relatedDataCounts.supportTickets = parseInt(ticketCount.count);

      // Count ticket comments
      const commentCount = await database.get('SELECT COUNT(*) as count FROM ticket_comments WHERE user_id = $1', [user_id]);
      relatedDataCounts.ticketComments = parseInt(commentCount.count);

      // Count notifications
      const notificationCount = await database.get('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1', [user_id]);
      relatedDataCounts.notifications = parseInt(notificationCount.count);

      // Count user sessions
      const sessionCount = await database.get('SELECT COUNT(*) as count FROM user_sessions WHERE user_id = $1', [user_id]);
      relatedDataCounts.userSessions = parseInt(sessionCount.count);

    } catch (countError) {
      console.warn('Warning: Could not count related data:', countError.message);
    }

    // Log the deletion for audit purposes
    console.log(`🗑️ [USER DELETION] Superadmin ${req.user.email} is deleting user:`, {
      deletedUser: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        created_at: user.created_at
      },
      relatedDataToDelete: relatedDataCounts,
      deletedBy: {
        id: req.user.id,
        email: req.user.email
      },
      timestamp: new Date().toISOString()
    });

    // Delete the user (cascade deletion will handle related data)
    await database.run('DELETE FROM users WHERE id = $1', [user_id]);

    // Calculate total items deleted
    const totalItemsDeleted = 1 + Object.values(relatedDataCounts).reduce((sum, count) => sum + count, 0);

    console.log(`✅ [USER DELETION] Successfully deleted user ${user.email} and ${totalItemsDeleted - 1} related items`);

    res.json({
      success: true,
      message: `User ${user.first_name} ${user.last_name} deleted successfully`,
      deletedData: {
        user: `${user.first_name} ${user.last_name} (${user.email})`,
        relatedItemsDeleted: relatedDataCounts,
        totalItemsDeleted: totalItemsDeleted
      }
    });
  } catch (error) {
    console.error('❌ [USER DELETION] Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
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

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(refreshToken, refreshSecret);
    
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
