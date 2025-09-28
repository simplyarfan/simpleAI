/**
 * AI-POWERED CV RANKING SERVICE
 * Uses OpenAI to intelligently rank candidates and provide detailed skill matching analysis
 */

const axios = require('axios');
const cacheService = require('./cacheService');

class AIRankingCVAnalysisService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo';
    this.cache = cacheService;
  }

  /**
   * Extract key information from CV using regex patterns
   */
  extractBasicInfo(cvText) {
    const patterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      name: this.extractName(cvText)
    };

    return {
      email: (cvText.match(patterns.email) || [])[0] || 'Not found',
      phone: (cvText.match(patterns.phone) || [])[0] || 'Not found',
      name: patterns.name || 'Not found'
    };
  }

  extractName(cvText) {
    // Look for name in first few lines
    const lines = cvText.split('\n').slice(0, 5);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 2 && trimmed.length < 50 && 
          /^[A-Za-z\s]+$/.test(trimmed) && 
          !trimmed.toLowerCase().includes('resume') &&
          !trimmed.toLowerCase().includes('cv')) {
        return trimmed;
      }
    }
    return 'Not found';
  }

  /**
   * Analyze Job Description to extract required skills and requirements
   */
  async analyzeJobDescription(jdText) {
    console.log('🎯 Analyzing Job Description with AI...');
    
    const cacheKey = `jd_analysis_${Buffer.from(jdText).toString('base64').slice(0, 32)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      console.log('📋 Using cached JD analysis');
      return cached;
    }

    const prompt = `Analyze this job description and extract the key requirements:

JOB DESCRIPTION:
${jdText.slice(0, 2000)}

Please provide a JSON response with:
{
  "required_skills": ["skill1", "skill2", ...],
  "preferred_skills": ["skill1", "skill2", ...],
  "experience_required": "X years",
  "education_required": "degree level",
  "key_responsibilities": ["responsibility1", "responsibility2", ...],
  "job_title": "extracted title"
}

Focus on technical skills, programming languages, frameworks, tools, and qualifications.`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const analysis = JSON.parse(response.data.choices[0].message.content);
      await this.cache.set(cacheKey, analysis, 3600); // Cache for 1 hour
      
      console.log('✅ JD Analysis complete:', analysis);
      return analysis;
    } catch (error) {
      console.error('❌ JD Analysis failed:', error.message);
      return this.getFallbackJDAnalysis();
    }
  }

  /**
   * AI-Powered Candidate Analysis and Ranking
   */
  async analyzeAndRankCandidates(candidates, jdAnalysis) {
    console.log(`🤖 AI analyzing and ranking ${candidates.length} candidates...`);
    
    const analysisPromises = candidates.map(async (candidate, index) => {
      return await this.analyzeSingleCandidate(candidate, jdAnalysis, index + 1);
    });

    const analyses = await Promise.all(analysisPromises);
    
    // Let AI rank all candidates together
    const ranking = await this.getAIRanking(analyses, jdAnalysis);
    
    return ranking;
  }

  /**
   * Analyze individual candidate with detailed skill matching
   */
  async analyzeSingleCandidate(candidate, jdAnalysis, candidateNumber) {
    console.log(`🔍 Analyzing candidate ${candidateNumber}: ${candidate.fileName}`);
    
    const basicInfo = this.extractBasicInfo(candidate.cvText);
    
    const prompt = `You are an expert HR analyst. Analyze this candidate's CV against the job requirements and provide detailed skill matching.

JOB REQUIREMENTS:
- Required Skills: ${jdAnalysis.required_skills?.join(', ') || 'Not specified'}
- Preferred Skills: ${jdAnalysis.preferred_skills?.join(', ') || 'Not specified'}
- Experience Required: ${jdAnalysis.experience_required || 'Not specified'}
- Education Required: ${jdAnalysis.education_required || 'Not specified'}

CANDIDATE CV (First 1500 chars):
${candidate.cvText.slice(0, 1500)}

Provide a JSON response with:
{
  "matched_required_skills": ["skill1", "skill2"],
  "missing_required_skills": ["skill1", "skill2"],
  "matched_preferred_skills": ["skill1", "skill2"],
  "additional_skills": ["skill1", "skill2"],
  "experience_years": "X years or Not clear",
  "education_level": "degree found or Not specified",
  "key_strengths": ["strength1", "strength2"],
  "potential_concerns": ["concern1", "concern2"],
  "overall_fit_summary": "2-3 sentence summary of how well this candidate fits the role"
}

Be specific about technical skills and provide honest assessment.`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const analysis = JSON.parse(response.data.choices[0].message.content);
      
      return {
        ...candidate,
        basicInfo,
        aiAnalysis: analysis,
        candidateNumber
      };
    } catch (error) {
      console.error(`❌ Analysis failed for candidate ${candidateNumber}:`, error.message);
      return {
        ...candidate,
        basicInfo,
        aiAnalysis: this.getFallbackAnalysis(),
        candidateNumber
      };
    }
  }

  /**
   * Get AI-powered ranking of all candidates
   */
  async getAIRanking(candidateAnalyses, jdAnalysis) {
    console.log('🏆 Getting AI ranking of all candidates...');
    
    const candidateSummaries = candidateAnalyses.map((candidate, index) => {
      return `CANDIDATE ${index + 1} (${candidate.fileName}):
- Required Skills Match: ${candidate.aiAnalysis.matched_required_skills?.length || 0}/${jdAnalysis.required_skills?.length || 0}
- Missing Required: ${candidate.aiAnalysis.missing_required_skills?.join(', ') || 'None'}
- Experience: ${candidate.aiAnalysis.experience_years || 'Not clear'}
- Education: ${candidate.aiAnalysis.education_level || 'Not specified'}
- Key Strengths: ${candidate.aiAnalysis.key_strengths?.join(', ') || 'None listed'}
- Concerns: ${candidate.aiAnalysis.potential_concerns?.join(', ') || 'None'}
- Overall Fit: ${candidate.aiAnalysis.overall_fit_summary || 'No summary'}`;
    }).join('\n\n');

    const rankingPrompt = `You are an expert HR manager. Rank these ${candidateAnalyses.length} candidates from BEST to WORST for this position.

JOB REQUIREMENTS SUMMARY:
- Required Skills: ${jdAnalysis.required_skills?.join(', ') || 'Not specified'}
- Experience: ${jdAnalysis.experience_required || 'Not specified'}
- Education: ${jdAnalysis.education_required || 'Not specified'}

CANDIDATES TO RANK:
${candidateSummaries}

Provide a JSON response with:
{
  "ranking": [
    {
      "candidate_number": 1,
      "rank": 1,
      "ranking_reason": "Detailed reason why this candidate is ranked here",
      "recommendation": "Strong Hire/Hire/Maybe/Pass"
    }
  ],
  "overall_assessment": "Brief summary of the candidate pool quality"
}

Rank based on: 1) Required skills match, 2) Experience relevance, 3) Overall fit. Be decisive and provide clear reasoning.`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        messages: [{ role: 'user', content: rankingPrompt }],
        max_tokens: 800,
        temperature: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const rankingResult = JSON.parse(response.data.choices[0].message.content);
      
      // Combine ranking with detailed analysis
      const rankedCandidates = rankingResult.ranking.map(rank => {
        const candidate = candidateAnalyses[rank.candidate_number - 1];
        return {
          ...candidate,
          rank: rank.rank,
          ranking_reason: rank.ranking_reason,
          recommendation: rank.recommendation
        };
      });

      console.log('✅ AI Ranking complete');
      return {
        candidates: rankedCandidates,
        overall_assessment: rankingResult.overall_assessment,
        jd_analysis: jdAnalysis
      };
    } catch (error) {
      console.error('❌ AI Ranking failed:', error.message);
      // Fallback to simple ranking by required skills match
      return this.getFallbackRanking(candidateAnalyses, jdAnalysis);
    }
  }

  /**
   * Main analysis function - processes all candidates and returns AI ranking
   */
  async analyzeCVBatch(cvFiles, jdText) {
    try {
      console.log('🚀 Starting AI-powered CV analysis and ranking...');
      
      // Step 1: Analyze Job Description
      const jdAnalysis = await this.analyzeJobDescription(jdText);
      
      // Step 2: Prepare candidate data
      const candidates = cvFiles.map(file => ({
        fileName: file.fileName,
        cvText: file.text,
        fileId: file.fileId || Math.random().toString(36).substring(7)
      }));
      
      // Step 3: AI Analysis and Ranking
      const result = await this.analyzeAndRankCandidates(candidates, jdAnalysis);
      
      console.log('✅ AI analysis and ranking complete');
      return result;
    } catch (error) {
      console.error('❌ CV batch analysis failed:', error);
      throw error;
    }
  }

  // Fallback methods for when AI fails
  getFallbackJDAnalysis() {
    return {
      required_skills: ['Programming', 'Problem Solving'],
      preferred_skills: ['Communication', 'Teamwork'],
      experience_required: 'Not specified',
      education_required: 'Not specified',
      key_responsibilities: ['Development', 'Analysis'],
      job_title: 'Position'
    };
  }

  getFallbackAnalysis() {
    return {
      matched_required_skills: ['To be reviewed'],
      missing_required_skills: ['To be reviewed'],
      matched_preferred_skills: ['To be reviewed'],
      additional_skills: ['To be reviewed'],
      experience_years: 'To be reviewed',
      education_level: 'To be reviewed',
      key_strengths: ['Manual review needed'],
      potential_concerns: ['Manual review needed'],
      overall_fit_summary: 'Manual review required for detailed assessment'
    };
  }

  getFallbackRanking(candidateAnalyses, jdAnalysis) {
    const ranked = candidateAnalyses.map((candidate, index) => ({
      ...candidate,
      rank: index + 1,
      ranking_reason: 'Automatic ranking - manual review recommended',
      recommendation: 'Review Required'
    }));

    return {
      candidates: ranked,
      overall_assessment: 'AI ranking unavailable - manual review recommended',
      jd_analysis: jdAnalysis
    };
  }

  /**
   * Legacy method for compatibility with existing batch details endpoint
   */
  async rankCandidatesWithAI(candidates, jobDescription) {
    console.log('🔄 Legacy ranking method called - converting to new format...');
    
    try {
      // Convert candidates to new format
      const candidatesData = candidates.map(candidate => ({
        fileName: candidate.name || 'Unknown',
        cvText: candidate.cv_text || '',
        fileId: candidate.id
      }));

      // Use new AI ranking system
      const result = await this.analyzeAndRankCandidates(candidatesData, { 
        required_skills: ['General Skills'],
        job_title: 'Position'
      });

      // Convert back to legacy format
      return result.candidates.map((rankedCandidate, index) => ({
        ...candidates[index],
        ai_rank: rankedCandidate.rank,
        ai_reasoning: rankedCandidate.ranking_reason,
        ai_recommendation: rankedCandidate.recommendation
      })).sort((a, b) => a.ai_rank - b.ai_rank);
    } catch (error) {
      console.error('❌ Legacy ranking failed:', error.message);
      // Return original candidates sorted by score
      return candidates.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
  }
}

module.exports = AIRankingCVAnalysisService;
