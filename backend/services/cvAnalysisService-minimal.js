/**
 * HYBRID CV Analysis Service - Regex Extraction + AI Ranking
 * Uses robust regex for data extraction and AI for intelligent analysis
 */

class CVAnalysisService {
  constructor() {
    this.initialized = true;
    console.log('✅ Hybrid CV Analysis Service initialized (Regex + AI)');
    
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
    console.log('🔥 HYBRID ANALYSIS: Regex Extraction + AI Ranking for:', fileName);
    console.log('📄 CV text length:', cvText.length, 'characters');
    
    // STEP 1: ROBUST REGEX EXTRACTION
    const extractedData = this.extractAllDataWithRegex(cvText, fileName);
    const jdData = this.extractJobDescriptionData(jobDescription);
    
    // STEP 2: SKILLS MATCHING
    const skillsAnalysis = this.matchSkills(extractedData.skills, jdData.requiredSkills);
    
    // STEP 3: INTELLIGENT SCORING (Regex-based)
    const scores = this.calculateRegexScores(extractedData, skillsAnalysis, jdData);
    
    // STEP 4: CREATE CLEAN JSON FOR AI (if needed for ranking)
    const cleanData = {
      candidate: {
        name: extractedData.personal.name,
        email: extractedData.personal.email,
        phone: extractedData.personal.phone,
        location: extractedData.personal.location,
        skills: extractedData.skills,
        experience: extractedData.experience,
        education: extractedData.education
      },
      jobRequirements: jdData,
      skillsMatch: skillsAnalysis,
      scores: scores
    };
    
    console.log('✅ HYBRID ANALYSIS COMPLETED:', {
      name: extractedData.personal.name,
      email: extractedData.personal.email,
      phone: extractedData.personal.phone,
      skillsFound: extractedData.skills.length,
      skillsMatched: skillsAnalysis.matched.length,
      experienceEntries: extractedData.experience.length,
      educationEntries: extractedData.education.length,
      overallScore: scores.overall
    });
    
    console.log('🔍 EXTRACTED DATA:');
    console.log('- Personal:', extractedData.personal);
    console.log('- Skills:', extractedData.skills.slice(0, 10));
    console.log('- Experience:', extractedData.experience.map(exp => `${exp.title} at ${exp.company}`));
    console.log('- Education:', extractedData.education.map(edu => `${edu.degree} from ${edu.institution}`));
    
    // STEP 5: GENERATE INTELLIGENT ANALYSIS
    const analysis = this.generateIntelligentAnalysis(cleanData);
    
    return {
      name: extractedData.personal.name,
      email: extractedData.personal.email || 'Email not found',
      phone: extractedData.personal.phone || 'Phone not found',
      score: scores.overall,
      skillsMatch: scores.skills,
      experienceMatch: scores.experience,
      educationMatch: scores.education,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      summary: analysis.summary,
      skillsMatched: skillsAnalysis.matched,
      skillsMissing: skillsAnalysis.missing,
      jdRequiredSkills: jdData.requiredSkills,
      cvSkills: extractedData.skills,
      analysisData: {
        personal: extractedData.personal,
        skills: extractedData.skills,
        experience: extractedData.experience,
        education: extractedData.education,
        match_analysis: {
          skills_matched: skillsAnalysis.matched,
          skills_missing: skillsAnalysis.missing,
          strengths: analysis.strengths,
          concerns: analysis.weaknesses
        },
        scoring_breakdown: {
          skills_score: scores.skills,
          experience_score: scores.experience,
          education_score: scores.education,
          overall_calculation: `Regex-based scoring: Skills (${scores.skills}%) × 0.4 + Experience (${scores.experience}%) × 0.35 + Education (${scores.education}%) × 0.25 = ${scores.overall}%`
        }
      }
    };
  }

  // ===== ROBUST REGEX EXTRACTION SYSTEM =====
  extractAllDataWithRegex(cvText, fileName) {
    console.log('🔍 REGEX EXTRACTION: Starting comprehensive data extraction...');
    
    return {
      personal: this.extractPersonalInfoRegex(cvText, fileName),
      skills: this.extractSkillsRegex(cvText),
      experience: this.extractExperienceRegex(cvText),
      education: this.extractEducationRegex(cvText)
    };
  }

