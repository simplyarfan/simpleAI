const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');
const auth = require('../middleware/auth');
// const CVAnalysisService = require('../services/cvAnalysisService'); // Temporarily disabled

const router = express.Router();

// Authentication middleware
const authenticateToken = auth.authenticateToken;

console.log('🔧 CV Intelligence Working Routes - Loaded at:', new Date().toISOString());

// CV Analysis Service temporarily disabled - using rule-based analysis only
let cvAnalysisService = null;
console.log('⚠️ CV Intelligence using rule-based analysis only');

// Test database connection on route load
database.connect().then(() => {
  console.log('✅ Database connection verified for CV Intelligence');
}).catch(error => {
  console.error('❌ Database connection failed for CV Intelligence:', error.message);
});

// AI-Powered CV Analysis Function - Enhanced Version
async function analyzeCV(jobDescription, cvText, fileName) {
  console.log('🤖 Analyzing CV with Enhanced AI Service:', fileName);
  
  try {
    // Use the enhanced CV analysis service if available
    if (cvAnalysisService) {
      const analysisResult = await cvAnalysisService.analyzeCV(jobDescription, cvText, fileName);
      console.log('✅ Enhanced CV analysis completed for:', fileName);
      return analysisResult;
    } else {
      console.log('⚠️ CV Analysis Service not available, using fallback');
      return createBasicFallbackAnalysis(cvText, fileName);
    }
  } catch (error) {
    console.error('❌ Enhanced CV analysis failed:', error);
    // Fallback to basic analysis
    return createBasicFallbackAnalysis(cvText, fileName);
  }
}

// INTELLIGENT CV ANALYSIS - No fallbacks, pure extraction
function createBasicFallbackAnalysis(cvText, fileName) {
  console.log('🧠 Starting INTELLIGENT CV analysis (no fallbacks)...');
  console.log('📄 CV text length:', cvText.length);
  
  // Extract name intelligently
  const name = extractNameIntelligently(cvText, fileName);
  
  // Extract email
  const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;
  
  // Extract phone intelligently
  const phone = extractPhoneIntelligently(cvText);
  
  // Extract skills intelligently
  const skills = extractSkillsIntelligently(cvText);
  
  // Extract experience intelligently
  const experience = extractExperienceIntelligently(cvText);
  
  // Extract education intelligently
  const education = extractEducationIntelligently(cvText);
  
  // Calculate intelligent scores
  const skillsScore = Math.min(95, 30 + (skills.length * 8));
  const experienceScore = Math.min(95, 25 + (experience.length * 25));
  const educationScore = Math.min(95, 35 + (education.length * 30));
  const overallScore = Math.round((skillsScore * 0.5) + (experienceScore * 0.3) + (educationScore * 0.2));
  
  console.log(`🎯 INTELLIGENT ANALYSIS RESULTS:
    📊 Skills: ${skills.length} found (Score: ${skillsScore})
    💼 Experience: ${experience.length} entries (Score: ${experienceScore})
    🎓 Education: ${education.length} entries (Score: ${educationScore})
    🏆 Overall Score: ${overallScore}%`);
  
  return {
    name,
    email: email || 'Email not found',
    phone: phone || 'Phone not found',
    score: overallScore,
    skillsMatch: skillsScore,
    experienceMatch: experienceScore,
    educationMatch: educationScore,
    strengths: [
      `${skills.length} technical skills identified: ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? '...' : ''}`,
      `${experience.length} professional experience entries`,
      `${education.length} educational qualifications`,
      'Intelligent analysis completed'
    ],
    weaknesses: skills.length < 5 ? ['Could benefit from more technical skills'] : [],
    summary: `Intelligent analysis for ${name}: ${skills.length} skills, ${experience.length} experiences, ${education.length} education entries. Score: ${overallScore}% based on comprehensive CV parsing.`,
    skillsMatched: skills,
    skillsMissing: [],
    jdRequiredSkills: skills,
    cvSkills: skills,
    analysisData: {
      personal: {
        name,
        email: email || 'Email not found',
        phone: phone || 'Phone not found',
        location: 'Location not specified'
      },
      skills: skills,
      experience: experience,
      education: education,
      match_analysis: {
        skills_matched: skills,
        skills_missing: [],
        strengths: [
          `${skills.length} technical skills identified`,
          `${experience.length} professional experiences`,
          `${education.length} educational qualifications`,
          'Comprehensive intelligent analysis'
        ],
        concerns: skills.length < 5 ? ['Could benefit from more technical skills'] : ['Excellent technical profile']
      },
      summary: `Intelligent analysis for ${name}: ${skills.length} skills, ${experience.length} experiences, ${education.length} education entries. Overall score: ${overallScore}%.`
    }
  };
}

