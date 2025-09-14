// Netlify function to handle all API routes
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

// Import your existing routes
const authRoutes = require('../../backend/routes/auth');
const supportRoutes = require('../../backend/routes/support');
const cvRoutes = require('../../backend/routes/cv-intelligence');
const analyticsRoutes = require('../../backend/routes/analytics');

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for Netlify
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/cv-intelligence', cvRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running on Netlify Functions' });
});

// Export the serverless function
module.exports.handler = serverless(app);