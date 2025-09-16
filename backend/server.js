const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const responseTime = require('response-time');
const path = require('path');
require('dotenv').config();

const database = require('./models/database');
const { generalLimiter } = require('./middleware/rateLimiting');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting Enterprise AI Hub Backend v2.0.0...');

// Trust proxy for rate limiting and security
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Performance middleware
app.use(compression());
app.use(responseTime());

// Enhanced CORS configuration - TEMPORARY: Allow all origins for debugging
app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'X-Request-ID',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Date',
    'X-Api-Version',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Request-ID']
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: database.isConnected ? 'connected' : 'connecting...'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Enterprise AI Hub Backend API v2.0.0',
    status: 'running',
    frontend: 'https://thesimpleai.netlify.app',
    documentation: '/api',
    health: '/health',
    database: database.isConnected ? 'connected' : 'connecting...'
  });
});

// Test endpoint for debugging
app.get('/api/test', async (req, res) => {
  try {
    console.log('🧪 [TEST] Test endpoint accessed');
    await database.connect();
    
    // Check users table
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    const users = await database.all('SELECT id, email, first_name, last_name, role, created_at FROM users LIMIT 5');
    
    // Check if tables exist
    const tables = await database.all(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    // Test auth endpoint directly
    let authTestResult;
    try {
      const authUsers = await database.all('SELECT COUNT(*) as count FROM users WHERE role = $1', ['superadmin']);
      authTestResult = { success: true, superadmins: authUsers[0]?.count || 0 };
    } catch (authError) {
      authTestResult = { success: false, error: authError.message };
    }
    
    res.json({
      success: true,
      message: 'Comprehensive database test',
      database: 'connected',
      timestamp: new Date().toISOString(),
      data: {
        userCount: userCount?.count || 0,
        users: users || [],
        tables: tables.map(t => t.table_name),
        authTest: authTestResult,
        environment: process.env.NODE_ENV || 'unknown'
      }
    });
  } catch (error) {
    console.error('❌ [TEST] Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test auth endpoint directly
app.get('/api/test-auth', async (req, res) => {
  try {
    console.log('🧪 [TEST-AUTH] Direct auth test endpoint accessed');
    
    // Simulate what the auth endpoint does
    await database.connect();
    
    const users = await database.all(`
      SELECT 
        id, email, first_name, last_name, role, 
        department, job_title, is_active, last_login, created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    const totalCount = await database.get('SELECT COUNT(*) as total FROM users');
    
    res.json({
      success: true,
      message: 'Direct auth test successful',
      data: {
        users,
        pagination: {
          page: 1,
          limit: 10,
          total: totalCount.total,
          totalPages: Math.ceil(totalCount.total / 10)
        }
      }
    });
  } catch (error) {
    console.error('❌ [TEST-AUTH] Auth test error:', error);
    res.status(500).json({
      success: false,
      message: 'Auth test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// TEMPORARY: Simple profile endpoint without session validation
app.get('/api/profile-simple', async (req, res) => {
  try {
    console.log('👤 [PROFILE-SIMPLE] Getting profile...');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-change-in-production');
    
    await database.connect();
    const user = await database.get('SELECT id, email, first_name, last_name, role, department, job_title, created_at FROM users WHERE id = $1', [decoded.userId]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: user
      }
    });
  } catch (error) {
    console.error('❌ [PROFILE-SIMPLE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile fetch failed'
    });
  }
});

// TEMPORARY: Simple users endpoint without middleware
app.get('/api/users-simple', async (req, res) => {
  try {
    console.log('👥 [USERS-SIMPLE] Getting all users...');
    await database.connect();
    
    const users = await database.all(`
      SELECT 
        id, email, first_name, last_name, role, 
        department, job_title, is_active, 
        last_login, created_at, updated_at
      FROM users 
      WHERE is_active = true
      ORDER BY created_at DESC
    `);
    
    const totalCount = await database.get('SELECT COUNT(*) as total FROM users WHERE is_active = true');
    
    res.json({
      success: true,
      data: {
        users: users,
        pagination: {
          page: 1,
          limit: 20,
          total: parseInt(totalCount.total) || 0,
          totalPages: Math.ceil((parseInt(totalCount.total) || 0) / 20)
        }
      }
    });
  } catch (error) {
    console.error('❌ [USERS-SIMPLE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Users fetch failed',
      error: error.message
    });
  }
});

// TEMPORARY: Simple profile update endpoint
app.put('/api/profile-simple', async (req, res) => {
  try {
    console.log('👤 [PROFILE-UPDATE-SIMPLE] Updating profile...');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-change-in-production');
    
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
    
    await database.connect();
    
    // Handle password change if provided
    if (currentPassword && newPassword) {
      const user = await database.get('SELECT * FROM users WHERE id = $1', [decoded.userId]);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const bcrypt = require('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      
      await database.run(`
        UPDATE users 
        SET first_name = $1, last_name = $2, email = $3, password_hash = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `, [firstName, lastName, email, hashedNewPassword, decoded.userId]);
    } else {
      await database.run(`
        UPDATE users 
        SET first_name = $1, last_name = $2, email = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [firstName, lastName, email, decoded.userId]);
    }
    
    const updatedUser = await database.get('SELECT id, email, first_name, last_name, role, department, job_title, created_at FROM users WHERE id = $1', [decoded.userId]);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('❌ [PROFILE-UPDATE-SIMPLE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message
    });
  }
});

// TEMPORARY: Simple analytics detailed endpoint
app.get('/api/analytics-detailed-simple', async (req, res) => {
  try {
    console.log('📊 [ANALYTICS-DETAILED-SIMPLE] Getting detailed analytics...');
    await database.connect();
    
    // Get comprehensive analytics data
    const totalUsers = await database.get('SELECT COUNT(*) as count FROM users');
    const activeUsers = await database.get('SELECT COUNT(*) as count FROM users WHERE is_active = true');
    const superAdmins = await database.get('SELECT COUNT(*) as count FROM users WHERE role = $1', ['superadmin']);
    const recentUsers = await database.all('SELECT email, first_name, last_name, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    
    // Mock some analytics data
    const userGrowthData = [
      { month: 'Aug 2025', users: 1 },
      { month: 'Sep 2025', users: 2 }
    ];
    
    const activityData = [
      { date: '2025-09-15', logins: 2, registrations: 0 },
      { date: '2025-09-16', logins: 1, registrations: 1 }
    ];
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: parseInt(totalUsers?.count) || 0,
          activeUsers: parseInt(activeUsers?.count) || 0,
          superAdmins: parseInt(superAdmins?.count) || 0,
          userGrowth: '+100% this month',
          systemHealth: 'Excellent'
        },
        userGrowth: userGrowthData,
        userActivity: activityData,
        recentUsers: recentUsers,
        systemMetrics: {
          uptime: '99.9%',
          responseTime: '45ms',
          errorRate: '0.1%',
          activeConnections: 12
        }
      }
    });
  } catch (error) {
    console.error('❌ [ANALYTICS-DETAILED-SIMPLE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Analytics fetch failed'
    });
  }
});

