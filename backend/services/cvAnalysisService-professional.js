/**
 * PROFESSIONAL CV ANALYSIS SERVICE
 * Advanced AI-powered CV analysis with proper data extraction
 */

const axios = require('axios');

class ProfessionalCVAnalysisService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo';
    
    // Try to load cache service, but don't fail if it's not available
    try {
      const cacheService = require('./cacheService');
      this.cache = cacheService;
    } catch (error) {
      console.log('Cache service not available, using in-memory fallback');
      this.cache = {
        get: async () => null,
        set: async () => true
      };
    }
  }

  /**
   * Analyze Job Description to extract requirements
   */
  async analyzeJobDescription(jdText) {
    console.log('Analyzing Job Description with AI...');
    
    const cacheKey = `jd_analysis_${Buffer.from(jdText).toString('base64').slice(0, 32)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      console.log('Using cached JD analysis');
      return cached;
    }

    const prompt = `Analyze this job description and extract key requirements:

JOB DESCRIPTION:
${jdText.slice(0, 2000)}

Provide a JSON response with:
{
  "job_title": "extracted job title",
  "required_skills": ["skill1", "skill2", "skill3"],
  "preferred_skills": ["skill1", "skill2"],
  "experience_required": "X years",
  "education_required": "degree level",
  "key_responsibilities": ["responsibility1", "responsibility2"],
  "industry": "industry sector",
  "location": "job location if mentioned"
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
      await this.cache.set(cacheKey, analysis, 3600);
      
      console.log('JD Analysis complete:', analysis);
      return analysis;
    } catch (error) {
      console.error('JD Analysis failed:', error.message);
      return this.getFallbackJDAnalysis();
    }
  }

  /**
   * Analyze individual candidate with comprehensive data extraction
   */
  async analyzeSingleCandidate(candidate, jdAnalysis, candidateNumber) {
    console.log(`Analyzing candidate ${candidateNumber}: ${candidate.fileName}`);
    
    const prompt = `You are an expert HR analyst. Analyze this candidate's CV and extract comprehensive information.

JOB REQUIREMENTS:
- Required Skills: ${jdAnalysis.required_skills?.join(', ') || 'Not specified'}
- Preferred Skills: ${jdAnalysis.preferred_skills?.join(', ') || 'Not specified'}
- Experience Required: ${jdAnalysis.experience_required || 'Not specified'}
- Education Required: ${jdAnalysis.education_required || 'Not specified'}

CANDIDATE CV TEXT:
${candidate.cvText.slice(0, 4000)}

Extract and provide a JSON response with:
{
  "personal_info": {
    "name": "Properly formatted name (Title Case, not ALL CAPS)",
    "email": "extracted email address",
    "phone": "extracted phone number",
    "location": "city/country if mentioned"
  },
  "skills": {
    "all_skills": ["comprehensive list of all technical skills found"],
    "matched_required": ["skills that match JD required skills"],
    "matched_preferred": ["skills that match JD preferred skills"],
    "missing_required": ["required skills not found in CV"],
    "additional_valuable": ["other valuable skills not in JD"]
  },
  "experience": {
    "total_years": "number only (e.g., 5)",
    "current_role": "current job title",
    "current_company": "current company name",
    "summary": "brief professional experience overview",
    "key_achievements": ["notable achievement 1", "notable achievement 2"]
  },
  "education": {
    "highest_degree": "degree name (e.g., Bachelor of Computer Science)",
    "university": "university/institution name",
    "graduation_year": "year if mentioned",
    "additional_certifications": ["cert1", "cert2"]
  },
  "analysis": {
    "overall_fit": "percentage match (0-100)",
    "strengths": ["key strength 1", "key strength 2"],
    "professional_summary": "2-3 sentence assessment",
    "recommendation": "Strong Hire|Hire|Consider|Pass"
  }
}

Be precise, extract actual data from the CV, and format names properly (not ALL CAPS).`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
        temperature: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const analysis = JSON.parse(response.data.choices[0].message.content);
      console.log(`Candidate ${candidateNumber} analysis complete`);
      return {
        ...candidate,
        ai_analysis: analysis,
        candidateNumber
      };
    } catch (error) {
      console.error(`Candidate ${candidateNumber} analysis failed:`, error.message);
      return {
        ...candidate,
        ai_analysis: this.getFallbackCandidateAnalysis(candidate),
        candidateNumber
      };
    }
  }

  /**
   * Rank all candidates using AI
   */
  async rankCandidates(candidateAnalyses, jdAnalysis) {
    console.log(`Ranking ${candidateAnalyses.length} candidates with AI...`);

    const candidateSummaries = candidateAnalyses.map((candidate, index) => ({
      id: index + 1,
      name: candidate.ai_analysis?.personal_info?.name || `Candidate ${index + 1}`,
      skills_match: candidate.ai_analysis?.skills?.matched_required?.length || 0,
      experience: candidate.ai_analysis?.experience?.total_years || 0,
      overall_fit: candidate.ai_analysis?.analysis?.overall_fit || 0,
      summary: candidate.ai_analysis?.analysis?.professional_summary || 'No summary'
    }));

    const prompt = `You are an expert HR manager. Rank these candidates from BEST to WORST for the job.

JOB REQUIREMENTS:
- Required Skills: ${jdAnalysis.required_skills?.join(', ') || 'Not specified'}
- Experience: ${jdAnalysis.experience_required || 'Not specified'}

CANDIDATES:
${candidateSummaries.map(c => `${c.id}. ${c.name} - ${c.skills_match} matched skills, ${c.experience} years experience, ${c.overall_fit}% fit`).join('\n')}

Provide ranking as JSON array:
[
  {
    "candidate_id": 1,
    "rank": 1,
    "ranking_reason": "Clear explanation why this candidate is ranked here"
  }
]

Rank from 1 (best) to ${candidateAnalyses.length} (worst).`;

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

      const ranking = JSON.parse(response.data.choices[0].message.content);
      
      // Apply ranking to candidates
      const rankedCandidates = candidateAnalyses.map(candidate => {
        const rankInfo = ranking.find(r => r.candidate_id === candidate.candidateNumber);
        return {
          ...candidate,
          ai_rank: rankInfo?.rank || 999,
          ranking_reason: rankInfo?.ranking_reason || 'Ranking analysis pending'
        };
      }).sort((a, b) => a.ai_rank - b.ai_rank);

      console.log('AI ranking complete');
      return rankedCandidates;
    } catch (error) {
      console.error('AI ranking failed:', error.message);
      return candidateAnalyses.sort((a, b) => 
        (b.ai_analysis?.analysis?.overall_fit || 0) - (a.ai_analysis?.analysis?.overall_fit || 0)
      );
    }
  }

  /**
   * Main analysis and ranking function
   */
  async analyzeAndRankCandidates(candidates, jdAnalysis) {
    console.log(`Starting comprehensive analysis of ${candidates.length} candidates...`);
    
    // Analyze each candidate
    const analysisPromises = candidates.map(async (candidate, index) => {
      return await this.analyzeSingleCandidate(candidate, jdAnalysis, index + 1);
    });

    const candidateAnalyses = await Promise.all(analysisPromises);
    
    // Rank candidates
    const rankedCandidates = await this.rankCandidates(candidateAnalyses, jdAnalysis);
    
    return {
      candidates: rankedCandidates,
      jd_analysis: jdAnalysis,
      total_analyzed: candidates.length
    };
  }

  /**
   * Legacy compatibility method
   */
  async rankCandidatesWithAI(candidates, jobDescription) {
    console.log('Legacy ranking method called - using new professional analysis...');
    
    try {
      const jdAnalysis = await this.analyzeJobDescription(jobDescription);
      
      const candidatesData = candidates.map(candidate => ({
        fileName: candidate.name || 'Unknown',
        cvText: candidate.cv_text || '',
        fileId: candidate.id
      }));

      const result = await this.analyzeAndRankCandidates(candidatesData, jdAnalysis);

      return result.candidates.map((rankedCandidate, index) => ({
        ...candidates[index],
        ai_rank: rankedCandidate.ai_rank,
        ai_analysis: rankedCandidate.ai_analysis,
        ranking_reason: rankedCandidate.ranking_reason
      }));
    } catch (error) {
      console.error('Professional analysis failed:', error.message);
      return candidates.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
  }

  getFallbackJDAnalysis() {
    return {
      job_title: 'Position',
      required_skills: ['General Skills'],
      preferred_skills: [],
      experience_required: 'Not specified',
      education_required: 'Not specified',
      key_responsibilities: ['Various responsibilities'],
      industry: 'Technology',
      location: 'Not specified'
    };
  }

  getFallbackCandidateAnalysis(candidate) {
    return {
      personal_info: {
        name: candidate.fileName || 'Name not found',
        email: 'Email not found',
        phone: 'Phone not found',
        location: 'Location not specified'
      },
      skills: {
        all_skills: [],
        matched_required: [],
        matched_preferred: [],
        missing_required: [],
        additional_valuable: []
      },
      experience: {
        total_years: '0',
        current_role: 'Not specified',
        current_company: 'Not specified',
        summary: 'Experience details not available',
        key_achievements: []
      },
      education: {
        highest_degree: 'Not specified',
        university: 'Not specified',
        graduation_year: 'Not specified',
        additional_certifications: []
      },
      analysis: {
        overall_fit: 0,
        strengths: [],
        professional_summary: 'Analysis not available',
        recommendation: 'Review Required'
      }
    };
  }
}

module.exports = ProfessionalCVAnalysisService;
