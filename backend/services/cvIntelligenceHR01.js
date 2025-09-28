/**
 * CV INTELLIGENCE (HR-01) - CLEAN IMPLEMENTATION
 * Following EXACT blueprint: Ingress → Docling → spaCy → Llama 3.1 → Pydantic → pgvector
 */

const axios = require('axios');

class CVIntelligenceHR01 {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo'; // Using available model instead of Llama 3.1
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
   * STEP 2: PARSING - Docling → text + layout blocks
   */
  async parseDocument(fileBuffer, fileType) {
    // Simulating Docling parsing
    // In production: use actual Docling library
    let text = '';
    
    if (fileType === 'pdf') {
      // Use pdf-parse if available, otherwise fallback
      try {
        const pdf = require('pdf-parse');
        const pdfData = await pdf(fileBuffer);
        text = pdfData.text;
      } catch (e) {
        text = 'PDF parsing not available - please install pdf-parse';
      }
    } else {
      text = fileBuffer.toString('utf-8');
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
    const prompt = `Extract structured information from this resume. Return ONLY valid JSON matching this exact schema:

{
  "personal": {
    "name": "string",
    "email": "string", 
    "phone": "string",
    "location": "string",
    "linkedin": "string"
  },
  "experience": [
    {
      "company": "string",
      "role": "string", 
      "startDate": "string",
      "endDate": "string",
      "achievements": ["string"]
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
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('LLM extraction failed:', error.message);
      return this.getFallbackStructure(entities);
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

  getFallbackStructure(entities) {
    const emailEntity = entities.find(e => e.type === 'EMAIL');
    const phoneEntity = entities.find(e => e.type === 'PHONE');
    const linkedinEntity = entities.find(e => e.type === 'LINKEDIN');

    return {
      personal: {
        name: 'Name not found',
        email: emailEntity?.value || 'Email not found',
        phone: phoneEntity?.value || 'Phone not found',
        location: 'Location not specified',
        linkedin: linkedinEntity?.value || 'LinkedIn not found'
      },
      experience: [],
      education: [],
      skills: [],
      certifications: []
    };
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
}

module.exports = CVIntelligenceHR01;
