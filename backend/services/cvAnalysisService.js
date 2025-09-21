/**
 * Enhanced CV Analysis Service
 * Provides intelligent rule-based CV analysis with structured output
 * Designed to match frontend expectations exactly
 */

class CVAnalysisService {
  constructor() {
    this.techKeywords = [
      // Programming Languages
      'python', 'javascript', 'java', 'c++', 'sql', 'html', 'css', 'typescript', 'php', 'ruby', 'go', 'rust', 'swift',
      // ML/AI Libraries & Frameworks
      'tensorflow', 'keras', 'pytorch', 'opencv', 'pandas', 'numpy', 'matplotlib', 'scikit-learn', 'scipy',
      'huggingface', 'transformers', 'bert', 'gpt', 'llama', 'stable diffusion',
      // Cloud & DevOps
      'aws', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
      'terraform', 'ansible', 'ci/cd', 'devops',
      // Databases
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'sql server',
      // Web Technologies
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
      'rest api', 'graphql', 'microservices',
      // Mobile Development
      'ios', 'android', 'react native', 'flutter', 'kotlin', 'swift',
      // Data Science & Analytics
      'data science', 'machine learning', 'deep learning', 'ai', 'artificial intelligence',
      'data analysis', 'statistics', 'r', 'tableau', 'power bi', 'excel',
      // Other Technologies
      'blockchain', 'cybersecurity', 'penetration testing', 'network security', 'linux', 'windows'
    ];

    this.softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical thinking',
      'creativity', 'adaptability', 'time management', 'project management', 'collaboration',
      'critical thinking', 'innovation', 'mentoring', 'conflict resolution', 'negotiation'
    ];

    this.experienceKeywords = [
      'intern', 'internship', 'experience', 'worked', 'developed', 'managed', 'led', 'implemented',
      'designed', 'architected', 'collaborated', 'competed', 'project', 'built', 'created',
      'maintained', 'optimized', 'automated', 'deployed', 'scaled'
    ];

