const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database
const database = require('./models/database');
// Load routes with error handling
let authRoutes, analyticsRoutes, supportRoutes, cvRoutes, notificationRoutes, initRoutes, interviewRoutes;

// Load each route individually with error handling
try {
  authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
  console.error('❌ Stack trace:', error.stack);
}

try {
  cvRoutes = require('./routes/cv-intelligence-clean');
  console.log('✅ CV Intelligence routes loaded successfully (HR-01 Blueprint)');
} catch (error) {
  console.error('❌ Error loading CV Intelligence routes:', error.message);
  console.error('❌ Full error details:', error);
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

// CV Intelligence routes already loaded above

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

try {
  interviewRoutes = require('./routes/interview-coordinator');
  console.log('✅ Interview Coordinator routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading interview coordinator routes:', error.message);
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

// CORS Configuration - Environment-driven
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Get allowed origins from environment or use defaults
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [
        'https://thesimpleai.netlify.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-Request-ID,X-Admin-Secret');
  res.header('Access-Control-Expose-Headers', 'Content-Length,X-Request-ID');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Starting SimpleAI Enterprise Backend

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET environment variable');
  console.error('❌ Application cannot start without JWT_SECRET');
  process.exit(1);
}

// JWT_REFRESH_SECRET is optional - will use JWT_SECRET as fallback
if (!process.env.JWT_REFRESH_SECRET) {
  console.warn('⚠️ SECURITY WARNING: JWT_REFRESH_SECRET not set, using JWT_SECRET as fallback');
  console.warn('⚠️ For production, set separate JWT_REFRESH_SECRET for better security');
  process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET;
}

// Initialize database connection (non-blocking)
database.connect().catch(error => {
  console.error('❌ Database connection failed:', error);
  // Don't exit process, let it continue for health checks
});

// Duplicate CORS configuration removed - using the specific origin one above

// HTTPS Enforcement for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Health Check endpoint
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

// Cache management endpoints (admin only)
const cacheService = require('./services/cacheService');
const { requireSuperAdmin, authenticateToken } = require('./middleware/auth');

app.get('/api/cache/stats', authenticateToken, requireSuperAdmin, async (req, res) => {
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

app.delete('/api/cache/clear/:pattern', authenticateToken, requireSuperAdmin, async (req, res) => {
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

// Test endpoint - comprehensive health check (development only)
app.get('/api/test', async (req, res) => {
  // Only allow in development or with admin authentication
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is disabled in production'
    });
  }
  
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

    res.json(results);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
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
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes mounted at /api/auth (cache middleware temporarily removed)');
} else {
  console.error('❌ Auth routes NOT mounted - authRoutes is falsy');
}

if (analyticsRoutes) {
  app.use('/api/analytics', longCacheMiddleware, analyticsRoutes);
}
if (supportRoutes) {
  app.use('/api/support', shortCacheMiddleware, cacheInvalidationMiddleware(['api:support*']), supportRoutes);
}
if (cvRoutes) {
  app.use('/api/cv-intelligence', cvRoutes);
  console.log('✅ CV Intelligence routes mounted at /api/cv-intelligence');
  console.log('✅ CV Routes object type:', typeof cvRoutes);
  console.log('✅ CV Routes available:', Object.getOwnPropertyNames(cvRoutes));
} else {
  console.error('❌ CV Intelligence routes failed to load - cvRoutes is:', cvRoutes);
}
if (notificationRoutes) {
  app.use('/api/notifications', shortCacheMiddleware, cacheInvalidationMiddleware(['api:notifications*']), notificationRoutes);
}
if (initRoutes) {
  app.use('/api/init', initRoutes);
}
if (interviewRoutes) {
  app.use('/api/interview-coordinator', interviewRoutes);
  console.log('✅ Interview Coordinator routes mounted at /api/interview-coordinator');
} else {
  console.error('❌ Interview Coordinator routes failed to load');
}

// Debug routes removed - not needed in production

// Debug user endpoint removed - security risk in production

// Debug refresh token endpoint removed - security risk in production


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
  
  // SECURITY: Never expose stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { error: err.message, stack: err.stack })
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
