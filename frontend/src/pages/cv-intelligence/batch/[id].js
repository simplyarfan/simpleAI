import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/shared/Header';
import { cvIntelligenceAPI } from '../../../utils/cvIntelligenceAPI';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Users,
  Star,
  Award,
  Target,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Brain,
  Eye,
  Download
} from 'lucide-react';

const BatchDetail = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [batch, setBatch] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBatchDetails();
    }
  }, [id]);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      const response = await cvIntelligenceAPI.getCandidates(id);
      setBatch(response.data.data.batch);
      setCandidates(response.data.data.candidates || []);
    } catch (error) {
      console.error('Error fetching batch details:', error);
      toast.error('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-400 bg-green-500/20';
    if (score >= 70) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getFitLevelColor = (fitLevel) => {
    switch (fitLevel?.toLowerCase()) {
      case 'high':
        return 'text-green-400 bg-green-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'low':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'highly recommended':
        return <Star className="w-4 h-4 text-green-400" />;
      case 'recommended':
        return <CheckCircle className="w-4 h-4 text-yellow-400" />;
      case 'consider':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const viewCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white">Loading batch details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Batch Not Found</h3>
            <p className="text-gray-300 mb-6">The batch you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => router.push('/cv-intelligence')}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Back to CV Intelligence
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <Head>
        <title>{batch.name} - CV Intelligence | simpleAI</title>
        <meta name="description" content={`CV analysis results for ${batch.name}`} />
      </Head>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/cv-intelligence')}
            className="flex items-center text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CV Intelligence
          </button>
        </div>

        {/* Batch Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{batch.name}</h1>
                  <p className="text-gray-300">Created on {new Date(batch.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{candidates.length}</div>
                <div className="text-xs text-gray-400">Candidates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {candidates.filter(c => c.recommendation === 'Highly Recommended').length}
                </div>
                <div className="text-xs text-gray-400">Top Picks</div>
              </div>
            </div>
          </div>

          {/* Job Description Summary */}
          {batch.jd_analysis && (
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Job Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Position</h4>
                  <p className="text-white">{batch.jd_analysis.position_title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Experience Required</h4>
                  <p className="text-white">{batch.jd_analysis.experience_required}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {batch.jd_analysis.required_skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Candidates List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Ranked Candidates</h2>
            <div className="text-sm text-gray-400">
              Sorted by match score (highest first)
            </div>
          </div>

          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No candidates found</h3>
              <p className="text-gray-300">This batch doesn't have any processed candidates yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-orange-400">#{index + 1}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{candidate.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              {candidate.email !== 'Email not found' && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {candidate.email}
                                </div>
                              )}
                              {candidate.phone !== 'Phone not found' && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {candidate.phone}
                                </div>
                              )}
                              {candidate.location !== 'Location not found' && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {candidate.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(candidate.score)}`}>
                            {candidate.score}%
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Match Score</div>
                        </div>
                        <div className="text-center">
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getFitLevelColor(candidate.fit_level)}`}>
                            {candidate.fit_level}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Fit Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-400 text-lg font-semibold">
                            {candidate.skills_matched}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Skills Matched</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-400 text-lg font-semibold">
                            {candidate.skills_missing}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Skills Missing</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getRecommendationIcon(candidate.recommendation)}
                          <span className="text-sm font-medium text-white">
                            {candidate.recommendation}
                          </span>
                        </div>
                        <button
                          onClick={() => viewCandidateDetails(candidate)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Candidate Detail Modal */}
      {showCandidateModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {selectedCandidate.name} - Detailed Analysis
              </h3>
              <button
                onClick={() => setShowCandidateModal(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personal Information
                </h4>
                <div className="space-y-3">
                  {selectedCandidate.analysis_data?.personal && Object.entries(selectedCandidate.analysis_data.personal).map(([key, value]) => (
                    value && value !== 'Not specified' && (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-white">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Match Analysis */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Match Analysis
                </h4>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(selectedCandidate.score)}`}>
                      {selectedCandidate.score}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Overall Match Score</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-semibold text-green-400">{selectedCandidate.skills_matched}</div>
                      <div className="text-xs text-gray-400">Skills Matched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-red-400">{selectedCandidate.skills_missing}</div>
                      <div className="text-xs text-gray-400">Skills Missing</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${getFitLevelColor(selectedCandidate.fit_level)}`}>
                      {getRecommendationIcon(selectedCandidate.recommendation)}
                      <span className="font-medium">{selectedCandidate.recommendation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Skills
                </h4>
                <div className="space-y-3">
                  {selectedCandidate.analysis_data?.match_analysis?.skills_matched?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-green-400 mb-2">Matched Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.analysis_data.match_analysis.skills_matched.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedCandidate.analysis_data?.match_analysis?.skills_missing?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-red-400 mb-2">Missing Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.analysis_data.match_analysis.skills_missing.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experience
                </h4>
                <div className="space-y-3">
                  {selectedCandidate.analysis_data?.experience?.map((exp, index) => (
                    <div key={index} className="border-l-2 border-orange-500 pl-4">
                      <h5 className="font-medium text-white">{exp.position}</h5>
                      <p className="text-sm text-gray-400">{exp.company} • {exp.duration}</p>
                      {exp.description && (
                        <p className="text-sm text-gray-300 mt-1">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 lg:col-span-2">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCandidate.analysis_data?.education?.map((edu, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-4">
                      <h5 className="font-medium text-white">{edu.degree}</h5>
                      <p className="text-sm text-gray-400">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Concerns */}
              {selectedCandidate.analysis_data?.match_analysis && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 lg:col-span-2">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Analysis Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedCandidate.analysis_data.match_analysis.strengths?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-green-400 mb-3">Strengths</h5>
                        <ul className="space-y-2">
                          {selectedCandidate.analysis_data.match_analysis.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedCandidate.analysis_data.match_analysis.concerns?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-orange-400 mb-3">Areas of Concern</h5>
                        <ul className="space-y-2">
                          {selectedCandidate.analysis_data.match_analysis.concerns.map((concern, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetail;
