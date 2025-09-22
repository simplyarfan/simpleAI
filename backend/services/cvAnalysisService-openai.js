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
    
    const prompt = `You are an expert HR analyst. Analyze this CV against the job description and provide detailed insights.

JOB DESCRIPTION:
${jobDescription}

CV CONTENT:
${cvText}

FILENAME: ${fileName}

Please analyze and return a JSON response with the following structure:
{
  "personal": {
    "name": "Extract the candidate's full name (NOT placeholder text like 'Insert Candidate Name')",
    "email": "Extract email address",
    "phone": "Extract phone number with country code if available",
    "location": "Extract city/country (NOT technical skills)"
  },
  "skills": {
    "technical": ["List all technical skills found"],
    "soft": ["List all soft skills found"],
    "matched": ["Skills that match job requirements"],
    "missing": ["Important skills missing from CV"]
  },
  "experience": [
    {
      "title": "Job title",
      "company": "Company name", 
      "duration": "Time period",
      "description": "Brief description of role and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/College name",
      "year": "Graduation year",
      "field": "Field of study"
    }
  ],
  "analysis": {
    "overall_score": "Calculate realistic score 0-100 based on actual match",
    "skills_score": "Score based on % of required skills matched",
    "experience_score": "Score based on relevance and quantity of experience",
    "education_score": "Score based on educational background relevance",
    "strengths": ["List specific strengths with examples"],
    "weaknesses": ["List specific areas for improvement"],
    "summary": "Professional summary explaining the scores and fit",
    "recommendation": "Hire/Consider/Reject with detailed reasoning"
  }
}

IMPORTANT RULES:
1. Extract REAL names from CV text or filename - never use placeholder text
2. Location should be actual places (Dubai, UAE) NOT technical skills (Java, Python)
3. Extract ALL experience entries - don't limit to 2-3, include ALL jobs/internships/projects
4. Be specific about experience - extract actual company names, job titles, and durations
5. Calculate REALISTIC and VARIED scores - avoid repeated scores like 70%, 60%
6. Skills score should be: (matched_skills / total_required_skills) * 100
7. Experience score should vary based on relevance and seniority
8. Give actionable insights in strengths/weaknesses with specific examples
9. Return valid JSON only`;

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
    
    // Use OpenAI scores if available, otherwise calculate dynamically
    let scores;
    if (analysis.overall_score && analysis.skills_score && analysis.experience_score && analysis.education_score) {
      console.log('✅ Using OpenAI calculated scores');
      scores = {
        overall: analysis.overall_score,
        skills: analysis.skills_score,
        experience: analysis.experience_score,
        education: analysis.education_score
      };
    } else {
      console.log('⚠️ OpenAI scores missing, calculating dynamically...');
      // Create mock skill analysis for scoring
      const skillsAnalysis = {
        required: skills.missing ? [...(skills.matched || []), ...(skills.missing || [])] : [],
        matched: skills.matched || [],
        cvSkills: [...(skills.technical || []), ...(skills.soft || [])]
      };
      scores = this.calculateScores(skillsAnalysis, data.experience || [], data.education || []);
    }
    
    return {
      name: personal.name || this.extractNameFromFilename(fileName),
      email: personal.email || 'Email not found',
      phone: personal.phone || 'Phone not found',
      score: scores.overall,
      skillsMatch: scores.skills,
      experienceMatch: scores.experience,
      educationMatch: scores.education,
      strengths: analysis.strengths || ['Strong technical background'],
      weaknesses: analysis.weaknesses || ['Areas for improvement identified'],
      summary: analysis.summary || `${personal.name || 'Candidate'} shows good potential for this role.`,
      skillsMatched: skills.matched || [],
      skillsMissing: skills.missing || [],
      jdRequiredSkills: skills.matched || [],
      cvSkills: [...(skills.technical || []), ...(skills.soft || [])],
      analysisData: {
        personal: personal,
        skills: [...(skills.technical || []), ...(skills.soft || [])],
        experience: (data.experience || []).map(exp => ({
          position: exp.title,
          company: exp.company,
          duration: exp.duration,
          description: exp.description
        })),
        education: data.education || [],
        match_analysis: {
          skills_matched: skills.matched || [],
          skills_missing: skills.missing || [],
          strengths: analysis.strengths || [],
          concerns: analysis.weaknesses || []
        },
        scoring_breakdown: {
          skills_score: analysis.skills_score || 70,
          experience_score: analysis.experience_score || 70,
          education_score: analysis.education_score || 70,
          overall_calculation: `OpenAI Analysis: Overall ${analysis.overall_score || 70}% based on comprehensive evaluation`
        }
      }
    };
  }

  /**
   * Enhanced Fallback Analysis (if no API key)
   */
  async performFallbackAnalysis(jobDescription, cvText, fileName) {
    console.log('⚡ Enhanced fallback analysis...');
    
    const name = this.extractNameFromFilename(fileName);
    const email = this.extractEmail(cvText);
    const phone = this.extractPhone(cvText);
    const location = this.extractLocation(cvText);
    
    const skillsAnalysis = this.analyzeSkills(jobDescription, cvText);
    const experience = this.extractExperience(cvText);
    const education = this.extractEducation(cvText);
    
    const scores = this.calculateScores(skillsAnalysis, experience, education);
    
    return {
      name: name,
      email: email || 'Email not found',
      phone: phone || 'Phone not found',
      score: scores.overall,
      skillsMatch: scores.skills,
      experienceMatch: scores.experience,
      educationMatch: scores.education,
      strengths: this.generateStrengths(skillsAnalysis, experience, education),
      weaknesses: this.generateWeaknesses(skillsAnalysis, scores),
      summary: this.generateSummary(name, scores, skillsAnalysis),
      skillsMatched: skillsAnalysis.matched,
      skillsMissing: skillsAnalysis.missing,
      jdRequiredSkills: skillsAnalysis.required,
      cvSkills: skillsAnalysis.cvSkills,
      analysisData: {
        personal: { name, email, phone, location },
        skills: skillsAnalysis.cvSkills,
        experience: experience.map(exp => ({
          position: exp.title,
          company: exp.company,
          duration: exp.duration,
          description: exp.description
        })),
        education: education,
        match_analysis: {
          skills_matched: skillsAnalysis.matched,
          skills_missing: skillsAnalysis.missing,
          strengths: this.generateStrengths(skillsAnalysis, experience, education),
          concerns: this.generateWeaknesses(skillsAnalysis, scores)
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

  calculateScores(skillsAnalysis, experience, education) {
    console.log('📊 CALCULATING DYNAMIC SCORES:');
    console.log('- Required skills:', skillsAnalysis.required.length);
    console.log('- Matched skills:', skillsAnalysis.matched.length);
    console.log('- CV skills total:', skillsAnalysis.cvSkills.length);
    console.log('- Experience entries:', experience.length);
    console.log('- Education entries:', education.length);
    
    // ENHANCED DYNAMIC SKILLS SCORING - More generous and realistic
    let skillsScore = 60; // Higher base score
    if (skillsAnalysis.required.length > 0) {
      const matchPercentage = (skillsAnalysis.matched.length / skillsAnalysis.required.length) * 100;
      // BOOST: Add bonus for high skill counts
      const skillBonus = Math.min(15, skillsAnalysis.matched.length * 2); // 2 points per matched skill, max 15
      skillsScore = Math.round(matchPercentage + skillBonus);
      console.log('- Skills match percentage:', matchPercentage + '%');
      console.log('- Skills bonus:', skillBonus + ' points');
      console.log('- Final skills score:', skillsScore + '%');
    } else {
      // If no specific requirements, score based on total skills found - more generous
      skillsScore = Math.min(90, 60 + (skillsAnalysis.cvSkills.length * 4));
    }
    
    // ENHANCED DYNAMIC EXPERIENCE SCORING - More generous
    let experienceScore = 50; // Higher base score
    if (experience.length === 0) {
      experienceScore = 40;
    } else if (experience.length === 1) {
      experienceScore = 70;
    } else if (experience.length === 2) {
      experienceScore = 85;
    } else if (experience.length >= 3) {
      experienceScore = Math.min(95, 85 + ((experience.length - 3) * 3));
    }
    
    // ENHANCED DYNAMIC EDUCATION SCORING - More generous
    let educationScore = 60; // Higher base score
    if (education.length === 0) {
      educationScore = 50;
    } else if (education.length === 1) {
      educationScore = 80;
    } else if (education.length >= 2) {
      educationScore = 90;
    }
    
    // WEIGHTED OVERALL SCORE
    const overallScore = Math.round(
      (skillsScore * 0.5) +      // 50% weight on skills
      (experienceScore * 0.35) + // 35% weight on experience  
      (educationScore * 0.15)    // 15% weight on education
    );
    
    const scores = {
      skills: Math.max(40, Math.min(100, skillsScore)),
      experience: Math.max(40, Math.min(100, experienceScore)),
      education: Math.max(50, Math.min(100, educationScore)),
      overall: Math.max(45, Math.min(100, overallScore))
    };
    
    console.log('✅ FINAL SCORES:', scores);
    return scores;
  }

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
1. Skills match quality and relevance (look at skills_list for specific matches)
2. Experience relevance and seniority (analyze experience_details for AI/ML/data science roles)
3. Overall profile fit for the role
4. Quality of experience over quantity
5. Specific AI/ML/data science experience should rank higher for AI roles
6. Not just the numerical score but actual qualifications and experience depth`;

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
