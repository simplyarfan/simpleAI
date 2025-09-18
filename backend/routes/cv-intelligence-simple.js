const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CV Intelligence routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Simple batches endpoint
router.get('/batches', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Simple batches endpoint working'
  });
});

// Simple create batch endpoint
router.post('/batch', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Simple batch creation working',
    batchId: 'test-batch-123'
  });
});

module.exports = router;
