const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting SimpleAI Backend (Fixed Version)...');
console.log('🔧 Environment:', process.env.NODE_ENV || 'development');

// Enhanced error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

// Basic middleware with error handling
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: ['https://thesimpleai.netlify.app', 'http://localhost:3000', 'https://thesimpleai.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check - MUST be accessible
app.get('/health', (req, res) => {
  try {
    res.json({
      success: true,
      status: 'healthy ✅',
      timestamp: new Date().toISOString(),
      version: '1.0.4',
      message: 'Backend is running successfully!',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  try {
    res.json({
      message: 'SimpleAI Backend API',
      status: 'running',
      version: '1.0.4',
      endpoints: {
        health: '/health',
        test: '/api/test',
        auth: '/api/auth/*'
      }
    });
  } catch (error) {
    console.error('Root endpoint error:', error);
    res.status(500).json({ error: 'Root endpoint failed' });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'API is working perfectly! 🎯',
      timestamp: new Date().toISOString(),
      request_info: {
        method: req.method,
        url: req.url,
        headers: req.headers
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Test endpoint failed' });
  }
});

// Basic auth endpoints (simplified for debugging)
app.post('/api/auth/register', (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body);
    res.json({
      success: true,
      message: 'Registration endpoint working',
      user: { id: 1, email: 'test@example.com', role: 'user' },
      token: 'test-token-' + Date.now()
    });
  } catch (error) {
    console.error('Register endpoint error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    res.json({
      success: true,
      message: 'Login endpoint working', 
      user: { id: 1, email: 'admin@example.com', role: 'superadmin' },
      token: 'test-token-' + Date.now()
    });
  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Analytics endpoint
app.get('/api/analytics/dashboard', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalUsers: 2,
        activeUsers: 1,
        systemHealth: 'Good',
        uptime: process.uptime()
      }
    });
  } catch (error) {
    console.error('Analytics endpoint error:', error);
    res.status(500).json({ error: 'Analytics failed' });
  }
});

// Catch-all for undefined routes
app.all('*', (req, res) => {
  console.log(`⚠️  Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url,
    method: req.method,
    available_endpoints: [
      '/health',
      '/',
      '/api/test',
      '/api/auth/login',
      '/api/auth/register',
      '/api/analytics/dashboard'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err);
  console.error('❌ Stack:', err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
} else {
  console.log('✅ Running on Vercel serverless');
}

module.exports = app;
