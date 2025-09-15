const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const responseTime = require('response-time');
const path = require('path');
require('dotenv').config();

const database = require('./models/database');
const { generalLimiter } = require('./middleware/rateLimiting');

// Import routes
const cvRoutes = require('./routes/cv-intelligence');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting Enterprise AI Hub Backend v2.0.0...');

// Trust proxy for rate limiting and security
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allow for development
}));

// Performance middleware
app.use(compression());
app.use(responseTime());

// Enhanced CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow all Netlify deploy previews and production
    if (origin.includes('netlify.app')) {
      return callback(null, true);
    }
    
    // Allow all Vercel deployments
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Allow specific production domains
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
    'X-Request-ID',  // Add this header
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

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Mount API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/cv-intelligence', cvRoutes);
app.use('/api/support', require('./routes/support'));
app.use('/api/notifications', require('./routes/notifications'));

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path,
    availableEndpoints: ['/api/auth', '/api/analytics', '/api/support', '/api/notifications', '/api/cv-intelligence']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
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

// Initialize database with Neon PostgreSQL
const initializeDatabase = async () => {
  try {
    console.log('🔗 Connecting to Neon PostgreSQL database...');
    console.log('🔗 Database URL available:', !!process.env.DATABASE_URL);
    console.log('🔗 Postgres URL available:', !!process.env.POSTGRES_URL);
    
    await database.connect();
    console.log('✅ Neon PostgreSQL database connected and tables initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    // Don't exit in production - let Vercel handle the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Start server
const startServer = async () => {
  // Initialize database first
  await initializeDatabase();
  
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    });
  } else {
    console.log('✅ Running on Vercel serverless environment with Neon PostgreSQL');
  }
};

// For Vercel serverless
if (process.env.VERCEL) {
  // Initialize database immediately for serverless
  initializeDatabase().catch(error => {
    console.error('Vercel database initialization error:', error);
  });
}

startServer().catch(console.error);

// Export for Vercel
module.exports = app;
