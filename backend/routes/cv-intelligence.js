const express = require('express');
const multer = require('multer');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

// Test endpoint to verify routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CV Intelligence routes are working',
    timestamp: new Date().toISOString()
  });
});

// Try to load controller with error handling
let CVIntelligenceController;
try {
  CVIntelligenceController = require('../controllers/CVIntelligenceController');
  console.log('✅ CVIntelligenceController loaded successfully');
} catch (error) {
  console.error('❌ Error loading CVIntelligenceController:', error.message);
}

// Configure multer for file uploads (memory storage - no disk storage needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 11 // 1 JD + max 10 CVs
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF and text files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'text/plain' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, DOC, and DOCX files are allowed'), false);
    }
  }
});

// Middleware to handle file upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 11 files (1 JD + 10 CVs).'
      });
    }
  }
  
  if (error.message.includes('Only PDF')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Routes - Only add if controller loaded successfully
if (CVIntelligenceController) {
  // POST /api/cv-intelligence/batch - Create new batch
  router.post('/batch',
    requireAuth,
    generalLimiter,
    CVIntelligenceController.createBatch
  );

  // POST /api/cv-intelligence/batch/:batchId/process - Process files for batch
  router.post('/batch/:batchId/process',
    requireAuth,
    generalLimiter,
    upload.fields([
      { name: 'jdFile', maxCount: 1 },
      { name: 'cvFiles', maxCount: 10 }
    ]),
    handleUploadError,
    CVIntelligenceController.processFiles
  );

  // GET /api/cv-intelligence/batches - Get all batches for user
  router.get('/batches',
    requireAuth,
    generalLimiter,
    CVIntelligenceController.getBatches
  );

  // GET /api/cv-intelligence/batch/:batchId/candidates - Get candidates for batch
  router.get('/batch/:batchId/candidates',
    requireAuth,
    generalLimiter,
    CVIntelligenceController.getCandidates
  );
} else {
  // Fallback routes if controller failed to load
  router.get('/batches', requireAuth, (req, res) => {
    res.status(500).json({
      success: false,
      message: 'CV Intelligence controller failed to load',
      error: 'Service temporarily unavailable'
    });
  });

  router.post('/batch', requireAuth, (req, res) => {
    res.status(500).json({
      success: false,
      message: 'CV Intelligence controller failed to load',
      error: 'Service temporarily unavailable'
    });
  });
}

module.exports = router;