/**
 * Intelligent CV Analysis Service - Real content extraction and scoring
 * Provides comprehensive CV analysis with actual data extraction
 */

class CVAnalysisService {
  constructor() {
    this.initialized = true;
    console.log('✅ Intelligent CV Analysis Service initialized');
    
    // Comprehensive skill categories for better matching
    this.techKeywords = [
      // Programming Languages
      'python', 'javascript', 'java', 'c++', 'c#', 'sql', 'html', 'css', 'typescript', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r',
      
      // Frameworks & Libraries
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'tensorflow', 'keras', 'pytorch', 'pandas', 'numpy',
      
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'ci/cd', 'terraform', 'ansible',
      
      // Databases
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'sql server', 'cassandra',
      
      // Tools & Technologies
      'linux', 'windows', 'macos', 'bash', 'powershell', 'vim', 'vscode', 'intellij', 'eclipse', 'jira', 'confluence', 'slack'
    ];

    this.softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical thinking',
      'creativity', 'adaptability', 'time management', 'project management', 'collaboration',
      'critical thinking', 'innovation', 'mentoring', 'negotiation', 'presentation'
    ];

    // Experience indicators
    this.experienceKeywords = [
      'experience', 'worked', 'developed', 'managed', 'led', 'implemented', 'designed', 'architected',
      'collaborated', 'built', 'created', 'maintained', 'optimized', 'automated', 'deployed',
      'intern', 'internship', 'junior', 'senior', 'lead', 'principal', 'manager', 'director'
    ];

