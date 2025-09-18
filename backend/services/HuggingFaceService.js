class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    this.model = 'microsoft/DialoGPT-large'; // Free model for text generation
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
      
      // Import the old service for fallback
      const ollamaService = require('./OllamaService');
      if (analysisType === 'cv') {
        return ollamaService.basicCVAnalysis(...args);
      } else if (analysisType === 'jd') {
        return ollamaService.basicJDAnalysis(...args);
      } else if (analysisType === 'matching') {
        return ollamaService.basicMatching(...args);
      }
    }
  }
}

module.exports = new HuggingFaceService();
