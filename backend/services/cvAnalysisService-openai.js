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
    
    const prompt = `You are an expert HR analyst with 15+ years of experience. Use the following STRUCTURED RESUME SCREENING METHODOLOGY to evaluate this CV against the job description.

JOB DESCRIPTION:
${jobDescription}

CV CONTENT:
${cvText}

FILENAME: ${fileName}

RESUME SCREENING GUIDELINES:

1. EXTRACT KEY DETAILS FROM JD:
   - Required tools, technologies, frameworks, certifications
   - Responsibilities and expected tasks
   - Soft skills or team collaboration needs
   - Industry or domain experience

2. EVALUATION CRITERIA (with weightage):
   - Technical Skills Match (30%)
   - Role and Responsibility Alignment (20%)
   - Project Work and Impact Evidence (20%)
   - Industry/Domain Fit (10%)
   - Soft Skills and Learning Mindset (20%)

3. SCORING LOGIC:
   - Strong evidence = full points
   - Some/indirect evidence = half points
   - Not mentioned/not relevant = zero points
   - Only count what's CLEARLY STATED in the resume

4. RECENCY LOGIC:
   - Experience in last 5 years = 100% weight
   - 5-10 years ago = 50% weight
   - More than 10 years ago = 25% weight (unless legacy expertise required)

Provide analysis and return a JSON response with this structure:
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
  "evaluation": {
    "technical_skills_match": {
      "score": "0-30 points based on evidence strength and recency",
      "evidence": ["List specific technical skills with evidence level (Strong/Some/None)"],
      "gaps": ["Missing critical technical skills"]
    },
    "role_responsibility_alignment": {
      "score": "0-20 points based on role match",
      "evidence": ["List relevant responsibilities with evidence level"],
      "gaps": ["Missing key responsibilities"]
    },
    "project_work_impact": {
      "score": "0-20 points based on project relevance and impact",
      "evidence": ["List relevant projects with measurable impact"],
      "gaps": ["Missing project types or impact evidence"]
    },
    "industry_domain_fit": {
      "score": "0-10 points based on domain experience",
      "evidence": ["List relevant industry/domain experience"],
      "gaps": ["Missing domain knowledge"]
    },
    "soft_skills_learning": {
      "score": "0-20 points based on soft skills and growth mindset",
      "evidence": ["List soft skills with evidence"],
      "gaps": ["Missing soft skills"]
    }
  },
  "analysis": {
    "total_score": "Sum of all category scores (0-100)",
    "ranking_position": "Position among candidates (if multiple)",
    "summary": "1 paragraph professional summary explaining fit and unique value",
    "strengths": ["Key strengths with specific evidence from resume"],
    "gaps_mismatches": ["Areas where candidate doesn't match requirements"],
    "recommendation": "Shortlist/Maybe/No with detailed reasoning",
    "recency_impact": "How recency of experience affected scoring"
  }
}

CRITICAL EVALUATION RULES:
1. EVIDENCE-BASED SCORING: Only count what is CLEARLY STATED in the resume
2. RECENCY MATTERS: Apply time-based weighting to all experience
3. EXACT MATCH PRIORITY: Direct technology/framework matches score higher
4. MEASURABLE IMPACT: Look for quantifiable results and achievements
5. ROLE-SPECIFIC FOCUS: Score based on job requirements, not general impressiveness
6. NO ASSUMPTION: Don't infer skills or experience not explicitly mentioned
7. STRUCTURED SCORING: Use the 5-category breakdown with proper weightage
8. PROFESSIONAL OBJECTIVITY: Focus on job fit, not candidate potential
9. CLEAR EVIDENCE LEVELS: Distinguish between Strong/Some/None evidence
10. Return valid JSON only with structured evaluation breakdown`;

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
    console.log('🔄 Formatting structured OpenAI response...');
    
    const personal = data.personal || {};
    const skills = data.skills || {};
    const evaluation = data.evaluation || {};
    const analysis = data.analysis || {};
    const certifications = data.certifications || [];
    const projects = data.projects || [];
    
    // STRUCTURED EVALUATION SCORING
    console.log('✅ Using structured resume screening methodology');
    
    const totalScore = analysis.total_score || 
      (evaluation.technical_skills_match?.score || 0) +
      (evaluation.role_responsibility_alignment?.score || 0) +
      (evaluation.project_work_impact?.score || 0) +
      (evaluation.industry_domain_fit?.score || 0) +
      (evaluation.soft_skills_learning?.score || 0);
    
    return {
      name: personal.name || this.extractNameFromFilename(fileName),
      email: personal.email || 'Email not found',
      phone: personal.phone || 'Phone not found',
      score: totalScore,
      skillsMatch: evaluation.technical_skills_match?.score || 20,
      experienceMatch: (evaluation.role_responsibility_alignment?.score || 0) + (evaluation.project_work_impact?.score || 0),
      educationMatch: evaluation.industry_domain_fit?.score || 8,
      strengths: analysis.strengths || ['Professional background identified'],
      weaknesses: analysis.gaps_mismatches || ['Areas for improvement identified'],
      summary: analysis.summary || `${personal.name || 'Candidate'} evaluated using structured screening methodology.`,
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
        structured_evaluation: {
          technical_skills: evaluation.technical_skills_match || {},
          role_alignment: evaluation.role_responsibility_alignment || {},
          project_impact: evaluation.project_work_impact || {},
          domain_fit: evaluation.industry_domain_fit || {},
          soft_skills: evaluation.soft_skills_learning || {}
        },
        match_analysis: {
          skills_matched: skills.matched || [],
          skills_missing: skills.missing || [],
          strengths: analysis.strengths || [],
          concerns: analysis.gaps_mismatches || [],
          recommendation: analysis.recommendation || 'Maybe',
          recency_impact: analysis.recency_impact || 'Not specified'
        },
        scoring_breakdown: {
          technical_skills_score: evaluation.technical_skills_match?.score || 0,
          role_alignment_score: evaluation.role_responsibility_alignment?.score || 0,
          project_impact_score: evaluation.project_work_impact?.score || 0,
          domain_fit_score: evaluation.industry_domain_fit?.score || 0,
          soft_skills_score: evaluation.soft_skills_learning?.score || 0,
          total_score: totalScore,
          methodology: 'Structured Resume Screening with Evidence-Based Evaluation'
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
