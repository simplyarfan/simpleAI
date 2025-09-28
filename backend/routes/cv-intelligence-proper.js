/**
 * CV INTELLIGENCE ROUTES (HR-01) - PROPER IMPLEMENTATION
 * Using Neon Postgres + Pydantic JSON schema + spaCy + pgvector
 */

const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');
const auth = require('../middleware/auth');
const authenticateToken = auth.authenticateToken;

// Load the proper CV Intelligence service
let CVIntelligenceService = null;
try {
  const CVIntelligenceProperService = require('../services/cvIntelligenceProper');
  CVIntelligenceService = new CVIntelligenceProperService();
  console.log('✅ CV Intelligence Proper Service loaded successfully');
} catch (error) {
  console.error('❌ Failed to load CV Intelligence Proper Service:', error.message);
}

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// GET /api/cv-intelligence/batches - Get all CV batches
router.get('/batches', authenticateToken, async (req, res) => {
  try {
    await database.connect();
    
    const batches = await database.all(`
      SELECT 
        b.*,
        j.title as job_title,
        j.description as job_description,
        COUNT(c.id) as candidate_count
      FROM cv_batches b
      LEFT JOIN jobs j ON b.job_id = j.id
      LEFT JOIN candidates c ON b.id = c.batch_id
      WHERE b.user_id = $1
      GROUP BY b.id, j.title, j.description
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    // Get candidates for each batch
    for (let batch of batches) {
      const candidates = await database.all(`
        SELECT 
          id, name, email, phone, overall_score, must_have_score,
          semantic_score, profile_json
        FROM candidates 
        WHERE batch_id = $1 
        ORDER BY overall_score DESC
      `, [batch.id]);
      
      batch.candidates = candidates;
    }

    res.json({
      success: true,
      data: batches,
      message: 'CV batches retrieved successfully'
    });

  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve CV batches',
      error: error.message
    });
  }
});

// POST /api/cv-intelligence/create-batch - Create new CV analysis batch
router.post('/create-batch', authenticateToken, upload.array('cvFiles', 10), async (req, res) => {
  try {
    const { batchName, jobDescription, jobRequirements } = req.body;
    const files = req.files;

    if (!batchName || !jobDescription || !files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: batchName, jobDescription, or CV files'
      });
    }

    if (!CVIntelligenceService) {
      throw new Error('CV Intelligence Service not available');
    }

    await database.connect();

    // Parse job requirements
    let parsedRequirements;
    try {
      parsedRequirements = typeof jobRequirements === 'string' ? 
        JSON.parse(jobRequirements) : jobRequirements;
    } catch (e) {
      parsedRequirements = {
        must_have: [],
        preferred: [],
        experience_years: 0
      };
    }

    // Create job entry
    const jobId = uuidv4();
    const jobEmbedding = await CVIntelligenceService.generateEmbedding(jobDescription);
    
    await database.run(`
      INSERT INTO jobs (id, user_id, title, description, requirements_json, embedding)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      jobId,
      req.user.id,
      batchName,
      jobDescription,
      JSON.stringify(parsedRequirements),
      jobEmbedding ? `[${jobEmbedding.join(',')}]` : null
    ]);

    // Create batch
    const batchId = uuidv4();
    await database.run(`
      INSERT INTO cv_batches (id, user_id, job_id, name, total_resumes, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [batchId, req.user.id, jobId, batchName, files.length, 'processing']);

    // Process each CV file
    const processingPromises = files.map(async (file, index) => {
      try {
        console.log(`📄 Processing CV ${index + 1}/${files.length}: ${file.originalname}`);

        // Extract text from PDF
        let cvText = '';
        if (file.mimetype === 'application/pdf') {
          const pdfData = await pdf(file.buffer);
          cvText = pdfData.text;
        } else {
          // For DOCX, you'd use a library like mammoth
          cvText = 'DOCX parsing not implemented yet';
        }

        // Store raw resume
        const resumeId = uuidv4();
        await database.run(`
          INSERT INTO resumes_raw (id, user_id, filename, file_url, file_size, file_type, raw_text, processing_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          resumeId,
          req.user.id,
          file.originalname,
          `temp://uploaded/${resumeId}`, // In real app, upload to Supabase Storage
          file.size,
          file.mimetype,
          cvText,
          'processing'
        ]);

        // Process with AI service
        const processingResult = await CVIntelligenceService.processResumeComplete(
          cvText, 
          parsedRequirements
        );

        if (processingResult.success) {
          // Store entities with offsets
          for (const entity of processingResult.entities) {
            await database.run(`
              INSERT INTO resume_entities (
                resume_id, entity_type, entity_value, confidence_score,
                start_offset, end_offset, context_window
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              resumeId,
              entity.type,
              entity.value,
              entity.confidence,
              entity.start_offset,
              entity.end_offset,
              entity.context_window || null
            ]);
          }

          // Store candidate profile
          const candidateId = uuidv4();
          await database.run(`
            INSERT INTO candidates (
              id, batch_id, resume_id, name, email, phone, location,
              profile_json, must_have_score, semantic_score, recency_score,
              impact_score, overall_score, evidence_offsets, verification_data,
              processing_time_ms
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          `, [
            candidateId,
            batchId,
            resumeId,
            processingResult.profile.personal?.name || 'Name not found',
            processingResult.profile.personal?.email || 'Email not found',
            processingResult.profile.personal?.phone || 'Phone not found',
            processingResult.profile.personal?.location || 'Location not specified',
            JSON.stringify(processingResult.profile),
            processingResult.scores.must_have_score,
            processingResult.scores.semantic_score,
            processingResult.scores.recency_score,
            processingResult.scores.impact_score,
            processingResult.scores.overall_score,
            JSON.stringify(processingResult.entities),
            JSON.stringify(processingResult.verification),
            Date.now() - processingResult.processing_metadata.processing_time
          ]);

          // Store metrics event
          await database.run(`
            INSERT INTO metrics_events (
              batch_id, resume_id, event_type, event_data,
              field_validity_rate, evidence_coverage, disagreement_rate
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            batchId,
            resumeId,
            'processing_complete',
            JSON.stringify(processingResult.processing_metadata),
            processingResult.processing_metadata.field_validity_rate,
            processingResult.processing_metadata.evidence_coverage,
            processingResult.processing_metadata.disagreement_rate
          ]);

          console.log(`✅ CV ${index + 1} processed successfully`);
        } else {
          console.error(`❌ CV ${index + 1} processing failed:`, processingResult.error);
        }

        // Update resume status
        await database.run(`
          UPDATE resumes_raw 
          SET processing_status = $1 
          WHERE id = $2
        `, [processingResult.success ? 'completed' : 'failed', resumeId]);

      } catch (error) {
        console.error(`❌ Error processing CV ${index + 1}:`, error.message);
      }
    });

    // Wait for all CVs to be processed
    await Promise.all(processingPromises);

    // Update batch status
    await database.run(`
      UPDATE cv_batches 
      SET status = $1, processing_completed_at = CURRENT_TIMESTAMP,
          processed_resumes = total_resumes
      WHERE id = $2
    `, ['completed', batchId]);

    res.json({
      success: true,
      data: {
        batch_id: batchId,
        job_id: jobId,
        processed_count: files.length
      },
      message: 'CV batch created and processed successfully'
    });

  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create CV batch',
      error: error.message
    });
  }
});