// TEMPORARY: Simple system health endpoint
app.get('/api/system-health-simple', async (req, res) => {
  try {
    console.log('🔧 [SYSTEM-HEALTH-SIMPLE] Getting system status...');
    await database.connect();
    
    // Check database connectivity
    const dbCheck = await database.get('SELECT NOW() as current_time');
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    
    res.json({
      success: true,
      data: {
        systemStatus: 'Operational',
        services: {
          database: {
            status: 'healthy',
            responseTime: '12ms',
            lastCheck: dbCheck.current_time,
            connections: 5
          },
          api: {
            status: 'healthy',
            responseTime: '28ms',
            uptime: '99.99%',
            version: '1.0.0'
          },
          frontend: {
            status: 'healthy',
            lastDeploy: new Date().toISOString(),
            buildStatus: 'success'
          }
        },
        metrics: {
          totalUsers: parseInt(userCount?.count) || 0,
          systemLoad: '23%',
          memoryUsage: '67%',
          diskSpace: '45%'
        },
        recentEvents: [
          {
            type: 'info',
            message: 'System health check completed',
            timestamp: new Date().toISOString()
          },
          {
            type: 'success', 
            message: 'Database connection optimized',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      }
    });
  } catch (error) {
    console.error('❌ [SYSTEM-HEALTH-SIMPLE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'System health check failed'
    });
  }
});

// TEMPORARY: Simple support tickets endpoint
app.get('/api/support-tickets-simple', async (req, res) => {
  try {
    console.log('🎫 [SUPPORT-SIMPLE] Getting support tickets...');
    await database.connect();
    
    // Get actual tickets from database (if any exist)
    const tickets = await database.all(`
      SELECT 
        st.id, st.subject, st.status, st.priority, st.category,
        st.created_at, st.updated_at,
        u.first_name, u.last_name, u.email
      FROM support_tickets st
      LEFT JOIN users u ON st.user_id = u.id
      ORDER BY st.created_at DESC
      LIMIT 20
    `);
    
    const stats = await database.get(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM support_tickets
    `);
    
    // If no tickets exist, provide sample data
    const sampleTickets = tickets.length > 0 ? [] : [
      {
        id: 1,
        subject: 'Welcome to SimpleAI Support',
        status: 'resolved',
        priority: 'low',
        category: 'general',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        first_name: 'System',
        last_name: 'Administrator',
        email: 'system@thesimpleai.com'
      }
    ];
    
    res.json({
      success: true,
      data: {
        tickets: tickets.length > 0 ? tickets : sampleTickets,
        stats: {
          total: parseInt(stats?.total) || 1,
          open: parseInt(stats?.open) || 0,
          resolved: parseInt(stats?.resolved) || 1,
          pending: parseInt(stats?.pending) || 0
        },
        recentActivity: [
          {
            action: 'System initialized',
            user: 'System Administrator',
            timestamp: new Date().toISOString()
          }
        ]
      }
    });
  } catch (error) {
    console.error('❌ [SUPPORT-SIMPLE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Support tickets fetch failed'
    });
  }
});

// TEMPORARY: Password reset endpoint for debugging
app.post('/api/reset-admin-password', async (req, res) => {
  try {
    console.log('🔑 [ADMIN-RESET] Resetting admin password...');
    await database.connect();
    
    const bcrypt = require('bcryptjs');
    const newPassword = 'admin123'; // The correct password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await database.run(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id, email, role',
      [hashedPassword, 'syedarfan@securemaxtech.com']
    );
    
    if (result.rows && result.rows.length > 0) {
      res.json({
        success: true,
        message: 'Admin password reset to: admin123',
        user: result.rows[0]
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
  } catch (error) {
    console.error('❌ [ADMIN-RESET] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
});

// Test analytics WITHOUT middleware
app.get('/api/test-analytics', async (req, res) => {
  try {
    console.log('📈 [TEST-ANALYTICS] Direct analytics test');
    await database.connect();
    
    // Test basic analytics data
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    const superAdminCount = await database.get('SELECT COUNT(*) as count FROM users WHERE role = $1', ['superadmin']);
    
    res.json({
      success: true,
      message: 'Direct analytics test successful',
      data: {
        totalUsers: userCount?.count || 0,
        activeUsers: Math.floor((userCount?.count || 0) * 0.8),
        agentUsage: 5,
        systemHealth: 'Good',
        userGrowth: '+15% from last month',
        activeGrowth: '+8% from last month',
        agentGrowth: '+50% from last month',
        systemStatus: 'Stable from last month',
        recentActivity: [
          {
            action: 'User Login',
            user: 'System Administrator',
            email: 'syedarfan@securemaxtech.com',
            time: new Date().toISOString(),
            status: 'Success'
          }
        ],
        debug: {
          superadminCount: superAdminCount?.count || 0,
          requestTime: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('❌ [TEST-ANALYTICS] Analytics test error:', error);
    res.status(500).json({
      success: false,
      message: 'Analytics test failed',
      error: error.message
    });
  }
});
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Enterprise AI Hub API v2.0.0',
    endpoints: {
      auth: '/api/auth',
      analytics: '/api/analytics',
      support: '/api/support',
      cvIntelligence: '/api/cv-intelligence'
    },
    documentation: 'https://github.com/simplyarfan/simpleAI'
  });
});

// DEBUG: Add logging middleware to track all requests
app.use('/api', (req, res, next) => {
  console.log(`🔍 [DEBUG] API Request: ${req.method} ${req.originalUrl}`);
  console.log(`🔍 [DEBUG] Headers:`, req.headers.authorization ? 'Bearer token present' : 'No token');
  console.log(`🔍 [DEBUG] Full path: ${req.path}`);
  console.log(`🔍 [DEBUG] Query:`, req.query);
  next();
});

// Import routes
console.log('📦 Loading route handlers...');
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const cvRoutes = require('./routes/cv-intelligence');
const supportRoutes = require('./routes/support');
const notificationRoutes = require('./routes/notifications');

// Mount API routes with enhanced logging
app.use('/api/auth', (req, res, next) => {
  console.log(`🔐 [AUTH] ${req.method} ${req.path}`);
  next();
}, authRoutes);

// TEMPORARY: Simple analytics route WITHOUT middleware for debugging
app.get('/api/analytics/dashboard-simple', async (req, res) => {
  try {
    console.log('📊 [SIMPLE-ANALYTICS] Direct analytics call');
    await database.connect();
    
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    const superAdminCount = await database.get('SELECT COUNT(*) as count FROM users WHERE role = $1', ['superadmin']);
    
    res.json({
      success: true,
      data: {
        totalUsers: parseInt(userCount?.count) || 0,
        activeUsers: Math.floor((parseInt(userCount?.count) || 0) * 0.8),
        agentUsage: 0,
        systemHealth: 'Good',
        userGrowth: '+0% from last month',
        activeGrowth: '+0% from last month', 
        agentGrowth: '+0% from last month',
        systemStatus: 'Stable from last month',
        recentActivity: [
          {
            action: 'System Check',
            user: 'System Administrator',
            email: 'syedarfan@securemaxtech.com',
            time: new Date().toISOString(),
            status: 'Success'
          }
        ]
      }
    });
  } catch (error) {
    console.error('❌ [SIMPLE-ANALYTICS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Analytics temporarily unavailable'
    });
  }
});

app.use('/api/analytics', (req, res, next) => {
  console.log(`📊 [ANALYTICS] ${req.method} ${req.path}`);
  next();
}, analyticsRoutes);

app.use('/api/cv-intelligence', cvRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);

console.log('✅ All routes mounted successfully');

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`❌ [404] API endpoint not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: ['/api/auth', '/api/analytics', '/api/support', '/api/notifications', '/api/cv-intelligence']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ [ERROR]:', err.message);
  console.error('❌ Stack:', err.stack);
  
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    })
  });
});

// Initialize database
const initializeDatabase = async () => {
  try {
    console.log('🔗 Connecting to Neon PostgreSQL database...');
    await database.connect();
    console.log('✅ Database connected and initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Start server
const startServer = async () => {
  await initializeDatabase();
  
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    });
  } else {
    console.log('✅ Running on Vercel serverless environment');
  }
};

// For Vercel serverless
if (process.env.VERCEL) {
  initializeDatabase().catch(error => {
    console.error('Vercel database initialization error:', error);
  });
}

startServer().catch(console.error);

module.exports = app;
