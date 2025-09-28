const express = require('express');
const database = require('../models/database');
// Authentication middleware
const auth = require('../middleware/auth');
const authenticateToken = auth.authenticateToken;

// Optional dependencies with fallbacks
let multer, pdf, uuidv4;
try {
  multer = require('multer');
} catch (e) {
  console.warn('⚠️ multer not available');
  multer = null;
}

try {
  pdf = require('pdf-parse');
} catch (e) {
  console.warn('⚠️ pdf-parse not available');
  pdf = null;
}

try {
  const uuid = require('uuid');
  uuidv4 = uuid.v4;
} catch (e) {
  console.warn('⚠️ uuid not available, using fallback');
  uuidv4 = () => 'batch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Load CV analysis service - prioritize AI ranking service for batch processing
let CVAnalysisService = null;
try {
  const AIRankingCVAnalysisService = require('../services/cvAnalysisService-ai-ranking');
  CVAnalysisService = new AIRankingCVAnalysisService();
  console.log('✅ AI Ranking CV Analysis Service loaded successfully');
} catch (error) {
  console.error('❌ Failed to load AI Ranking CV Analysis Service:', error.message);
  console.log('📋 Falling back to professional service...');
  
  try {
    const ProfessionalCVAnalysisService = require('../services/cvAnalysisService-professional');
    CVAnalysisService = new ProfessionalCVAnalysisService();
    console.log('✅ Professional CV Analysis Service loaded as fallback');
  } catch (fallbackError) {
    console.error('❌ Failed to load fallback service:', fallbackError.message);
    console.log('⚠️ CV Intelligence will run with basic functionality only');
  }
}

// CV Analysis Function - Simplified
async function analyzeCV(jobDescription, cvText, fileName) {
  try {
    if (!CVAnalysisService) {
      throw new Error('CV Analysis Service not available. Please ensure OPENAI_API_KEY is configured.');
    }
    
    // Use the new AI ranking service
    return await CVAnalysisService.analyzeCVBatch([{
      fileName,
      text: cvText,
      fileId: Math.random().toString(36).substring(7)
    }], jobDescription);
  } catch (error) {
    console.error('❌ AI analysis failed:', error.message);
    throw new Error(`CV analysis failed: ${error.message}`);
  }
}

// Helper functions for fallback analysis
function extractNameFromText(text) {
  const nameMatch = text.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/);
  return nameMatch ? nameMatch[1] : null;
}

// Extract years of experience as integer
function extractExperienceYears(experienceText) {
  if (!experienceText || typeof experienceText !== 'string') return 0;
  
  // Look for patterns like "5 years", "10+ years", "3-5 years"
  const yearMatch = experienceText.match(/(\d+)[\+\-\s]*(?:years?|yrs?)/i);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }
  
  // Look for just numbers
  const numberMatch = experienceText.match(/(\d+)/);
  if (numberMatch) {
    const num = parseInt(numberMatch[1], 10);
    return num > 50 ? 0 : num; // Sanity check - if > 50, probably not years
  }
  
  return 0;
}

// Extract education level as integer (0-5 scale)
function extractEducationLevel(educationText) {
  if (!educationText || typeof educationText !== 'string') return 0;
  
  const text = educationText.toLowerCase();
  
  if (text.includes('phd') || text.includes('doctorate')) return 5;
  if (text.includes('master') || text.includes('msc') || text.includes('mba')) return 4;
  if (text.includes('bachelor') || text.includes('bsc') || text.includes('degree')) return 3;
  if (text.includes('diploma') || text.includes('associate')) return 2;
  if (text.includes('certificate') || text.includes('high school')) return 1;
  
  return 0;
}

function extractEmailFromText(text) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : null;
}
function extractPhoneFromText(text) {
  const phoneMatch = text.match(/\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
  return phoneMatch ? phoneMatch[0] : null;
}

// Configure multer for file uploads (if available)
let upload = null;
if (multer) {
  upload = multer({
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
        cb(new Error('Only PDF, TXT, DOC, and DOCX files are allowed'));
      }
    }
  });
} else {
  // Fallback for file upload routes
  upload = {
    array: () => (req, res, next) => {
      res.status(500).json({
        success: false,
        message: 'File upload not available - multer dependency missing'
      });
    }
  };
}

