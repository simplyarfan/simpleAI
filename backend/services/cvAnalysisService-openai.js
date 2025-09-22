/**
 * OPENAI CV Analysis Service - Context-Aware AI Analysis
 * Uses OpenAI API for intelligent CV analysis like ChatGPT
 */

const axios = require('axios');

class CVAnalysisService {
  constructor() {
    try {
      // OPENAI API CONFIGURATION
      this.apiKey = process.env.OPENAI_API_KEY || null;
      this.apiUrl = 'https://api.openai.com/v1/chat/completions';
      this.model = 'gpt-3.5-turbo';
      this.initialized = true;
      
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
   * Main CV Analysis Method - Uses OpenAI for intelligent analysis
   */
  async analyzeCV(jobDescription, cvText, fileName) {
    console.log('🧠 Starting OpenAI CV analysis for:', fileName);
    console.log('📝 Job Description length:', jobDescription.length, 'characters');
    console.log('📄 CV Text length:', cvText.length, 'characters');
    
    try {
      if (this.apiKey) {
        console.log('🚀 Using OpenAI for intelligent analysis...');
        return await this.performOpenAIAnalysis(jobDescription, cvText, fileName);
      } else {
        console.log('⚡ No API key - using enhanced fallback analysis...');
        return await this.performFallbackAnalysis(jobDescription, cvText, fileName);
      }
    } catch (error) {
      console.error('❌ OpenAI analysis failed:', error.message);
      console.log('⚡ Falling back to enhanced analysis...');
      return await this.performFallbackAnalysis(jobDescription, cvText, fileName);
    }
  }

  /**
   * OpenAI-Powered Analysis - Like ChatGPT
   */
  async performOpenAIAnalysis(jobDescription, cvText, fileName) {
    console.log('🧠 OpenAI: Performing intelligent CV analysis...');
    
    const prompt = `You are an expert HR analyst with 15+ years of experience. Analyze this CV comprehensively against the job description like a senior recruiter would.

JOB DESCRIPTION:
${jobDescription}

CV CONTENT:
${cvText}

FILENAME: ${fileName}

Provide a thorough analysis and return a JSON response with this structure:
{
  "personal": {
    "name": "Extract the candidate's full name (NOT placeholder text)",
    "email": "Extract email address",
    "phone": "Extract phone number with country code",
    "location": "Extract city/country (NOT technical skills)"
  },
  "skills": {
    "technical": ["List ALL technical skills found - programming languages, frameworks, tools, databases"],
    "soft": ["List soft skills - leadership, communication, teamwork, etc."],
    "matched": ["Skills that directly match job requirements"],
    "missing": ["Critical skills missing but required for the role"]
  },
  "experience": [
    {
      "title": "Exact job title from CV",
      "company": "Company/Organization name", 
      "duration": "Start date - End date or duration",
      "description": "Detailed description of responsibilities, achievements, and impact",
      "relevance": "How relevant this experience is to the target role (High/Medium/Low)"
    }
  ],
  "education": [
    {
      "degree": "Full degree name (Bachelor of Computer Science, Master of AI, etc.)",
      "institution": "University/College name",
      "year": "Graduation year or expected graduation",
      "field": "Field of study",
      "gpa": "GPA if mentioned",
      "honors": "Any honors, distinctions, or notable achievements"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "year": "Year obtained",
      "relevance": "Relevance to the job role"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "What the project does and technologies used",
      "impact": "Results or impact achieved"
    }
  ],
  "analysis": {
    "overall_score": "Realistic score 45-95 based on comprehensive evaluation",
    "skills_score": "Score based on technical and soft skills match (40-100)",
    "experience_score": "Score based on relevance, seniority, and achievements (40-100)",
    "education_score": "Score based on educational background and relevance (50-100)",
    "strengths": ["Specific strengths with concrete examples from CV"],
    "weaknesses": ["Areas for improvement with constructive feedback"],
    "summary": "Professional 2-3 sentence summary explaining why this candidate fits the role and what makes them unique",
    "recommendation": "Strong Hire/Hire/Consider/Pass with detailed reasoning",
    "key_highlights": ["3-4 most impressive achievements or qualifications"],
    "growth_potential": "Assessment of candidate's potential for growth in the role"
  }
}

ANALYSIS GUIDELINES:
1. PRIORITIZE ACTUAL EXPERIENCE OVER JOB TITLES - Focus on what they actually did, not their title
2. TECHNICAL SKILLS MATCH IS CRITICAL - Exact technology match is more important than seniority
3. HANDS-ON AI/ML EXPERIENCE beats general data experience for AI roles
4. Research labs, AI projects, and ML implementations should score very highly
5. Don't be biased by prestigious education if technical experience doesn't match
6. Current employment status (intern vs consultant) is less important than relevant experience
7. Look for specific AI frameworks (TensorFlow, PyTorch) and ML project outcomes
8. Space/research AI experience is highly valuable for AI engineering roles
9. Data engineering ≠ AI engineering - distinguish between data pipelines and ML pipelines
10. Score based on JOB RELEVANCE, not general career prestige
11. Return valid JSON only`;

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
    const analysis = data.analysis || {};
    const certifications = data.certifications || [];
    const projects = data.projects || [];
    
    // PURE AI SCORING - No fallbacks, trust OpenAI completely
    console.log('✅ Using pure OpenAI analysis and scoring');
    
    return {
      name: personal.name || this.extractNameFromFilename(fileName),
      email: personal.email || 'Email not found',
      phone: personal.phone || 'Phone not found',
      score: analysis.overall_score || 75,
      skillsMatch: analysis.skills_score || 75,
      experienceMatch: analysis.experience_score || 75,
      educationMatch: analysis.education_score || 75,
      strengths: analysis.strengths || ['Strong technical background'],
      weaknesses: analysis.weaknesses || ['Areas for improvement identified'],
      summary: analysis.summary || `${personal.name || 'Candidate'} shows good potential for this role.`,
      skillsMatched: skills.matched || [],
      skillsMissing: skills.missing || [],
      jdRequiredSkills: [...(skills.matched || []), ...(skills.missing || [])],
      cvSkills: [...(skills.technical || []), ...(skills.soft || [])],
      analysisData: {
        personal: personal,
        skills: [...(skills.technical || []), ...(skills.soft || [])],
        experience: (data.experience || []).map(exp => ({
          position: exp.title,
          company: exp.company,
          duration: exp.duration,
          description: exp.description,
          relevance: exp.relevance
        })),
        education: data.education || [],
        certifications: certifications,
        projects: projects,
        match_analysis: {
          skills_matched: skills.matched || [],
          skills_missing: skills.missing || [],
          strengths: analysis.strengths || [],
          concerns: analysis.weaknesses || [],
          key_highlights: analysis.key_highlights || [],
          growth_potential: analysis.growth_potential || 'Good potential for growth',
          recommendation: analysis.recommendation || 'Consider'
        },
        scoring_breakdown: {
          skills_score: analysis.skills_score || 75,
          experience_score: analysis.experience_score || 75,
          education_score: analysis.education_score || 75,
          overall_calculation: `OpenAI Comprehensive Analysis: ${analysis.overall_score || 75}% - ${analysis.recommendation || 'Recommended'}`
        }
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
1. ACTUAL AI/ML EXPERIENCE is most important - research labs, AI projects, ML implementations
2. TECHNICAL SKILLS EXACT MATCH - TensorFlow, PyTorch, scikit-learn for AI roles
3. HANDS-ON PROJECT EXPERIENCE - Real AI projects beat job titles
4. RESEARCH/ACADEMIC AI EXPERIENCE is highly valuable for AI engineering
5. Data engineering experience ≠ AI engineering experience
6. Don't be fooled by prestigious job titles if technical experience doesn't match
7. Space AI, computer vision, ML research should rank very highly for AI roles
8. Look at what they actually built, not where they worked`;

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
}

module.exports = CVAnalysisService;
