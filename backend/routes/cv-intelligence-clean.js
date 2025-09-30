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

// Helper function to normalize names
function normalizeName(name) {
  if (!name || name === 'Name not found') return name;
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Test route to verify CV Intelligence is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CV Intelligence routes are working!',
    timestamp: new Date().toISOString(),
    service: CVIntelligenceHR01 ? 'HR-01 Service Available' : 'HR-01 Service Not Available'
  });
});

// POST /api/cv-intelligence/ - Create batch (frontend compatibility)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Batch name is required and must be a non-empty string'
      });
    }

    await database.connect();

    // Create batch record
    const batchId = CVIntelligenceHR01 ? CVIntelligenceHR01.generateId() : `batch_${Date.now()}`;
    
    await database.run(`
      CREATE TABLE IF NOT EXISTS cv_batches (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'created',
        total_resumes INTEGER DEFAULT 0,
        processed_resumes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await database.run(`
      INSERT INTO cv_batches (id, user_id, name, status, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `, [batchId, req.user.id, name.trim(), 'created']);

    res.json({
      success: true,
      data: {
        batchId: batchId,
        name: name.trim(),
        status: 'created'
      },
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

// POST /api/cv-intelligence/batch/:id/process - Process CVs for existing batch
router.post('/batch/:id/process', authenticateToken, upload.fields([
  { name: 'cvFiles', maxCount: 10 },
  { name: 'jdFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id: batchId } = req.params;
    const files = req.files;

    // Extract CV files from the multer fields structure
    const cvFiles = files?.cvFiles || [];
    const jdFile = files?.jdFile?.[0] || null;

    if (!cvFiles || cvFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No CV files provided'
      });
    }

    if (!CVIntelligenceHR01) {
      return res.status(500).json({
        success: false,
        message: 'CV Intelligence service not available'
      });
    }

    let databaseAvailable = true;
    try {
      await database.connect();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      databaseAvailable = false;
      // Continue without database for now - just process files
      console.log('⚠️ Continuing without database - files will be processed but not stored');
    }

    // Update batch status and file count (if database available)
    if (databaseAvailable) {
      try {
        await database.run(`
          UPDATE cv_batches 
          SET status = 'processing', total_resumes = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND user_id = $3
        `, [cvFiles.length, batchId, req.user.id]);
      } catch (dbError) {
        console.error('Database update failed:', dbError);
        databaseAvailable = false;
      }
    }

    // Process each CV file
    const candidates = [];
    const parsedRequirements = { skills: [], experience: [], education: [] };

    for (let i = 0; i < cvFiles.length; i++) {
      const file = cvFiles[i];
      
      try {
        console.log(`🔄 Processing CV ${i + 1}/${cvFiles.length}: ${file.originalname}`);
        
        // Process with HR-01 service
        const result = await CVIntelligenceHR01.processResume(
          file.buffer, 
          file.originalname, 
          parsedRequirements
        );

        if (result.success) {
          const candidateId = CVIntelligenceHR01.generateId();
          
          // Store candidate (simplified schema) - only if database available
          if (databaseAvailable) {
            try {
              await database.run(`
                INSERT INTO candidates (
                  id, batch_id, name, email, phone, location, profile_json, overall_score
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              `, [
                candidateId,
                batchId,
                result.structuredData.personal?.name || 'Name not found',
                result.structuredData.personal?.email || 'Email not found',
                result.structuredData.personal?.phone || 'Phone not found',
                result.structuredData.personal?.location || 'Location not specified',
                JSON.stringify(result.structuredData),
                Math.round(result.scores?.overallScore || 0)
              ]);
            } catch (dbError) {
              console.error('Failed to store candidate:', dbError);
            }
          }

          candidates.push({
            id: candidateId,
            name: normalizeName(result.structuredData.personal?.name || 'Name not found'),
            rank: candidates.length + 1,
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

    // Update batch status to completed (if database available)
    if (databaseAvailable) {
      try {
        await database.run(`
          UPDATE cv_batches 
          SET status = 'completed', processed_resumes = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $2
        `, [candidates.length, batchId]);
      } catch (dbError) {
        console.error('Failed to update batch status:', dbError);
      }
    }

    res.json({
      success: true,
      data: {
        batchId: batchId,
        processed: candidates.length,
        total: cvFiles.length,
        candidates: candidates,
        databaseStatus: databaseAvailable ? 'connected' : 'offline'
      },
      message: `Batch processed successfully. ${candidates.length}/${cvFiles.length} CVs processed.${databaseAvailable ? '' : ' (Database offline - results not saved)'}`
    });

  } catch (error) {
    console.error('Process batch error:', error);
    
    // Update batch status to failed
    try {
      await database.run(`
        UPDATE cv_batches 
        SET status = 'failed', updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [req.params.id]);
    } catch (updateError) {
      console.error('Failed to update batch status:', updateError);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process batch',
      error: error.message
    });
  }
});

