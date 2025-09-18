const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CV Intelligence routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Simple batches endpoint
router.get('/batches', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Simple batches endpoint working'
  });
});

// Simple create batch endpoint
router.post('/batch', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Simple batch creation working',
    batchId: 'test-batch-123'
  });
});

module.exports = router;
