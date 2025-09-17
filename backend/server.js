const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting SimpleAI Backend (Minimal Version)...');

// Basic middleware
app.use(cors({
  origin: ['https://thesimpleai.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy ✅',
    timestamp: new Date().toISOString(),
    version: '1.0.3',
    message: 'Backend is running successfully!'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SimpleAI Backend API',
    status: 'running',
    version: '1.0.3',
    endpoints: {
      health: '/health',
      test: '/api/test'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Basic auth endpoints (no database for now)
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration endpoint working',
    user: { id: 1, email: 'test@example.com', role: 'user' },
    token: 'test-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint working', 
    user: { id: 1, email: 'test@example.com', role: 'superadmin' },
    token: 'test-token'
  });
});

// Analytics endpoint
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 2,
      activeUsers: 1,
      systemHealth: 'Good'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error'
  });
});

// Initialize
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
} else {
  console.log('✅ Running on Vercel');
}

module.exports = app;
