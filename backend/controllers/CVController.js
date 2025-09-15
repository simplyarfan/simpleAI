const database = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', 'cv_batches');
    // Create directory if it doesn't exist
    fs.mkdir(uploadPath, { recursive: true }).then(() => {
      cb(null, uploadPath);
    }).catch(err => {
      console.error('Error creating upload directory:', err);
      cb(err);
    });
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 50 // Maximum 50 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX, PNG, JPG, JPEG files
    const allowedTypes = /\.(pdf|doc|docx|png|jpg|jpeg)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PNG, JPG, JPEG files are allowed.'));
    }
  }
});

class CVController {
  // Create new CV analysis batch
  static async createBatch(req, res) {
    try {
      const { batchName } = req.body;
      const cvFiles = req.files?.cvFiles || [];
      const jdFiles = req.files?.jdFile || [];

      if (!batchName || !batchName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Batch name is required'
        });
      }

      if (cvFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one CV file is required'
        });
      }

      if (jdFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Job description file is required'
        });
      }

      const batchId = uuidv4();
      const startTime = Date.now();

      // Create batch record
      await database.run(`
        INSERT INTO cv_batches (id, name, user_id, status, cv_count, jd_count)
        VALUES ($1, $2, $3, 'processing', $4, $5) RETURNING id
      `, [batchId, batchName.trim(), req.user.id, cvFiles.length, jdFiles.length]);

      // Track agent usage
      await database.run(`
        INSERT INTO agent_usage_stats (user_id, agent_id, usage_count, total_time_spent, date)
        VALUES ($1, 'cv_intelligence', 
          COALESCE((SELECT usage_count FROM agent_usage_stats WHERE user_id = $2 AND agent_id = 'cv_intelligence' AND date = CURRENT_DATE), 0) + 1,
          COALESCE((SELECT total_time_spent FROM agent_usage_stats WHERE user_id = $3 AND agent_id = 'cv_intelligence' AND date = CURRENT_DATE), 0),
          CURRENT_DATE
        )
        ON CONFLICT (user_id, agent_id, date) 
        DO UPDATE SET 
          usage_count = agent_usage_stats.usage_count + 1,
          updated_at = CURRENT_TIMESTAMP
      `, [req.user.id, req.user.id, req.user.id]);

      // Track analytics
      await database.run(`
        INSERT INTO user_analytics (user_id, action, agent_id, metadata, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [
        req.user.id,
        'cv_batch_created',
        'cv_intelligence',
        JSON.stringify({ 
          batch_id: batchId, 
          batch_name: batchName,
          cv_count: cvFiles.length,
          jd_count: jdFiles.length
        }),
        req.ip,
        req.get('User-Agent')
      ]);

      // Process files (simplified version - in production you'd use a queue/worker)
      const candidates = await CVController.processFiles(batchId, cvFiles, jdFiles);
      
      const processingTime = Date.now() - startTime;

      // Update batch with results
      await database.run(`
        UPDATE cv_batches 
        SET status = 'completed', candidate_count = $1, processing_time = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3
      `, [candidates.length, processingTime, batchId]);

      // Get the completed batch
      const batch = await database.get(`
        SELECT * FROM cv_batches WHERE id = $1
      `, [batchId]);

      res.status(201).json({
        success: true,
        message: 'CV batch processed successfully',
        data: {
          batch,
          candidates
        }
      });

    } catch (error) {
      console.error('Create CV batch error:', error);
      
      // Update batch status to failed if it was created
      if (req.body.batchId) {
        await database.run(`
          UPDATE cv_batches 
          SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1
        `, [req.body.batchId]);
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error during CV processing'
      });
    }
  }

  // Get user's CV batches
  static async getUserBatches(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          id, name, status, cv_count, jd_count, candidate_count, 
          processing_time, created_at, updated_at
        FROM cv_batches 
        WHERE user_id = ?
      `;
      
      const params = [req.user.id];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const batches = await database.all(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM cv_batches WHERE user_id = ?';
      const countParams = [req.user.id];

      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }

      const totalCount = await database.get(countQuery, countParams);

      res.json({
        success: true,
        data: {
          batches,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount.total,
            totalPages: Math.ceil(totalCount.total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user batches error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get batch details with candidates
  static async getBatchDetails(req, res) {
    try {
      const { batch_id } = req.params;

      // Get batch details
      const batch = await database.get(`
        SELECT * FROM cv_batches 
        WHERE id = ? AND user_id = ?
      `, [batch_id, req.user.id]);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found or access denied'
        });
      }

      // Get candidates for this batch
      const candidates = await database.all(`
        SELECT * FROM cv_candidates 
        WHERE batch_id = ?
        ORDER BY score DESC
      `, [batch_id]);

      // Parse analysis data
      const candidatesWithAnalysis = candidates.map(candidate => ({
        ...candidate,
        analysis: candidate.analysis_data ? JSON.parse(candidate.analysis_data) : {}
      }));

      res.json({
        success: true,
        data: {
          batch,
          candidates: candidatesWithAnalysis
        }
      });

    } catch (error) {
      console.error('Get batch details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get candidate details
  static async getCandidateDetails(req, res) {
    try {
      const { candidate_id } = req.params;

      // Get candidate with batch info to verify user access
      const candidate = await database.get(`
        SELECT 
          cc.*,
          cb.user_id as batch_user_id
        FROM cv_candidates cc
        JOIN cv_batches cb ON cc.batch_id = cb.id
        WHERE cc.id = ?
      `, [candidate_id]);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }

      // Check user access
      if (candidate.batch_user_id !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Parse analysis data
      const candidateWithAnalysis = {
        ...candidate,
        analysis: candidate.analysis_data ? JSON.parse(candidate.analysis_data) : {}
      };

      delete candidateWithAnalysis.batch_user_id; // Remove internal field

      res.json({
        success: true,
        data: { candidate: candidateWithAnalysis }
      });

    } catch (error) {
      console.error('Get candidate details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete batch
  static async deleteBatch(req, res) {
    try {
      const { batch_id } = req.params;

      // Check if batch exists and user has access
      const batch = await database.get(`
        SELECT * FROM cv_batches 
        WHERE id = ? AND user_id = ?
      `, [batch_id, req.user.id]);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found or access denied'
        });
      }

      // Delete batch (candidates will be deleted due to foreign key cascade)
      await database.run('DELETE FROM cv_batches WHERE id = $1', [batch_id]);

      // Track deletion
      await database.run(`
        INSERT INTO user_analytics (user_id, action, agent_id, metadata, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [
        req.user.id,
        'cv_batch_deleted',
        'cv_intelligence',
        JSON.stringify({ batch_id, batch_name: batch.name }),
        req.ip,
        req.get('User-Agent')
      ]);

      res.json({
        success: true,
        message: 'Batch deleted successfully'
      });

    } catch (error) {
      console.error('Delete batch error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Process CV files (mock implementation)
  static async processFiles(batchId, cvFiles, jdFiles) {
    const candidates = [];
    
    // Mock AI processing - in production, you'd integrate with actual AI services
    for (let i = 0; i < cvFiles.length; i++) {
      const cvFile = cvFiles[i];
      const candidateId = uuidv4();
      
      // Mock candidate data
      const mockNames = [
        'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 
        'David Wilson', 'Lisa Anderson', 'James Taylor', 'Maria Garcia'
      ];
      
      const mockEmails = [
        'john.smith@email.com', 'sarah.j@email.com', 'michael.b@email.com',
        'emily.d@email.com', 'david.w@email.com', 'lisa.a@email.com'
      ];

      const mockSkills = [
        'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker',
        'Machine Learning', 'Data Analysis', 'Project Management', 'Leadership'
      ];

      const mockExperience = [
        { position: 'Senior Developer', company: 'Tech Corp', duration: '2020-2023', description: 'Led development team' },
        { position: 'Software Engineer', company: 'StartupXYZ', duration: '2018-2020', description: 'Built scalable applications' }
      ];

      // Generate random but realistic data
      const score = Math.floor(Math.random() * 40) + 60; // 60-100 range
      const name = mockNames[Math.floor(Math.random() * mockNames.length)];
      const email = mockEmails[Math.floor(Math.random() * mockEmails.length)];
      const phone = `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
      
      const selectedSkills = mockSkills
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 6) + 3);

      const analysisData = {
        skills: selectedSkills,
        experience: mockExperience,
        match_analysis: {
          recommendation: score >= 85 ? 'Highly Recommended' : score >= 75 ? 'Recommended' : 'Consider',
          candidate_summary: `Strong candidate with ${Math.floor(Math.random() * 8) + 2} years of experience`,
          skills_matched: selectedSkills.slice(0, 3),
          skills_missing: ['Docker', 'Kubernetes'].filter(skill => !selectedSkills.includes(skill)),
          strengths: ['Technical expertise', 'Problem solving', 'Communication'],
          concerns: score < 70 ? ['Limited experience in specific domain'] : []
        }
      };

      const candidate = {
        id: candidateId,
        batch_id: batchId,
        filename: cvFile.originalname,
        name,
        email,
        phone,
        location: 'New York, NY',
        score,
        analysis_data: JSON.stringify(analysisData)
      };

      // Insert candidate into database
      await database.run(`
        INSERT INTO cv_candidates (
          id, batch_id, filename, name, email, phone, location, score, analysis_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
      `, [
        candidate.id,
        candidate.batch_id,
        candidate.filename,
        candidate.name,
        candidate.email,
        candidate.phone,
        candidate.location,
        candidate.score,
        candidate.analysis_data
      ]);

      candidates.push({
        ...candidate,
        analysis: analysisData
      });
    }

    return candidates.sort((a, b) => b.score - a.score);
  }

  // Get CV Intelligence statistics (admin only)
  static async getCVStats(req, res) {
    try {
      const { timeframe = '30d', user_id } = req.query;

      const timeFrameMap = {
        '7d': '-7 days',
        '30d': '-30 days',
        '90d': '-90 days',
        '1y': '-1 year'
      };

      const sqlTimeFrame = timeFrameMap[timeframe] || '-30 days';

      // Overall statistics
      let query = `
        SELECT 
          COUNT(*) as total_batches,
          COUNT(DISTINCT user_id) as unique_users,
          SUM(candidate_count) as total_candidates,
          AVG(candidate_count) as avg_candidates_per_batch,
          AVG(processing_time) as avg_processing_time,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_batches,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_batches
        FROM cv_batches 
        WHERE created_at > NOW() - INTERVAL '30 days'
      `;

      const params = [];
      if (user_id) {
        query += ' AND user_id = ?';
        params.push(user_id);
      }

      const stats = await database.get(query, params);

      // Daily processing trends
      let trendQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as batches_created,
          SUM(candidate_count) as candidates_processed,
          COUNT(DISTINCT user_id) as active_users
        FROM cv_batches 
        WHERE created_at > NOW() - INTERVAL '30 days'
      `;

      if (user_id) {
        trendQuery += ' AND user_id = ?';
      }

      trendQuery += ' GROUP BY DATE(created_at) ORDER BY date ASC';

      const trends = await database.all(trendQuery, user_id ? [user_id] : []);

      // Top users by batch count
      const topUsers = await database.all(`
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.department,
          COUNT(cb.id) as batch_count,
          SUM(cb.candidate_count) as total_candidates,
          AVG(cb.processing_time) as avg_processing_time
        FROM users u
        JOIN cv_batches cb ON u.id = cb.user_id
        WHERE cb.created_at > NOW() - INTERVAL '${sqlTimeFrame}'
        AND cb.status = 'completed'
        GROUP BY u.id
        ORDER BY batch_count DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          stats: stats || {
            total_batches: 0,
            unique_users: 0,
            total_candidates: 0,
            avg_candidates_per_batch: 0,
            avg_processing_time: 0,
            completed_batches: 0,
            failed_batches: 0
          },
          trends,
          topUsers,
          timeframe
        }
      });

    } catch (error) {
      console.error('CV stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Export batch results
  static async exportBatch(req, res) {
    try {
      const { batch_id } = req.params;
      const { format = 'json' } = req.query;

      // Get batch details
      const batch = await database.get(`
        SELECT * FROM cv_batches 
        WHERE id = ? AND user_id = ?
      `, [batch_id, req.user.id]);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found or access denied'
        });
      }

      // Get candidates
      const candidates = await database.all(`
        SELECT * FROM cv_candidates 
        WHERE batch_id = ?
        ORDER BY score DESC
      `, [batch_id]);

      const candidatesWithAnalysis = candidates.map(candidate => ({
        ...candidate,
        analysis: candidate.analysis_data ? JSON.parse(candidate.analysis_data) : {}
      }));

      if (format === 'csv') {
        // Convert to CSV
        const headers = [
          'Rank', 'Name', 'Email', 'Phone', 'Location', 'Score', 
          'Skills', 'Experience Count', 'Recommendation'
        ].join(',');

        const csvData = candidatesWithAnalysis.map((candidate, index) => [
          index + 1,
          `"${candidate.name || ''}"`,
          `"${candidate.email || ''}"`,
          `"${candidate.phone || ''}"`,
          `"${candidate.location || ''}"`,
          candidate.score,
          `"${candidate.analysis$1.skills$2.join(', ') || ''}"`,
          candidate.analysis?.experience?.length || 0,
          `"${candidate.analysis$1.match_analysis$2.recommendation || ''}"`
        ].join(',')).join('\n');

        const csv = `${headers}\n${csvData}`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="batch_${batch.name}_results.csv"`);
        res.send(csv);

      } else {
        // JSON format
        res.json({
          success: true,
          data: {
            batch,
            candidates: candidatesWithAnalysis,
            exported_at: new Date().toISOString()
          }
        });
      }

      // Track export
      await database.run(`
        INSERT INTO user_analytics (user_id, action, agent_id, metadata, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [
        req.user.id,
        'cv_batch_exported',
        'cv_intelligence',
        JSON.stringify({ batch_id, format, candidate_count: candidates.length }),
        req.ip,
        req.get('User-Agent')
      ]);

    } catch (error) {
      console.error('Export batch error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get multer upload middleware
  static getUploadMiddleware() {
    return upload.fields([
      { name: 'cvFiles', maxCount: 50 },
      { name: 'jdFile', maxCount: 5 }
    ]);
  }
}

module.exports = CVController;