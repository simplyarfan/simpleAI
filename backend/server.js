const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database
const database = require('./models/database');

// Import routes (with individual error handling)
let authRoutes, analyticsRoutes, supportRoutes, cvRoutes, notificationRoutes, initRoutes;

// Load each route individually with error handling
try {
  authRoutes = require('./routes/auth');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

try {
  analyticsRoutes = require('./routes/analytics');
} catch (error) {
  console.error('❌ Error loading analytics routes:', error.message);
}

try {
  supportRoutes = require('./routes/support');
} catch (error) {
  console.error('❌ Error loading support routes:', error.message);
}

try {
  cvRoutes = require('./routes/cv-intelligence-working');
} catch (error) {
  console.error('❌ Error loading CV Intelligence routes:', error.message);
}

try {
  notificationRoutes = require('./routes/notifications');
} catch (error) {
  console.error('❌ Error loading notification routes:', error.message);
}

try {
  initRoutes = require('./routes/init');
} catch (error) {
  console.error('❌ Error loading init routes:', error.message);
}

// Simple request logger middleware
const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const app = express();
const PORT = process.env.PORT || 5000;

// Starting SimpleAI Enterprise Backend

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('❌ Application cannot start without proper JWT configuration');
  process.exit(1);
}

// Initialize database connection (non-blocking)
database.connect().catch(error => {
  console.error('❌ Database connection failed:', error);
  // Don't exit process, let it continue for health checks
});

// CORS Configuration
app.use(cors({
  origin: [
    'https://thesimpleai.netlify.app',
    'http://localhost:3000',
    'https://thesimpleai.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'SimpleAI Enterprise Backend is running!',
    database: database.isConnected ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Test endpoint - comprehensive health check
app.get('/api/test', async (req, res) => {
  const results = {
    success: true,
    message: 'API Health Check',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  try {
    // Test 1: Database connection
    await database.connect();
    results.checks.database_connection = { status: 'OK', message: 'Connected' };

    // Test 2: Users table exists and has data
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    results.checks.users_table = { 
      status: 'OK', 
      count: parseInt(userCount.count),
      message: `${userCount.count} users found`
    };

    // Test 3: Admin user exists
    const adminUser = await database.get('SELECT email, role, first_name, last_name FROM users WHERE role = $1', ['superadmin']);
    results.checks.admin_user = adminUser ? {
      status: 'OK',
      email: adminUser.email,
      name: `${adminUser.first_name} ${adminUser.last_name}`,
      message: 'Admin user found'
    } : {
      status: 'MISSING',
      message: 'No admin user found'
    };

    // Test 4: Check if new columns exist
    try {
      await database.get('SELECT failed_login_attempts, account_locked_until FROM users LIMIT 1');
      results.checks.table_schema = { status: 'OK', message: 'All required columns exist' };
    } catch (error) {
      results.checks.table_schema = { status: 'ERROR', message: error.message };
    }

    // Test 5: Routes loaded
    results.checks.routes = {
      status: authRoutes ? 'OK' : 'ERROR',
      auth: !!authRoutes,
      analytics: !!analyticsRoutes,
      support: !!supportRoutes,
      cv: !!cvRoutes,
      notifications: !!notificationRoutes
    };

  } catch (error) {
    results.success = false;
    results.checks.database_connection = { status: 'ERROR', message: error.message };
  }

  res.json(results);
});

// Admin creation endpoint removed - use proper registration flow

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SimpleAI Enterprise Backend API',
    status: 'running',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      analytics: '/api/analytics/*',
      support: '/api/support/*',
      cvIntelligence: '/api/cv-intelligence/*',
      notifications: '/api/notifications/*'
    }
  });
});

// Route loading status check removed

// API Routes (conditional)
if (authRoutes) {
  app.use('/api/auth', authRoutes);
}
if (analyticsRoutes) {
  app.use('/api/analytics', analyticsRoutes);
}
if (supportRoutes) {
  app.use('/api/support', supportRoutes);
}
if (cvRoutes) {
  app.use('/api/cv-intelligence', cvRoutes);
} else {
  console.error('❌ CV Intelligence routes failed to load');
}
if (notificationRoutes) {
  app.use('/api/notifications', notificationRoutes);
}
if (initRoutes) {
  app.use('/api/init', initRoutes);
}

// Debug routes removed - not needed in production

// Debug user endpoint removed - security risk in production

// Debug refresh token endpoint removed - security risk in production

// Simple endpoints for basic functionality (fallback)
app.get('/api/users', async (req, res) => {
  try {
    await database.connect();
    const users = await database.all(`
      SELECT id, email, first_name, last_name, role, department, job_title, 
             is_active, created_at, last_login
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      data: { 
        users,
        totalPages: 1,
        currentPage: 1,
        totalCount: users.length
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Debug support tickets endpoint removed - not needed in production

app.get('/api/system/health', async (req, res) => {
  try {
    await database.connect();
    const dbTest = await database.get('SELECT 1 as test');
    
    res.json({
      success: true,
      data: {
        overall: 'healthy',
        api: 'healthy',
        database: 'healthy',
        storage: 'healthy',
        memory: 'healthy'
      },
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        overall: 'warning',
        api: 'healthy',
        database: 'error',
        storage: 'healthy',
        memory: 'healthy'
      },
      status: 'degraded',
      database: 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/api/system/metrics', async (req, res) => {
  try {
    await database.connect();
    
    // Get basic system metrics
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    
    // Calculate uptime in days
    const uptimeDays = (uptime / (24 * 60 * 60)).toFixed(1);
    
    // Get user count for active users metric
    const userCount = await database.get('SELECT COUNT(*) as count FROM users WHERE is_active = true');
    
    res.json({
      success: true,
      data: {
        uptime: `${uptimeDays} days`,
        responseTime: null,
        apiCalls: 0,
        errorRate: null,
        activeUsers: userCount?.count || 0,
        cpuUsage: 0,
        memoryUsage: Math.floor((memUsage.heapUsed / memUsage.heapTotal) * 100),
        diskUsage: 0,
        recentEvents: []
      }
    });
  } catch (error) {
    console.error('System metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system metrics',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server (only in non-Vercel environments)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SimpleAI Enterprise Backend running on port ${PORT}`);
  });
}

module.exports = app;
