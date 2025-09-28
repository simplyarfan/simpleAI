import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { cvAPI } from '../../../utils/api';
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
  Download,
  Sparkles,
  X,
  LogOut,
  Trash2,
  MoreVertical,
  FileText
} from 'lucide-react';

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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
      
      // Handle different response structures
      const isSuccess = response.success || (response.data && response.data.success);
      const batchData = response.data?.batch || response.batch || response.data;
      const candidatesData = response.data?.candidates || response.candidates || [];
      
      if (isSuccess && batchData) {
        console.log('🎯 Setting batch data:', batchData);
        console.log('🎯 Setting candidates data:', candidatesData);
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
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
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
                  <MoreVertical className="w-5 h-5 text-gray-600" />
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
                      <Trash2 className="w-4 h-4 mr-3" />
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
                <Users className="w-5 h-5 text-blue-600" />
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
                <CheckCircle className="w-5 h-5 text-green-600" />
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
                <TrendingUp className="w-5 h-5 text-orange-600" />
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
            <p className="text-sm text-gray-600">Ranked by AI analysis score</p>
          </div>
          
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates analyzed yet</h3>
              <p className="text-gray-600">CV analysis is in progress. Please check back in a few minutes.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {candidates
                .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
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
                              <Mail className="w-4 h-4" />
                              <span>{candidate.personal.email}</span>
                            </div>
                          )}
                          {candidate.personal?.phone && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{candidate.personal.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {candidate.overall_score || candidate.score || 0}
                          <span className="text-sm text-gray-500 font-normal">/10</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {candidate.recommendation || 'Under Review'}
                        </div>
                      </div>
                      <button
                        onClick={() => openCandidateModal(candidate)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
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
                    {selectedCandidate.overall_score || selectedCandidate.score || 0}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedCandidate.personal?.name || selectedCandidate.name || 'Unnamed Candidate'}
                  </h2>
                  <p className="text-gray-600">Candidate Analysis Report</p>
                </div>
              </div>
              <button
                onClick={() => setShowCandidateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{selectedCandidate.personal?.email || selectedCandidate.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{selectedCandidate.personal?.phone || selectedCandidate.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{selectedCandidate.personal?.location || selectedCandidate.location || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills?.matched && selectedCandidate.skills.matched.length > 0 ? (
                    selectedCandidate.skills.matched.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No skills extracted</span>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                  Experience
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {selectedCandidate.experience || selectedCandidate.work_experience || 'Experience details not available'}
                </p>
              </div>

              {/* Education */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                  Education
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {selectedCandidate.education || 'Education details not available'}
                </p>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI Analysis Summary
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {selectedCandidate.analysis_summary || selectedCandidate.recommendation || 'Analysis summary not available'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetail;
