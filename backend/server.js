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
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

try {
  analyticsRoutes = require('./routes/analytics');
  console.log('✅ Analytics routes loaded');
} catch (error) {
  console.error('❌ Error loading analytics routes:', error.message);
}

try {
  supportRoutes = require('./routes/support');
  console.log('✅ Support routes loaded');
} catch (error) {
  console.error('❌ Error loading support routes:', error.message);
}

try {
  cvRoutes = require('./routes/cv-intelligence-simple');
  console.log('✅ CV Intelligence routes loaded (simple version)');
} catch (error) {
  console.error('❌ Error loading CV Intelligence routes:', error.message);
  console.error('❌ CV Intelligence stack:', error.stack);
}

try {
  notificationRoutes = require('./routes/notifications');
  console.log('✅ Notification routes loaded');
} catch (error) {
  console.error('❌ Error loading notification routes:', error.message);
}

try {
  initRoutes = require('./routes/init');
  console.log('✅ Init routes loaded');
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

console.log('🚀 Starting SimpleAI Enterprise Backend...');

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

// Manual admin creation endpoint (for debugging)
app.post('/api/create-admin', async (req, res) => {
  try {
    await database.connect();
    await database.createDefaultAdmin();
    
    res.json({
      success: true,
      message: 'Admin user creation attempted',
      credentials: {
        email: 'syedarfan@securemaxtech.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
});

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

// Debug: Check which routes are loaded
console.log('🔍 Route loading status:');
console.log('- authRoutes:', !!authRoutes);
console.log('- analyticsRoutes:', !!analyticsRoutes);
console.log('- supportRoutes:', !!supportRoutes);
console.log('- cvRoutes:', !!cvRoutes);
console.log('- notificationRoutes:', !!notificationRoutes);
console.log('- initRoutes:', !!initRoutes);

// API Routes (conditional)
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Mounted /api/auth');
}
if (analyticsRoutes) {
  app.use('/api/analytics', analyticsRoutes);
  console.log('✅ Mounted /api/analytics');
}
if (supportRoutes) {
  app.use('/api/support', supportRoutes);
  console.log('✅ Mounted /api/support');
}
if (cvRoutes) {
  app.use('/api/cv-intelligence', cvRoutes);
  console.log('✅ Mounted /api/cv-intelligence');
} else {
  console.log('❌ cvRoutes is null/undefined - NOT MOUNTED');
}
if (notificationRoutes) {
  app.use('/api/notifications', notificationRoutes);
  console.log('✅ Mounted /api/notifications');
}
if (initRoutes) {
  app.use('/api/init', initRoutes);
  console.log('✅ Mounted /api/init');
}

// Debug endpoint to list all routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    success: true,
    routes: routes,
    routeCount: routes.length,
    loadedModules: {
      authRoutes: !!authRoutes,
      analyticsRoutes: !!analyticsRoutes,
      supportRoutes: !!supportRoutes,
      cvRoutes: !!cvRoutes,
      notificationRoutes: !!notificationRoutes,
      initRoutes: !!initRoutes
    }
  });
});

// Debug endpoint to check user authentication
app.get('/api/debug/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ success: false, message: 'No auth header', headers: req.headers });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.json({ success: false, message: 'No token', authHeader });
    }
    
    const jwt = require('jsonwebtoken');
    console.log('🔍 [DEBUG] Token received:', token.substring(0, 20) + '...');
    console.log('🔍 [DEBUG] JWT_SECRET:', process.env.JWT_SECRET ? 'present' : 'missing');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    await database.connect();
    const user = await database.get('SELECT id, email, role FROM users WHERE id = $1', [decoded.userId]);
    
    res.json({
      success: true,
      decoded,
      user,
      hasRequiredRole: ['admin', 'superadmin'].includes(user?.role),
      tokenPreview: token.substring(0, 20) + '...'
    });
  } catch (error) {
    console.log('🔍 [DEBUG] JWT Error:', error.message);
    res.json({ 
      success: false, 
      error: error.message,
      tokenPreview: req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'none'
    });
  }
});

// Debug endpoint to force re-login and get fresh token
app.post('/api/debug/refresh-token', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ success: false, message: 'Email required' });
    }
    
    await database.connect();
    const user = await database.get('SELECT * FROM users WHERE email = $1', [email]);
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

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

// Debug endpoint to check support tickets table
app.get('/api/debug/support-tickets', async (req, res) => {
  try {
    await database.connect();
    
    // Check if table exists
    const tableExists = await database.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'support_tickets'
      );
    `);
    
    let ticketCount = 0;
    if (tableExists.exists) {
      const count = await database.get('SELECT COUNT(*) as count FROM support_tickets');
      ticketCount = count.count;
    }
    
    res.json({
      success: true,
      tableExists: tableExists.exists,
      ticketCount
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

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
    console.log(`✅ SimpleAI Enterprise Backend running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 API endpoints: http://localhost:${PORT}/api/*`);
  });
}

module.exports = app;
