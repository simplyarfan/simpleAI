const database = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const pdf = require('pdf-parse');

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
      console.log('📋 Analyzing Job Description...');
      let jdText = '';
      
      if (jdFile.mimetype === 'application/pdf') {
        const pdfData = await pdf(jdFile.buffer);
        jdText = pdfData.text;
      } else {
        jdText = jdFile.buffer.toString('utf8');
      }

      // For now, we'll use basic JD analysis (will enhance with Ollama later)
      const jdAnalysis = await this.analyzeJobDescription(jdText, jdFile.originalname);

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

          // Analyze CV (basic analysis for now)
          const cvAnalysis = await this.analyzeCVBasic(cvText, cvFile.originalname);
          
          // Perform matching
          const matchingResult = await this.performMatching(cvAnalysis, jdAnalysis);

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

  // Basic JD analysis (will be enhanced with Ollama)
  static async analyzeJobDescription(jdText, filename) {
    try {
      // Basic regex-based extraction
      const lines = jdText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // Extract position title (usually in first few lines)
      const positionTitle = lines.find(line => 
        line.toLowerCase().includes('position') || 
        line.toLowerCase().includes('role') ||
        line.toLowerCase().includes('job title')
      ) || lines[0] || 'Software Engineer';

      // Extract skills
      const skillKeywords = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 
        'Git', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Vue.js',
        'Angular', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'PHP'
      ];
      
      const requiredSkills = skillKeywords.filter(skill => 
        jdText.toLowerCase().includes(skill.toLowerCase())
      );

      // Extract experience requirement
      const experienceMatch = jdText.match(/(\d+)[\s-]*(\d+)?\s*years?\s*(of\s*)?experience/i);
      const experienceRequired = experienceMatch ? 
        (experienceMatch[2] ? `${experienceMatch[1]}-${experienceMatch[2]} years` : `${experienceMatch[1]}+ years`) :
        '2-5 years';

      return {
        position_title: positionTitle.substring(0, 100),
        company: 'Company Name',
        required_skills: requiredSkills.length > 0 ? requiredSkills : ['JavaScript', 'React', 'Node.js'],
        experience_required: experienceRequired,
        responsibilities: ['Develop software solutions', 'Collaborate with team', 'Write clean code'],
        domain: 'Technology'
      };

    } catch (error) {
      console.error('JD analysis error:', error);
      return {
        position_title: 'Software Engineer',
        company: 'TechCorp',
        required_skills: ['JavaScript', 'Python', 'React'],
        experience_required: '3-5 years',
        responsibilities: ['Develop software', 'Collaborate with team'],
        domain: 'Technology'
      };
    }
  }

  // Basic CV analysis (will be enhanced with Ollama)
  static async analyzeCVBasic(cvText, filename) {
    try {
      const lines = cvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // Extract email
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const emailMatch = cvText.match(emailRegex);
      
      // Extract phone
      const phoneRegex = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
      const phoneMatch = cvText.match(phoneRegex);
      
      // Extract name (usually first non-empty line)
      const name = lines.length > 0 ? lines[0] : filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
      
      // Extract skills
      const skillKeywords = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 
        'Git', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Vue.js'
      ];
      const foundSkills = skillKeywords.filter(skill => 
        cvText.toLowerCase().includes(skill.toLowerCase())
      );

      return {
        personal: {
          name: name,
          email: emailMatch ? emailMatch[0] : "Not specified",
          phone: phoneMatch ? phoneMatch[0] : "Not specified",
          location: "Not specified",
          age: "Not specified",
          gender: "Not specified",
          current_salary: "Not specified",
          expected_salary: "Not specified"
        },
        skills: foundSkills.length > 0 ? foundSkills : ["Skills extraction needed"],
        experience: [{
          company: "Experience parsing needed",
          position: "Will be enhanced with Ollama",
          duration: "Unknown",
          description: "Basic parsing completed"
        }],
        education: [{
          degree: "Education parsing needed",
          institution: "Will be enhanced with Ollama",
          year: "Unknown"
        }],
        summary: "Basic CV parsing completed - will be enhanced with local LLM"
      };

    } catch (error) {
      console.error('CV analysis error:', error);
      return {
        personal: {
          name: filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' '),
          email: "Not specified",
          phone: "Not specified",
          location: "Not specified",
          age: "Not specified",
          gender: "Not specified",
          current_salary: "Not specified",
          expected_salary: "Not specified"
        },
        skills: ["Unable to extract skills"],
        experience: [{ company: "Unable to extract", position: "Unable to extract", duration: "Unable to extract", description: "CV parsing failed" }],
        education: [{ degree: "Unable to extract", institution: "Unable to extract", year: "Unable to extract" }],
        summary: "CV analysis failed - please try uploading again"
      };
    }
  }

  // Basic matching logic (will be enhanced with Ollama)
  static async performMatching(cvData, jdData) {
    try {
      const cvSkills = cvData.skills.map(s => s.toLowerCase());
      const jdSkills = jdData.required_skills.map(s => s.toLowerCase());
      
      const matchedSkills = cvSkills.filter(skill => 
        jdSkills.some(jdSkill => 
          skill.includes(jdSkill) || jdSkill.includes(skill) || skill === jdSkill
        )
      );
      
      const missingSkills = jdSkills.filter(skill => 
        !cvSkills.some(cvSkill => cvSkill.includes(skill) || skill.includes(cvSkill))
      );
      
      const skillMatchRate = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) : 0.5;
      const overallScore = Math.round(60 + (skillMatchRate * 40));
      
      return {
        overall_score: overallScore,
        skills_matched: matchedSkills.slice(0, 10),
        skills_missing: missingSkills.slice(0, 5),
        strengths: skillMatchRate > 0.6 ? ['Good skill alignment', 'Relevant experience'] : ['Some relevant experience'],
        concerns: skillMatchRate < 0.4 ? ['Limited skill match', 'May need training'] : [],
        recommendations: [`Score: ${overallScore}%`, 'Review detailed analysis'],
        fit_level: overallScore >= 85 ? 'High' : overallScore >= 70 ? 'Medium' : 'Low',
        recommendation: overallScore >= 85 ? 'Highly Recommended' : overallScore >= 70 ? 'Recommended' : 'Consider'
      };

    } catch (error) {
      console.error('Matching error:', error);
      return {
        overall_score: 65,
        skills_matched: [],
        skills_missing: [],
        strengths: ['Basic analysis completed'],
        concerns: ['Detailed analysis needed'],
        recommendations: ['Review manually'],
        fit_level: 'Medium',
        recommendation: 'Consider'
      };
    }
  }
}

module.exports = CVIntelligenceController;
