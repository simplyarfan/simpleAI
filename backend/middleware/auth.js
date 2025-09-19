const jwt = require('jsonwebtoken');
const database = require('../models/database');

// JWT Authentication Middleware - Enterprise Grade
const authenticateToken = async (req, res, next) => {
  try {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Debug logging
    console.log('🔍 [AUTH DEBUG] Headers:', req.headers);
    console.log('🔍 [AUTH DEBUG] Auth header:', authHeader);
    console.log('🔍 [AUTH DEBUG] Extracted token:', token ? token.substring(0, 20) + '...' : 'null');

    if (!token) {
  return res.status(401).json({ 
  success: false, 
message: 'Access token required',
debug: {
  authHeader: authHeader ? 'present' : 'missing',
  headers: Object.keys(req.headers)
}
});
}

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-change-in-production');
      console.log('🔍 [AUTH DEBUG] JWT decoded successfully:', { userId: decoded.userId, email: decoded.email });
    } catch (jwtError) {
      console.error('🔍 [AUTH DEBUG] JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token',
        debug: { jwtError: jwtError.message }
      });
    }

// Ensure database connection
await database.connect();

// Get user details directly from database
const user = await database.get(
  'SELECT id, email, first_name, last_name, role, is_active, department, job_title FROM users WHERE id = $1',
      [decoded.userId]
);

console.log('🔍 [AUTH DEBUG] User lookup result:', user ? { id: user.id, email: user.email } : 'null');

if (!user) {
return res.status(401).json({ 
  success: false, 
    message: 'User not found' 
      });
}

if (!user.is_active) {
  return res.status(401).json({ 
  success: false, 
message: 'Account is deactivated' 
});
}

    // Add user to request object
req.user = user;

next();
} catch (error) {
console.error('Auth middleware error:', error);

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
const allowedDomain = process.env.COMPANY_DOMAIN || 'securemaxtech.com';

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
      await database.connect();
        
        const metadata = {
          path: req.path,
          method: req.method,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      };

  await database.run(`
    INSERT INTO user_analytics (user_id, action, agent_id, metadata, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      `, [
          req.user.id,
        action,
        agent_id,
          JSON.stringify(metadata)
      ]);
  } catch (error) {
  console.error('Error tracking activity:', error);
  // Don't fail the request if analytics fails
  }
  }
    next();
};
};

// Session cleanup middleware
const cleanupExpiredSessions = async (req, res, next) => {
next(); // Skip session cleanup for now - will implement proper session management later
};

module.exports = {
authenticateToken,
requireRole,
requireSuperAdmin,
requireAdmin,
validateCompanyDomain,
  trackActivity,
cleanupExpiredSessions
};
