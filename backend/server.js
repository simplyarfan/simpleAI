const express = require('express');
const cors = require('cors');

const app = express();

// Ultra-basic CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Health endpoint - MUST work
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Backend is working! 🎉',
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'SimpleAI Backend - Fixed Version!', status: 'running' });
});

// Test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API test successful!',
    timestamp: new Date().toISOString()
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login working',
    user: { id: 1, email: 'test@test.com', role: 'superadmin' },
    token: 'test-token-' + Date.now()
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration working',
    user: { id: 1, email: 'test@test.com', role: 'user' },
    token: 'test-token-' + Date.now()
  });
});

// Catch all
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url,
    available: ['/health', '/', '/api/test', '/api/auth/login', '/api/auth/register']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message
  });
});

module.exports = app;