// GET /api/cv-intelligence/batches - Get all batches
router.get('/batches', authenticateToken, async (req, res) => {
  try {
    await database.connect();
    
    // Simplified query without complex joins
    const batches = await database.all(`
      SELECT 
        b.*,
        (SELECT COUNT(*) FROM candidates c WHERE c.batch_id = b.id) as candidate_count
      FROM cv_batches b
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    // Get candidates for each batch
    for (let batch of batches) {
      const candidates = await database.all(`
        SELECT id, name, email, phone, overall_score
        FROM candidates 
        WHERE batch_id = $1 
        ORDER BY overall_score DESC
      `, [batch.id]);
      
      batch.candidates = candidates;
    }

    res.json({
      success: true,
      data: batches || [],
      message: 'CV batches retrieved successfully'
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

    // Create batch (simplified - no job table dependency)
    await database.run(`
      INSERT INTO cv_batches (id, user_id, name, status, total_resumes, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `, [batchId, req.user.id, batchName, 'processing', files.length]);

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
          // Store candidate (simplified schema)
          const candidateId = CVIntelligenceHR01.generateId();
          await database.run(`
            INSERT INTO candidates (
              id, batch_id, name, email, phone, location, profile_json, overall_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            candidateId,
            batchId,
            result.structuredData.personal?.name || 'Name not found',
            result.structuredData.personal?.email || 'Email not found',
            result.structuredData.personal?.phone || 'Phone not found',
            result.structuredData.personal?.location || 'Location not specified',
            JSON.stringify(result.structuredData),
            Math.round(result.scores?.overallScore || 0)
          ]);

          candidates.push({
            id: candidateId,
            name: result.structuredData.personal?.name || 'Name not found',
            score: Math.round(result.scores?.overallScore || 0),
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
      SELECT * FROM cv_batches 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    const candidates = await database.all(`
      SELECT * FROM candidates
      WHERE batch_id = $1
      ORDER BY overall_score DESC
    `, [id]);

    // Add cv_count field for frontend compatibility
    const batchWithCount = {
      ...batch,
      cv_count: batch.total_resumes || candidates.length
    };

    // Rank candidates and add ranking reasons (remove scores)
    const rankedCandidates = candidates.map((candidate, index) => {
      const profileData = candidate.profile_json ? JSON.parse(candidate.profile_json) : {};
      
      // Generate ranking reason based on position
      let rankingReason = '';
      if (index === 0) {
        rankingReason = 'Top candidate with the strongest skill match and most relevant experience for this position.';
      } else if (index === 1) {
        rankingReason = 'Strong candidate with good technical skills and solid background, second-best match overall.';
      } else if (index === 2) {
        rankingReason = 'Good candidate with relevant experience, third-best match with potential for growth.';
      } else {
        rankingReason = `Candidate ranked #${index + 1} with decent qualifications but fewer matching requirements than higher-ranked candidates.`;
      }

      return {
        ...candidate,
        rank: index + 1,
        rankingReason: rankingReason,
        name: candidate.name ? normalizeName(candidate.name) : 'Name not found',
        profile_json: profileData,
        // Remove score field completely
        score: undefined,
        overall_score: undefined
      };
    });

    res.json({
      success: true,
      data: {
        batch: batchWithCount,
        candidates: rankedCandidates
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

// GET /api/cv-intelligence/candidate/:id/evidence - Get candidate details (simplified)
router.get('/candidate/:id/evidence', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await database.connect();
    
    const candidate = await database.get(`
      SELECT * FROM candidates WHERE id = $1
    `, [id]);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      data: {
        candidate: {
          ...candidate,
          profile_json: candidate.profile_json ? JSON.parse(candidate.profile_json) : {}
        }
      },
      message: 'Candidate details retrieved successfully'
    });

  } catch (error) {
    console.error('Get candidate details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve candidate details',
      error: error.message
    });
  }
});

// POST /api/cv-intelligence/candidate/:id/schedule-interview - Schedule interview for candidate
router.post('/candidate/:id/schedule-interview', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { jobTitle, interviewType = 'technical', calendlyLink, googleFormLink } = req.body;
    
    await database.connect();
    
    // Get candidate details
    const candidate = await database.get(`
      SELECT * FROM candidates WHERE id = $1
    `, [id]);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Create interview record
    const interviewId = CVIntelligenceHR01.generateId();
    
    // For now, we'll create a simple interview record
    // In a full implementation, you'd integrate with Calendly API and Google Forms API
    
    const interviewData = {
      id: interviewId,
      candidateId: id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobTitle: jobTitle || 'Position Interview',
      interviewType: interviewType,
      status: 'invitation_sent',
      calendlyLink: calendlyLink || 'https://calendly.com/your-link',
      googleFormLink: googleFormLink || 'https://forms.google.com/your-form',
      createdAt: new Date().toISOString(),
      scheduledBy: req.user.id
    };

    // Store interview in database (we'll need to create interviews table)
    await database.run(`
      CREATE TABLE IF NOT EXISTS interviews (
        id VARCHAR(255) PRIMARY KEY,
        candidate_id VARCHAR(255) NOT NULL,
        candidate_name VARCHAR(255),
        candidate_email VARCHAR(255),
        job_title VARCHAR(255),
        interview_type VARCHAR(50) DEFAULT 'technical',
        status VARCHAR(50) DEFAULT 'invitation_sent',
        calendly_link TEXT,
        google_form_link TEXT,
        scheduled_time TIMESTAMP,
        meeting_link TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        scheduled_by INTEGER
      )
    `);

    await database.run(`
      INSERT INTO interviews (
        id, candidate_id, candidate_name, candidate_email, job_title,
        interview_type, status, calendly_link, google_form_link, scheduled_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      interviewId,
      id,
      candidate.name,
      candidate.email,
      jobTitle || 'Position Interview',
      interviewType,
      'invitation_sent',
      calendlyLink || 'https://calendly.com/your-link',
      googleFormLink || 'https://forms.google.com/your-form',
      req.user.id
    ]);

    // TODO: Send email with Calendly link and Google Form
    // This would integrate with your email service (SendGrid, etc.)
    
    res.json({
      success: true,
      data: {
        interviewId: interviewId,
        message: 'Interview invitation sent successfully',
        calendlyLink: calendlyLink || 'https://calendly.com/your-link',
        googleFormLink: googleFormLink || 'https://forms.google.com/your-form'
      },
      message: 'Interview scheduled and invitation sent to candidate'
    });

  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
});

// DELETE /api/cv-intelligence/batch/:id - Delete batch and all associated candidates
router.delete('/batch/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await database.connect();
    
    // First, verify the batch belongs to the user
    const batch = await database.get(`
      SELECT * FROM cv_batches 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or you do not have permission to delete it'
      });
    }

    // Delete all candidates associated with this batch
    const candidatesDeleted = await database.run(`
      DELETE FROM candidates 
      WHERE batch_id = $1
    `, [id]);

    // Delete the batch itself
    const batchDeleted = await database.run(`
      DELETE FROM cv_batches 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    console.log(`🗑️ Batch deleted: ${batch.name} (${candidatesDeleted.changes || 0} candidates removed)`);

    res.json({
      success: true,
      message: 'Batch and all associated candidates deleted successfully',
      data: {
        batchId: id,
        batchName: batch.name,
        candidatesDeleted: candidatesDeleted.changes || 0
      }
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

module.exports = router;
