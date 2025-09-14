const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const database = require('./models/database');
const { generalLimiter } = require('./middleware/rateLimiting');

// Import routes
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const supportRoutes = require('./routes/support');
const cvRoutes = require('./routes/cv-intelligence');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting Enterprise AI Hub Backend...');

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Updated for new Netlify URL
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://thesimpleai.netlify.app',
    'https://comfy-syrniki-164b7b.netlify.app', // Keep old URL during transition
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Apply general rate limiting
app.use(generalLimiter);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.3',
    message: 'Backend is running successfully!',
    frontend: 'https://thesimpleai.netlify.app'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Enterprise AI Hub Backend API',
    version: '1.0.3',
    status: 'running',
    deployment: 'Vercel deployment successful!',
    frontend: 'https://thesimpleai.netlify.app',
    endpoints: {
      auth: '/api/auth',
      analytics: '/api/analytics', 
      support: '/api/support',
      cvIntelligence: '/api/cv-intelligence'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/cv-intelligence', cvRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Enterprise AI Hub API Documentation',
    version: '1.0.3',
    endpoints: 'All endpoints available and working!'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

// Initialize database on startup
const initializeDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await database.connect();
    console.log('Database connected successfully');
    
    await database.initializeTables();
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

// Initialize database
initializeDatabase();

// Start server (only for local development)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} else {
  console.log('Running on Vercel serverless environment');
}

// Export for Vercel
module.exports = app;