const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database
const database = require('./models/database');

// Import routes (with error handling)
let authRoutes, analyticsRoutes, supportRoutes, cvRoutes, notificationRoutes;
try {
  authRoutes = require('./routes/auth');
  analyticsRoutes = require('./routes/analytics');
  supportRoutes = require('./routes/support');
  cvRoutes = require('./routes/cv-intelligence');
  notificationRoutes = require('./routes/notifications');
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
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

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    await database.connect();
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    const adminUser = await database.get('SELECT email, role FROM users WHERE role = $1', ['superadmin']);
    
    res.json({
      success: true,
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount: userCount.count,
        adminUser: adminUser ? adminUser.email : 'Not found'
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'API working but database issue',
      timestamp: new Date().toISOString(),
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

// API Routes (conditional)
if (authRoutes) app.use('/api/auth', authRoutes);
if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);
if (supportRoutes) app.use('/api/support', supportRoutes);
if (cvRoutes) app.use('/api/cv-intelligence', cvRoutes);
if (notificationRoutes) app.use('/api/notifications', notificationRoutes);

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
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

app.get('/api/system/health', async (req, res) => {
  try {
    await database.connect();
    const dbTest = await database.get('SELECT NOW() as current_time');
    
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      dbTime: dbTest.current_time
    });
  } catch (error) {
    res.json({
      success: true,
      status: 'degraded',
      database: 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
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