    // Education indicators
    this.educationKeywords = [
      'bachelor', 'master', 'phd', 'degree', 'university', 'college', 'graduate', 'diploma',
      'certification', 'certified', 'course', 'training', 'scholarship', 'academic', 'gpa'
    ];
  }

  async analyzeCV(jobDescription, cvText, fileName) {
    console.log('🧠 Starting intelligent CV analysis for:', fileName);
    console.log('📄 CV text length:', cvText.length, 'characters');
    
    // Extract comprehensive information
    const personalInfo = this.extractPersonalInfo(cvText, fileName);
    const skillsAnalysis = this.extractSkills(cvText, jobDescription);
    const experienceAnalysis = this.extractExperience(cvText);
    const educationAnalysis = this.extractEducation(cvText);
    
    // Calculate intelligent scores based on actual content
    const scores = this.calculateIntelligentScores(skillsAnalysis, experienceAnalysis, educationAnalysis, jobDescription, cvText);
    
    console.log('✅ Analysis completed:', {
      name: personalInfo.name,
      skillsFound: skillsAnalysis.cvSkills.length,
      experienceEntries: experienceAnalysis.length,
      educationEntries: educationAnalysis.length,
      overallScore: scores.overall
    });
    
    return {
      name: personalInfo.name,
      email: personalInfo.email || 'Email not found',
      phone: personalInfo.phone || 'Phone not found',
      score: scores.overall,
      skillsMatch: scores.skills,
      experienceMatch: scores.experience,
      educationMatch: scores.education,
      strengths: this.generateIntelligentStrengths(skillsAnalysis, experienceAnalysis, educationAnalysis, scores),
      weaknesses: this.generateIntelligentWeaknesses(skillsAnalysis, experienceAnalysis, educationAnalysis, scores),
      summary: this.generateIntelligentSummary(personalInfo.name, scores, skillsAnalysis, experienceAnalysis, educationAnalysis),
      skillsMatched: skillsAnalysis.matchedSkills,
      skillsMissing: skillsAnalysis.missingSkills,
      jdRequiredSkills: skillsAnalysis.requiredSkills,
      cvSkills: skillsAnalysis.cvSkills,
      analysisData: {
        personal: personalInfo,
        skills: skillsAnalysis.cvSkills,
        experience: experienceAnalysis,
        education: educationAnalysis,
        scoring_breakdown: {
          skills_score: scores.skills,
          experience_score: scores.experience,
          education_score: scores.education,
          overall_calculation: `Skills (${scores.skills}%) × 0.4 + Experience (${scores.experience}%) × 0.35 + Education (${scores.education}%) × 0.25 = ${scores.overall}%`
        }
      }
    };
  }

  // ===== PERSONAL INFORMATION EXTRACTION =====
  extractPersonalInfo(cvText, fileName) {
    const name = this.extractName(cvText, fileName);
    const email = this.extractEmail(cvText);
    const phone = this.extractPhone(cvText);
    const location = this.extractLocation(cvText);
    
    return { name, email, phone, location };
  }

  extractName(cvText, fileName) {
    // Multiple name extraction patterns
    const patterns = [
      // Name at the beginning of CV
      /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
      // Name: format
      /Name\s*:?\s*([A-Za-z\s]{2,50})/i,
      // Full name in first few lines
      /^(.{0,100}?)([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/m
    ];
    
    for (const pattern of patterns) {
      const match = cvText.match(pattern);
      if (match) {
        const candidateName = (match[2] || match[1]).trim();
        if (this.isValidName(candidateName)) {
          return candidateName;
        }
      }
    }
    
    // Fallback to filename
    return fileName.replace(/\.(pdf|doc|docx)$/i, '').replace(/[_-]/g, ' ').trim() || 'Unknown Candidate';
  }

  isValidName(name) {
    return name.length >= 2 && name.length <= 50 && 
           /^[A-Za-z\s]+$/.test(name) &&
           !name.toLowerCase().includes('summary') &&
           !name.toLowerCase().includes('experience') &&
           !name.toLowerCase().includes('education');
  }

  extractEmail(cvText) {
    const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return emailMatch ? emailMatch[0] : null;
  }

  extractPhone(cvText) {
    // Enhanced phone extraction patterns
    const patterns = [
      /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/,
      /(?:Phone|Tel|Mobile|Cell|Contact)[:.\s]*([+\d\s\-\(\)\.]{8,20})/i,
      /\b\d{10,15}\b/
    ];
    
    for (const pattern of patterns) {
      const match = cvText.match(pattern);
      if (match) {
        const phone = (match[1] || match[0]).trim();
        if (phone.length >= 8 && phone.length <= 20 && /\d{6,}/.test(phone)) {
          return phone;
        }
      }
    }
    return null;
  }

  extractLocation(cvText) {
    const locationPatterns = [
      /(?:Location|Address|City|Based in)[:.\s]*([A-Za-z\s,]{2,50})/i,
      /([A-Z][a-z]+,\s*[A-Z]{2,})/
    ];
    
    for (const pattern of locationPatterns) {
      const match = cvText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  // ===== SKILLS EXTRACTION =====
  extractSkills(cvText, jobDescription) {
    const cvLower = cvText.toLowerCase();
    const jdLower = jobDescription.toLowerCase();
    
    // Find all technical skills in CV
    const cvTechSkills = this.techKeywords.filter(skill => 
      cvLower.includes(skill.toLowerCase())
    );
    
    // Find all soft skills in CV
    const cvSoftSkills = this.softSkills.filter(skill => 
      cvLower.includes(skill.toLowerCase())
    );
    
    // Combine all CV skills
    const cvSkills = [...cvTechSkills, ...cvSoftSkills];
    
    // Find required skills from job description
    const requiredTechSkills = this.techKeywords.filter(skill => 
      jdLower.includes(skill.toLowerCase())
    );
    const requiredSoftSkills = this.softSkills.filter(skill => 
      jdLower.includes(skill.toLowerCase())
    );
    const requiredSkills = [...requiredTechSkills, ...requiredSoftSkills];
    
    // Find matching and missing skills
    const matchedSkills = requiredSkills.filter(skill => 
      cvLower.includes(skill.toLowerCase())
    );
    const missingSkills = requiredSkills.filter(skill => 
      !cvLower.includes(skill.toLowerCase())
    );
    
    return {
      cvSkills,
      requiredSkills,
      matchedSkills,
      missingSkills,
      cvTechSkills,
      cvSoftSkills
    };
  }

  // ===== EXPERIENCE EXTRACTION =====
  extractExperience(cvText) {
    const experiences = [];
    
    // Pattern 1: Company | Position | Duration
    const pattern1 = /(.+?)\s*\|\s*(.+?)\s*\|\s*([\d\-\s,to present]+)/gi;
    let match1;
    while ((match1 = pattern1.exec(cvText)) !== null) {
      experiences.push({
        company: match1[1].trim(),
        position: match1[2].trim(),
        duration: match1[3].trim(),
        description: 'Experience details available in CV'
      });
    }
    
    // Pattern 2: Position at Company (Duration)
    const pattern2 = /(.+?)\s*(?:at|@)\s*(.+?)\s*\(([\d\-\s,to present]+)\)/gi;
    let match2;
    while ((match2 = pattern2.exec(cvText)) !== null) {
      experiences.push({
        position: match2[1].trim(),
        company: match2[2].trim(),
        duration: match2[3].trim(),
        description: 'Professional experience'
      });
    }
    
    // Pattern 3: Look for experience sections
    const experienceSection = this.extractSection(cvText, 'experience');
    if (experienceSection && experiences.length === 0) {
      const lines = experienceSection.split('\n').filter(line => line.trim().length > 10);
      lines.forEach((line, index) => {
        if (index < 5) { // Limit to first 5 entries
          experiences.push({
            position: `Position ${index + 1}`,
            company: 'Company details in CV',
            duration: 'Duration specified in CV',
            description: line.trim().substring(0, 100) + '...'
          });
        }
      });
    }
    
    // If still no structured experience, look for keywords
    if (experiences.length === 0) {
      const experienceIndicators = this.experienceKeywords.filter(keyword => 
        cvText.toLowerCase().includes(keyword)
      );
      
      if (experienceIndicators.length > 0) {
        experiences.push({
          position: 'Professional Experience',
          company: 'Multiple organizations',
          duration: 'Various periods',
          description: `Experience indicators found: ${experienceIndicators.slice(0, 5).join(', ')}`
        });
      }
    }
    
    return experiences;
  }

  // ===== EDUCATION EXTRACTION =====
  extractEducation(cvText) {
    const education = [];
    
    // Pattern 1: Degree in Subject from Institution (Year)
    const pattern1 = /(Bachelor|Master|PhD|Degree).+?(?:in|of)\s*(.+?)(?:from|at)\s*(.+?)(?:\((.+?)\)|$)/gi;
    let match1;
    while ((match1 = pattern1.exec(cvText)) !== null) {
      education.push({
        degree: `${match1[1]} in ${match1[2].trim()}`,
        institution: match1[3].trim(),
        year: match1[4] ? match1[4].trim() : 'Year not specified',
        type: 'Degree'
      });
    }
    
    // Pattern 2: Institution | Degree | Year
    const pattern2 = /(.+?)\s*\|\s*(Bachelor|Master|PhD|Degree.+?)\s*\|\s*([\d\-]+)/gi;
    let match2;
    while ((match2 = pattern2.exec(cvText)) !== null) {
      education.push({
        institution: match2[1].trim(),
        degree: match2[2].trim(),
        year: match2[3].trim(),
        type: 'Degree'
      });
    }
    
    // Look for education section
    const educationSection = this.extractSection(cvText, 'education');
    if (educationSection && education.length === 0) {
      const lines = educationSection.split('\n').filter(line => line.trim().length > 10);
      lines.forEach((line, index) => {
        if (index < 3) { // Limit to first 3 entries
          education.push({
            degree: 'Educational Background',
            institution: line.trim().substring(0, 50),
            year: 'Year specified in CV',
            type: 'Education'
          });
        }
      });
    }
    
    // Look for certifications
    const certificationPatterns = [
      /certified?\s+(.+?)(?:\s|$)/gi,
      /certification\s+in\s+(.+?)(?:\s|$)/gi
    ];
    
    certificationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(cvText)) !== null) {
        education.push({
          degree: `Certification in ${match[1].trim()}`,
          institution: 'Certification Authority',
          year: 'Certification year in CV',
          type: 'Certification'
        });
      }
    });
    
    return education;
  }

  // Helper method to extract sections
  extractSection(cvText, sectionName) {
    const regex = new RegExp(`(${sectionName}[^\\n]*\\n)([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Z\\s]{5,}|$)`, 'i');
    const match = cvText.match(regex);
    return match ? match[2] : null;
  }

  // ===== INTELLIGENT SCORING SYSTEM =====
  calculateIntelligentScores(skillsAnalysis, experienceAnalysis, educationAnalysis, jobDescription, cvText) {
    // Skills Score (0-100)
    const skillsScore = this.calculateSkillsScore(skillsAnalysis);
    
    // Experience Score (0-100)
    const experienceScore = this.calculateExperienceScore(experienceAnalysis, cvText);
    
    // Education Score (0-100)
    const educationScore = this.calculateEducationScore(educationAnalysis, cvText);
    
    // Overall Score (weighted average)
    const overallScore = Math.round(
      (skillsScore * 0.4) + 
      (experienceScore * 0.35) + 
      (educationScore * 0.25)
    );
    
    return {
      skills: Math.max(0, Math.min(100, skillsScore)),
      experience: Math.max(0, Math.min(100, experienceScore)),
      education: Math.max(0, Math.min(100, educationScore)),
      overall: Math.max(0, Math.min(100, overallScore))
    };
  }

  calculateSkillsScore(skillsAnalysis) {
    const { requiredSkills, matchedSkills, cvSkills } = skillsAnalysis;
    
    if (requiredSkills.length === 0) {
      // If no specific requirements, score based on skill diversity
      return Math.min(85, 40 + (cvSkills.length * 3));
    }
    
    // Base score from skill matching
    const matchPercentage = (matchedSkills.length / requiredSkills.length) * 100;
    
    // Bonus for additional skills
    const additionalSkillsBonus = Math.min(15, cvSkills.length * 1.5);
    
    // Penalty for missing critical skills
    const missingPenalty = Math.min(20, (requiredSkills.length - matchedSkills.length) * 5);
    
    return Math.max(20, matchPercentage + additionalSkillsBonus - missingPenalty);
  }

  calculateExperienceScore(experienceAnalysis, cvText) {
    let score = 30; // Base score
    
    // Score based on number of experience entries
    score += Math.min(30, experienceAnalysis.length * 10);
    
    // Bonus for experience keywords in CV
    const experienceKeywordCount = this.experienceKeywords.filter(keyword => 
      cvText.toLowerCase().includes(keyword)
    ).length;
    score += Math.min(25, experienceKeywordCount * 2);
    
    // Bonus for leadership indicators
    const leadershipKeywords = ['led', 'managed', 'director', 'manager', 'lead', 'senior'];
    const leadershipCount = leadershipKeywords.filter(keyword => 
      cvText.toLowerCase().includes(keyword)
    ).length;
    score += Math.min(15, leadershipCount * 5);
    
    return score;
  }

  calculateEducationScore(educationAnalysis, cvText) {
    let score = 40; // Base score
    
    // Score based on education entries
    score += Math.min(25, educationAnalysis.length * 8);
    
    // Bonus for degree types
    educationAnalysis.forEach(edu => {
      if (edu.degree.toLowerCase().includes('master') || edu.degree.toLowerCase().includes('phd')) {
        score += 15;
      } else if (edu.degree.toLowerCase().includes('bachelor')) {
        score += 10;
      } else if (edu.degree.toLowerCase().includes('certification')) {
        score += 5;
      }
    });
    
    // Bonus for education keywords
    const educationKeywordCount = this.educationKeywords.filter(keyword => 
      cvText.toLowerCase().includes(keyword)
    ).length;
    score += Math.min(20, educationKeywordCount * 2);
    
    return score;
  }

  // ===== INTELLIGENT CONTENT GENERATION =====
  generateIntelligentStrengths(skillsAnalysis, experienceAnalysis, educationAnalysis, scores) {
    const strengths = [];
    
    // Skills-based strengths
    if (skillsAnalysis.matchedSkills.length > 0) {
      strengths.push(`Strong technical alignment: ${skillsAnalysis.matchedSkills.slice(0, 4).join(', ')}`);
    }
    
    if (skillsAnalysis.cvSkills.length > 8) {
      strengths.push(`Comprehensive skill portfolio (${skillsAnalysis.cvSkills.length} skills identified)`);
    }
    
    // Experience-based strengths
    if (experienceAnalysis.length > 2) {
      strengths.push(`Diverse professional experience across ${experienceAnalysis.length} positions`);
    }
    
    // Education-based strengths
    const degrees = educationAnalysis.filter(edu => edu.type === 'Degree');
    const certifications = educationAnalysis.filter(edu => edu.type === 'Certification');
    
    if (degrees.length > 0) {
      strengths.push(`Solid educational foundation: ${degrees[0].degree}`);
    }
    
    if (certifications.length > 0) {
      strengths.push(`Professional certifications demonstrate continuous learning`);
    }
    
    // Score-based strengths
    if (scores.skills > 80) {
      strengths.push('Excellent technical skills match for the role');
    }
    
    if (scores.experience > 75) {
      strengths.push('Strong professional background and experience');
    }
    
    return strengths.length > 0 ? strengths : ['Professional qualifications and relevant background'];
  }

  generateIntelligentWeaknesses(skillsAnalysis, experienceAnalysis, educationAnalysis, scores) {
    const weaknesses = [];
    
    // Skills-based weaknesses
    if (skillsAnalysis.missingSkills.length > 0) {
      weaknesses.push(`Skills development needed: ${skillsAnalysis.missingSkills.slice(0, 3).join(', ')}`);
    }
    
    if (scores.skills < 60) {
      weaknesses.push('Technical skills require strengthening for optimal role fit');
    }
    
    // Experience-based weaknesses
    if (experienceAnalysis.length < 2) {
      weaknesses.push('Limited professional experience documented');
    }
    
    if (scores.experience < 50) {
      weaknesses.push('Experience level may not fully meet role requirements');
    }
    
    // Education-based weaknesses
    if (educationAnalysis.length === 0) {
      weaknesses.push('Educational background requires clarification');
    }
    
    if (scores.education < 60) {
      weaknesses.push('Educational qualifications could be enhanced');
    }
    
    // Overall weaknesses
    if (scores.overall < 70) {
      weaknesses.push('Overall profile needs strengthening to fully meet role requirements');
    }
    
    return weaknesses.length > 0 ? weaknesses : ['Minor areas for professional development'];
  }

  generateIntelligentSummary(name, scores, skillsAnalysis, experienceAnalysis, educationAnalysis) {
    const fitLevel = scores.overall >= 80 ? 'Excellent' : 
                     scores.overall >= 70 ? 'Strong' :
                     scores.overall >= 60 ? 'Good' : 
                     scores.overall >= 50 ? 'Fair' : 'Developing';
    
    const skillMatchPercentage = skillsAnalysis.requiredSkills.length > 0 ? 
      Math.round((skillsAnalysis.matchedSkills.length / skillsAnalysis.requiredSkills.length) * 100) : 0;
    
    const recommendation = scores.overall >= 75 ? 'Highly Recommended' :
                          scores.overall >= 65 ? 'Recommended' :
                          scores.overall >= 50 ? 'Consider with Development' : 'Requires Significant Development';
    
    return `${name} presents a ${fitLevel.toLowerCase()} candidate profile with ${scores.overall}% overall compatibility. ` +
           `Technical skills show ${skillMatchPercentage}% alignment (${skillsAnalysis.matchedSkills.length}/${skillsAnalysis.requiredSkills.length} required skills). ` +
           `Professional experience spans ${experienceAnalysis.length} documented positions with ${educationAnalysis.length} educational qualifications. ` +
           `Assessment: ${recommendation}. ` +
           `Key strengths in ${scores.skills > scores.experience ? 'technical capabilities' : 'professional experience'}.`;
  }
}

module.exports = CVAnalysisService;
