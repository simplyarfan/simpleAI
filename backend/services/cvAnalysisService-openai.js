/**
 * OPENAI CV Analysis Service - Context-Aware AI Analysis
 * Uses OpenAI API for intelligent CV analysis like ChatGPT
 */

const axios = require('axios');
const cacheService = require('./cacheService');

class CVAnalysisService {
  constructor() {
    try {
      // OPENAI API CONFIGURATION
      this.apiKey = process.env.OPENAI_API_KEY || null;
      this.apiUrl = 'https://api.openai.com/v1/chat/completions';
      this.model = 'gpt-3.5-turbo';
      this.initialized = true;
      this.cache = cacheService;
      
      console.log('🤖 OpenAI CV Analysis Service initializing...');
      console.log('🧠 Using model:', this.model);
      console.log('☁️ OpenAI-powered service ready');
      
      if (this.apiKey && this.apiKey.length > 10) {
        console.log('✅ OpenAI API key configured! AI analysis available');
        console.log('🔑 Key preview:', this.apiKey.substring(0, 8) + '...');
      } else {
        console.log('⚠️ No OpenAI API key found - will use fallback analysis');
        console.log('📝 Add OPENAI_API_KEY to environment for full AI features');
      }
    } catch (error) {
      console.error('❌ OpenAI CVAnalysisService constructor error:', error.message);
      this.initialized = false;
      this.apiKey = null;
    }
    
    // Tech keywords for fallback
    this.techKeywords = [
      'python', 'javascript', 'java', 'c++', 'sql', 'html', 'css', 'typescript', 'php', 'ruby', 'go', 'rust', 'swift',
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'tensorflow', 'keras', 'pytorch', 'pandas', 'numpy',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'linux', 'mongodb', 'postgresql', 'mysql', 'redis',
      'machine learning', 'artificial intelligence', 'data science', 'deep learning', 'nlp', 'computer vision'
    ];
    
    this.softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative', 'adaptable', 'organized'
    ];
  }

  /**
   * Main CV Analysis Method - Uses OpenAI for intelligent analysis with Redis caching
   */
  async analyzeCV(jobDescription, cvText, fileName) {
    console.log('🧠 Starting OpenAI CV analysis for:', fileName);
    console.log('📝 Job Description length:', jobDescription.length, 'characters');
    console.log('📄 CV Text length:', cvText.length, 'characters');
    
    // Generate cache key based on content hash
    const crypto = require('crypto');
    const contentHash = crypto.createHash('md5')
      .update(jobDescription + cvText)
      .digest('hex')
      .substring(0, 16);
    
    const cacheKey = `${fileName}_${contentHash}`;
    
    // Try to get cached result first
    console.log('🔍 Checking cache for analysis...');
    const cachedResult = await this.cache.getCachedCVAnalysis(cacheKey);
    if (cachedResult) {
      console.log('🎯 Using cached analysis result - 100% cost savings!');
      return cachedResult;
    }
    
    console.log('❌ No cache found, performing fresh analysis...');
    
    try {
      let analysisResult;
      
      if (this.apiKey) {
        console.log('🚀 Using OpenAI for intelligent analysis...');
        analysisResult = await this.performOpenAIAnalysis(jobDescription, cvText, fileName);
      } else {
        console.log('⚡ No API key - using enhanced fallback analysis...');
        analysisResult = await this.performFallbackAnalysis(jobDescription, cvText, fileName);
      }
      
      // Cache the result for 24 hours
      console.log('💾 Caching analysis result for future requests...');
      await this.cache.cacheCVAnalysis(cacheKey, analysisResult, 86400);
      
      return analysisResult;
      
    } catch (error) {
      console.error('❌ OpenAI analysis failed:', error.message);
      console.log('⚡ Falling back to enhanced analysis...');
      const fallbackResult = await this.performFallbackAnalysis(jobDescription, cvText, fileName);
      
      // Cache fallback result for shorter time (1 hour)
      await this.cache.cacheCVAnalysis(cacheKey, fallbackResult, 3600);
      
      return fallbackResult;
    }
  }

  /**
   * OpenAI-Powered Analysis - Like ChatGPT
   */
  async performOpenAIAnalysis(jobDescription, cvText, fileName) {
    console.log('🧠 OpenAI: Performing intelligent CV analysis...');
    
    const prompt = `You are an expert HR recruiter with 15+ years of experience. Analyze this CV against the job description like ChatGPT would - naturally and intelligently.

JOB DESCRIPTION:
${jobDescription}

CV CONTENT:
${cvText}

INSTRUCTIONS:
1. Score the candidate out of 10 (not percentage) - be realistic, not everyone is 8.5/10
2. Extract ALL skills from the CV, not just 2-3
3. Show comprehensive skill matching - list many matched AND missing skills
4. Be natural and conversational in your analysis like ChatGPT
5. Give varied, realistic scores based on actual fit

Return JSON in this exact format:
{
  "personal": {
    "name": "Full name from CV",
    "email": "Email address", 
    "phone": "Phone with country code",
    "location": "City, Country"
  },
  "overallScore": 7.2,
  "scoreOutOf": 10,
  "recommendation": "Highly Recommended / Recommended / Consider / Not Recommended",
  "skills": {
    "allTechnical": ["List ALL technical skills found - be comprehensive"],
    "allSoft": ["List ALL soft skills found"],
    "matched": ["Skills that match job requirements - be generous, show many"],
    "missing": ["Important skills missing for this role - show several"]
  },
  "experience": [
    {
      "title": "Job title from CV",
      "company": "Company name",
      "duration": "Time period", 
      "description": "What they did and achieved",
      "relevance": "High/Medium/Low relevance to target role"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/College",
      "year": "Year",
      "field": "Field of study"
    }
  ],
  "strengths": ["3-4 key strengths based on CV"],
  "concerns": ["2-3 areas of concern or gaps"],
  "summary": "Natural, conversational 2-3 sentence summary explaining the score and recommendation like ChatGPT would write it"
}

Be thorough, realistic, and natural in your analysis. Return only valid JSON.`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst who provides detailed CV analysis. Always return valid JSON responses.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const aiResponse = response.data.choices[0].message.content;
      console.log('✅ OpenAI response received');
      
      // Parse JSON response
      let analysisData;
      try {
        // Clean the response to extract JSON
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI JSON response:', parseError.message);
        console.log('Raw response:', aiResponse);
        throw new Error('Invalid JSON response from OpenAI');
      }

      // Convert to expected format
      return this.formatOpenAIResponse(analysisData, fileName);

    } catch (error) {
      console.error('❌ OpenAI API call failed:', error.message);
      throw error;
    }
  }

  /**
   * Format OpenAI response to match expected structure
   */
  formatOpenAIResponse(data, fileName) {
    console.log('🔄 Formatting OpenAI response...');
    
    const personal = data.personal || {};
    const skills = data.skills || {};
    
    // Convert score from /10 to percentage for UI compatibility  
    const scoreOutOf10 = data.overallScore || 5.0;
    const percentageScore = Math.round(scoreOutOf10 * 10); // 7.2 -> 72%
    
    console.log(`🎯 OpenAI Score: ${scoreOutOf10}/10 (${percentageScore}%)`);
    console.log(`📊 Skills found: ${skills.allTechnical?.length || 0} technical, ${skills.allSoft?.length || 0} soft`);
    console.log(`✅ Recommendation: ${data.recommendation}`);
    
    return {
      name: personal.name || this.extractNameFromFilename(fileName),
      email: personal.email || 'Email not found',
      phone: personal.phone || 'Phone not found',
      score: percentageScore,
      scoreOutOf10: scoreOutOf10,
      skillsMatch: Math.round((skills.matched?.length || 0) * 10), // Dynamic based on matched skills
      experienceMatch: Math.round(scoreOutOf10 * 8), // Experience component
      educationMatch: Math.round(scoreOutOf10 * 9), // Education component
      strengths: data.strengths || ['Professional background', 'Relevant experience'],
      weaknesses: data.concerns || ['Areas for improvement identified'],
      summary: data.summary || `${personal.name}: ${data.recommendation} candidate with ${scoreOutOf10}/10 overall rating.`,
      skillsMatched: skills.matched || [],
      skillsMissing: skills.missing || [],
      jdRequiredSkills: skills.missing || [], // Skills needed for role
      cvSkills: [...(skills.allTechnical || []), ...(skills.allSoft || [])],
      recommendation: data.recommendation || 'Consider',
      analysisData: {
        personal: personal,
        skills: skills.allTechnical || [],
        softSkills: skills.allSoft || [],
        experience: data.experience || [],
        education: data.education || [],
        matchedSkills: skills.matched || [],
        missingSkills: skills.missing || [],
        naturalSummary: data.summary,
        aiRecommendation: data.recommendation
      }
    };
  }

  /**
   * Minimal Fallback Analysis (only if no API key - should rarely be used)
   */
  async performFallbackAnalysis(jobDescription, cvText, fileName) {
    console.log('⚠️ No OpenAI API key - using minimal fallback analysis');
    console.log('🚨 For best results, add OPENAI_API_KEY to environment variables');
    
    return {
      name: this.extractNameFromFilename(fileName),
      email: 'Email extraction requires OpenAI',
      phone: 'Phone extraction requires OpenAI',
      score: 60,
      skillsMatch: 60,
      experienceMatch: 60,
      educationMatch: 60,
      strengths: ['OpenAI analysis required for detailed insights'],
      weaknesses: ['Add OPENAI_API_KEY for comprehensive analysis'],
      summary: 'Basic analysis - OpenAI required for detailed evaluation',
      skillsMatched: [],
      skillsMissing: [],
      jdRequiredSkills: [],
      cvSkills: [],
      analysisData: {
        personal: { name: this.extractNameFromFilename(fileName) },
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        projects: [],
        match_analysis: {
          skills_matched: [],
          skills_missing: [],
          strengths: ['OpenAI analysis required'],
          concerns: ['Add OPENAI_API_KEY for detailed analysis']
        }
      }
    };
  }

  // Helper methods for fallback analysis
  extractNameFromFilename(fileName) {
    let name = fileName
      .replace(/\.(pdf|doc|docx|txt)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b(resume|cv|curriculum|vitae)\b/gi, '')
      .trim();
    
    if (name && name.length > 2) {
      name = name
        .split(' ')
        .filter(word => word.length > 1)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return name;
    }
    
    return 'Candidate Name';
  }

  extractEmail(cvText) {
    const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return emailMatch ? emailMatch[0] : null;
  }

  extractPhone(cvText) {
    const phonePatterns = [
      /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/,
      /(?:phone|tel|mobile|cell|contact)[:.\s]*([+\d\s\-\(\)\.]{8,20})/i
    ];
    
    for (const pattern of phonePatterns) {
      const match = cvText.match(pattern);
      if (match) {
        const phone = (match[1] || match[0]).trim();
        if (phone.length >= 8 && /\d{6,}/.test(phone)) {
          return phone;
        }
      }
    }
    return null;
  }

  extractLocation(cvText) {
    const locationPatterns = [
      /(?:location|address|city|based in)[:.\s]*([A-Za-z\s,]{3,50})/i,
      /([A-Z][a-z]{3,},\s*[A-Z][a-z]{2,})/
    ];
    
    for (const pattern of locationPatterns) {
      const match = cvText.match(pattern);
      if (match && match[1]) {
        const location = match[1].trim();
        // Simple validation - not a tech skill
        if (!this.techKeywords.some(skill => location.toLowerCase().includes(skill))) {
          return location;
        }
      }
    }
    return null;
  }

  analyzeSkills(jobDescription, cvText) {
    console.log('🛠️ ANALYZING SKILLS:');
    const jdLower = jobDescription.toLowerCase();
    const cvLower = cvText.toLowerCase();
    
    // Find required skills in job description
    const required = this.techKeywords.filter(skill => jdLower.includes(skill.toLowerCase()));
    console.log('- Required skills from JD:', required);
    
    // Find all skills present in CV
    const cvSkills = this.techKeywords.filter(skill => cvLower.includes(skill.toLowerCase()));
    const softSkillsFound = this.softSkills.filter(skill => cvLower.includes(skill.toLowerCase()));
    const allCvSkills = [...cvSkills, ...softSkillsFound];
    console.log('- Skills found in CV:', allCvSkills);
    
    // Find matching and missing skills
    const matched = required.filter(skill => cvLower.includes(skill.toLowerCase()));
    const missing = required.filter(skill => !cvLower.includes(skill.toLowerCase()));
    
    console.log('- Skills matched:', matched);
    console.log('- Skills missing:', missing);
    
    return { 
      required, 
      cvSkills: allCvSkills, 
      matched, 
      missing 
    };
  }

  extractExperience(cvText) {
    const experiences = [];
    
    // Enhanced patterns for better experience extraction
    const experiencePatterns = [
      // Company | Position | Duration format
      /(.+?)\s*\|\s*(.+?)\s*\|\s*([\d\-\s,to present]+)/gi,
      // Position at Company (Duration)
      /(.+?)\s*(?:at|@)\s*(.+?)\s*\(([\d\-\s,to present]+)\)/gi,
      // Job titles with context
      /\b((?:Senior|Junior|Lead|Principal|Staff)?\s*(?:Software|Data|AI|Machine Learning|Full Stack|Backend|Frontend|DevOps|Cloud|Research)\s*(?:Engineer|Developer|Scientist|Analyst|Architect|Specialist|Researcher))\b/gi
    ];
    
    // Try structured patterns first
    for (let i = 0; i < 2; i++) {
      const pattern = experiencePatterns[i];
      let match;
      while ((match = pattern.exec(cvText)) !== null && experiences.length < 10) {
        if (i === 0) {
          // Company | Position | Duration
          experiences.push({
            title: match[2].trim(),
            company: match[1].trim(),
            duration: match[3].trim(),
            description: 'Professional experience with documented responsibilities'
          });
        } else {
          // Position at Company (Duration)
          experiences.push({
            title: match[1].trim(),
            company: match[2].trim(),
            duration: match[3].trim(),
            description: 'Professional role with documented experience'
          });
        }
      }
    }
    
    // If no structured experience found, look for job titles
    if (experiences.length === 0) {
      const jobTitlePattern = experiencePatterns[2];
      let match;
      while ((match = jobTitlePattern.exec(cvText)) !== null && experiences.length < 5) {
        experiences.push({
          title: match[1].trim(),
          company: 'Company details in CV',
          duration: 'Duration in CV',
          description: 'Professional experience'
        });
      }
    }
    
    return experiences;
  }

  extractEducation(cvText) {
    const education = [];
    const degreePattern = /(Bachelor|Master|PhD|B\.S|M\.S).+?(Computer Science|Engineering|Science|Technology)/gi;
    let match;
    while ((match = degreePattern.exec(cvText)) !== null && education.length < 2) {
      education.push({
        degree: `${match[1]} ${match[2]}`,
        institution: 'Institution in CV',
        year: 'Year in CV',
        field: match[2]
      });
    }
    return education;
  }

  // REMOVED: All custom scoring logic - Pure AI analysis now

  generateStrengths(skillsAnalysis, experience, education) {
    const strengths = [];
    if (skillsAnalysis.matched.length > 0) {
      strengths.push(`Strong technical alignment: ${skillsAnalysis.matched.slice(0, 3).join(', ')}`);
    }
    if (experience.length > 1) {
      strengths.push(`Diverse professional experience across ${experience.length} positions`);
    }
    if (education.length > 0) {
      strengths.push(`Solid educational foundation: ${education[0].degree}`);
    }
    return strengths.length > 0 ? strengths : ['Professional background shows potential'];
  }

  generateWeaknesses(skillsAnalysis, scores) {
    const weaknesses = [];
    if (skillsAnalysis.missing.length > 0) {
      weaknesses.push(`Skills development needed: ${skillsAnalysis.missing.slice(0, 3).join(', ')}`);
    }
    if (scores.experience < 60) {
      weaknesses.push('Experience level could be enhanced for optimal role fit');
    }
    return weaknesses.length > 0 ? weaknesses : ['Areas for improvement identified'];
  }

  generateSummary(name, scores, skillsAnalysis) {
    const fitLevel = scores.overall >= 80 ? 'excellent' : scores.overall >= 70 ? 'strong' : scores.overall >= 60 ? 'good' : 'fair';
    return `${name} presents a ${fitLevel} candidate profile with ${scores.overall}% overall compatibility. Technical skills show alignment with ${skillsAnalysis.matched.length}/${skillsAnalysis.required.length} required skills matched.`;
  }

  /**
   * OpenAI Intelligent Ranking - Let AI rank candidates
   */
  async rankCandidatesWithAI(candidates, jobDescription) {
    if (!this.apiKey || candidates.length <= 1) {
      console.log('⚠️ No API key or insufficient candidates for AI ranking');
      return candidates.sort((a, b) => b.score - a.score); // Fallback to score sorting
    }

    console.log('🧠 OpenAI: Ranking candidates intelligently...');

    const candidatesSummary = candidates.map((candidate, index) => ({
      index: index,
      name: candidate.name,
      score: candidate.score,
      skills_matched: candidate.skillsMatched?.length || 0,
      skills_missing: candidate.skillsMissing?.length || 0,
      experience_count: candidate.analysisData?.experience?.length || 0,
      education_count: candidate.analysisData?.education?.length || 0,
      experience_details: candidate.analysisData?.experience?.map(exp => `${exp.position} at ${exp.company}`).join('; ') || 'No experience details',
      skills_list: candidate.skillsMatched?.join(', ') || 'No skills matched',
      summary: candidate.summary
    }));

    const rankingPrompt = `You are an expert HR manager. Rank these candidates for the given job position based on overall fit, not just scores.

JOB DESCRIPTION:
${jobDescription}

CANDIDATES TO RANK:
${JSON.stringify(candidatesSummary, null, 2)}

Please rank them from BEST to WORST fit and return a JSON array with just the indices in ranking order:
{
  "ranking": [2, 0, 1],
  "reasoning": "Brief explanation of ranking logic"
}

Consider:
1. Skills match quality and relevance
2. Experience relevance and seniority
3. Overall profile fit for the role
4. Quality of experience over quantity
5. Educational background and certifications
6. Growth potential and learning mindset
7. Not just the numerical score but actual qualifications and experience depth`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR manager who ranks candidates based on job fit. Return valid JSON only.'
          },
          {
            role: 'user',
            content: rankingPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const aiResponse = response.data.choices[0].message.content;
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const rankingData = JSON.parse(jsonMatch[0]);
        const rankedCandidates = rankingData.ranking.map(index => candidates[index]);
        console.log('✅ OpenAI ranking completed:', rankingData.reasoning);
        console.log('📊 Ranking order:', rankingData.ranking.map(index => candidates[index].name));
        return rankedCandidates;
      } else {
        console.log('⚠️ No valid JSON found in OpenAI ranking response');
        console.log('Raw response:', aiResponse);
      }
    } catch (error) {
      console.error('❌ OpenAI ranking failed:', error.message);
    }

    // Fallback to score-based ranking
    console.log('⚠️ Using fallback score-based ranking');
    return candidates.sort((a, b) => b.score - a.score);
  }

  // Helper method to extract name from filename
  extractNameFromFilename(fileName) {
    return fileName
      .replace(/\.(pdf|doc|docx)$/i, '')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}

module.exports = CVAnalysisService;