// GET /api/cv-intelligence/batch/:id - Get batch details with candidates
router.get('/batch/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await database.connect();
    
    // Get batch with job details
    const batch = await database.get(`
      SELECT 
        b.*,
        j.title as job_title,
        j.description as job_description,
        j.requirements_json
      FROM cv_batches b
      LEFT JOIN jobs j ON b.job_id = j.id
      WHERE b.id = $1 AND b.user_id = $2
    `, [id, req.user.id]);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Get candidates with full profiles
    const candidates = await database.all(`
      SELECT 
        c.*,
        r.filename,
        r.raw_text
      FROM candidates c
      LEFT JOIN resumes_raw r ON c.resume_id = r.id
      WHERE c.batch_id = $1
      ORDER BY c.overall_score DESC
    `, [id]);

    // Parse JSON fields
    const processedCandidates = candidates.map(candidate => ({
      ...candidate,
      profile_json: candidate.profile_json ? JSON.parse(candidate.profile_json) : {},
      evidence_offsets: candidate.evidence_offsets ? JSON.parse(candidate.evidence_offsets) : [],
      verification_data: candidate.verification_data ? JSON.parse(candidate.verification_data) : {}
    }));

    // Get batch metrics
    const metrics = await database.get(`
      SELECT 
        AVG(field_validity_rate) as avg_field_validity,
        AVG(evidence_coverage) as avg_evidence_coverage,
        AVG(disagreement_rate) as avg_disagreement_rate,
        COUNT(*) as total_events
      FROM metrics_events 
      WHERE batch_id = $1
    `, [id]);

    res.json({
      success: true,
      data: {
        batch: {
          ...batch,
          requirements_json: batch.requirements_json ? JSON.parse(batch.requirements_json) : {}
        },
        candidates: processedCandidates,
        metrics: metrics || {}
      },
      message: 'Batch details retrieved successfully'
    });

  } catch (error) {
    console.error('Get batch details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve batch details',
      error: error.message
    });
  }
});