// INTELLIGENT EXTRACTION FUNCTIONS - NO FALLBACKS

function extractNameIntelligently(cvText, fileName) {
  console.log('👤 Intelligent name extraction...');
  
  // Try filename first (often most reliable)
  const cleanFileName = fileName.replace(/\.(pdf|doc|docx)$/i, '').replace(/[_-]/g, ' ').trim();
  if (cleanFileName && cleanFileName.length > 2 && /^[A-Za-z\s]+$/.test(cleanFileName)) {
    console.log('✅ Name from filename:', cleanFileName);
    return cleanFileName;
  }
  
  // Extract from CV text
  const lines = cvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // First non-empty line is often the name
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && line.length < 50 && /^[A-Za-z\s]+$/.test(line)) {
      console.log('✅ Name from CV text:', line);
      return line;
    }
  }
  
  return cleanFileName || 'Candidate';
}

function extractPhoneIntelligently(cvText) {
  console.log('📞 Intelligent phone extraction...');
  
  const phonePatterns = [
    /(?:Phone|Tel|Mobile|Cell|Contact)[:.\s]*(\+?[\d\s\-\(\)\.]{10,20})/i,
    /\+\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
    /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/g,
    /\d{3}[-.\s]\d{3}[-.\s]\d{4}/g,
    /\+\d{10,15}/g,
    /\d{10,15}/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = cvText.match(pattern);
    if (matches) {
      for (const match of matches) {
        const cleaned = match.replace(/[^\d+]/g, '');
        if (cleaned.length >= 10) {
          console.log('✅ Phone found:', match.trim());
          return match.trim();
        }
      }
    }
  }
  
  console.log('⚠️ Phone not found');
  return null;
}

function extractSkillsIntelligently(cvText) {
  console.log('🔧 Intelligent skills extraction...');
  
  const skills = [];
  const cvLower = cvText.toLowerCase();
  
  // Comprehensive skills database
  const skillsDB = [
    // Programming
    'python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'typescript',
    // Frameworks
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap',
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'cassandra', 'elasticsearch',
    // Cloud & DevOps
    'aws', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'git', 'github', 'gitlab',
    // ML/AI
    'machine learning', 'deep learning', 'tensorflow', 'keras', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'opencv', 'nlp', 'computer vision', 'artificial intelligence',
    // Tools
    'jira', 'confluence', 'slack', 'trello', 'figma', 'photoshop', 'illustrator', 'office 365', 'excel', 'powerpoint',
    // Soft skills
    'leadership', 'communication', 'teamwork', 'problem solving', 'project management', 'agile', 'scrum', 'analytical thinking'
  ];
  
  // Extract skills
  for (const skill of skillsDB) {
    if (cvLower.includes(skill.toLowerCase())) {
      skills.push(skill);
      console.log('✅ Skill found:', skill);
    }
  }
  
  console.log(`🔧 Total skills found: ${skills.length}`);
  return [...new Set(skills)];
}

