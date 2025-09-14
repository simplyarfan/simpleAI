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

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://comfy-syrniki-164b7b.netlify.app'
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

// Health check endpoint (before rate limiting)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
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
    message: 'Enterprise AI Hub API',
    version: '1.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        endpoints: [
          'POST /register - Register new user',
          'POST /login - User login',
          'POST /verify-email - Verify email address',
          'POST /resend-verification - Resend verification email',
          'POST /forgot-password - Request password reset',
          'POST /reset-password - Reset password',
          'POST /refresh-token - Refresh access token',
          'GET /profile - Get user profile',
          'PUT /profile - Update user profile',
          'GET /check - Check authentication status',
          'POST /logout - Logout current session',
          'POST /logout-all - Logout all sessions'
        ]
      },
      analytics: {
        base: '/api/analytics',
        description: 'Superadmin only',
        endpoints: [
          'GET /dashboard - Dashboard statistics',
          'GET /users - User analytics',
          'GET /agents - Agent usage analytics',
          'GET /cv-intelligence - CV Intelligence analytics',
          'GET /system - System analytics',
          'GET /users/:user_id/activity - User activity details',
          'GET /export - Export analytics data'
        ]
      },
      support: {
        base: '/api/support',
        endpoints: [
          'POST / - Create support ticket',
          'GET /my-tickets - Get user tickets',
          'GET /:ticket_id - Get ticket details',
          'POST /:ticket_id/comments - Add comment',
          'PUT /:ticket_id - Update ticket',
          'GET / - Get all tickets (admin)',
          'GET /admin/stats - Support statistics (admin)',
          'DELETE /:ticket_id - Delete ticket (admin)'
        ]
      },
      cvIntelligence: {
        base: '/api/cv-intelligence',
        endpoints: [
          'POST / - Create CV analysis batch',
          'GET /my-batches - Get user batches',
          'GET /batches/:batch_id - Get batch details',
          'GET /candidates/:candidate_id - Get candidate details',
          'GET /batches/:batch_id/export - Export batch results',
          'DELETE /batches/:batch_id - Delete batch',
          'GET /admin/stats - CV Intelligence statistics (admin)'
        ]
      }
    },
    documentation: 'https://docs.yourapi.com'
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

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size allowed is 10MB.'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum 50 files allowed.'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.'
    });
  }

  // Validation errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }

  // Default error response
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

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    console.log('Database connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 Enterprise AI Hub API Server is running!

📍 Server URL: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📚 API Documentation: http://localhost:${PORT}/api
❤️  Health Check: http://localhost:${PORT}/health

🔐 Company Domain: ${process.env.COMPANY_DOMAIN}
📧 Admin Email: ${process.env.ADMIN_EMAIL}

Available Endpoints:
├── Authentication: /api/auth
├── Analytics: /api/analytics (superadmin only)
├── Support: /api/support
└── CV Intelligence: /api/cv-intelligence

Ready to accept requests! 🎉
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await database.disconnect();
        console.log('Server closed and database disconnected');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await database.disconnect();
        console.log('Server closed and database disconnected');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;