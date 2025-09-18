const express = require('express');
const router = express.Router();
const database = require('../models/database');

// Initialize database tables
router.get('/database', async (req, res) => {
  try {
    console.log('🔧 Initializing database tables...');
    await database.init();
    
    res.json({
      success: true,
      message: 'Database tables initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize database',
      error: error.message
    });
  }
});

module.exports = router;