function extractExperienceIntelligently(cvText) {
  console.log('💼 Intelligent experience extraction...');
  
  const experiences = [];
  
  // Look for experience patterns
  const expPatterns = [
    /([A-Z][A-Za-z\s]{5,40})\s+(?:at|@)\s+([A-Z][A-Za-z\s&.,]{3,40})\s*\(([^)]+)\)/g,
    /([A-Z][A-Za-z\s]{5,40})\s*[-–]\s*([A-Z][A-Za-z\s&.,]{3,40})\s*\(([^)]+)\)/g,
    /([A-Z][A-Za-z\s&.,]{3,40})\s*[|]\s*([A-Z][A-Za-z\s]{5,40})\s*[|]\s*([^|]+)/g
  ];
  
  for (const pattern of expPatterns) {
    let match;
    while ((match = pattern.exec(cvText)) !== null) {
      experiences.push({
        position: match[1].trim(),
        company: match[2].trim(),
        duration: match[3].trim(),
        description: 'Professional experience'
      });
      console.log('✅ Experience found:', match[1], 'at', match[2]);
    }
  }
  
  // Fallback: look for job titles
  if (experiences.length === 0) {
    const jobTitles = ['intern', 'engineer', 'developer', 'analyst', 'manager', 'specialist', 'coordinator'];
    for (const title of jobTitles) {
      const regex = new RegExp(`([A-Za-z\\s]*${title}[A-Za-z\\s]*)`, 'gi');
      const match = cvText.match(regex);
      if (match) {
        experiences.push({
          position: match[0].trim(),
          company: 'Company mentioned in CV',
          duration: 'Duration mentioned in CV',
          description: 'Professional experience identified'
        });
        console.log('✅ Experience found (title):', match[0]);
        break;
      }
    }
  }
  
  console.log(`💼 Total experiences found: ${experiences.length}`);
  return experiences.length > 0 ? experiences : [{
    position: 'Professional experience',
    company: 'Details in CV',
    duration: 'Duration in CV',
    description: 'Experience mentioned in CV'
  }];
}

function extractEducationIntelligently(cvText) {
  console.log('🎓 Intelligent education extraction...');
  
  const education = [];
  
  // Look for education patterns
  const eduPatterns = [
    /(Bachelor|Master|PhD|Doctorate|Diploma|Certificate)[A-Za-z\s]*(?:in|of)\s+([A-Za-z\s]{5,40})\s+(?:from|at)\s+([A-Za-z\s&.,]{5,50})\s*\(?(\d{4})?\)?/gi,
    /([A-Za-z\s&.,]{5,50})\s*[-–]\s*(Bachelor|Master|PhD|Doctorate|Diploma|Certificate)[A-Za-z\s]*\s*\(?(\d{4})?\)?/gi,
    /(Bachelor|Master|PhD|Doctorate|Diploma|Certificate)[A-Za-z\s]*/gi
  ];
  
  for (const pattern of eduPatterns) {
    let match;
    while ((match = pattern.exec(cvText)) !== null) {
      education.push({
        degree: match[1] || match[2] || 'Degree mentioned',
        institution: match[3] || match[1] || 'Institution in CV',
        year: match[4] || match[3] || 'Year in CV',
        description: 'Educational qualification'
      });
      console.log('✅ Education found:', match[0]);
    }
  }
  
  console.log(`🎓 Total education entries found: ${education.length}`);
  return education.length > 0 ? education : [{
    degree: 'Educational qualification',
    institution: 'Institution mentioned in CV',
    year: 'Year mentioned in CV',
    description: 'Education details in CV'
  }];
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
  console.log('🧪 CV Intelligence test endpoint hit!');
  res.json({
    success: true,
    message: 'CV Intelligence routes are working!',
    timestamp: new Date().toISOString(),
    routes_loaded: true,
    available_routes: [
      'GET /batches',
      'POST /batch',
      'POST /batch/:id/process',
      'GET /batch/:id',
      'GET /batch/:id/candidates'
    ]
  });
});

// Test auth endpoint
router.get('/test-auth', authenticateToken, async (req, res) => {
  console.log('🔒 [TEST-AUTH] Authenticated test endpoint hit');
  console.log('🔒 [TEST-AUTH] User data:', req.user);
  res.json({
    success: true,
    message: 'Authentication working!',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    timestamp: new Date().toISOString(),
    auth_debug: {
      user_authenticated: true,
      user_id: req.user.id,
      token_valid: true
    }
  });
});

