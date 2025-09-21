const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');
const auth = require('../middleware/auth');
const CVAnalysisService = require('../services/cvAnalysisService');

const router = express.Router();

// Authentication middleware
const authenticateToken = auth.authenticateToken;

console.log('🧠 PURE AI CV Intelligence Routes - Loaded at:', new Date().toISOString());

// CV Analysis Service - PURE AI ONLY
let cvAnalysisService = null;
try {
  cvAnalysisService = new CVAnalysisService();
  console.log('✅ PURE AI CV Analysis Service initialized');
} catch (error) {
  console.error('❌ Failed to initialize CV Analysis Service:', error);
}

// Test database connection on route load
database.connect().then(() => {
  console.log('✅ Database connection verified for CV Intelligence');
}).catch(error => {
  console.error('❌ Database connection failed for CV Intelligence:', error.message);
});

// PURE AI CV Analysis Function - NO FALLBACKS
async function analyzeCV(jobDescription, cvText, fileName) {
  console.log('🧠 PURE AI CV Analysis - NO FALLBACKS:', fileName);
  
  if (!cvAnalysisService) {
    throw new Error('CV Analysis Service not initialized - check OpenRouter API key');
  }
  
  // PURE AI ONLY - NO FALLBACKS
  const analysisResult = await cvAnalysisService.analyzeCV(jobDescription, cvText, fileName);
  console.log('✅ PURE AI analysis completed for:', fileName);
  return analysisResult;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 11 // 1 JD + max 10 CVs
  },
  fileFilter: (req, file, cb) => {
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

// Test endpoint (no auth)
router.get('/test', (req, res) => {
  console.log('🧪 PURE AI CV Intelligence test endpoint hit!');
  res.json({
    success: true,
    message: 'PURE AI CV Intelligence routes are working!',
    timestamp: new Date().toISOString(),
    ai_enabled: !!cvAnalysisService,
    available_routes: [
      'GET /batches',
      'POST /batch',
      'POST /batch/:id/process',
      'GET /batch/:id',
      'GET /batch/:id/candidates'
    ]
  });
});

// GET /api/cv-intelligence/batches - Get all batches for user
router.get('/batches', authenticateToken, async (req, res) => {
  try {
    console.log('📊 [BATCHES] Fetching user batches...');
    console.log('📊 [BATCHES] User object:', JSON.stringify(req.user, null, 2));
    console.log('📊 [BATCHES] User ID:', req.user?.id);
    console.log('📊 [BATCHES] User ID type:', typeof req.user?.id);
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or user ID missing',
        debug: { user: req.user }
      });
    }
    
    await database.connect();
    console.log('📊 [BATCHES] Database connected successfully');
    
    const batches = await database.all(`
      SELECT 
        id, name, status, cv_count, candidate_count, 
        processing_time, created_at, updated_at
      FROM cv_batches 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [req.user.id]);
    
    console.log(`📊 [BATCHES] Found ${batches?.length || 0} batches for user ${req.user.id}`);
    
    res.json({
      success: true,
      data: batches || [],
      message: 'Batches retrieved successfully'
    });
  } catch (error) {
    console.error('❌ [BATCHES] Get batches error:', error);
    console.error('❌ [BATCHES] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches',
      error: error.message,
      debug: {
        user_id: req.user?.id,
        error_type: error.constructor.name
      }
    });
  }
});

// POST /api/cv-intelligence - Create new batch (Frontend compatibility)
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🎯 Creating CV batch for user:', req.user.id);
    
    await database.connect();
    
    const batchId = uuidv4();
    const { name } = req.body;
    
    await database.run(`
      INSERT INTO cv_batches (id, user_id, name, status, created_at, updated_at)
      VALUES ($1, $2, $3, 'created', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [batchId, req.user.id, name || 'New Batch']);
    
    console.log('✅ Batch created successfully:', batchId);
    
    res.json({
      success: true,
      data: { batchId },
      message: 'Batch created successfully'
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch',
      error: error.message
    });
  }
});