// GET /api/cv-intelligence/candidate/:id/evidence - Get evidence highlights for candidate
router.get('/candidate/:id/evidence', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await database.connect();
    
    // Get candidate with evidence
    const candidate = await database.get(`
      SELECT c.*, r.raw_text, r.filename
      FROM candidates c
      LEFT JOIN resumes_raw r ON c.resume_id = r.id
      WHERE c.id = $1
    `, [id]);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Get all entities with offsets
    const entities = await database.all(`
      SELECT *
      FROM resume_entities
      WHERE resume_id = $1
      ORDER BY start_offset
    `, [candidate.resume_id]);

    res.json({
      success: true,
      data: {
        candidate: {
          ...candidate,
          profile_json: candidate.profile_json ? JSON.parse(candidate.profile_json) : {},
          evidence_offsets: candidate.evidence_offsets ? JSON.parse(candidate.evidence_offsets) : []
        },
        entities: entities,
        raw_text: candidate.raw_text
      },
      message: 'Candidate evidence retrieved successfully'
    });

  } catch (error) {
    console.error('Get candidate evidence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve candidate evidence',
      error: error.message
    });
  }
});

// DELETE /api/cv-intelligence/batch/:id - Delete batch and all related data
router.delete('/batch/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await database.connect();
    
    // Verify ownership
    const batch = await database.get(`
      SELECT * FROM cv_batches WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or not authorized'
      });
    }

    // Delete in correct order (foreign key constraints)
    await database.run('DELETE FROM metrics_events WHERE batch_id = $1', [id]);
    await database.run('DELETE FROM candidates WHERE batch_id = $1', [id]);
    
    // Get resume IDs to delete entities
    const resumes = await database.all(`
      SELECT r.id FROM resumes_raw r
      JOIN candidates c ON r.id = c.resume_id
      WHERE c.batch_id = $1
    `, [id]);
    
    for (const resume of resumes) {
      await database.run('DELETE FROM resume_entities WHERE resume_id = $1', [resume.id]);
      await database.run('DELETE FROM resumes_raw WHERE id = $1', [resume.id]);
    }
    
    await database.run('DELETE FROM cv_batches WHERE id = $1', [id]);
    await database.run('DELETE FROM jobs WHERE id = $1', [batch.job_id]);

    res.json({
      success: true,
      message: 'Batch deleted successfully'
    });

  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete batch',
      error: error.message
    });
  }
});

// GET /api/cv-intelligence/analytics - Get CV Intelligence analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    await database.connect();
    
    const analytics = await database.get(`
      SELECT 
        COUNT(DISTINCT b.id) as total_batches,
        COUNT(DISTINCT c.id) as total_candidates,
        AVG(c.overall_score) as avg_overall_score,
        AVG(m.field_validity_rate) as avg_field_validity,
        AVG(m.evidence_coverage) as avg_evidence_coverage,
        AVG(m.disagreement_rate) as avg_disagreement_rate
      FROM cv_batches b
      LEFT JOIN candidates c ON b.id = c.batch_id
      LEFT JOIN metrics_events m ON b.id = m.batch_id
      WHERE b.user_id = $1
    `, [req.user.id]);

    res.json({
      success: true,
      data: analytics || {},
      message: 'Analytics retrieved successfully'
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
});

module.exports = router;
