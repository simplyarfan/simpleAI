const { Ollama } = require('ollama');

class OllamaService {
  constructor() {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434'
    });
    this.model = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    this.isAvailable = false;
    this.checkAvailability();
  }

  async checkAvailability() {
    try {
      const models = await this.ollama.list();
      this.isAvailable = models.models.some(m => m.name.includes(this.model.split(':')[0]));
      
      if (this.isAvailable) {
        console.log(`✅ Ollama available with model: ${this.model}`);
      } else {
        console.log(`⚠️ Ollama model ${this.model} not found. Available models:`, models.models.map(m => m.name));
        console.log(`📥 To install: ollama pull ${this.model}`);
      }
    } catch (error) {
      console.log('⚠️ Ollama not available:', error.message);
      console.log('📥 Install Ollama: https://ollama.ai/download');
      this.isAvailable = false;
    }
  }

  async generateResponse(prompt, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Ollama service not available');
    }

    try {
      const response = await this.ollama.generate({
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.1,
          top_p: options.top_p || 0.9,
          num_predict: options.max_tokens || 2000,
          ...options
        }
      });

      return response.response;
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw error;
    }
  }

  // Analyze CV with structured output
  async analyzeCVWithLLM(cvText, filename) {
    console.log('🧠 Analyzing CV with local LLM...');
    
    const prompt = `You are an expert CV parser and HR analyst. Extract comprehensive information from this resume/CV and return ONLY a valid JSON object. Do not include any explanatory text, just the JSON.

CV Text:
${cvText.substring(0, 4000)}

Return this exact JSON structure with all available information:
{
  "personal": {
    "name": "full name from CV",
    "email": "email from CV or Not specified",
    "phone": "phone from CV or Not specified", 
    "location": "location/address from CV or Not specified",
    "age": "age if mentioned or Not specified",
    "gender": "gender if mentioned or Not specified",
    "current_salary": "current salary if mentioned or Not specified",
    "expected_salary": "expected salary if mentioned or Not specified"
  },
  "skills": ["list of all technical and professional skills found"],
  "experience": [
    {
      "company": "company name",
      "position": "job title/role",
      "duration": "time period (e.g., Jan 2020 - Dec 2022)",
      "description": "brief description of responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "degree name and field",
      "institution": "school/university name", 
      "year": "graduation year or period"
    }
  ],
  "summary": "brief professional summary highlighting key strengths and experience"
}

Extract as much detail as possible. If information is not clearly available, use "Not specified" or appropriate fallback values.`;

    try {
      const response = await this.generateResponse(prompt, { 
        temperature: 0.1,
        max_tokens: 2000 
      });

      // Clean and parse JSON response
      let cleanResponse = response.trim();
      
      // Remove any markdown code blocks
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON object in response
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
      }

      const result = JSON.parse(cleanResponse);
      
      // Validate and ensure required structure
      if (!result.personal) result.personal = {};
      if (!Array.isArray(result.skills)) result.skills = [];
      if (!Array.isArray(result.experience)) result.experience = [];
      if (!Array.isArray(result.education)) result.education = [];
      if (!result.summary) result.summary = "CV analysis completed";

      console.log('✅ LLM CV analysis completed');
      return result;

    } catch (error) {
      console.error('❌ LLM CV analysis failed:', error);
      throw error;
    }
  }

  // Analyze Job Description with LLM
  async analyzeJobDescriptionWithLLM(jdText, filename) {
    console.log('🧠 Analyzing Job Description with local LLM...');
    
    const prompt = `You are an expert HR analyst. Analyze this Job Description and extract key requirements. Return ONLY a valid JSON object, no explanatory text.

Job Description:
${jdText.substring(0, 3000)}

Return this exact JSON structure:
{
  "position_title": "main job title/position",
  "company": "company name if mentioned or Company Name",
  "required_skills": ["list of all technical and professional skills required"],
  "experience_required": "experience requirement (e.g., 3-5 years, Entry level, Senior level)",
  "responsibilities": ["list of main job responsibilities and duties"],
  "domain": "industry/domain (e.g., Technology, Healthcare, Finance)",
  "employment_type": "Full-time, Part-time, Contract, etc.",
  "location": "job location if specified",
  "salary_range": "salary range if mentioned or Not specified"
}

Extract comprehensive information. Focus on technical skills, experience requirements, and key responsibilities.`;

    try {
      const response = await this.generateResponse(prompt, { 
        temperature: 0.1,
        max_tokens: 1500 
      });

      // Clean and parse JSON response
      let cleanResponse = response.trim();
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
      }

      const result = JSON.parse(cleanResponse);
      
      // Validate structure
      if (!Array.isArray(result.required_skills)) result.required_skills = [];
      if (!Array.isArray(result.responsibilities)) result.responsibilities = [];
      if (!result.position_title) result.position_title = "Software Engineer";
      if (!result.company) result.company = "Company Name";
      if (!result.experience_required) result.experience_required = "3-5 years";
      if (!result.domain) result.domain = "Technology";

      console.log('✅ LLM JD analysis completed');
      return result;

    } catch (error) {
      console.error('❌ LLM JD analysis failed:', error);
      throw error;
    }
  }

  // Perform intelligent CV-JD matching with LLM
  async performIntelligentMatching(cvData, jdData) {
    console.log('🧠 Performing intelligent matching with local LLM...');
    
    const prompt = `You are an expert HR analyst specializing in candidate-job matching. Analyze how well this candidate matches the job requirements and provide detailed, actionable insights.

CANDIDATE PROFILE:
Name: ${cvData.personal.name}
Skills: ${cvData.skills.join(', ')}
Experience: ${cvData.experience.map(exp => `${exp.position} at ${exp.company} (${exp.duration})`).join('; ')}
Education: ${cvData.education.map(edu => `${edu.degree} from ${edu.institution} (${edu.year})`).join('; ')}
Summary: ${cvData.summary}

JOB REQUIREMENTS:
Position: ${jdData.position_title}
Company: ${jdData.company}
Required Skills: ${jdData.required_skills.join(', ')}
Experience Required: ${jdData.experience_required}
Responsibilities: ${jdData.responsibilities.join(', ')}
Domain: ${jdData.domain}

Provide a comprehensive analysis as JSON:
{
  "overall_score": 85,
  "skills_matched": ["list specific skills that match between CV and JD"],
  "skills_missing": ["list specific skills candidate lacks but job requires"],
  "strengths": ["specific strengths based on CV vs JD analysis"],
  "concerns": ["specific concerns or gaps identified"],
  "recommendations": ["specific hiring recommendations and next steps"],
  "fit_level": "High|Medium|Low",
  "recommendation": "Highly Recommended|Recommended|Consider|Not Recommended",
  "experience_match": "assessment of experience level match",
  "cultural_fit": "assessment based on background and role requirements",
  "growth_potential": "candidate's potential for growth in this role"
}

Be specific, detailed, and provide actionable insights. Score should be 0-100 based on overall match quality.`;

    try {
      const response = await this.generateResponse(prompt, { 
        temperature: 0.2,
        max_tokens: 2000 
      });

      // Clean and parse JSON response
      let cleanResponse = response.trim();
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
      }

      const result = JSON.parse(cleanResponse);
      
      // Validate and ensure required fields
      result.skills_matched = result.skills_matched || [];
      result.skills_missing = result.skills_missing || [];
      result.strengths = result.strengths || [];
      result.concerns = result.concerns || [];
      result.recommendations = result.recommendations || [];
      
      // Ensure score is within range
      result.overall_score = Math.min(100, Math.max(0, result.overall_score || 75));
      
      if (!result.fit_level) {
        result.fit_level = result.overall_score >= 85 ? 'High' : result.overall_score >= 70 ? 'Medium' : 'Low';
      }
      
      if (!result.recommendation) {
        result.recommendation = result.overall_score >= 85 ? 'Highly Recommended' : 
                              result.overall_score >= 70 ? 'Recommended' : 'Consider';
      }

      console.log('✅ LLM matching analysis completed');
      return result;

    } catch (error) {
      console.error('❌ LLM matching analysis failed:', error);
      throw error;
    }
  }

  // Fallback to basic analysis if LLM fails
  async analyzeWithFallback(analysisType, ...args) {
    try {
      switch (analysisType) {
        case 'cv':
          return await this.analyzeCVWithLLM(...args);
        case 'jd':
          return await this.analyzeJobDescriptionWithLLM(...args);
        case 'matching':
          return await this.performIntelligentMatching(...args);
        default:
          throw new Error('Unknown analysis type');
      }
    } catch (error) {
      console.log(`⚠️ LLM analysis failed, using fallback for ${analysisType}:`, error.message);
      
      // Return to basic analysis methods as fallback
      if (analysisType === 'cv') {
        return this.basicCVAnalysis(...args);
      } else if (analysisType === 'jd') {
        return this.basicJDAnalysis(...args);
      } else if (analysisType === 'matching') {
        return this.basicMatching(...args);
      }
    }
  }

  // Basic fallback methods (same as before)
  basicCVAnalysis(cvText, filename) {
    const lines = cvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = cvText.match(emailRegex);
    
    const phoneRegex = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
    const phoneMatch = cvText.match(phoneRegex);
    
    const name = lines.length > 0 ? lines[0] : filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
    
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 
      'Git', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Vue.js',
      'Angular', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'PHP'
    ];
    const foundSkills = skillKeywords.filter(skill => 
      cvText.toLowerCase().includes(skill.toLowerCase())
    );

    return {
      personal: {
        name: name,
        email: emailMatch ? emailMatch[0] : "Not specified",
        phone: phoneMatch ? phoneMatch[0] : "Not specified",
        location: "Not specified",
        age: "Not specified",
        gender: "Not specified",
        current_salary: "Not specified",
        expected_salary: "Not specified"
      },
      skills: foundSkills.length > 0 ? foundSkills : ["Basic parsing - LLM unavailable"],
      experience: [{
        company: "Basic parsing completed",
        position: "LLM analysis unavailable",
        duration: "Unknown",
        description: "Install Ollama for detailed analysis"
      }],
      education: [{
        degree: "Basic parsing completed",
        institution: "LLM analysis unavailable",
        year: "Unknown"
      }],
      summary: "Basic CV parsing completed - install Ollama for detailed analysis"
    };
  }

  basicJDAnalysis(jdText, filename) {
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 
      'Git', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Vue.js'
    ];
    
    const requiredSkills = skillKeywords.filter(skill => 
      jdText.toLowerCase().includes(skill.toLowerCase())
    );

    const experienceMatch = jdText.match(/(\d+)[\s-]*(\d+)?\s*years?\s*(of\s*)?experience/i);
    const experienceRequired = experienceMatch ? 
      (experienceMatch[2] ? `${experienceMatch[1]}-${experienceMatch[2]} years` : `${experienceMatch[1]}+ years`) :
      '2-5 years';

    return {
      position_title: 'Software Engineer',
      company: 'Company Name',
      required_skills: requiredSkills.length > 0 ? requiredSkills : ['JavaScript', 'React', 'Node.js'],
      experience_required: experienceRequired,
      responsibilities: ['Develop software solutions', 'Collaborate with team', 'Write clean code'],
      domain: 'Technology'
    };
  }

  basicMatching(cvData, jdData) {
    const cvSkills = cvData.skills.map(s => s.toLowerCase());
    const jdSkills = jdData.required_skills.map(s => s.toLowerCase());
    
    const matchedSkills = cvSkills.filter(skill => 
      jdSkills.some(jdSkill => 
        skill.includes(jdSkill) || jdSkill.includes(skill) || skill === jdSkill
      )
    );
    
    const missingSkills = jdSkills.filter(skill => 
      !cvSkills.some(cvSkill => cvSkill.includes(skill) || skill.includes(cvSkill))
    );
    
    const skillMatchRate = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) : 0.5;
    const overallScore = Math.round(60 + (skillMatchRate * 40));
    
    return {
      overall_score: overallScore,
      skills_matched: matchedSkills.slice(0, 10),
      skills_missing: missingSkills.slice(0, 5),
      strengths: skillMatchRate > 0.6 ? ['Good skill alignment'] : ['Some relevant experience'],
      concerns: skillMatchRate < 0.4 ? ['Limited skill match'] : [],
      recommendations: [`Score: ${overallScore}%`, 'Install Ollama for detailed analysis'],
      fit_level: overallScore >= 85 ? 'High' : overallScore >= 70 ? 'Medium' : 'Low',
      recommendation: overallScore >= 85 ? 'Highly Recommended' : overallScore >= 70 ? 'Recommended' : 'Consider'
    };
  }
}

// Create singleton instance
const ollamaService = new OllamaService();

module.exports = ollamaService;