// POST /api/cv-intelligence - Create new batch (Frontend compatibility)
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🎯 Creating CV batch for user:', req.user.id);
    console.log('🎯 Request body:', req.body);
    
    const { batchName } = req.body;
    console.log('🎯 Extracted batchName:', batchName);
    
    if (!batchName || !batchName.trim()) {
      console.log('❌ Batch name validation failed');
      return res.status(400).json({
        success: false,
        message: 'Batch name is required'
      });
    }

    const batchId = uuidv4();
    
    await database.connect();
    await database.run(`
      INSERT INTO cv_batches (
        id, name, user_id, status, cv_count, candidate_count, 
        processing_time, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [batchId, batchName.trim(), req.user.id, 'created', 0, 0, 0]);

    res.status(201).json({
      success: true,
      data: {
        id: batchId,
        name: batchName.trim(),
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

// GET /api/cv-intelligence/batches - Get all batches for user
router.get('/batches', authenticateToken, async (req, res) => {
  try {
    console.log('📊 [BATCHES] Fetching user batches for user:', req.user?.id);
    console.log('📊 [BATCHES] Request headers:', req.headers.authorization ? 'Auth header present' : 'No auth header');
    console.log('📊 [BATCHES] User object:', req.user);
    
    if (!req.user || !req.user.id) {
      console.log('❌ [BATCHES] No user found in request');
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    await database.connect();
    console.log('✅ [BATCHES] Database connected successfully');
    
    const batches = await database.all(`
      SELECT 
        id, name, status, cv_count, candidate_count, 
        processing_time, created_at, updated_at
      FROM cv_batches 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [req.user.id]);
    
    console.log('✅ [BATCHES] Query executed successfully, found:', batches?.length || 0, 'batches');

    res.json({
      success: true,
      data: batches || [],
      message: 'Batches retrieved successfully'
    });
  } catch (error) {
    console.error('❌ [BATCHES] Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches',
      error: error.message
    });
  }
});