    this.educationKeywords = [
      'bachelor', 'master', 'phd', 'degree', 'university', 'college', 'graduate', 'diploma',
      'certification', 'certified', 'course', 'training', 'scholarship', 'academic'
    ];
  }

  /**
   * Main CV analysis function
   * @param {string} jobDescription - The job description text
   * @param {string} cvText - The CV text content
   * @param {string} fileName - Original filename for fallback name
   * @returns {Object} Structured analysis result matching frontend expectations
   */
  async analyzeCV(jobDescription, cvText, fileName) {
    console.log('🤖 Starting enhanced CV analysis for:', fileName);
    
    try {
      // Extract basic personal information
      const personalInfo = this.extractPersonalInfo(cvText, fileName);
      
      // Perform skills analysis
      const skillsAnalysis = this.analyzeSkills(jobDescription, cvText);
      
      // Extract experience information
      const experienceInfo = this.extractExperience(cvText);
      
      // Extract education information
      const educationInfo = this.extractEducation(cvText);
      
      // Calculate match scores
      const scores = this.calculateMatchScores(jobDescription, cvText, skillsAnalysis);
      
      // Generate recommendations
      const recommendation = this.generateRecommendation(scores.overall);
      
      // Create structured analysis data for frontend
      const analysisData = {
        personal: {
          name: personalInfo.name,
          email: personalInfo.email || 'Email not found',
          phone: personalInfo.phone || 'Phone not found',
          location: personalInfo.location || 'Location not specified'
        },
        skills: skillsAnalysis.cvSkills,
        experience: experienceInfo.length > 0 ? experienceInfo : [{
          position: 'Experience details require manual review',
          company: 'Please review CV manually',
          duration: 'Duration not specified',
          description: 'Experience information not clearly structured in CV'
        }],
        education: educationInfo.length > 0 ? educationInfo : [{
          degree: 'Education details require manual review',
          institution: 'Please review CV manually',
          year: 'Year not specified',
          description: 'Education information not clearly structured in CV'
        }],
        match_analysis: {
          skills_matched: skillsAnalysis.matched,
          skills_missing: skillsAnalysis.missing,
          strengths: this.generateStrengths(skillsAnalysis, experienceInfo, educationInfo, cvText),
          concerns: this.generateConcerns(skillsAnalysis, experienceInfo, scores)
        },
        summary: this.generateSummary(personalInfo.name || fileName, scores, skillsAnalysis)
      };

      // Return complete analysis result
      return {
        name: personalInfo.name,
        email: personalInfo.email,
        phone: personalInfo.phone,
        score: scores.overall,
        skillsMatch: scores.skills,
        experienceMatch: scores.experience,
        educationMatch: scores.education,
        strengths: analysisData.match_analysis.strengths,
        weaknesses: analysisData.match_analysis.concerns,
        summary: analysisData.summary,
        // Additional data for compatibility
        skillsMatched: skillsAnalysis.matched,
        skillsMissing: skillsAnalysis.missing,
        jdRequiredSkills: skillsAnalysis.required,
        cvSkills: skillsAnalysis.cvSkills,
        analysisData: analysisData
      };

    } catch (error) {
      console.error('❌ CV analysis failed:', error);
      return this.createFallbackAnalysis(fileName);
    }
  }

  /**
   * Extract personal information from CV text
   */
  extractPersonalInfo(cvText, fileName) {
    const cleanText = cvText.replace(/\s+/g, ' ').trim();
    
    // Name extraction with multiple patterns
    const namePatterns = [
      /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(?:\n|$)/,
      /Name:?\s*([A-Za-z\s]{2,50})/i,
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)/
    ];
    
    let name = null;
    for (const pattern of namePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        const candidateName = match[1].trim();
        if (candidateName.length >= 2 && candidateName.length <= 50 && 
            /^[A-Za-z\s]+$/.test(candidateName) &&
            !candidateName.toLowerCase().includes('summary') &&
            !candidateName.toLowerCase().includes('experience')) {
          name = candidateName;
          break;
        }
      }
    }
    
    // Fallback to filename
    if (!name) {
      name = fileName.replace(/\.(pdf|doc|docx)$/i, '').replace(/[_-]/g, ' ').replace(/cv|resume/i, '').trim() || 'Unknown Candidate';
    }

    // Email extraction
    const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : null;

    // Phone extraction with multiple patterns
    const phonePatterns = [
      /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/,
      /(?:Phone|Tel|Mobile|Cell|Contact)[:.\s]*([+\d\s\-\(\)\.]{8,20})/i,
      /\b\d{10,15}\b/
    ];
    
    let phone = null;
    for (const pattern of phonePatterns) {
      const match = cvText.match(pattern);
      if (match) {
        const candidatePhone = (match[1] || match[0]).trim();
        if (candidatePhone.length >= 8 && candidatePhone.length <= 20 && /\d{6,}/.test(candidatePhone)) {
          phone = candidatePhone;
          break;
        }
      }
    }

    // Location extraction
    const locationPatterns = [
      /(?:Location|Address|City)[:.\s]*([A-Za-z\s,]{2,50})/i,
      /([A-Z][a-z]+,\s*[A-Z]{2,})/
    ];
    
    let location = null;
    for (const pattern of locationPatterns) {
      const match = cvText.match(pattern);
      if (match && match[1]) {
        location = match[1].trim();
        break;
      }
    }

    return { name, email, phone, location };
  }

  /**
   * Analyze skills match between job description and CV
   */
  analyzeSkills(jobDescription, cvText) {
    const jdLower = jobDescription.toLowerCase();
    const cvLower = cvText.toLowerCase();
    
    // Find required skills in job description
    const requiredSkills = this.techKeywords.filter(skill => jdLower.includes(skill.toLowerCase()));
    
    // Find skills present in CV
    const cvSkills = this.techKeywords.filter(skill => cvLower.includes(skill.toLowerCase()));
    
    // Find matching and missing skills
    const matched = requiredSkills.filter(skill => cvLower.includes(skill.toLowerCase()));
    const missing = requiredSkills.filter(skill => !cvLower.includes(skill.toLowerCase()));
    
    // Also include soft skills found in CV
    const softSkillsFound = this.softSkills.filter(skill => cvLower.includes(skill.toLowerCase()));
    cvSkills.push(...softSkillsFound);

    return {
      required: requiredSkills,
      cvSkills: [...new Set(cvSkills)], // Remove duplicates
      matched: matched,
      missing: missing
    };
  }

  /**
   * Extract experience information from CV
   */
  extractExperience(cvText) {
    const experiences = [];
    
    // Look for common experience patterns
    const experiencePatterns = [
      {
        pattern: /(.+?)\s*\|\s*(.+?)\s*\|\s*([\d\-\s,]+)/g,
        extract: (match) => ({
          position: match[1].trim(),
          company: match[2].trim(),
          duration: match[3].trim(),
          description: 'Experience details in CV'
        })
      },
      {
        pattern: /(.+?)\s*(?:at|@)\s*(.+?)\s*\(([\d\-\s,]+)\)/gi,
        extract: (match) => ({
          position: match[1].trim(),
          company: match[2].trim(),
          duration: match[3].trim(),
          description: 'Professional experience'
        })
      }
    ];

    for (const patternInfo of experiencePatterns) {
      let match;
      while ((match = patternInfo.pattern.exec(cvText)) !== null) {
        const experience = patternInfo.extract(match);
        if (experience.position.length > 2 && experience.company.length > 2) {
          experiences.push(experience);
        }
      }
    }

    // If no structured experience found, look for experience keywords
    if (experiences.length === 0) {
      const experienceCount = this.experienceKeywords.filter(keyword => 
        cvText.toLowerCase().includes(keyword)
      ).length;

      if (experienceCount > 0) {
        experiences.push({
          position: 'Professional Experience',
          company: 'Details in CV',
          duration: 'Please review CV',
          description: `${experienceCount} experience indicators found in CV`
        });
      }
    }

    return experiences;
  }

  /**
   * Extract education information from CV
   */
  extractEducation(cvText) {
    const education = [];
    
    // Look for education patterns
    const educationPatterns = [
      {
        pattern: /(Bachelor|Master|PhD|Degree).+?(?:in|of)\s*(.+?)(?:from|at)\s*(.+?)(?:\((.+?)\)|$)/gi,
        extract: (match) => ({
          degree: `${match[1]} in ${match[2].trim()}`,
          institution: match[3].trim(),
          year: match[4] ? match[4].trim() : 'Year not specified'
        })
      },
      {
        pattern: /(Bachelor|Master|PhD).+?(.+?)\s*\|\s*(.+?)\s*\|\s*([\d\-]+)/gi,
        extract: (match) => ({
          degree: `${match[1]} ${match[2].trim()}`,
          institution: match[3].trim(),
          year: match[4].trim()
        })
      }
    ];

    for (const patternInfo of educationPatterns) {
      let match;
      while ((match = patternInfo.pattern.exec(cvText)) !== null) {
        const edu = patternInfo.extract(match);
        if (edu.degree.length > 5 && edu.institution.length > 2) {
          education.push(edu);
        }
      }
    }

    // Fallback: look for education keywords
    if (education.length === 0) {
      const educationCount = this.educationKeywords.filter(keyword => 
        cvText.toLowerCase().includes(keyword)
      ).length;

      if (educationCount > 0) {
        education.push({
          degree: 'Educational Background',
          institution: 'Details in CV',
          year: 'Please review CV'
        });
      }
    }

    return education;
  }

  /**
   * Calculate match scores
   */
  calculateMatchScores(jobDescription, cvText, skillsAnalysis) {
    const jdLower = jobDescription.toLowerCase();
    const cvLower = cvText.toLowerCase();

    // Skills score based on match percentage
    const skillsScore = skillsAnalysis.required.length > 0 ? 
      Math.round((skillsAnalysis.matched.length / skillsAnalysis.required.length) * 100) : 80;

    // Experience score based on keywords
    const experienceIndicators = this.experienceKeywords.filter(keyword => cvLower.includes(keyword));
    const experienceScore = Math.min(100, 50 + (experienceIndicators.length * 10));

    // Education score based on keywords and degree mentions
    const educationIndicators = this.educationKeywords.filter(keyword => cvLower.includes(keyword));
    const educationScore = Math.min(100, 60 + (educationIndicators.length * 8));

    // Overall score with weighted average
    const overallScore = Math.round(
      (skillsScore * 0.4) + 
      (experienceScore * 0.35) + 
      (educationScore * 0.25)
    );

    return {
      overall: Math.max(30, Math.min(100, overallScore)),
      skills: Math.max(20, Math.min(100, skillsScore)),
      experience: Math.max(30, Math.min(100, experienceScore)),
      education: Math.max(40, Math.min(100, educationScore))
    };
  }

  /**
   * Generate strengths based on analysis
   */
  generateStrengths(skillsAnalysis, experienceInfo, educationInfo, cvText) {
    const strengths = [];
    
    if (skillsAnalysis.matched.length > 0) {
      strengths.push(`Strong technical skills: ${skillsAnalysis.matched.slice(0, 5).join(', ')}`);
    }
    
    if (experienceInfo.length > 0) {
      strengths.push(`Professional experience with ${experienceInfo.length} positions`);
    }
    
    if (educationInfo.length > 0) {
      strengths.push(`Educational background: ${educationInfo[0].degree}`);
    }
    
    if (skillsAnalysis.cvSkills.length > 5) {
      strengths.push(`Diverse technical skill set (${skillsAnalysis.cvSkills.length} skills identified)`);
    }

    // Look for specific achievements
    const cvLower = cvText.toLowerCase();
    if (cvLower.includes('project') || cvLower.includes('led') || cvLower.includes('managed')) {
      strengths.push('Project leadership and management experience');
    }
    
    if (cvLower.includes('competition') || cvLower.includes('award') || cvLower.includes('recognition')) {
      strengths.push('Achievement-oriented with competitive experience');
    }

    return strengths.length > 0 ? strengths : ['Professional background with relevant qualifications'];
  }

  /**
   * Generate concerns/weaknesses
   */
  generateConcerns(skillsAnalysis, experienceInfo, scores) {
    const concerns = [];
    
    if (skillsAnalysis.missing.length > 0) {
      concerns.push(`Missing key skills: ${skillsAnalysis.missing.slice(0, 3).join(', ')}`);
    }
    
    if (scores.experience < 60) {
      concerns.push('Limited professional experience');
    }
    
    if (scores.skills < 50) {
      concerns.push('Technical skills gap requires development');
    }
    
    if (experienceInfo.length === 0) {
      concerns.push('Experience details require clarification');
    }

    return concerns.length > 0 ? concerns : ['Minor areas for development'];
  }

  /**
   * Generate analysis summary
   */
  generateSummary(name, scores, skillsAnalysis) {
    const compatibilityLevel = scores.overall >= 80 ? 'Excellent' : 
                              scores.overall >= 65 ? 'Good' : 
                              scores.overall >= 50 ? 'Fair' : 'Needs Review';
    
    const skillMatch = skillsAnalysis.required.length > 0 ? 
      `${Math.round((skillsAnalysis.matched.length / skillsAnalysis.required.length) * 100)}% skill match` :
      'Skills assessment completed';
    
    return `${name}: ${compatibilityLevel} candidate fit (${scores.overall}% overall score). ` +
           `${skillMatch} with ${skillsAnalysis.matched.length} matching skills identified. ` +
           `Strong areas: Technical background, ${skillsAnalysis.cvSkills.length} total skills. ` +
           `Compatibility level: ${compatibilityLevel}.`;
  }

  /**
   * Generate recommendation based on score
   */
  generateRecommendation(score) {
    if (score >= 85) return 'Highly Recommended';
    if (score >= 70) return 'Recommended';
    if (score >= 55) return 'Consider';
    return 'Not Recommended';
  }

  /**
   * Create fallback analysis for failed processing
   */
  createFallbackAnalysis(fileName) {
    const name = fileName.replace(/\.(pdf|doc|docx)$/i, '').replace(/[_-]/g, ' ') || 'Unknown Candidate';
    
    return {
      name: name,
      email: 'Email extraction failed',
      phone: 'Phone extraction failed',
      score: 45,
      skillsMatch: 40,
      experienceMatch: 45,
      educationMatch: 50,
      strengths: ['CV processed with basic extraction', 'Manual review recommended'],
      weaknesses: ['Detailed analysis failed', 'Requires manual evaluation'],
      summary: `${name}: Processing encountered issues. Manual review required for accurate assessment.`,
      skillsMatched: [],
      skillsMissing: ['Analysis incomplete'],
      jdRequiredSkills: [],
      cvSkills: ['Manual review needed'],
      analysisData: {
        personal: {
          name: name,
          email: 'Extraction failed',
          phone: 'Extraction failed',
          location: 'Location not specified'
        },
        skills: ['Manual review needed'],
        experience: [{
          position: 'Processing failed',
          company: 'Manual review required',
          duration: 'N/A',
          description: 'CV processing encountered errors'
        }],
        education: [{
          degree: 'Processing failed',
          institution: 'Manual review required',
          year: 'N/A'
        }],
        match_analysis: {
          skills_matched: [],
          skills_missing: ['Analysis incomplete'],
          strengths: ['CV file processed'],
          concerns: ['Manual review required']
        },
        summary: `${name}: Processing issues encountered. Manual review recommended.`
      }
    };
  }
}

module.exports = CVAnalysisService;
