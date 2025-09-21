class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    this.model = 'microsoft/DialoGPT-medium'; // Better for CV analysis
    this.isAvailable = !!this.apiKey;
    
    if (!this.apiKey) {
      console.log('⚠️ Hugging Face API key not found. Using fallback analysis.');
      console.log('📝 Get free API key at: https://huggingface.co/settings/tokens');
    } else {
      console.log('✅ Hugging Face API available');
    }
  }

  async generateResponse(prompt, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Hugging Face API not available');
    }

    try {
      console.log('🤗 Making HuggingFace API request...');
      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: options.max_tokens || 1000,
            temperature: options.temperature || 0.1,
            return_full_text: false,
            ...options
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HF API error: ${response.status}`);
      }

      const result = await response.json();
      return result[0]?.generated_text || result.generated_text || '';
    } catch (error) {
      console.error('Hugging Face API error:', error);
      throw error;
    }
  }

  // Same CV analysis methods but using HF API
  async analyzeCVWithLLM(cvText, filename) {
    console.log('🤗 Analyzing CV with Hugging Face API...');
    
    const prompt = `Extract information from this CV and return JSON:

CV: ${cvText.substring(0, 3000)}

Return only valid JSON:
{
  "personal": {"name": "", "email": "", "phone": "", "location": ""},
  "skills": ["skill1", "skill2"],
  "experience": [{"company": "", "position": "", "duration": "", "description": ""}],
  "education": [{"degree": "", "institution": "", "year": ""}],
  "summary": ""
}`;

    try {
      const response = await this.generateResponse(prompt);
      
      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ HF CV analysis completed');
        return result;
      }
      
      throw new Error('No valid JSON in response');
    } catch (error) {
      console.error('❌ HF CV analysis failed:', error);
      throw error;
    }
  }

  async analyzeJobDescriptionWithLLM(jdText, filename) {
    console.log('🤗 Analyzing JD with Hugging Face API...');
    
    const prompt = `Extract job requirements from this Job Description and return JSON:

JD: ${jdText.substring(0, 2000)}

Return only valid JSON:
{
  "position_title": "",
  "company": "",
  "required_skills": ["skill1", "skill2"],
  "experience_required": "",
  "responsibilities": ["resp1", "resp2"],
  "domain": ""
}`;

    try {
      const response = await this.generateResponse(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ HF JD analysis completed');
        return result;
      }
      
      throw new Error('No valid JSON in response');
    } catch (error) {
      console.error('❌ HF JD analysis failed:', error);
      throw error;
    }
  }

  async performIntelligentMatching(cvData, jdData) {
    console.log('🤗 Performing matching with Hugging Face API...');
    
    const prompt = `Analyze candidate-job match and return JSON:

Candidate: ${JSON.stringify(cvData.personal)} Skills: ${cvData.skills.join(', ')}
Job: ${jdData.position_title} Required: ${jdData.required_skills.join(', ')}

Return only valid JSON:
{
  "overall_score": 85,
  "skills_matched": ["skill1"],
  "skills_missing": ["skill2"],
  "strengths": ["strength1"],
  "concerns": ["concern1"],
  "recommendations": ["rec1"],
  "fit_level": "High",
  "recommendation": "Highly Recommended"
}`;

    try {
      const response = await this.generateResponse(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ HF matching analysis completed');
        return result;
      }
      
      throw new Error('No valid JSON in response');
    } catch (error) {
      console.error('❌ HF matching analysis failed:', error);
      throw error;
    }
  }

  // Fallback methods (same as before)
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
      console.log(`⚠️ HF API failed, using fallback for ${analysisType}:`, error.message);
      
      // Use basic fallback methods
      if (analysisType === 'cv') {
        return this.basicCVAnalysis(...args);
      } else if (analysisType === 'jd') {
        return this.basicJDAnalysis(...args);
      } else if (analysisType === 'matching') {
        return this.basicMatching(...args);
      }
    }
  }

  // Basic fallback methods
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
      skills: foundSkills.length > 0 ? foundSkills : ["Basic parsing - HF API unavailable"],
      experience: [{
        company: "Basic parsing completed",
        position: "HF API analysis unavailable",
        duration: "Unknown",
        description: "Add HF API key for detailed analysis"
      }],
      education: [{
        degree: "Basic parsing completed",
        institution: "HF API analysis unavailable",
        year: "Unknown"
      }],
      summary: "Basic CV parsing completed - add HF API key for detailed analysis"
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
      recommendations: [`Score: ${overallScore}%`, 'Add HF API key for detailed analysis'],
      fit_level: overallScore >= 85 ? 'High' : overallScore >= 70 ? 'Medium' : 'Low',
      recommendation: overallScore >= 85 ? 'Highly Recommended' : overallScore >= 70 ? 'Recommended' : 'Consider'
    };
  }
}

module.exports = new HuggingFaceService();