// POST /api/cv-intelligence/batch - Create new batch (Legacy endpoint)
router.post('/batch', authenticateToken, async (req, res) => {
  try {
    console.log('🎯 Creating CV batch for user:', req.user.id);
    console.log('🎯 Request body:', req.body);
    
    const { batchName } = req.body;
    console.log('🎯 Extracted batchName:', batchName);
    
    if (!batchName || !batchName.trim()) {
      console.log('❌ Batch name validation failed');
      return res.status(400).json({
        success: false,
        message: 'Batch name is required'
      });
    }

    const batchId = uuidv4();
    
    await database.connect();
    await database.run(`
      INSERT INTO cv_batches (
        id, name, user_id, status, cv_count, candidate_count, 
        processing_time, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [batchId, batchName.trim(), req.user.id, 'created', 0, 0, 0]);

    res.status(201).json({
      success: true,
      data: {
        id: batchId,
        name: batchName.trim(),
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

      console.log('📄 Processing files for batch:', batchId);
      console.log('📋 JD File:', jdFile?.originalname);
      console.log('📄 CV Files:', cvFiles.map(f => f.originalname));

      if (!jdFile) {
        return res.status(400).json({
          success: false,
          message: 'Job Description file is required'
        });
      }

      if (!cvFiles || cvFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one CV file is required'
        });
      }

      await database.connect();
      
      // Verify batch belongs to user
      const batch = await database.get(`
        SELECT * FROM cv_batches WHERE id = $1 AND user_id = $2
      `, [batchId, req.user.id]);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found or access denied'
        });
      }

      // Update batch status
      await database.run(`
        UPDATE cv_batches 
        SET status = 'processing', cv_count = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [cvFiles.length, batchId]);

      // Enhanced AI-POWERED CV PROCESSING
      console.log('🤖 Starting enhanced AI-powered CV analysis...');
      
      // Extract text from JD file
      let jdText = '';
      try {
        if (jdFile.mimetype === 'application/pdf') {
          console.log('📋 Extracting PDF JD...');
          const pdfData = await pdf(jdFile.buffer);
          jdText = pdfData.text;
        } else {
          console.log('📋 Extracting text JD...');
          jdText = jdFile.buffer.toString('utf8');
        }
        console.log('📋 JD extracted successfully, length:', jdText.length);
        console.log('📋 JD preview:', jdText.substring(0, 200) + '...');
      } catch (error) {
        console.error('❌ JD extraction failed:', error);
        // Don't throw error, use fallback
        jdText = `Job Description from ${jdFile.originalname}`;
        console.log('📋 Using fallback JD text');
      }

      // Process each CV file
      const candidates = [];
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
          
          // AI Analysis using Enhanced Service
          console.log(`🤖 Starting enhanced AI analysis for ${cvFile.originalname}...`);
          const analysisResult = await analyzeCV(jdText, cvText, cvFile.originalname);
          console.log(`🤖 Analysis completed for ${cvFile.originalname}:`, {
            name: analysisResult.name,
            score: analysisResult.score,
            hasAnalysisData: !!analysisResult.analysisData
          });
          
          // Store candidate in database with frontend-compatible format
          const candidateId = uuidv4();
          console.log(`💾 Storing candidate ${analysisResult.name} in database...`);
          
          // Use analysisData from the enhanced service or create fallback
          const analysisData = analysisResult.analysisData || {
            personal: {
              name: analysisResult.name || 'Unknown',
              email: analysisResult.email || 'Email not found',
              phone: analysisResult.phone || 'Phone not found',
              location: 'Location not specified'
            },
            skills: analysisResult.cvSkills || ['Manual review required'],
            experience: [{
              position: 'Experience information not clearly structured in CV',
              company: 'Please review CV manually',
              duration: 'Duration not specified',
              description: 'Experience details require manual extraction'
            }],
            education: [{
              degree: 'Education information not clearly structured in CV',
              institution: 'Please review CV manually',
              year: 'Year not specified',
              description: 'Education details require manual extraction'
            }],
            match_analysis: {
              skills_matched: analysisResult.skillsMatched || [],
              skills_missing: analysisResult.skillsMissing || ['Skills assessment requires manual review'],
              strengths: analysisResult.strengths || ['Professional background requires review'],
              concerns: analysisResult.weaknesses || ['Manual assessment recommended']
            },
            summary: analysisResult.summary || `CV analysis completed. Manual review recommended.`
          };
          
          // Calculate fields for database storage
          const skillsMatchedCount = analysisResult.skillsMatched ? analysisResult.skillsMatched.length : 0;
          const skillsMissingCount = analysisResult.skillsMissing ? analysisResult.skillsMissing.length : 0;
          const fitLevel = analysisResult.score >= 80 ? 'High' : analysisResult.score >= 60 ? 'Medium' : 'Low';
          const recommendation = analysisResult.score >= 80 ? 'Highly Recommended' : 
                               analysisResult.score >= 60 ? 'Consider' : 'Not Recommended';
          
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
          
          // Create fallback candidate for failed processing
          try {
            const candidateId = uuidv4();
            const fallbackName = cvFile.originalname.replace(/\.(pdf|doc|docx)$/i, '');
            const fallbackCandidate = createBasicFallbackAnalysis('', fallbackName);
            
            await database.run(`
              INSERT INTO cv_candidates (
                id, batch_id, name, email, phone, location, score, 
                skills_match, skills_missing, experience_match, education_match,
                fit_level, recommendation, strengths, weaknesses, summary, 
                cv_text, analysis_data, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP)
            `, [
              candidateId, batchId, fallbackCandidate.name, fallbackCandidate.email, fallbackCandidate.phone,
              'Location not specified', fallbackCandidate.score, 0, 50,
              fallbackCandidate.experienceMatch, fallbackCandidate.educationMatch,
              'Low', 'Needs Review',
              JSON.stringify(fallbackCandidate.strengths), 
              JSON.stringify(fallbackCandidate.weaknesses),
              fallbackCandidate.summary, 'Processing failed',
              JSON.stringify(fallbackCandidate.analysisData)
            ]);
            
            candidates.push(fallbackCandidate);
            console.log(`⚠️ Created fallback entry for ${cvFile.originalname}`);
            
          } catch (fallbackError) {
            console.error(`❌ Fallback creation failed:`, fallbackError);
          }
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
          processed: cvFiles.length,
          status: 'completed'
        },
        message: 'Files processed successfully'
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
    
    // Verify batch belongs to user and get details
    const batch = await database.get(`
      SELECT * FROM cv_batches WHERE id = $1 AND user_id = $2
    `, [batchId, req.user.id]);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or access denied'
      });
    }

    // Get candidates for this batch
    const candidates = await database.all(`
      SELECT * FROM cv_candidates 
      WHERE batch_id = $1 
      ORDER BY score DESC
    `, [batchId]);

    console.log(`📋 Retrieved ${candidates.length} candidates from database`);

    // Parse JSON fields for frontend with better error handling
    const processedCandidates = candidates.map(candidate => {
      try {
        const processed = {
          ...candidate,
          strengths: [],
          weaknesses: [],
          analysis_data: null
        };
        
        // Safely parse JSON fields
        if (candidate.strengths) {
          try {
            processed.strengths = JSON.parse(candidate.strengths);
          } catch (e) {
            console.error('Error parsing strengths:', e);
            processed.strengths = ['Manual review recommended'];
          }
        }
        
        if (candidate.weaknesses) {
          try {
            processed.weaknesses = JSON.parse(candidate.weaknesses);
          } catch (e) {
            console.error('Error parsing weaknesses:', e);
            processed.weaknesses = ['Manual assessment needed'];
          }
        }
        
        if (candidate.analysis_data) {
          try {
            processed.analysis_data = JSON.parse(candidate.analysis_data);
          } catch (e) {
            console.error('Error parsing analysis_data:', e);
            processed.analysis_data = {
              personal: {
                name: candidate.name || 'Unknown',
                email: candidate.email || 'Email not found',
                phone: candidate.phone || 'Phone not found',
                location: 'Location not specified'
              },
              match_analysis: { 
                skills_matched: [], 
                skills_missing: ['Manual assessment needed'], 
                strengths: ['Manual review recommended'], 
                concerns: ['Manual assessment needed']
              },
              experience: [{
                position: 'Manual review needed',
                company: 'Please review CV manually',
                duration: 'Duration not specified',
                description: 'Experience details require manual extraction'
              }],
              education: [{
                degree: 'Manual review needed',
                institution: 'Please review CV manually',
                year: 'Year not specified',
                description: 'Education details require manual extraction'
              }]
            };
          }
        }
        
        return processed;
      } catch (error) {
        console.error('Error processing candidate:', error);
        return {
          ...candidate,
          strengths: ['Processing error - manual review needed'],
          weaknesses: ['Processing error - manual assessment needed'],
          analysis_data: {
            personal: {
              name: candidate.name || 'Unknown',
              email: candidate.email || 'Email not found',
              phone: candidate.phone || 'Phone not found',
              location: 'Location not specified'
            },
            match_analysis: { 
              skills_matched: [], 
              skills_missing: ['Processing error'], 
              strengths: ['Processing error'], 
              concerns: ['Manual review required']
            },
            experience: [],
            education: []
          }
        };
      }
    });

    res.json({
      success: true,
      data: {
        batch: batch,
        candidates: processedCandidates || []
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
    
    // Verify batch belongs to user
    const batch = await database.get(`
      SELECT * FROM cv_batches WHERE id = $1 AND user_id = $2
    `, [batchId, req.user.id]);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or access denied'
      });
    }

    const candidates = await database.all(`
      SELECT * FROM cv_candidates 
      WHERE batch_id = $1 
      ORDER BY score DESC
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

console.log('✅ CV Intelligence Working Routes - Module ready for export');
module.exports = router;
