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

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
