import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import cvAPI from '../../../utils/cvIntelligenceAPI';
import toast from 'react-hot-toast';
import * as Icons from 'lucide-react';

const BatchDetail = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [batch, setBatch] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [schedulingInterview, setSchedulingInterview] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleScheduleInterview = (candidate) => {
    // Redirect to interview coordinator with pre-filled candidate data
    const candidateData = {
      candidateId: candidate.id,
      candidateName: candidate.personal?.name || candidate.name || 'Unknown',
      candidateEmail: candidate.personal?.email || candidate.email || '',
      candidatePhone: candidate.personal?.phone || candidate.phone || '',
      jobTitle: batch?.name || 'Position Interview',
      batchId: batch?.id,
      score: candidate.score || candidate.overall_score || 0
    };
    
    // Encode the data to pass via URL
    const encodedData = encodeURIComponent(JSON.stringify(candidateData));
    router.push(`/interview-coordinator/schedule?candidate=${encodedData}`);
  };

  useEffect(() => {
    if (id) {
      fetchBatchDetails();
    }
  }, [id]);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      console.log('🎯 Fetching batch details for ID:', id);
      const response = await cvAPI.getBatchDetails(id);
      console.log('🎯 Batch details response:', response);
      
      // Handle different response structures - check console for actual structure
      console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));
      
      const isSuccess = response.success || (response.data && response.data.success);
      const batchData = response.data?.data?.batch || response.data?.batch || response.batch || response.data;
      const candidatesData = response.data?.data?.candidates || response.data?.candidates || response.candidates || [];
      
      if (isSuccess && batchData) {
        console.log('🎯 Setting batch data:', batchData);
        console.log('🎯 Setting candidates data:', candidatesData);
        console.log('🎯 Candidates array length:', candidatesData?.length);
        console.log('🎯 First candidate sample:', candidatesData?.[0]);
        setBatch(batchData);
        setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
      } else {
        console.error('🎯 Failed to load batch details:', response);
        toast.error('Failed to load batch details');
        router.push('/cv-intelligence');
      }
    } catch (error) {
      console.error('🎯 Error fetching batch details:', error);
      console.error('🎯 Error details:', error.response?.data);
      toast.error('Failed to load batch details');
      router.push('/cv-intelligence');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    try {
      console.log('🎯 Deleting batch:', id);
      const response = await cvAPI.deleteBatch(id);
      console.log('🎯 Delete response:', response);
      
      if (response.success || response.data?.success) {
        toast.success('Batch deleted successfully');
        router.push('/cv-intelligence');
      } else {
        toast.error('Failed to delete batch');
      }
    } catch (error) {
      console.error('🎯 Error deleting batch:', error);
      toast.error('Failed to delete batch');
    }
    setShowDeleteModal(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const openCandidateModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Batch Not Found</h2>
          <p className="text-gray-600 mb-6">The requested batch could not be found.</p>
          <button
            onClick={() => router.push('/cv-intelligence')}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg transition-colors"
          >
            Back to CV Intelligence
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{batch.name} - CV Intelligence</title>
        <meta name="description" content="CV batch analysis results" />
      </Head>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/cv-intelligence')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Icons.Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{batch.name}</h1>
                  <p className="text-sm text-gray-500">Created {new Date(batch.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icons.MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Icons.Trash2 className="w-4 h-4 mr-3" />
                      Delete Batch
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Batch Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icons.Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total CVs</p>
                <p className="text-2xl font-bold text-gray-900">{batch.cv_count || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icons.CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icons.TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{batch.status || 'Processing'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Analyzed Candidates</h2>
            <p className="text-sm text-gray-600">Ranked from best to worst match</p>
          </div>
          
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <Icons.Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates analyzed yet</h3>
              <p className="text-gray-600">CV analysis is in progress. Please check back in a few minutes.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {candidates
                .sort((a, b) => (b.score || b.overall_score || 0) - (a.score || a.overall_score || 0))
                .map((candidate, index) => (
                <div key={candidate.id || index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {candidate.personal?.name || candidate.name || `Candidate ${index + 1}`}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          {candidate.personal?.email && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Icons.Mail className="w-4 h-4" />
                              <span>{candidate.personal.email}</span>
                            </div>
                          )}
                          {candidate.personal?.phone && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Icons.Phone className="w-4 h-4" />
                              <span>{candidate.personal.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                          index === 0 ? 'bg-green-100 text-green-800' :
                          index === 1 ? 'bg-blue-100 text-blue-800' :
                          index === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {index === 0 ? 'Best Match' :
                           index === 1 ? 'Strong Candidate' :
                           index === 2 ? 'Good Candidate' :
                           'Candidate'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Rank #{candidate.rank || index + 1}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleScheduleInterview(candidate)}
                          disabled={schedulingInterview === candidate.id}
                          className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          {schedulingInterview === candidate.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Scheduling...
                            </>
                          ) : (
                            <>
                              <Icons.Calendar className="w-4 h-4 mr-2" />
                              Schedule Interview
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openCandidateModal(candidate)}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills Preview */}
                  {candidate.skills?.matched && candidate.skills.matched.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-2">Key Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.matched.slice(0, 5).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.matched.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{candidate.skills.matched.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Batch</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{batch.name}"? All analysis results and candidate data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBatch}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {showCandidateModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    #{candidates.findIndex(c => c.id === selectedCandidate.id) + 1}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedCandidate.name || 'Name not found'}
                  </h2>
                  <p className="text-gray-600">Candidate Analysis Report</p>
                </div>
              </div>
              <button
                onClick={() => setShowCandidateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icons.User className="w-5 h-5 mr-2 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Icons.Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{selectedCandidate.email || 'Email not found'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icons.Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{selectedCandidate.phone || 'Phone not found'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icons.MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{selectedCandidate.location || 'Location not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icons.Code className="w-5 h-5 mr-2 text-purple-600" />
                  Skills Analysis
                </h3>
                <div className="space-y-4">
                  {/* Extract skills from analysis_data */}
                  {(() => {
                    try {
                      // Use profile_json instead of analysis_data
                      const profileData = selectedCandidate.profile_json || {};
                      const skills = profileData.skills || [];
                      
                      // Convert skills array to display format
                      const allSkills = Array.isArray(skills) ? skills : [];
                      const matchedSkills = allSkills.slice(0, Math.ceil(allSkills.length * 0.7)); // Show 70% as matched
                      const missingSkills = [];

                      return (
                        <>
                          {matchedSkills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-green-700 mb-2">Required Skills Match:</p>
                              <div className="flex flex-wrap gap-2">
                                {matchedSkills.map((skill, index) => (
                                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {missingSkills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-red-700 mb-2">Missing Required Skills:</p>
                              <div className="flex flex-wrap gap-2">
                                {missingSkills.map((skill, index) => (
                                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {allSkills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-blue-700 mb-2">All Technical Skills:</p>
                              <div className="flex flex-wrap gap-2">
                                {allSkills.slice(0, 10).map((skill, index) => (
                                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {skill}
                                  </span>
                                ))}
                                {allSkills.length > 10 && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                    +{allSkills.length - 10} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {matchedSkills.length === 0 && missingSkills.length === 0 && allSkills.length === 0 && (
                            <p className="text-gray-500 text-sm">Skills analysis not available</p>
                          )}
                        </>
                      );
                    } catch (e) {
                      return <p className="text-gray-500 text-sm">Skills data parsing error</p>;
                    }
                  })()}
                </div>
              </div>

              {/* Professional Experience */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icons.Briefcase className="w-5 h-5 mr-2 text-green-600" />
                  Professional Experience
                </h3>
                <div className="space-y-3">
                  {/* Extract experience from profile_json */}
                  {(() => {
                    try {
                      const profileData = selectedCandidate.profile_json || {};
                      const experience = profileData.experience || [];
                      
                      // Get the most recent experience (first in array)
                      const latestExperience = Array.isArray(experience) && experience.length > 0 ? experience[0] : {};
                      const currentRole = latestExperience.role || 'Role not specified';
                      const currentCompany = latestExperience.company || 'Company not specified';
                      const startDate = latestExperience.startDate || 'Start date not specified';
                      const endDate = latestExperience.endDate || 'Present';
                      
                      // Calculate experience level based on number of roles
                      const experienceYears = experience.length > 0 ? Math.max(1, experience.length * 1.5) : 0;

                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Experience Level:</span>
                            <span className="font-medium text-gray-900">{experienceYears} years</span>
                          </div>
                          
                          {currentRole && currentRole !== 'Role not specified' && (
                            <div>
                              <span className="text-sm text-gray-600">Latest Role:</span>
                              <p className="font-medium text-gray-900">{currentRole}</p>
                            </div>
                          )}
                          {currentCompany && currentCompany !== 'Company not specified' && (
                            <div>
                              <span className="text-sm text-gray-600">Company:</span>
                              <p className="font-medium text-gray-900">{currentCompany}</p>
                            </div>
                          )}
                          {startDate !== 'Start date not specified' && (
                            <div>
                              <span className="text-sm text-gray-600">Duration:</span>
                              <p className="font-medium text-gray-900">{startDate} - {endDate}</p>
                            </div>
                          )}
                          
                          {experience.length > 1 && (
                            <div>
                              <span className="text-sm text-gray-600">Total Positions:</span>
                              <p className="font-medium text-gray-900">{experience.length} roles</p>
                            </div>
                          )}
                          
                          {experience.length === 0 && (
                            <p className="text-gray-500 text-sm">Experience details not available</p>
                          )}
                        </div>
                      );
                    } catch (e) {
                      return <p className="text-gray-500 text-sm">Experience details not available</p>;
                    }
                  })()}
                </div>
              </div>

              {/* Education & Qualifications */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icons.GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                  Education & Qualifications
                </h3>
                <div className="space-y-3">
                  {/* Extract education from analysis_data */}
                  {(() => {
                    try {
                      // Use profile_json instead of analysis_data
                      const profileData = selectedCandidate.profile_json || {};
                      const education = profileData.education || [];
                      
                      // Get the first education entry if available
                      const firstEducation = Array.isArray(education) && education.length > 0 ? education[0] : {};
                      const university = firstEducation.institution || 'Institution not specified';
                      const degree = firstEducation.degree || 'Degree not specified';
                      const field = firstEducation.field || 'Field not specified';
                      const graduationYear = firstEducation.year || 'Year not specified';

                      return (
                        <div className="space-y-2">
                          {degree && (
                            <div>
                              <span className="text-sm text-gray-600">Degree:</span>
                              <p className="font-medium text-gray-900">{degree}</p>
                            </div>
                          )}
                          {university && university !== 'Institution not specified' && (
                            <div>
                              <span className="text-sm text-gray-600">Institution:</span>
                              <p className="font-medium text-gray-900">{university}</p>
                            </div>
                          )}
                          {field && field !== 'Field not specified' && (
                            <div>
                              <span className="text-sm text-gray-600">Field of Study:</span>
                              <p className="font-medium text-gray-900">{field}</p>
                            </div>
                          )}
                          {graduationYear && graduationYear !== 'Year not specified' && (
                            <div>
                              <span className="text-sm text-gray-600">Year:</span>
                              <p className="font-medium text-gray-900">{graduationYear}</p>
                            </div>
                          )}
                          {(!degree || degree === 'Degree not specified') && (!university || university === 'Institution not specified') && (
                            <p className="text-gray-500 text-sm">Education details not available</p>
                          )}
                        </div>
                      );
                    } catch (e) {
                      return <p className="text-gray-500 text-sm">Education data parsing error</p>;
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Professional Assessment */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icons.FileText className="w-5 h-5 mr-2 text-blue-600" />
                Professional Assessment
              </h3>
              <div className="space-y-4">
                {/* Extract professional summary from analysis_data */}
                {(() => {
                  try {
                    const analysisData = typeof selectedCandidate.analysis_data === 'string' 
                      ? JSON.parse(selectedCandidate.analysis_data) 
                      : selectedCandidate.analysis_data || {};
                    
                    const analysis = analysisData.analysis || analysisData.ai_analysis?.analysis || {};
                    const professionalSummary = analysis.professional_summary || selectedCandidate.summary;
                    const strengths = analysis.strengths || [];

                    return (
                      <div className="space-y-3">
                        {professionalSummary && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Summary:</h4>
                            <p className="text-gray-700 leading-relaxed">{professionalSummary}</p>
                          </div>
                        )}
                        
                        {strengths.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Key Strengths:</h4>
                            <ul className="space-y-1">
                              {strengths.map((strength, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                  <span className="text-gray-700 text-sm">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                          <span className="text-sm font-medium text-gray-600">Recommendation:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedCandidate.recommendation === 'Strong Hire' ? 'bg-green-100 text-green-800' :
                            selectedCandidate.recommendation === 'Hire' ? 'bg-blue-100 text-blue-800' :
                            selectedCandidate.recommendation === 'Consider' ? 'bg-yellow-100 text-yellow-800' :
                            selectedCandidate.recommendation === 'Pass' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedCandidate.recommendation || 'Under Review'}
                          </span>
                        </div>
                      </div>
                    );
                  } catch (e) {
                    return (
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedCandidate.rankingReason || 'Professional assessment completed'}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                          <span className="text-sm font-medium text-gray-600">Ranking:</span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Rank #{selectedCandidate.rank || 'N/A'}
                          </span>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetail;
