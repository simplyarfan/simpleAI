const database = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const pdf = require('pdf-parse');
const huggingFaceService = require('../services/HuggingFaceService');

class CVIntelligenceController {
  // Create a new CV analysis batch
  static async createBatch(req, res) {
    try {
      console.log('🎯 [CV-INTELLIGENCE] Creating new batch...');
      
      const { batchName } = req.body;
      const userId = req.user.id;
      
      if (!batchName) {
        return res.status(400).json({
          success: false,
          message: 'Batch name is required'
        });
      }

      const batchId = uuidv4();
      
      // Create batch record
      await database.run(`
        INSERT INTO cv_batches (
          id, name, user_id, status, cv_count, candidate_count, 
          processing_time, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [batchId, batchName, userId, 'created', 0, 0, 0]);

      console.log('✅ [CV-INTELLIGENCE] Batch created:', batchId);

      res.json({
        success: true,
        data: {
          batchId,
          name: batchName,
          status: 'created',
          message: 'Batch created successfully. Ready for file uploads.'
        }
      });

    } catch (error) {
      console.error('❌ [CV-INTELLIGENCE] Create batch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create batch',
        error: error.message
      });
    }
  }

  // Process uploaded files (JD + CVs)
  static async processFiles(req, res) {
    try {
      console.log('📄 [CV-INTELLIGENCE] Processing files...');
      
      const { batchId } = req.params;
      const files = req.files;
      
      if (!files || !files.jdFile || !files.cvFiles) {
        return res.status(400).json({
          success: false,
          message: 'Missing required files. Need 1 JD file and at least 1 CV file.'
        });
      }

      // Ensure cvFiles is an array
      const cvFiles = Array.isArray(files.cvFiles) ? files.cvFiles : [files.cvFiles];
      const jdFile = files.jdFile;

      if (cvFiles.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 CV files allowed per batch'
        });
      }

      console.log(`📊 Processing ${cvFiles.length} CVs and 1 JD for batch: ${batchId}`);

      // Update batch status
      await database.run(`
        UPDATE cv_batches 
        SET status = 'processing', cv_count = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [cvFiles.length, batchId]);

      // Process JD file
      console.log('📋 Analyzing Job Description with LLM...');
      let jdText = '';
      
      if (jdFile.mimetype === 'application/pdf') {
        const pdfData = await pdf(jdFile.buffer);
        jdText = pdfData.text;
      } else {
        jdText = jdFile.buffer.toString('utf8');
      }

      // Use Hugging Face for intelligent JD analysis
      const jdAnalysis = await huggingFaceService.analyzeWithFallback('jd', jdText, jdFile.originalname);

      // Update batch with JD analysis
      await database.run(`
        UPDATE cv_batches 
        SET jd_analysis = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [JSON.stringify(jdAnalysis), batchId]);

      // Process CV files
      console.log('📄 Processing CV files...');
      const candidates = [];
      
      for (let i = 0; i < cvFiles.length; i++) {
        const cvFile = cvFiles[i];
        console.log(`📄 Processing CV ${i + 1}/${cvFiles.length}: ${cvFile.originalname}`);
        
        try {
          // Extract text from CV
          let cvText = '';
          if (cvFile.mimetype === 'application/pdf') {
            const pdfData = await pdf(cvFile.buffer);
            cvText = pdfData.text;
          } else {
            cvText = cvFile.buffer.toString('utf8');
          }

          // Analyze CV with Hugging Face
          console.log(`🤗 Analyzing CV with Hugging Face: ${cvFile.originalname}`);
          const cvAnalysis = await huggingFaceService.analyzeWithFallback('cv', cvText, cvFile.originalname);
          
          // Perform intelligent matching with Hugging Face
          console.log(`🎯 Performing intelligent matching for: ${cvFile.originalname}`);
          const matchingResult = await huggingFaceService.analyzeWithFallback('matching', cvAnalysis, jdAnalysis);

          // Create candidate record
          const candidateId = uuidv4();
          const candidate = {
            id: candidateId,
            batch_id: batchId,
            filename: cvFile.originalname,
            name: cvAnalysis.personal.name || 'Name not found',
            email: cvAnalysis.personal.email || 'Email not found',
            phone: cvAnalysis.personal.phone || 'Phone not found',
            location: cvAnalysis.personal.location || 'Location not found',
            age: cvAnalysis.personal.age || 'N/A',
            gender: cvAnalysis.personal.gender || 'N/A',
            current_salary: cvAnalysis.personal.current_salary || 'N/A',
            expected_salary: cvAnalysis.personal.expected_salary || 'N/A',
            score: matchingResult.overall_score,
            skills_matched: matchingResult.skills_matched.length,
            skills_missing: matchingResult.skills_missing.length,
            experience_years: cvAnalysis.experience.length,
            fit_level: matchingResult.fit_level,
            recommendation: matchingResult.recommendation,
            analysis_data: {
              personal: cvAnalysis.personal,
              skills: cvAnalysis.skills,
              experience: cvAnalysis.experience,
              education: cvAnalysis.education,
              match_analysis: matchingResult
            }
          };

          // Save candidate to database
          await database.run(`
            INSERT INTO cv_candidates (
              id, batch_id, filename, name, email, phone, location, age, gender,
              current_salary, expected_salary, score, skills_matched, skills_missing,
              experience_years, fit_level, recommendation, analysis_data, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP)
          `, [
            candidateId, batchId, candidate.filename, candidate.name, candidate.email,
            candidate.phone, candidate.location, candidate.age, candidate.gender,
            candidate.current_salary, candidate.expected_salary, candidate.score,
            candidate.skills_matched, candidate.skills_missing, candidate.experience_years,
            candidate.fit_level, candidate.recommendation, JSON.stringify(candidate.analysis_data)
          ]);

          candidates.push({
            id: candidateId,
            name: candidate.name,
            score: candidate.score,
            fit_level: candidate.fit_level,
            recommendation: candidate.recommendation
          });

        } catch (error) {
          console.error(`❌ Error processing CV ${cvFile.originalname}:`, error);
        }
      }

      // Update batch completion
      await database.run(`
        UPDATE cv_batches 
        SET status = 'completed', candidate_count = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [candidates.length, batchId]);

      // Sort candidates by score
      candidates.sort((a, b) => b.score - a.score);

      console.log('✅ [CV-INTELLIGENCE] Batch processing completed');

      res.json({
        success: true,
        data: {
          batchId,
          candidatesProcessed: candidates.length,
          candidates: candidates.slice(0, 5), // Return top 5 for preview
          message: 'Files processed successfully'
        }
      });

    } catch (error) {
      console.error('❌ [CV-INTELLIGENCE] Process files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process files',
        error: error.message
      });
    }
  }

  // Get all batches for user
  static async getBatches(req, res) {
    try {
      const userId = req.user.id;
      
      const batches = await database.all(`
        SELECT 
          id, name, status, cv_count, candidate_count, 
          processing_time, created_at, updated_at
        FROM cv_batches 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `, [userId]);

      res.json({
        success: true,
        data: batches
      });

    } catch (error) {
      console.error('❌ [CV-INTELLIGENCE] Get batches error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch batches',
        error: error.message
      });
    }
  }

  // Get candidates for a specific batch
  static async getCandidates(req, res) {
    try {
      const { batchId } = req.params;
      const userId = req.user.id;

      // Verify batch belongs to user
      const batch = await database.get(`
        SELECT * FROM cv_batches WHERE id = $1 AND user_id = $2
      `, [batchId, userId]);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Get candidates
      const candidates = await database.all(`
        SELECT * FROM cv_candidates 
        WHERE batch_id = $1 
        ORDER BY score DESC
      `, [batchId]);

      res.json({
        success: true,
        data: {
          batch,
          candidates
        }
      });

    } catch (error) {
      console.error('❌ [CV-INTELLIGENCE] Get candidates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch candidates',
        error: error.message
      });
    }
  }


}

module.exports = CVIntelligenceController;