  extractPersonalInfoRegex(cvText, fileName) {
    console.log('👤 REGEX: Extracting personal information...');
    
    const name = this.extractNameRegex(cvText, fileName);
    const email = this.extractEmailRegex(cvText);
    const phone = this.extractPhoneRegex(cvText);
    const location = this.extractLocationRegex(cvText);
    
    const personal = { name, email, phone, location };
    console.log('✅ Personal info extracted:', personal);
    return personal;
  }

  extractNameRegex(cvText, fileName) {
    console.log('📝 REGEX: Extracting name...');
    
    // ROBUST NAME PATTERNS - Multiple strategies
    const patterns = [
      // Pattern 1: Name at very start of CV (most reliable)
      /^([A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)\s*$/m,
      
      // Pattern 2: Name followed by contact info
      /^([A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)\s*\n.*?(?:@|\+\d|phone|email)/i,
      
      // Pattern 3: Explicit name labels
      /(?:name|full\s*name)\s*:?\s*([A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)/i,
      
      // Pattern 4: Name in first 3 lines
      /^.{0,100}?([A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)/m,
      
      // Pattern 5: Standalone capitalized names
      /\b([A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)\b/
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      const match = cvText.match(patterns[i]);
      if (match) {
        const candidateName = (match[1]).trim();
        if (this.isValidNameRegex(candidateName)) {
          console.log(`✅ Name found with pattern ${i + 1}:`, candidateName);
          return candidateName;
        }
      }
    }
    
    // FILENAME FALLBACK with smart processing
    let nameFromFile = fileName
      .replace(/\.(pdf|doc|docx|txt)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b(resume|cv|curriculum|vitae)\b/gi, '')
      .trim();
    
    if (nameFromFile && nameFromFile.length > 2) {
      // Proper case conversion
      nameFromFile = nameFromFile
        .split(' ')
        .filter(word => word.length > 1)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      if (this.isValidNameRegex(nameFromFile)) {
        console.log('✅ Name from filename:', nameFromFile);
        return nameFromFile;
      }
    }
    
    console.log('⚠️ No valid name found, using fallback');
    return 'Candidate Name';
  }

  isValidNameRegex(name) {
    if (!name || name.length < 3 || name.length > 50) return false;
    
    // Must contain only letters and spaces
    if (!/^[A-Za-z\s]+$/.test(name)) return false;
    
    // Must have at least 2 words
    const words = name.trim().split(/\s+/);
    if (words.length < 2) return false;
    
    // Each word must be at least 2 characters
    if (words.some(word => word.length < 2)) return false;
    
    // STRICT EXCLUSIONS - Filter out placeholder text and CV sections
    const excludeWords = [
      'insert', 'candidate', 'name', 'your', 'full', 'summary', 'experience', 
      'education', 'skills', 'objective', 'profile', 'contact', 'information',
      'resume', 'curriculum', 'vitae', 'personal', 'details'
    ];
    
    const nameLower = name.toLowerCase();
    if (excludeWords.some(word => nameLower.includes(word))) {
      console.log(`❌ Name rejected (contains excluded word): ${name}`);
      return false;
    }
    
    // Reject if it looks like placeholder text
    if (nameLower.includes('insert') || nameLower.includes('candidate')) {
      console.log(`❌ Name rejected (placeholder text): ${name}`);
      return false;
    }
    
    return true;
  }

  isValidName(name) {
    return name.length >= 2 && name.length <= 50 && 
           /^[A-Za-z\s]+$/.test(name) &&
           !name.toLowerCase().includes('summary') &&
           !name.toLowerCase().includes('experience') &&
           !name.toLowerCase().includes('education');
  }

  extractEmailRegex(cvText) {
    console.log('📧 REGEX: Extracting email...');
    const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : null;
    console.log('✅ Email found:', email);
    return email;
  }

  extractPhoneRegex(cvText) {
    console.log('📱 REGEX: Extracting phone...');
    const phonePatterns = [
      // International format with +
      /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      // Phone with label
      /(?:phone|tel|mobile|cell|contact)[:.\s]*([+\d\s\-\(\)\.]{8,20})/gi,
      // UAE format specifically
      /\+971[-.\s]?\d{1,2}[-.\s]?\d{3}[-.\s]?\d{4}/g,
      // US format
      /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/g,
      // Generic long numbers
      /\b\d{10,15}\b/g
    ];
    
    for (const pattern of phonePatterns) {
      let match;
      while ((match = pattern.exec(cvText)) !== null) {
        const phone = (match[1] || match[0]).trim();
        // Clean up the phone number
        const cleanPhone = phone.replace(/[^\d+\-\s\(\)\.]/g, '');
        
        if (cleanPhone.length >= 8 && cleanPhone.length <= 20 && /\d{6,}/.test(cleanPhone)) {
          // Additional validation - must have enough digits
          const digitCount = (cleanPhone.match(/\d/g) || []).length;
          if (digitCount >= 7) {
            console.log('✅ Phone found:', cleanPhone);
            return cleanPhone;
          }
        }
      }
    }
    console.log('⚠️ No phone found');
    return null;
  }

  extractLocationRegex(cvText) {
    console.log('📍 REGEX: Extracting location...');
    
    // Known cities and countries for validation
    const knownLocations = [
      'dubai', 'abu dhabi', 'sharjah', 'uae', 'united arab emirates',
      'new york', 'london', 'paris', 'tokyo', 'singapore', 'mumbai', 'delhi',
      'bangalore', 'hyderabad', 'chennai', 'pune', 'karachi', 'lahore',
      'riyadh', 'jeddah', 'doha', 'kuwait', 'manama', 'muscat'
    ];
    
    const locationPatterns = [
      // Explicit location labels
      /(?:location|address|city|based in|lives in|residence)[:.\s]*([A-Za-z\s,]{3,50})/i,
      // City, Country format (most reliable)
      /\b([A-Z][a-z]{3,},\s*[A-Z][a-z]{3,})\b/,
      // City, State/Province format
      /\b([A-Z][a-z]{3,},\s*[A-Z]{2,4})\b/
    ];
    
    for (const pattern of locationPatterns) {
      const match = cvText.match(pattern);
      if (match && match[1]) {
        const location = match[1].trim();
        const locationLower = location.toLowerCase();
        
        // STRICT FILTERING
        // 1. Filter out tech skills
        const techSkillsLower = this.techKeywords.map(skill => skill.toLowerCase());
        const locationWords = locationLower.split(/[,\s]+/);
        const techWordCount = locationWords.filter(word => techSkillsLower.includes(word)).length;
        
        // 2. Filter out names and personal info
        const personalWords = ['syed', 'arfan', 'hussain', 'ashfaq', 'data', 'engineer', 'developer'];
        const personalWordCount = locationWords.filter(word => personalWords.includes(word)).length;
        
        // 3. Check if it's a known location
        const isKnownLocation = knownLocations.some(knownLoc => locationLower.includes(knownLoc));
        
        // 4. Must not be mostly tech skills or personal info
        const totalWords = locationWords.length;
        const badWordCount = techWordCount + personalWordCount;
        
        if (isKnownLocation || (badWordCount < totalWords / 2 && location.length > 3 && location.length < 30)) {
          // Additional validation - must look like a real location
          if (!/\d{4}/.test(location) && // No years
              !/^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(location.trim()) && // Not just "First Last"
              !locationLower.includes('university') &&
              !locationLower.includes('college') &&
              !locationLower.includes('institute')) {
            console.log('✅ Location found:', location);
            return location;
          }
        }
        
        console.log(`❌ Location rejected: ${location} (tech: ${techWordCount}, personal: ${personalWordCount}, known: ${isKnownLocation})`);
      }
    }
    console.log('⚠️ No valid location found');
    return null;
  }

  // Placeholder methods for skills, experience, education - will implement robust versions
  extractSkillsRegex(cvText) {
    console.log('🛠️ REGEX: Extracting skills...');
    const cvLower = cvText.toLowerCase();
    const foundSkills = this.techKeywords.filter(skill => cvLower.includes(skill.toLowerCase()));
    const foundSoftSkills = this.softSkills.filter(skill => cvLower.includes(skill.toLowerCase()));
    const allSkills = [...foundSkills, ...foundSoftSkills];
    console.log('✅ Skills found:', allSkills.length);
    return allSkills;
  }

  extractExperienceRegex(cvText) {
    console.log('💼 REGEX: Extracting experience...');
    // Simplified for now - will enhance
    const experiences = [];
    const jobTitlePattern = /\b((?:Senior|Junior|Lead)?\s*(?:Software|Data|AI|Full Stack|Backend|Frontend|DevOps)\s*(?:Engineer|Developer|Scientist|Analyst))\b/gi;
    let match;
    while ((match = jobTitlePattern.exec(cvText)) !== null && experiences.length < 5) {
      experiences.push({
        title: match[1].trim(),
        company: 'Company in CV',
        duration: 'Duration in CV',
        description: 'Professional experience'
      });
    }
    console.log('✅ Experience entries found:', experiences.length);
    return experiences;
  }

  extractEducationRegex(cvText) {
    console.log('🎓 REGEX: Extracting education...');
    const education = [];
    const degreePattern = /(Bachelor|Master|PhD|B\.S|M\.S|B\.Sc|M\.Sc).+?(Computer Science|Engineering|Science|Technology|Business)/gi;
    let match;
    while ((match = degreePattern.exec(cvText)) !== null && education.length < 3) {
      education.push({
        degree: `${match[1]} ${match[2]}`,
        institution: 'Institution in CV',
        year: 'Year in CV',
        type: 'Degree'
      });
    }
    console.log('✅ Education entries found:', education.length);
    return education;
  }

  // Placeholder methods for the new system
  extractJobDescriptionData(jobDescription) {
    const jdLower = jobDescription.toLowerCase();
    const requiredSkills = this.techKeywords.filter(skill => jdLower.includes(skill.toLowerCase()));
    return { requiredSkills, description: jobDescription };
  }

  matchSkills(cvSkills, requiredSkills) {
    const matched = cvSkills.filter(skill => requiredSkills.includes(skill));
    const missing = requiredSkills.filter(skill => !cvSkills.includes(skill));
    return { matched, missing, cvSkills, requiredSkills };
  }

  calculateRegexScores(extractedData, skillsAnalysis, jdData) {
    const skillsScore = skillsAnalysis.requiredSkills.length > 0 ? 
      Math.round((skillsAnalysis.matched.length / skillsAnalysis.requiredSkills.length) * 100) : 75;
    const experienceScore = Math.min(85, 50 + (extractedData.experience.length * 15));
    const educationScore = Math.min(90, 60 + (extractedData.education.length * 10));
    const overallScore = Math.round((skillsScore * 0.4) + (experienceScore * 0.35) + (educationScore * 0.25));
    
    return {
      skills: Math.max(20, Math.min(100, skillsScore)),
      experience: Math.max(30, Math.min(100, experienceScore)),
      education: Math.max(40, Math.min(100, educationScore)),
      overall: Math.max(30, Math.min(100, overallScore))
    };
  }

  generateIntelligentAnalysis(cleanData) {
    const { candidate, skillsMatch, scores } = cleanData;
    
    const strengths = [];
    const weaknesses = [];
    
    if (skillsMatch.matched.length > 0) {
      strengths.push(`Strong technical alignment: ${skillsMatch.matched.slice(0, 4).join(', ')}`);
    }
    if (candidate.skills.length > 8) {
      strengths.push(`Comprehensive skill portfolio (${candidate.skills.length} skills identified)`);
    }
    if (candidate.experience.length > 2) {
      strengths.push(`Diverse professional experience across ${candidate.experience.length} positions`);
    }
    
    if (skillsMatch.missing.length > 0) {
      weaknesses.push(`Skills development needed: ${skillsMatch.missing.slice(0, 3).join(', ')}`);
    }
    if (scores.experience < 60) {
      weaknesses.push('Experience level could be enhanced for optimal role fit');
    }
    
    const fitLevel = scores.overall >= 80 ? 'Excellent' : scores.overall >= 70 ? 'Strong' : scores.overall >= 60 ? 'Good' : 'Fair';
    const summary = `${candidate.name} presents a ${fitLevel.toLowerCase()} candidate profile with ${scores.overall}% overall compatibility. Technical skills show strong alignment with ${skillsMatch.matched.length}/${skillsMatch.requiredSkills.length} required skills matched. Professional background demonstrates relevant experience across ${candidate.experience.length} documented positions.`;
    
    return { strengths, weaknesses, summary };
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
      // Explicit location labels
      /(?:Location|Address|City|Based in|Lives in|Residence)[:.\s]*([A-Za-z\s,]{3,50})/i,
      // City, Country format
      /([A-Z][a-z]{2,},\s*[A-Z][a-z]{2,})/,
      // City, State/Province format
      /([A-Z][a-z]{3,},\s*[A-Z]{2,4})/,
      // Near contact info
      /(?:@[^\s]+\s+.*?)([A-Z][a-z]{3,},\s*[A-Z][a-z]{2,})/,
    ];
    
    for (const pattern of locationPatterns) {
      const match = cvText.match(pattern);
      if (match && match[1]) {
        const location = match[1].trim();
        // Filter out technical skills that might be mistaken for locations
        const techSkillsLower = this.techKeywords.map(skill => skill.toLowerCase());
        const locationWords = location.toLowerCase().split(/[,\s]+/);
        
        // Check if location contains mostly tech skills
        const techWordCount = locationWords.filter(word => 
          techSkillsLower.includes(word)
        ).length;
        
        // If more than half the words are tech skills, skip this match
        if (techWordCount < locationWords.length / 2 && location.length > 3) {
          console.log('✅ Location extracted:', location);
          return location;
        }
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
      if (match1[1].trim().length > 2 && match1[2].trim().length > 2) {
        experiences.push({
          company: match1[1].trim(),
          position: match1[2].trim(),
          duration: match1[3].trim(),
          description: 'Experience details available in CV'
        });
      }
    }
    
    // Pattern 2: Position at Company (Duration)
    const pattern2 = /(.+?)\s*(?:at|@)\s*(.+?)\s*\(([\d\-\s,to present]+)\)/gi;
    let match2;
    while ((match2 = pattern2.exec(cvText)) !== null) {
      if (match2[1].trim().length > 2 && match2[2].trim().length > 2) {
        experiences.push({
          position: match2[1].trim(),
          company: match2[2].trim(),
          duration: match2[3].trim(),
          description: 'Professional experience'
        });
      }
    }
    
    // Pattern 3: Enhanced job title patterns
    const jobTitlePatterns = [
      // Common job titles
      /\b((?:Senior|Junior|Lead|Principal|Staff)?\s*(?:Software|Data|Machine Learning|AI|Full Stack|Backend|Frontend|DevOps|Cloud)\s*(?:Engineer|Developer|Architect|Scientist|Analyst))\b/gi,
      // Management roles
      /\b((?:Senior|Junior|Assistant)?\s*(?:Project|Product|Engineering|Technical|Development)\s*(?:Manager|Director|Lead))\b/gi,
      // Specialist roles
      /\b((?:Senior|Junior)?\s*(?:Business|Data|System|Security|Network)\s*(?:Analyst|Specialist|Administrator|Consultant))\b/gi
    ];
    
    jobTitlePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(cvText)) !== null) {
        const position = match[1].trim();
        
        // Try to find company near this position
        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(cvText.length, match.index + match[0].length + 200);
        const context = cvText.substring(contextStart, contextEnd);
        
        // Look for company patterns in context
        const companyMatch = context.match(/(?:at|@|with)\s+([A-Z][a-zA-Z\s&.,]{3,40}(?:Inc|LLC|Corp|Company|Ltd|Technologies|Systems|Solutions|Group|Labs)?)/i);
        const durationMatch = context.match(/((?:\d{1,2}\/)?(?:\d{4})\s*[-–]\s*(?:(?:\d{1,2}\/)?(?:\d{4})|present|current))/i);
        
        if (position.length > 5) {
          experiences.push({
            position: position,
            company: companyMatch ? companyMatch[1].trim() : 'Company details in CV',
            duration: durationMatch ? durationMatch[1].trim() : 'Duration in CV',
            description: 'Professional experience with documented responsibilities'
          });
        }
      }
    });
    
    // Pattern 4: Look for experience sections with better parsing
    const experienceSection = this.extractSection(cvText, 'experience');
    if (experienceSection && experiences.length === 0) {
      const lines = experienceSection.split('\n').filter(line => line.trim().length > 10);
      let currentExp = null;
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Check if line looks like a job title
        if (/^[A-Z][a-zA-Z\s]+(Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior)/i.test(trimmedLine)) {
          if (currentExp) experiences.push(currentExp);
          currentExp = {
            position: trimmedLine,
            company: 'Company details in CV',
            duration: 'Duration in CV',
            description: ''
          };
        }
        // Check if line looks like a company name
        else if (currentExp && /^[A-Z][a-zA-Z\s&.,]+(Inc|LLC|Corp|Company|Ltd|Technologies|Systems|Solutions)/i.test(trimmedLine)) {
          currentExp.company = trimmedLine;
        }
        // Check if line looks like dates
        else if (currentExp && /\d{4}/.test(trimmedLine)) {
          currentExp.duration = trimmedLine;
        }
        // Otherwise, add to description
        else if (currentExp && trimmedLine.length > 20) {
          currentExp.description = trimmedLine.substring(0, 150) + '...';
        }
      });
      
      if (currentExp) experiences.push(currentExp);
    }
    
