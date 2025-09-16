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

// Enhanced CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    if (origin.includes('netlify.app') || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'https://thesimpleai.netlify.app',
      'https://thesimpleai.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
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
    
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    
    res.json({
      success: true,
      message: 'Test endpoint working',
      database: 'connected',
      userCount: userCount?.count || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [TEST] Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// API documentation
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