// POST /api/cv-intelligence/batch/:batchId/process - Process files for batch
router.post('/batch/:batchId/process', 
  authenticateToken,
  upload.fields([
    { name: 'jdFile', maxCount: 1 },
    { name: 'cvFiles', maxCount: 10 }
  ]),
  async (req, res) => {
    const startTime = Date.now();
    try {
      const { batchId } = req.params;
      const jdFile = req.files?.jdFile?.[0];
      const cvFiles = req.files?.cvFiles || [];

      console.log(`🚀 Processing batch ${batchId}: ${cvFiles.length} CVs`);

      if (cvFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No CV files provided'
        });
      }

      await database.connect();

      // Update batch status
      await database.run(`
        UPDATE cv_batches 
        SET status = 'processing', cv_count = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [cvFiles.length, batchId]);

      // Extract text from JD file
      let jdText = '';
      if (jdFile) {
        if (jdFile.mimetype === 'application/pdf') {
          const jdData = await pdf(jdFile.buffer);
          jdText = jdData.text;
        } else {
          jdText = jdFile.buffer.toString('utf8');
        }
        console.log(`📄 JD text extracted, length: ${jdText.length}`);
      }

      const candidates = [];
      
      // Process each CV file with PURE AI
      for (let i = 0; i < cvFiles.length; i++) {
        const cvFile = cvFiles[i];
        console.log(`📄 Processing CV ${i + 1}/${cvFiles.length}: ${cvFile.originalname}`);
        
        try {
          // Extract text from CV
          let cvText = '';
          console.log(`📄 Extracting text from ${cvFile.originalname}...`);
          
          if (cvFile.mimetype === 'application/pdf') {
            console.log('📄 Processing PDF CV...');
            const pdfData = await pdf(cvFile.buffer);
            cvText = pdfData.text;
          } else {
            console.log('📄 Processing text CV...');
            cvText = cvFile.buffer.toString('utf8');
          }
          
          console.log(`📄 CV text extracted, length: ${cvText.length}`);
          
          // PURE AI Analysis - NO FALLBACKS
          console.log(`🧠 Starting PURE AI analysis for ${cvFile.originalname}...`);
          const analysisResult = await analyzeCV(jdText, cvText, cvFile.originalname);
          
          console.log(`🧠 PURE AI analysis completed for ${cvFile.originalname}:`, {
            name: analysisResult.name,
            score: analysisResult.score,
            hasAnalysisData: !!analysisResult.analysisData
          });
          
          // Store candidate in database
          const candidateId = uuidv4();
          console.log(`💾 Storing candidate ${analysisResult.name} in database...`);
          
          const analysisData = analysisResult.analysisData || {};
          const skillsMatchedCount = analysisResult.skillsMatched?.length || 0;
          const skillsMissingCount = analysisResult.skillsMissing?.length || 0;
          const fitLevel = analysisResult.score >= 80 ? 'High' : analysisResult.score >= 60 ? 'Medium' : 'Low';
          const recommendation = analysisResult.score >= 80 ? 'Highly Recommended' : 
                               analysisResult.score >= 60 ? 'Recommended' : 'Consider';

          await database.run(`
            INSERT INTO cv_candidates (
              id, batch_id, name, email, phone, location, score, 
              skills_match, skills_missing, experience_match, education_match,
              fit_level, recommendation, strengths, weaknesses, summary, 
              cv_text, analysis_data, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP)
          `, [
            candidateId, batchId, analysisResult.name, analysisResult.email, analysisResult.phone,
            'Location not specified', analysisResult.score, skillsMatchedCount, skillsMissingCount,
            analysisResult.experienceMatch, analysisResult.educationMatch,
            fitLevel, recommendation,
            JSON.stringify(analysisResult.strengths), 
            JSON.stringify(analysisResult.weaknesses),
            analysisResult.summary, cvText,
            JSON.stringify(analysisData)
          ]);
          
          candidates.push(analysisResult);
          console.log(`✅ Successfully processed ${cvFile.originalname}: Score ${analysisResult.score}%`);
          
        } catch (error) {
          console.error(`❌ Failed to process ${cvFile.originalname}:`, error);
          console.error(`❌ Error stack:`, error.stack);
          
          // NO FALLBACK - PURE AI ONLY
          console.log('❌ Skipping failed CV - no regex fallback allowed');
          continue;
        }
      }
      
      // Update batch with results
      await database.run(`
        UPDATE cv_batches 
        SET status = 'completed', candidate_count = $1, processing_time = $2, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $3
      `, [candidates.length, Date.now() - startTime, batchId]);

      res.json({
        success: true,
        data: {
          batchId: batchId,
          processed: candidates.length,
          status: 'completed'
        },
        message: 'Files processed successfully with PURE AI'
      });
    } catch (error) {
      console.error('Process files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process files',
        error: error.message
      });
    }
  }
);

// GET /api/cv-intelligence/batch/:batchId - Get batch details
router.get('/batch/:batchId', authenticateToken, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    await database.connect();
    
    const batch = await database.get(`
      SELECT * FROM cv_batches WHERE id = $1
    `, [batchId]);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    const candidates = await database.all(`
      SELECT * FROM cv_candidates WHERE batch_id = $1 ORDER BY score DESC
    `, [batchId]);

    // Parse JSON fields for frontend
    const processedCandidates = candidates.map(candidate => {
      try {
        return {
          ...candidate,
          strengths: candidate.strengths ? JSON.parse(candidate.strengths) : [],
          weaknesses: candidate.weaknesses ? JSON.parse(candidate.weaknesses) : [],
          analysis_data: candidate.analysis_data ? JSON.parse(candidate.analysis_data) : {}
        };
      } catch (e) {
        console.error('Error parsing candidate data:', e);
        return {
          ...candidate,
          strengths: [],
          weaknesses: [],
          analysis_data: {}
        };
      }
    });

    res.json({
      success: true,
      data: {
        batch,
        candidates: processedCandidates
      },
      message: 'Batch details retrieved successfully'
    });
  } catch (error) {
    console.error('Get batch details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch details',
      error: error.message
    });
  }
});

// GET /api/cv-intelligence/batch/:batchId/candidates - Get candidates for batch
router.get('/batch/:batchId/candidates', authenticateToken, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    await database.connect();
    
    const candidates = await database.all(`
      SELECT * FROM cv_candidates WHERE batch_id = $1 ORDER BY score DESC
    `, [batchId]);

    res.json({
      success: true,
      data: candidates || [],
      message: 'Candidates retrieved successfully'
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates',
      error: error.message
    });
  }
});

console.log('✅ PURE AI CV Intelligence Routes - Module ready for export');
module.exports = router;