const router = express.Router();

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

// Test auth endpoint (with auth)
router.get('/test-auth', authenticateToken, (req, res) => {
  console.log('🔒 PURE AI CV Intelligence AUTH test endpoint hit!');
  console.log('🔒 User from middleware:', JSON.stringify(req.user, null, 2));
  res.json({
    success: true,
    message: 'Authentication working! User authenticated successfully.',
    timestamp: new Date().toISOString(),
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
      name: `${req.user?.first_name} ${req.user?.last_name}`
    },
    debug: {
      user_object_keys: Object.keys(req.user || {}),
      user_id_type: typeof req.user?.id,
      middleware_working: true
    }
  });
});

// Database health check endpoint
router.get('/test-db', authenticateToken, async (req, res) => {
  try {
    console.log('🗄️ Testing database connection and tables...');
    
    await database.connect();
    
    // Test basic connection
    const timeTest = await database.get('SELECT NOW() as current_time');
    console.log('✅ Database connection test:', timeTest.current_time);
    
    // Test cv_batches table exists and is accessible
    const batchesTableTest = await database.get(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'cv_batches'
    `);
    console.log('✅ cv_batches table exists:', batchesTableTest.count > 0);
    
    // Test cv_candidates table exists and is accessible
    const candidatesTableTest = await database.get(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'cv_candidates'
    `);
    console.log('✅ cv_candidates table exists:', candidatesTableTest.count > 0);
    
    // Test sample query on cv_batches
    const sampleBatches = await database.all(`
      SELECT id, name, status, user_id, created_at 
      FROM cv_batches 
      LIMIT 5
    `);
    console.log('✅ Sample batches query successful, found:', sampleBatches.length);
    
    // Test user-specific query
    const userBatches = await database.all(`
      SELECT id, name, status, cv_count, candidate_count, created_at 
      FROM cv_batches 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 3
    `, [req.user.id]);
    console.log('✅ User-specific batches query successful, found:', userBatches.length);
    
    res.json({
      success: true,
      message: 'Database health check passed!',
      data: {
        database_connected: true,
        cv_batches_table_exists: batchesTableTest.count > 0,
        cv_candidates_table_exists: candidatesTableTest.count > 0,
        total_batches_in_system: sampleBatches.length,
        user_batches_count: userBatches.length,
        user_batches: userBatches,
        current_time: timeTest.current_time
      }
    });
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database health check failed',
      error: error.message,
      debug: {
        error_name: error.name,
        error_code: error.code,
        error_detail: error.detail
      }
    });
  }
});

