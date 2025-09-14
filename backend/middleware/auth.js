const jwt = require('jsonwebtoken');
const User = require('../models/User');
const database = require('../models/database');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is valid
    const session = await database.get(
      'SELECT * FROM user_sessions WHERE session_token = ? AND expires_at > datetime("now")',
      [token]
    );

    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }

    // Get user details
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.is_verified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please verify your email address' 
      });
    }

    // Add user to request object
    req.user = user;
    req.session = session;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Role-based authorization middleware
const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Superadmin only middleware
const requireSuperAdmin = requireRole(['superadmin']);

// Admin or Superadmin middleware
const requireAdmin = requireRole(['admin', 'superadmin']);

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (user && user.is_verified) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

// Company domain validation middleware
const validateCompanyDomain = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const emailDomain = email.split('@')[1];
  const allowedDomain = process.env.COMPANY_DOMAIN;

  if (emailDomain !== allowedDomain) {
    return res.status(403).json({
      success: false,
      message: `Only ${allowedDomain} email addresses are allowed`
    });
  }

  next();
};

// Track user activity middleware
const trackActivity = (action, agent_id = null) => {
  return async (req, res, next) => {
    if (req.user) {
      try {
        const metadata = {
          path: req.path,
          method: req.method,
          query: req.query,
          body: req.body?.password ? { ...req.body, password: '[HIDDEN]' } : req.body
        };

        await database.run(`
          INSERT INTO user_analytics (user_id, action, agent_id, metadata, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          req.user.id,
          action,
          agent_id,
          JSON.stringify(metadata),
          req.ip,
          req.get('User-Agent')
        ]);
      } catch (error) {
        console.error('Error tracking activity:', error);
        // Don't fail the request if analytics fails
      }
    }
    next();
  };
};

// Session cleanup middleware (removes expired sessions)
const cleanupExpiredSessions = async (req, res, next) => {
  try {
    await database.run('DELETE FROM user_sessions WHERE expires_at <= datetime("now")');
    next();
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    next(); // Continue even if cleanup fails
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSuperAdmin,
  requireAdmin,
  optionalAuth,
  validateCompanyDomain,
  trackActivity,
  cleanupExpiredSessions
};