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

// Simple request logger middleware (only errors and important routes)
const requestLogger = (req, res, next) => {
  if (req.url.includes('/api/') && !req.url.includes('/health')) {
    console.log(`${req.method} ${req.url}`);
  }
  next();
};

const app = express();
const PORT = process.env.PORT || 5000;

// Starting SimpleAI Enterprise Backend

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET environment variable');
  console.error('❌ Application cannot start without JWT_SECRET');
  process.exit(1);
}

// JWT_REFRESH_SECRET is optional - will use JWT_SECRET as fallback
if (!process.env.JWT_REFRESH_SECRET) {
  console.log('⚠️ JWT_REFRESH_SECRET not set, using JWT_SECRET as fallback');
  process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET;
}

// Initialize database connection (non-blocking)
database.connect().catch(error => {
  console.error('❌ Database connection failed:', error);
  // Don't exit process, let it continue for health checks
});

// CORS Configuration - Permissive for debugging login issues
const corsOptions = {
  origin: true, // Allow all origins temporarily to fix login
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Request-ID',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'X-Admin-Secret'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Explicit OPTIONS handler for all routes
app.options('*', (req, res) => {
  console.log('🔍 OPTIONS request for:', req.url, 'from origin:', req.get('Origin'));
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Request-ID,Accept,Origin,X-Requested-With,X-Admin-Secret');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

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

// CORS Test endpoint
app.get('/cors-test', (req, res) => {
  console.log('🔍 CORS Test - Origin:', req.get('Origin'));
  console.log('🔍 CORS Test - Headers:', req.headers);
  res.json({
    success: true,
    message: 'CORS test successful',
    origin: req.get('Origin'),
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Cache management endpoints
const cacheService = require('./services/cacheService');

app.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = await cacheService.getCacheStats();
    res.json({
      success: true,
      data: stats,
      message: 'Cache statistics retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats',
      error: error.message
    });
  }
});

app.delete('/api/cache/clear/:pattern', async (req, res) => {
  try {
    const { pattern } = req.params;
    await cacheService.clearCache(pattern);
    res.json({
      success: true,
      message: `Cache cleared for pattern: ${pattern}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    routes: {
      auth: !!authRoutes,
      analytics: !!analyticsRoutes,
      support: !!supportRoutes,
      cvRoutes: !!cvRoutes,
      notifications: !!notificationRoutes
    }
  });
});

// Database seeding endpoint (development only)
app.post('/api/admin/seed-database', async (req, res) => {
  try {
    // Only allow in development or with special header
    if (process.env.NODE_ENV === 'production' && req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const { seedDatabase } = require('./scripts/seed-database');
    await seedDatabase();
    
    res.json({
      success: true,
      message: 'Database seeded successfully'
    });
  } catch (error) {
    console.error('Database seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Database seeding failed',
      error: error.message
    });
  }
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

// Import cache middleware
const { longCacheMiddleware, shortCacheMiddleware, cacheInvalidationMiddleware } = require('./middleware/cache');

// API Routes with caching (conditional)
if (authRoutes) {
  app.use('/api/auth', cacheInvalidationMiddleware(['session:*', 'api:*']), authRoutes);
}
if (analyticsRoutes) {
  app.use('/api/analytics', longCacheMiddleware, analyticsRoutes);
}
if (supportRoutes) {
  app.use('/api/support', shortCacheMiddleware, cacheInvalidationMiddleware(['api:support*']), supportRoutes);
}
if (cvRoutes) {
  app.use('/api/cv-intelligence', cacheInvalidationMiddleware(['cv_analysis:*', 'api:cv-intelligence*']), cvRoutes);
} else {
  console.error('❌ CV Intelligence routes failed to load');
}
if (notificationRoutes) {
  app.use('/api/notifications', shortCacheMiddleware, cacheInvalidationMiddleware(['api:notifications*']), notificationRoutes);
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