// GET /api/cv-intelligence/batches - Get all batches for user
router.get('/batches', authenticateToken, async (req, res) => {
  try {
    console.log('📊 [BATCHES] === DEBUGGING BATCHES ENDPOINT ===');
    console.log('📊 [BATCHES] Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('📊 [BATCHES] Auth header:', req.headers.authorization || req.headers.Authorization);
    console.log('📊 [BATCHES] User object from middleware:', JSON.stringify(req.user, null, 2));
    console.log('📊 [BATCHES] User ID:', req.user?.id);
    console.log('📊 [BATCHES] User ID type:', typeof req.user?.id);
    console.log('📊 [BATCHES] User role:', req.user?.role);
    
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
    console.log('🎯 Request body:', req.body);
    console.log('🎯 Request body type:', typeof req.body);
    console.log('🎯 Request headers:', req.headers);
    
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

      // Extract text from JD file with robust error handling
      let jdText = '';
      if (jdFile) {
        try {
          if (jdFile.mimetype === 'application/pdf') {
            console.log('📄 Parsing JD PDF...');
            const jdData = await pdf(jdFile.buffer);
            jdText = jdData.text;
          } else {
            jdText = jdFile.buffer.toString('utf8');
          }
          console.log(`📄 JD text extracted, length: ${jdText.length}`);
        } catch (pdfError) {
          console.error('❌ JD PDF parsing failed:', pdfError.message);
          // Use filename as fallback for JD
          jdText = `Job Description from file: ${jdFile.originalname}. PDF parsing failed - please provide text format for better analysis.`;
          console.log('⚠️ Using fallback JD text');
        }
      }

      // Extract text from all CV files first
      const cvFilesData = [];
      
      for (let i = 0; i < cvFiles.length; i++) {
        const cvFile = cvFiles[i];
        console.log(`📄 Processing CV ${i + 1}/${cvFiles.length}: ${cvFile.originalname}`);
        
        try {
          let cvText = '';
          
          if (cvFile.mimetype === 'application/pdf') {
            console.log('📄 Processing PDF CV...');
            const pdfData = await pdf(cvFile.buffer);
            cvText = pdfData.text;
          } else {
            console.log('📄 Processing text CV...');
            cvText = cvFile.buffer.toString('utf8');
          }
          
          console.log(`📄 CV text extracted, length: ${cvText.length}`);
          
          // Check if we got meaningful text
          if (!cvText || cvText.trim().length < 50) {
            throw new Error('Insufficient text extracted from PDF');
          }
          
          cvFilesData.push({
            fileName: cvFile.originalname,
            text: cvText,
            fileId: uuidv4()
          });
          
        } catch (pdfError) {
          console.error(`❌ PDF parsing failed for ${cvFile.originalname}:`, pdfError.message);
          
          // Create fallback text with filename info
          const cleanName = cvFile.originalname.replace(/\.(pdf|doc|docx)$/i, '').replace(/[_-]/g, ' ');
          const fallbackText = `CV for ${cleanName}. 
          
          Note: PDF parsing failed due to format issues. This CV contains:
          - Candidate name: ${cleanName}
          - File type: ${cvFile.mimetype}
          - File size: ${(cvFile.size / 1024).toFixed(1)}KB
          
          For better analysis, please provide this CV in text format or a different PDF format.
          The AI will still attempt to analyze based on the filename and available information.`;
          
          cvFilesData.push({
            fileName: cvFile.originalname,
            text: fallbackText,
            fileId: uuidv4()
          });
          
          console.log(`⚠️ Using fallback text for ${cvFile.originalname}`);
        }
      }
      
      // AI BATCH ANALYSIS AND RANKING
      console.log(`🤖 Starting AI batch analysis and ranking for ${cvFilesData.length} candidates...`);
      
      if (!CVAnalysisService || typeof CVAnalysisService.analyzeCVBatch !== 'function') {
        throw new Error('CV Analysis Service not available or analyzeCVBatch method missing');
      }
      
      const aiRankingResult = await CVAnalysisService.analyzeCVBatch(cvFilesData, jdText);
      
      console.log('🏆 AI Ranking Results:', {
        candidatesCount: aiRankingResult.candidates?.length || 0,
        overallAssessment: aiRankingResult.overall_assessment
      });
      
      // Store ranked candidates in database
      const candidates = [];
      for (const rankedCandidate of aiRankingResult.candidates) {
        const candidateId = uuidv4();
        console.log(`💾 Storing ranked candidate #${rankedCandidate.rank}: ${rankedCandidate.basicInfo.name}`);
        
        const aiAnalysis = rankedCandidate.aiAnalysis;
        const basicInfo = rankedCandidate.basicInfo;

          // Extract data from new professional analysis structure
          const analysis = rankedCandidate.ai_analysis || {};
          const personalInfo = analysis.personal_info || {};
          const skills = analysis.skills || {};
          const experience = analysis.experience || {};
          const education = analysis.education || {};
          const analysisData = analysis.analysis || {};

          await database.run(`
            INSERT INTO cv_candidates (
              id, batch_id, name, email, phone, location, score, 
              skills_match, skills_missing, experience_match, education_match,
              fit_level, recommendation, strengths, weaknesses, summary, 
              cv_text, analysis_data, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP)
          `, [
            candidateId, 
            batchId, 
            personalInfo.name || 'Name not found',
            personalInfo.email || 'Email not found', 
            personalInfo.phone || 'Phone not found',
            personalInfo.location || 'Location not specified', 
            100 - (rankedCandidate.ai_rank * 10), // Convert rank to score (rank 1 = 90, rank 2 = 80, etc)
            skills.matched_required?.length || 0,
            skills.missing_required?.length || 0,
            extractExperienceYears(experience.total_years || '0'),
            extractEducationLevel(education.highest_degree || ''),
            analysisData.recommendation || 'Review Required',
            analysisData.recommendation || 'Review Required',
            JSON.stringify(analysisData.strengths || []), 
            JSON.stringify([]), // No weaknesses in new structure
            analysisData.professional_summary || rankedCandidate.ranking_reason || 'AI analysis completed',
            rankedCandidate.cvText || '',
            JSON.stringify({
              ai_analysis: analysis,
              rank: rankedCandidate.ai_rank,
              ranking_reason: rankedCandidate.ranking_reason,
              personal_info: personalInfo,
              skills: skills,
              experience: experience,
              education: education,
              university: education.university,
              degree: education.highest_degree,
              all_skills: skills.all_skills,
              matched_skills: skills.matched_required,
              missing_skills: skills.missing_required,
              additional_skills: skills.additional_valuable
            })
          ]);
          
          candidates.push({
            id: candidateId,
            name: basicInfo.name || 'Name not found',
            rank: rankedCandidate.rank,
            recommendation: rankedCandidate.recommendation,
            ai_analysis: aiAnalysis
          });
          
          console.log(`✅ Stored ranked candidate #${rankedCandidate.rank}: ${basicInfo.name}`);
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
        const analysisData = candidate.analysis_data ? JSON.parse(candidate.analysis_data) : {};
        return {
          ...candidate,
          strengths: candidate.strengths ? JSON.parse(candidate.strengths) : [],
          weaknesses: candidate.weaknesses ? JSON.parse(candidate.weaknesses) : [],
          analysis_data: analysisData,
          // Fix skills count display - frontend expects these field names
          skillsMatched: analysisData.match_analysis?.skills_matched || [],
          skillsMissing: analysisData.match_analysis?.skills_missing || [],
          skills_matched: (analysisData.match_analysis?.skills_matched || []).length,
          skills_missing: (analysisData.match_analysis?.skills_missing || []).length
        };
      } catch (e) {
        console.error('Error parsing candidate data:', e);
        return {
          ...candidate,
          strengths: [],
          weaknesses: [],
          analysis_data: {},
          skillsMatched: [],
          skillsMissing: [],
          skills_matched: 0,
          skills_missing: 0
        };
      }
    });

    // OPENAI INTELLIGENT RANKING
    let rankedCandidates = processedCandidates;
    if (CVAnalysisService && batch.job_description && processedCandidates.length > 1) {
      try {
        console.log('🧠 Applying OpenAI intelligent ranking...');
        rankedCandidates = await CVAnalysisService.rankCandidatesWithAI(processedCandidates, batch.job_description);
        console.log('✅ OpenAI ranking applied successfully');
      } catch (error) {
        console.error('❌ OpenAI ranking failed, using score-based ranking:', error.message);
        rankedCandidates = processedCandidates.sort((a, b) => b.score - a.score);
      }
    }

    res.json({
      success: true,
      data: {
        batch,
        candidates: rankedCandidates
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
// DELETE /api/cv-intelligence/batch/:batchId - Delete a batch and its candidates
router.delete('/batch/:batchId', authenticateToken, async (req, res) => {
  try {
    const { batchId } = req.params;

    await database.connect();

    // Verify ownership
    const batch = await database.get(`
      SELECT * FROM cv_batches WHERE id = $1 AND user_id = $2
    `, [batchId, req.user.id]);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or not authorized'
      });
    }

    // Delete child records first (candidates), then batch
    await database.run(`
      DELETE FROM cv_candidates WHERE batch_id = $1
    `, [batchId]);

    await database.run(`
      DELETE FROM cv_batches WHERE id = $1
    `, [batchId]);

    return res.json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    console.error('Delete batch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete batch',
      error: error.message
    });
  }
});

module.exports = router;
