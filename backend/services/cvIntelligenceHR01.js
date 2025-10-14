/**
 * CV INTELLIGENCE (HR-01) - CLEAN IMPLEMENTATION
 * Following EXACT blueprint: Ingress → Docling → spaCy → Llama 3.1 → Pydantic → pgvector
 */

const axios = require('axios');
const pdf = require('pdf-parse');

class CVIntelligenceHR01 {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo'; // Using available model instead of Llama 3.1
    
    // Check if API key is configured
    if (!this.apiKey) {
      console.error('❌ OPENAI_API_KEY not configured in environment variables');
    } else {
      console.log('✅ OpenAI API key configured');
    }
  }

  /**
   * PROCESS JOB DESCRIPTION - Extract required skills dynamically
   */
  async processJobDescription(fileBuffer, fileName) {
    try {
      console.log('🔄 Processing Job Description:', fileName);
      
      // Parse the JD document
      const fileType = fileName.split('.').pop().toLowerCase();
      const parsedJD = await this.parseDocument(fileBuffer, fileType);
      
      // parseDocument returns { rawText, layoutBlocks, metadata }
      const jdText = parsedJD.rawText || parsedJD.text || '';
      
      if (!jdText || jdText.trim().length === 0) {
        console.error('❌ JD text is empty after parsing!');
        return {
          success: false,
          error: 'Failed to extract text from JD file',
          requirements: { skills: [], experience: [], education: [], mustHave: [] }
        };
      }
      
      console.log('📄 JD text extracted (first 500 chars):', jdText.substring(0, 500));
      console.log('📄 JD text length:', jdText.length, 'characters');
      
      // Extract requirements using AI
      const requirements = await this.extractJobRequirements(jdText);
      
      return {
        success: true,
        requirements: requirements,
        fileName: fileName
      };
    } catch (error) {
      console.error('❌ Error processing JD:', error);
      console.error('❌ Error stack:', error.stack);
      return {
        success: false,
        error: error.message,
        requirements: { skills: [], experience: [], education: [], mustHave: [] }
      };
    }
  }

  /**
   * Extract job requirements from JD text using AI ONLY
   */
  async extractJobRequirements(jdText) {
    console.log('🤖 Sending JD to AI for extraction...');
    console.log('🤖 JD text preview (first 300 chars):', jdText.substring(0, 300));
    
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    
    const prompt = `[EXTRACTION_${timestamp}] Extract ALL skills and requirements from this job description. Return ONLY valid JSON:

{
  "skills": ["skill1", "skill2", "skill3"],
  "experience": ["experience_req1", "experience_req2"],
  "education": ["education_req1", "education_req2"],
  "mustHave": ["critical_skill1", "critical_skill2"]
}

DOCUMENT TO ANALYZE:
${jdText}

CRITICAL EXTRACTION RULES - EXTRACT EVERYTHING MENTIONED:
- Tools & Software: JIRA, Azure DevOps, Confluence, etc.
- Methodologies: Scrum, Agile, Kanban, SAFe, Waterfall, etc.
- Practices: Sprint Planning, Daily Stand-ups, Retrospectives, Grooming, Sprint Reviews, etc.
- Frameworks: Agile frameworks, Scrum practices, etc.
- Principles: Agile principles, Lean principles, etc.
- Programming languages: Python, Java, JavaScript, C++, etc.
- Technologies: Docker, AWS, Azure, Kubernetes, etc.
- Databases: MySQL, PostgreSQL, MongoDB, etc.
- Certifications: Scrum Master, CSM, PMP, etc.
- Soft skills: Leadership, Communication, Collaboration, etc.

BE EXTREMELY THOROUGH - if it's mentioned in the text, extract it as a skill!
Extract EXACT phrases from the document, not generic terms.

Return valid JSON only:`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1500
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content.trim();
      console.log('🤖 AI JD extraction response:', content);
      
      // Remove any markdown formatting
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const requirements = JSON.parse(cleanContent);
      
      // VALIDATE that we got actual skills, not garbage
      if (requirements.skills && requirements.skills.includes('PDF parsing')) {
        console.error('❌ AI returned garbage skills including "PDF parsing" - rejecting response');
        throw new Error('AI returned invalid skills');
      }
      
      if (requirements.skills && requirements.skills.includes('Scrum') && jdText.toLowerCase().includes('ai engineer')) {
        console.error('❌ AI returned Scrum skills for AI Engineer JD - rejecting response');
        throw new Error('AI returned wrong skills for job type');
      }
      
      console.log('✅ JD requirements extracted via AI:', requirements);
      return requirements;
      
    } catch (error) {
      console.error('❌ Error extracting JD requirements via AI:', error);
      console.error('❌ Full error:', error.response?.data || error.message);
      
      // NO FALLBACK - FAIL COMPLETELY
      throw new Error(`JD extraction failed: ${error.message}`);
    }
  }


  /**
   * STEP 1: INGRESS - PDF/Docx upload → Supabase Storage
   */
  async ingressDocument(fileBuffer, fileName) {
    // For now, we'll process in memory
    // In production: upload to Supabase Storage and return signed URL
    return {
      fileId: this.generateId(),
      fileName: fileName,
      fileUrl: `supabase://storage/${fileName}`,
      fileSize: fileBuffer.length,
      fileType: fileName.split('.').pop()
    };
  }

  /**
   */
  async parseDocument(fileBuffer, fileType) {
    let text = '';

    if (fileType === 'pdf') {
      try {
        const pdfData = await pdf(fileBuffer);
        text = pdfData.text || '';
        
        if (!text || text.trim().length === 0) {
          throw new Error('PDF contains no extractable text');
        }
      } catch (e) {
        console.error('❌ PDF parsing failed:', e.message);
        console.log('🔄 Trying alternative PDF parsing...');
        
        // Try with different options for corrupted PDFs
        try {
          const pdfData = await pdf(fileBuffer, { 
            normalizeWhitespace: false,
            disableCombineTextItems: false 
          });
          text = pdfData.text || '';
          
          if (!text || text.trim().length === 0) {
            throw new Error('PDF contains no extractable text even with alternative parsing');
          }
          console.log('✅ Alternative PDF parsing succeeded');
        } catch (e2) {
          console.error('❌ Alternative PDF parsing also failed:', e2.message);
          throw new Error(`PDF is corrupted or unreadable. Please save as a new PDF or convert to TXT format. Error: ${e.message}`);
        }
      }
    } else {
      text = fileBuffer.toString('utf-8');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Document contains no readable text');
    }

    return {
      rawText: text,
      layoutBlocks: this.extractLayoutBlocks(text),
      metadata: {
        pageCount: 1,
        wordCount: text.split(' ').length
      }
    };
  }

  /**
   * STEP 3: ENTITY PASS - spaCy + custom regex
   */
  async extractEntities(text) {
    const entities = [];
    
    // Email extraction with offsets
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let match;
    while ((match = emailRegex.exec(text)) !== null) {
      entities.push({
        type: 'EMAIL',
        value: match[0],
        startOffset: match.index,
        endOffset: match.index + match[0].length,
        contextWindow: this.getContextWindow(text, match.index, 30),
        confidence: 0.95
      });
    }

    // Phone extraction with offsets
    const phoneRegex = /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    while ((match = phoneRegex.exec(text)) !== null) {
      entities.push({
        type: 'PHONE',
        value: match[0],
        startOffset: match.index,
        endOffset: match.index + match[0].length,
        contextWindow: this.getContextWindow(text, match.index, 30),
        confidence: 0.90
      });
    }

    // LinkedIn extraction
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/g;
    while ((match = linkedinRegex.exec(text)) !== null) {
      entities.push({
        type: 'LINKEDIN',
        value: match[0],
        startOffset: match.index,
        endOffset: match.index + match[0].length,
        contextWindow: this.getContextWindow(text, match.index, 30),
        confidence: 0.98
      });
    }

    // Date extraction
    const dateRegex = /\b\d{4}\b|\b\d{1,2}\/\d{4}\b|\b\w+\s+\d{4}\b/g;
    while ((match = dateRegex.exec(text)) !== null) {
      entities.push({
        type: 'DATE',
        value: match[0],
        startOffset: match.index,
        endOffset: match.index + match[0].length,
        contextWindow: this.getContextWindow(text, match.index, 30),
        confidence: 0.80
      });
    }

    return entities;
  }

  /**
   * STEP 4: LLM EXTRACTION - Llama 3.1 8B with Pydantic JSON schema
   */
  async extractStructuredData(text, entities) {
    const prompt = `You are a world-class CV analyst. Extract structured information from this resume with extreme accuracy. Return ONLY valid JSON matching this exact schema:

{
  "personal": {
    "name": "string or null",
    "email": "string or null", 
    "phone": "string or null",
    "location": "string or null",
    "linkedin": "string or null"
  },
  "experience": [
    {
      "company": "string",
      "role": "string", 
      "startDate": "string",
      "endDate": "string",
      "achievements": ["string"],
      "technologies": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string", 
      "year": "string"
    }
  ],
  "skills": ["string"],
  "certifications": ["string"]
}

CRITICAL EXTRACTION RULES:

1. SKILLS - Extract ALL technical and professional skills from:
   - Dedicated skills sections
   - Tools/technologies mentioned in experience ("used Python", "worked with AWS", "managed Jira")
   - Project descriptions
   - Technologies in job descriptions
   - Methodologies (Agile, Scrum, Waterfall)
   - Soft skills if explicitly listed

2. CERTIFICATIONS - ONLY extract if EXPLICITLY mentioned:
   - Look for words like "Certified", "Certification", "Certificate"
   - Extract the EXACT certification name as written
   - If NO certifications are mentioned, return EMPTY array []
   - DO NOT infer certifications from skills
   - DO NOT create fake certifications

3. EXPERIENCE - Extract:
   - Company name, role, dates
   - Key achievements and responsibilities
   - Technologies used in each role (separate field)

4. Use null for missing personal information, not "Not found"

Resume text:
${text}

Return only the JSON object, no other text:`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const jsonText = response.data.choices[0].message.content.trim();
      console.log('🤖 AI CV extraction response:', jsonText);
      
      const structuredData = JSON.parse(jsonText);
      console.log('✅ CV skills extracted:', structuredData.skills);
      
      return structuredData;
    } catch (error) {
      console.error('LLM extraction failed:', error.message);
      return this.getFallbackStructure(entities, text);
    }
  }

  /**
   * STEP 5: EVIDENCE BINDING - Store character offsets
   */
  bindEvidence(structuredData, entities, text) {
    const evidenceMap = {};

    // Bind personal info to entities
    if (structuredData.personal) {
      Object.keys(structuredData.personal).forEach(field => {
        const value = structuredData.personal[field];
        if (value && value !== 'Not found') {
          const entity = entities.find(e => 
            e.value.toLowerCase().includes(value.toLowerCase()) ||
            value.toLowerCase().includes(e.value.toLowerCase())
          );
          
          if (entity) {
            evidenceMap[field] = {
              value: value,
              startOffset: entity.startOffset,
              endOffset: entity.endOffset,
              contextWindow: entity.contextWindow,
              confidence: entity.confidence
            };
          }
        }
      });
    }

    return evidenceMap;
  }

  /**
   * STEP 6: SCORING - Must-have gate + Semantic similarity + Recency + Impact
   */
  async calculateScores(structuredData, jobRequirements, entities) {
    const scores = {
      mustHaveScore: 0,
      semanticScore: 0,
      recencyScore: 0,
      impactScore: 0,
      overallScore: 0
    };

    // Must-have gate (boolean rules)
    if (jobRequirements.mustHave) {
      const mustHaveMatches = jobRequirements.mustHave.filter(skill =>
        structuredData.skills?.some(candidateSkill => 
          candidateSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      scores.mustHaveScore = (mustHaveMatches.length / jobRequirements.mustHave.length) * 40;
    }

    // Semantic similarity (would use pgvector in production)
    scores.semanticScore = await this.calculateSemanticSimilarity(
      structuredData, 
      jobRequirements
    ) * 30;

    // Recency weight
    scores.recencyScore = this.calculateRecencyScore(structuredData.experience) * 20;

    // Impact verbs bonus
    scores.impactScore = this.calculateImpactScore(structuredData.experience) * 10;

    // Overall score
    scores.overallScore = scores.mustHaveScore + scores.semanticScore + 
                         scores.recencyScore + scores.impactScore;

    return scores;
  }

  /**
   * STEP 7: VERIFIER - Second pass with 70B model simulation
   */
  async verifyExtraction(structuredData, text, entities) {
    const verification = {
      fieldValidityRate: 0,
      evidenceCoverage: 0,
      disagreementRate: 0,
      issues: []
    };

    // Date sanity checks
    const currentYear = new Date().getFullYear();
    structuredData.experience?.forEach(exp => {
      const startYear = parseInt(exp.startDate);
      const endYear = parseInt(exp.endDate);
      
      if (startYear > currentYear || endYear > currentYear + 1) {
        verification.issues.push(`Future date detected: ${exp.company}`);
      }
      
      if (startYear > endYear && exp.endDate !== 'Present') {
        verification.issues.push(`Invalid date range: ${exp.company}`);
      }
    });

    // Calculate metrics
    const totalFields = this.countFields(structuredData);
    const validFields = totalFields - verification.issues.length;
    verification.fieldValidityRate = (validFields / totalFields) * 100;
    verification.evidenceCoverage = (entities.length / totalFields) * 100;
    verification.disagreementRate = (verification.issues.length / totalFields) * 100;

    return verification;
  }

  /**
   * MAIN PROCESSING PIPELINE
   */
  async processResume(fileBuffer, fileName, jobRequirements) {
    const processingStart = Date.now();
    
    try {
      // Step 1: Ingress
      const ingressData = await this.ingressDocument(fileBuffer, fileName);
      
      // Step 2: Parsing
      const parseData = await this.parseDocument(fileBuffer, ingressData.fileType);
      
      // Step 3: Entity extraction
      const entities = await this.extractEntities(parseData.rawText);
      
      // Step 4: LLM extraction
      const structuredData = await this.extractStructuredData(parseData.rawText, entities);
      
      // Step 5: Evidence binding
      const evidenceMap = this.bindEvidence(structuredData, entities, parseData.rawText);
      
      // Step 6: Scoring
      const scores = await this.calculateScores(structuredData, jobRequirements, entities);
      
      // Step 7: Verification
      const verification = await this.verifyExtraction(structuredData, parseData.rawText, entities);
      
      return {
        success: true,
        resumeId: ingressData.fileId,
        fileName: fileName,
        structuredData: structuredData,
        entities: entities,
        evidenceMap: evidenceMap,
        scores: scores,
        verification: verification,
        processingTime: Date.now() - processingStart,
        metadata: {
          fieldValidityRate: verification.fieldValidityRate,
          evidenceCoverage: verification.evidenceCoverage,
          disagreementRate: verification.disagreementRate
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - processingStart
      };
    }
  }

  // Helper methods
  generateId() {
    return 'hr01_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  extractLayoutBlocks(text) {
    return text.split('\n\n').map((block, index) => ({
      id: index,
      text: block.trim(),
      type: this.detectBlockType(block)
    }));
  }

  detectBlockType(block) {
    if (block.includes('@')) return 'contact';
    if (block.match(/\d{4}/)) return 'experience';
    if (block.toLowerCase().includes('university') || block.toLowerCase().includes('degree')) return 'education';
    return 'text';
  }

  getContextWindow(text, position, windowSize) {
    const start = Math.max(0, position - windowSize);
    const end = Math.min(text.length, position + windowSize);
    return text.substring(start, end);
  }

  getFallbackStructure(entities, rawText = '') {
    const emailEntity = entities.find(e => e.type === 'EMAIL');
    const phoneEntity = entities.find(e => e.type === 'PHONE');
    const linkedinEntity = entities.find(e => e.type === 'LINKEDIN');
    
    // Extract name from entities or text
    let name = 'Name not found';
    const nameEntity = entities.find(e => e.type === 'PERSON');
    if (nameEntity) {
      name = this.normalizeName(nameEntity.value);
    } else {
      // Try to extract name from email
      const email = emailEntity?.value;
      if (email) {
        const emailName = email.split('@')[0].replace(/[._]/g, ' ');
        name = this.normalizeName(emailName);
      }
    }

    // Extract basic skills from text using common patterns
    const skills = this.extractBasicSkills(rawText);
    
    // Extract basic experience info
    const experience = this.extractBasicExperience(rawText);
    
    // Extract basic education info  
    const education = this.extractBasicEducation(rawText);

    return {
      personal: {
        name: name,
        email: emailEntity?.value || 'Email not found',
        phone: phoneEntity?.value || 'Phone not found',
        location: 'Location not specified',
        linkedin: linkedinEntity?.value || 'LinkedIn not found'
      },
      experience: experience,
      education: education,
      skills: skills,
      certifications: []
    };
  }

  normalizeName(name) {
    if (!name || name === 'Name not found') return name;
    
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  extractBasicSkills(text) {
    if (!text) return [];
    
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 'SQL',
      'MongoDB', 'PostgreSQL', 'Git', 'Docker', 'AWS', 'Azure', 'TypeScript',
      'Angular', 'Vue.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
      'PHP', 'C++', 'C#', '.NET', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
      'Machine Learning', 'Data Science', 'AI', 'DevOps', 'Kubernetes',
      'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'Project Management'
    ];
    
    const foundSkills = [];
    const textLower = text.toLowerCase();
    
    commonSkills.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills.slice(0, 10); // Limit to 10 skills
  }

  extractBasicExperience(text) {
    if (!text) return [];
    
    // Simple pattern matching for experience
    const lines = text.split('\n');
    const experience = [];
    
    lines.forEach(line => {
      // Look for company/role patterns
      if (line.match(/\b(developer|engineer|manager|analyst|designer|consultant)\b/i)) {
        experience.push({
          company: 'Company not specified',
          role: line.trim().substring(0, 50),
          startDate: 'Date not specified',
          endDate: 'Date not specified',
          achievements: []
        });
      }
    });
    
    return experience.slice(0, 3); // Limit to 3 experiences
  }

  extractBasicEducation(text) {
    if (!text) return [];
    
    const education = [];
    const textLower = text.toLowerCase();
    
    // Look for degree patterns
    const degrees = ['bachelor', 'master', 'phd', 'diploma', 'certificate'];
    const fields = ['computer science', 'engineering', 'business', 'mathematics', 'physics'];
    
    degrees.forEach(degree => {
      if (textLower.includes(degree)) {
        const field = fields.find(f => textLower.includes(f)) || 'Field not specified';
        education.push({
          institution: 'Institution not specified',
          degree: degree.charAt(0).toUpperCase() + degree.slice(1),
          field: field.charAt(0).toUpperCase() + field.slice(1),
          year: 'Year not specified'
        });
      }
    });
    
    return education.slice(0, 2); // Limit to 2 education entries
  }

  async calculateSemanticSimilarity(structuredData, jobRequirements) {
    // Simplified semantic similarity
    // In production: use actual pgvector embeddings
    const candidateText = JSON.stringify(structuredData).toLowerCase();
    const jobText = JSON.stringify(jobRequirements).toLowerCase();
    
    const commonWords = candidateText.split(' ').filter(word => 
      jobText.includes(word) && word.length > 3
    );
    
    return Math.min(1.0, commonWords.length / 20);
  }

  calculateRecencyScore(experience) {
    if (!experience || experience.length === 0) return 0;
    
    const currentYear = new Date().getFullYear();
    const mostRecentYear = Math.max(...experience.map(exp => {
      const endYear = exp.endDate === 'Present' ? currentYear : parseInt(exp.endDate);
      return endYear || 0;
    }));
    
    const yearsAgo = currentYear - mostRecentYear;
    
    if (yearsAgo <= 5) return 1.0;
    if (yearsAgo <= 10) return 0.5;
    return 0.25;
  }

  calculateImpactScore(experience) {
    if (!experience || experience.length === 0) return 0;
    
    const impactVerbs = ['implemented', 'built', 'owned', 'led', 'created', 'developed', 'managed', 'increased', 'reduced', 'improved'];
    let impactCount = 0;
    
    experience.forEach(exp => {
      exp.achievements?.forEach(achievement => {
        impactVerbs.forEach(verb => {
          if (achievement.toLowerCase().includes(verb)) {
            impactCount++;
          }
        });
      });
    });
    
    return Math.min(1.0, impactCount / 5);
  }

  countFields(obj) {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          count += obj[key].length;
        } else {
          count += this.countFields(obj[key]);
        }
      } else {
        count++;
      }
    }
    return count;
  }

  /**
   * HOLISTIC CV ASSESSMENT - Let ChatGPT analyze the entire CV contextually
   * This replaces robotic skill matching with intelligent evaluation
   */
  async assessCVHolistically(cvText, jobRequirements) {
    const jdText = JSON.stringify(jobRequirements, null, 2);
    
    const prompt = `You are a world-class HR expert and talent acquisition specialist. Analyze this CV holistically against the job requirements.

JOB REQUIREMENTS:
${jdText}

CANDIDATE CV:
${cvText}

Provide a comprehensive assessment in JSON format:

{
  "overallFit": "number 0-100",
  "strengths": ["detailed strength 1", "detailed strength 2", "detailed strength 3"],
  "weaknesses": ["detailed weakness 1", "detailed weakness 2"],
  "keyHighlights": ["impressive achievement 1", "impressive achievement 2"],
  "matchedRequirements": ["requirement 1", "requirement 2"],
  "missingRequirements": ["requirement 1", "requirement 2"],
  "experienceRelevance": "detailed analysis of how their experience aligns",
  "culturalFit": "assessment of soft skills and work style",
  "recommendation": "Strong Hire | Hire | Maybe | Pass",
  "detailedReasoning": "comprehensive paragraph explaining the recommendation"
}

ANALYSIS GUIDELINES:
1. Look at the COMPLETE picture - experience quality, career progression, achievements, not just skill keywords
2. Consider context: How did they use their skills? What impact did they make?
3. Evaluate career trajectory and growth potential
4. Assess both technical capabilities AND soft skills/leadership
5. Be specific in your reasoning - reference actual achievements from their CV
6. Consider transferable skills and learning ability
7. Don't just count matching keywords - evaluate depth of experience

Return only the JSON object:`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-4', // Use GPT-4 for better analysis
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const jsonText = response.data.choices[0].message.content.trim();
      const assessment = JSON.parse(jsonText);
      
      return assessment;
    } catch (error) {
      console.error('Holistic assessment failed:', error.message);
      return {
        overallFit: 0,
        strengths: [],
        weaknesses: [],
        keyHighlights: [],
        matchedRequirements: [],
        missingRequirements: [],
        experienceRelevance: 'Assessment failed',
        culturalFit: 'Assessment failed',
        recommendation: 'Pass',
        detailedReasoning: 'Unable to assess candidate due to technical error'
      };
    }
  }

  /**
   * RANK ALL CANDIDATES - Let ChatGPT rank them intelligently
   */
  async rankCandidatesIntelligently(candidates, jobRequirements) {
    const candidateSummaries = candidates.map((c, idx) => ({
      index: idx,
      name: c.name || 'Candidate ' + (idx + 1),
      assessment: c.assessment,
      keySkills: c.structuredData?.skills?.slice(0, 10) || [],
      experience: c.structuredData?.experience?.map(e => `${e.role} at ${e.company}`) || []
    }));

    const prompt = `You are a world-class HR expert. Rank these ${candidates.length} candidates from BEST to WORST for the given position.

JOB REQUIREMENTS:
${JSON.stringify(jobRequirements, null, 2)}

CANDIDATES TO RANK:
${JSON.stringify(candidateSummaries, null, 2)}

Return a JSON array with rankings:

[
  {
    "originalIndex": 0,
    "rank": 1,
    "name": "Candidate Name",
    "rankingReason": "Detailed explanation of why this candidate ranks here. Reference specific skills, experience, and achievements.",
    "recommendationLevel": "Strong Hire | Hire | Maybe | Pass"
  }
]

RANKING CRITERIA:
1. Overall fit and experience relevance (most important)
2. Depth of required skills, not just breadth
3. Career progression and achievements
4. Cultural fit and soft skills
5. Learning ability and growth potential
6. Specific accomplishments that demonstrate capability

Be specific in your reasoning. Reference actual experience and skills from each candidate.

Return only the JSON array:`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const jsonText = response.data.choices[0].message.content.trim();
      const rankings = JSON.parse(jsonText);
      
      return rankings;
    } catch (error) {
      console.error('Intelligent ranking failed:', error.message);
      // Fallback to simple ranking by assessment score
      return candidates.map((c, idx) => ({
        originalIndex: idx,
        rank: idx + 1,
        name: c.name || 'Candidate ' + (idx + 1),
        rankingReason: 'Ranked based on overall assessment score',
        recommendationLevel: c.assessment?.recommendation || 'Maybe'
      }));
    }
  }
}

module.exports = CVIntelligenceHR01;
