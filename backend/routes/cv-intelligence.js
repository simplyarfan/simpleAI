const express = require('express');
const router = express.Router();
const CVController = require('../controllers/CVController');
const { 
  authenticateToken,
  requireAdmin,
  trackActivity 
} = require('../middleware/auth');
const {
  cvBatchLimiter,
  uploadLimiter,
  exportLimiter,
  generalLimiter
} = require('../middleware/rateLimiting');
const {
  validateBatchCreation,
  validateBatchId,
  validateCandidateId,
  validatePagination,
  validateStatus,
  validateTimeframe,
  validateExportFormat
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// User routes (manage own CV batches)

// Create new CV analysis batch
router.post('/',
  cvBatchLimiter,
  uploadLimiter,
  CVController.getUploadMiddleware(),
  validateBatchCreation,
  trackActivity('cv_batch_created', 'cv_intelligence'),
  CVController.createBatch
);

// Get user's CV batches
router.get('/my-batches',
  generalLimiter,
  validatePagination,
  validateStatus,
  trackActivity('user_cv_batches_viewed', 'cv_intelligence'),
  CVController.getUserBatches
);

// Get batch details with candidates
router.get('/batches/:batch_id',
  generalLimiter,
  validateBatchId,
  trackActivity('cv_batch_details_viewed', 'cv_intelligence'),
  CVController.getBatchDetails
);

// Get candidate details
router.get('/candidates/:candidate_id',
  generalLimiter,
  validateCandidateId,
  trackActivity('cv_candidate_details_viewed', 'cv_intelligence'),
  CVController.getCandidateDetails
);

// Export batch results
router.get('/batches/:batch_id/export',
  exportLimiter,
  validateBatchId,
  validateExportFormat,
  trackActivity('cv_batch_exported', 'cv_intelligence'),
  CVController.exportBatch
);

// Delete batch
router.delete('/batches/:batch_id',
  generalLimiter,
  validateBatchId,
  trackActivity('cv_batch_deleted', 'cv_intelligence'),
  CVController.deleteBatch
);

// Admin routes (view all CV Intelligence data)

// Get CV Intelligence statistics (admin only)
router.get('/admin/stats',
  requireAdmin,
  generalLimiter,
  validateTimeframe,
  trackActivity('cv_admin_stats_viewed', 'cv_intelligence'),
  CVController.getCVStats
);

module.exports = router;