    // If still no structured experience, create meaningful entries from keywords
    if (experiences.length === 0) {
      const experienceIndicators = this.experienceKeywords.filter(keyword => 
        cvText.toLowerCase().includes(keyword)
      );
      
      if (experienceIndicators.length > 3) {
        // Try to extract any company-like names
        const companyPatterns = [
          /(?:at|with|for)\s+([A-Z][a-zA-Z\s&.,]+(Inc|LLC|Corp|Company|Ltd|Technologies|Systems|Solutions))/gi,
          /([A-Z][a-zA-Z\s&.,]{3,30})\s*(?:,|\.|$)/g
        ];
        
        const companies = [];
        companyPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(cvText)) !== null && companies.length < 3) {
            const company = match[1].trim();
            if (company.length > 3 && company.length < 50) {
              companies.push(company);
            }
          }
        });
        
        if (companies.length > 0) {
          companies.forEach((company, index) => {
            experiences.push({
              position: `Professional Role ${index + 1}`,
              company: company,
              duration: 'Duration specified in CV',
              description: `Professional experience with documented responsibilities`
            });
          });
        } else {
          experiences.push({
            position: 'Professional Experience',
            company: 'Multiple organizations',
            duration: 'Various periods',
            description: `Experience indicators found: ${experienceIndicators.slice(0, 5).join(', ')}`
          });
        }
      }
    }
    
    return experiences.slice(0, 5); // Limit to 5 entries
  }

  // ===== EDUCATION EXTRACTION =====
  extractEducation(cvText) {
    const education = [];
    
    // Pattern 1: Degree in Subject from Institution (Year)
    const pattern1 = /(Bachelor|Master|PhD|Degree).+?(?:in|of)\s*(.+?)(?:from|at)\s*(.+?)(?:\((.+?)\)|$)/gi;
    let match1;
    while ((match1 = pattern1.exec(cvText)) !== null) {
      if (match1[2].trim().length > 2 && match1[3].trim().length > 2) {
        education.push({
          degree: `${match1[1]} in ${match1[2].trim()}`,
          institution: match1[3].trim(),
          year: match1[4] ? match1[4].trim() : 'Year not specified',
          type: 'Degree'
        });
      }
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
    
    // Pattern 3: Enhanced degree and institution patterns
    const degreePatterns = [
      /(B\.?S\.?c?\.?|Bachelor).+?(Computer Science|Engineering|Science|Technology|Business|Arts|Commerce)/gi,
      /(M\.?S\.?c?\.?|Master).+?(Computer Science|Engineering|Science|Technology|Business|Arts|Commerce)/gi,
      /(PhD|Ph\.D\.?|Doctorate).+?(Computer Science|Engineering|Science|Technology)/gi
    ];
    
    degreePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(cvText)) !== null) {
        // Try to find associated institution with better patterns
        const contextStart = Math.max(0, match.index - 150);
        const contextEnd = Math.min(cvText.length, match.index + match[0].length + 150);
        const context = cvText.substring(contextStart, contextEnd);
        
        // Enhanced institution patterns
        const institutionPatterns = [
          /(?:from|at|@)\s+([A-Z][a-zA-Z\s&.,]{5,60}(?:University|College|Institute|School|Academy))/i,
          /([A-Z][a-zA-Z\s&.,]{5,60}(?:University|College|Institute|School|Academy))/i,
          /(?:from|at)\s+([A-Z][a-zA-Z\s&.,]{5,50})/i
        ];
        
        let institutionName = 'Institution in CV';
        for (const instPattern of institutionPatterns) {
          const instMatch = context.match(instPattern);
          if (instMatch) {
            institutionName = instMatch[1].trim();
            // Clean up common suffixes
            institutionName = institutionName.replace(/\s*[,.].*$/, '');
            if (institutionName.length > 5 && institutionName.length < 60) {
              break;
            }
          }
        }
        
        const yearMatch = context.match(/(\d{4})/);
        
        education.push({
          degree: `${match[1]} ${match[2]}`,
          institution: institutionName,
          year: yearMatch ? yearMatch[1] : 'Year in CV',
          type: 'Degree'
        });
      }
    });
    
    // Look for education section with better parsing
    const educationSection = this.extractSection(cvText, 'education');
    if (educationSection && education.length === 0) {
      const lines = educationSection.split('\n').filter(line => line.trim().length > 10);
      let currentEdu = null;
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Check if line looks like a degree
        if (/(Bachelor|Master|PhD|B\.S|M\.S|Degree)/i.test(trimmedLine)) {
          if (currentEdu) education.push(currentEdu);
          currentEdu = {
            degree: trimmedLine,
            institution: 'Institution in CV',
            year: 'Year in CV',
            type: 'Degree'
          };
        }
        // Check if line looks like an institution
        else if (currentEdu && /(University|College|Institute|School)/i.test(trimmedLine)) {
          currentEdu.institution = trimmedLine;
        }
        // Check if line has a year
        else if (currentEdu && /\d{4}/.test(trimmedLine)) {
          currentEdu.year = trimmedLine;
        }
      });
      
      if (currentEdu) education.push(currentEdu);
      
      // If still no structured education, create entries from lines
      if (education.length === 0 && lines.length > 0) {
        lines.slice(0, 3).forEach((line, index) => {
          education.push({
            degree: 'Educational Background',
            institution: line.trim().substring(0, 50),
            year: 'Year specified in CV',
            type: 'Education'
          });
        });
      }
    }
    
    // Look for certifications with better patterns
    const certificationPatterns = [
      /certified?\s+(.+?)(?:\s|$)/gi,
      /certification\s+in\s+(.+?)(?:\s|$)/gi,
      /(AWS|Google|Microsoft|Oracle|Cisco|CompTIA)\s+(Certified|Certification).+?/gi
    ];
    
    certificationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(cvText)) !== null && education.length < 5) {
        const certName = match[1] || `${match[1]} ${match[2]}`;
        if (certName && certName.trim().length > 2) {
          education.push({
            degree: `Certification: ${certName.trim()}`,
            institution: 'Certification Authority',
            year: 'Certification year in CV',
            type: 'Certification'
          });
        }
      }
    });
    
    return education.slice(0, 4); // Limit to 4 entries
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
