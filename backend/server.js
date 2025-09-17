const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const responseTime = require('response-time');
require('dotenv').config();

// Import database
const database = require('./backend/models/database');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting SimpleAI Backend Server...');

// Trust proxy for production
app.set('trust proxy', 1);

// Basic security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Performance middleware
app.use(compression());
app.use(responseTime());

// CORS - Allow frontend access
app.use(cors({
  origin: [
    'https://thesimpleai.netlify.app',
    'https://thesimpleai.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await database.connect();
    const testQuery = await database.get('SELECT NOW() as current_time');
    
    res.json({
      success: true,
      status: 'healthy ✅',
      timestamp: testQuery.current_time,
      version: '1.0.2',
      message: 'Backend is running successfully!'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy ❌',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SimpleAI Backend API',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      api: '/api'
    }
  });
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    console.log('🧪 Test endpoint accessed');
    await database.connect();
    
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    const users = await database.all('SELECT id, email, first_name, last_name, role FROM users LIMIT 3');
    
    res.json({
      success: true,
      message: 'Database test successful',
      data: {
        userCount: userCount?.count || 0,
        users: users || [],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Simple auth endpoints without complex middleware
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    await database.connect();
    
    // Check existing user
    const existingUser = await database.get('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const result = await database.run(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, first_name, last_name, role
    `, [email, hashedPassword, firstName, lastName, 'user', true, true]);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to create user');
    }
    
    const newUser = result.rows[0];
    
    // Generate JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: newUser
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    await database.connect();
    
    // Get user
    const user = await database.get(`
      SELECT id, email, password_hash, first_name, last_name, role, is_active
      FROM users WHERE email = $1
    `, [email]);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    await database.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    
    // Generate JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Check auth status
app.get('/api/auth/check', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    await database.connect();
    const user = await database.get(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    res.json({
      success: true,
      user: user
    });
    
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Get all users (for admin)
app.get('/api/users', async (req, res) => {
  try {
    await database.connect();
    const users = await database.all(`
      SELECT id, email, first_name, last_name, role, is_active, last_login, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      users: users
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// Dashboard analytics
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    await database.connect();
    
    const totalUsers = await database.get('SELECT COUNT(*) as count FROM users');
    const activeUsers = await database.get('SELECT COUNT(*) as count FROM users WHERE is_active = true');
    
    res.json({
      success: true,
      data: {
        totalUsers: totalUsers?.count || 0,
        activeUsers: activeUsers?.count || 0,
        systemHealth: 'Good',
        recentActivity: []
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Analytics failed',
      error: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Initialize and start
const initializeApp = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected');
    
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    if (!process.env.VERCEL) process.exit(1);
  }
};

// For Vercel serverless
if (process.env.VERCEL) {
  let initialized = false;
  app.use(async (req, res, next) => {
    if (!initialized) {
      try {
        await database.connect();
        initialized = true;
        console.log('✅ Vercel serverless initialized');
      } catch (error) {
        console.error('❌ Vercel init error:', error);
      }
    }
    next();
  });
} else {
  initializeApp();
}

module.exports = app;
