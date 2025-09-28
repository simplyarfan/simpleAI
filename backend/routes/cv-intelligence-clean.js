/**
 * CV INTELLIGENCE CLEAN ROUTES - HR-01 BLUEPRINT
 * Single service, proper flow, no overlaps
 */

const express = require('express');
const database = require('../models/database');
const auth = require('../middleware/auth');
const authenticateToken = auth.authenticateToken;

// Load ONLY the clean HR-01 service
let CVIntelligenceHR01 = null;
try {
  const CVIntelligenceHR01Service = require('../services/cvIntelligenceHR01');
  CVIntelligenceHR01 = new CVIntelligenceHR01Service();
  console.log('✅ CV Intelligence HR-01 Service loaded');
} catch (error) {
  console.error('❌ Failed to load CV Intelligence HR-01 Service:', error.message);
}

// Optional multer with fallback
let multer, upload;
try {
  multer = require('multer');
  upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and DOCX files allowed'));
      }
    }
  });
} catch (e) {
  upload = {
    array: () => (req, res, next) => {
      res.status(500).json({ success: false, message: 'File upload not available' });
    }
  };
}

const router = express.Router();

// GET /api/cv-intelligence/batches - Get all batches
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

    res.json({
      success: true,
      data: batches || [],
      message: 'Batches retrieved successfully'
    });

  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve batches',
      error: error.message
    });
  }
});

// POST /api/cv-intelligence/create-batch - Create and process batch
router.post('/create-batch', authenticateToken, upload.array('cvFiles', 10), async (req, res) => {
  if (!CVIntelligenceHR01) {
    return res.status(500).json({
      success: false,
      message: 'CV Intelligence service not available'
    });
  }

  const { batchName, jobDescription, jobRequirements } = req.body;
  const files = req.files;

  if (!batchName || !jobDescription || !files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: batchName, jobDescription, or CV files'
    });
  }

  const batchId = CVIntelligenceHR01.generateId();
  const jobId = CVIntelligenceHR01.generateId();

  try {
    await database.connect();

    // Parse job requirements
    let parsedRequirements;
    try {
      parsedRequirements = typeof jobRequirements === 'string' ? 
        JSON.parse(jobRequirements) : jobRequirements || {};
    } catch (e) {
      parsedRequirements = { mustHave: [], preferred: [], experienceYears: 0 };
    }

    // Create job entry
    await database.run(`
      INSERT INTO jobs (id, user_id, title, description, requirements_json, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `, [
      jobId,
      req.user.id,
      batchName,
      jobDescription,
      JSON.stringify(parsedRequirements)
    ]);

    // Create batch
    await database.run(`
      INSERT INTO cv_batches (id, user_id, job_id, name, status, total_resumes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    `, [batchId, req.user.id, jobId, batchName, 'processing', files.length]);

    // Process each CV file
    const candidates = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📄 Processing CV ${i + 1}/${files.length}: ${file.originalname}`);

      try {
        // Process with HR-01 service
        const result = await CVIntelligenceHR01.processResume(
          file.buffer, 
          file.originalname, 
          parsedRequirements
        );

        if (result.success) {
          // Store raw resume
          await database.run(`
            INSERT INTO resumes_raw (id, user_id, filename, file_url, file_size, file_type, raw_text, processing_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            result.resumeId,
            req.user.id,
            file.originalname,
            `temp://uploaded/${result.resumeId}`,
            file.size,
            file.mimetype,
            JSON.stringify(result.structuredData),
            'completed'
          ]);

          // Store entities with offsets
          for (const entity of result.entities) {
            await database.run(`
              INSERT INTO resume_entities (resume_id, entity_type, entity_value, confidence_score, start_offset, end_offset, context_window)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              result.resumeId,
              entity.type,
              entity.value,
              entity.confidence,
              entity.startOffset,
              entity.endOffset,
              entity.contextWindow
            ]);
          }

          // Store candidate
          const candidateId = CVIntelligenceHR01.generateId();
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
            result.resumeId,
            result.structuredData.personal?.name || 'Name not found',
            result.structuredData.personal?.email || 'Email not found',
            result.structuredData.personal?.phone || 'Phone not found',
            result.structuredData.personal?.location || 'Location not specified',
            JSON.stringify(result.structuredData),
            Math.round(result.scores.mustHaveScore || 0),
            Math.round(result.scores.semanticScore || 0),
            Math.round(result.scores.recencyScore || 0),
            Math.round(result.scores.impactScore || 0),
            Math.round(result.scores.overallScore || 0),
            JSON.stringify(result.evidenceMap),
            JSON.stringify(result.verification),
            result.processingTime
          ]);

          // Store metrics
          await database.run(`
            INSERT INTO metrics_events (
              batch_id, resume_id, event_type, event_data,
              field_validity_rate, evidence_coverage, disagreement_rate
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            batchId,
            result.resumeId,
            'processing_complete',
            JSON.stringify(result.metadata),
            result.metadata.fieldValidityRate,
            result.metadata.evidenceCoverage,
            result.metadata.disagreementRate
          ]);

          candidates.push({
            id: candidateId,
            name: result.structuredData.personal?.name || 'Name not found',
            score: Math.round(result.scores.overallScore || 0),
            email: result.structuredData.personal?.email || 'Email not found'
          });

          console.log(`✅ CV ${i + 1} processed successfully`);
        } else {
          console.error(`❌ CV ${i + 1} processing failed:`, result.error);
        }
      } catch (error) {
        console.error(`❌ Error processing CV ${i + 1}:`, error.message);
      }
    }

    // Update batch status
    await database.run(`
      UPDATE cv_batches 
      SET status = $1, processed_resumes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, ['completed', candidates.length, batchId]);

    res.json({
      success: true,
      data: {
        batchId: batchId,
        jobId: jobId,
        processedCount: candidates.length,
        candidates: candidates
      },
      message: 'CV batch processed successfully with HR-01 service'
    });

  } catch (error) {
    console.error('Create batch error:', error);
    
    // Update batch status to failed
    try {
      await database.run(`
        UPDATE cv_batches 
        SET status = 'failed', updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [batchId]);
    } catch (updateError) {
      console.error('Failed to update batch status:', updateError);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process CV batch',
      error: error.message
    });
  }
});

// GET /api/cv-intelligence/batch/:id - Get batch details
router.get('/batch/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await database.connect();
    
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

    const candidates = await database.all(`
      SELECT 
        c.*,
        r.filename
      FROM candidates c
      LEFT JOIN resumes_raw r ON c.resume_id = r.id
      WHERE c.batch_id = $1
      ORDER BY c.overall_score DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        batch: {
          ...batch,
          requirements_json: batch.requirements_json ? JSON.parse(batch.requirements_json) : {}
        },
        candidates: candidates.map(candidate => ({
          ...candidate,
          profile_json: candidate.profile_json ? JSON.parse(candidate.profile_json) : {},
          evidence_offsets: candidate.evidence_offsets ? JSON.parse(candidate.evidence_offsets) : {},
          verification_data: candidate.verification_data ? JSON.parse(candidate.verification_data) : {}
        }))
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

// GET /api/cv-intelligence/candidate/:id/evidence - Get evidence for highlighting
router.get('/candidate/:id/evidence', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await database.connect();
    
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
          evidence_offsets: candidate.evidence_offsets ? JSON.parse(candidate.evidence_offsets) : {}
        },
        entities: entities,
        rawText: candidate.raw_text
      },
      message: 'Evidence retrieved successfully'
    });

  } catch (error) {
    console.error('Get evidence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve evidence',
      error: error.message
    });
  }
});

module.exports = router;
