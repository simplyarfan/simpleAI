import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { cvAPI } from '../../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
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
  LogOut
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
      const response = await cvAPI.getBatchDetails(id);
      
      if (response.success && response.data) {
        setBatch(response.data.batch);
        setCandidates(response.data.candidates || []);
      } else {
        toast.error('Failed to load batch details');
        router.push('/cv-intelligence');
      }
    } catch (error) {
      console.error('Error fetching batch details:', error);
      toast.error('Failed to load batch details');
      router.push('/cv-intelligence');
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white text-sm">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Batch Not Found</h2>
          <p className="text-gray-400 mb-6">The requested batch could not be found.</p>
          <button
            onClick={() => router.push('/cv-intelligence')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to CV Intelligence
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ left: '10%', top: '20%' }} />
        <div className="absolute w-64 h-64 bg-pink-500/3 rounded-full blur-2xl" style={{ right: '10%', bottom: '20%' }} />
      </div>

      <Head>
        <title>{batch.name} - CV Intelligence - SimpleAI</title>
        <meta name="description" content="CV batch analysis results and candidate details" />
      </Head>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-white/10 bg-black/95 backdrop-blur-sm"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => router.push('/cv-intelligence')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4 text-gray-400 hover:text-white" />
              </motion.button>
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {batch.name}
                  </h1>
                  <p className="text-sm text-gray-400">CV Analysis Results</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white group"
                title="Logout"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Batch Overview */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{batch.candidate_count || 0}</h3>
                <p className="text-gray-400 text-sm">Total Candidates</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{batch.processed_count || 0}</h3>
                <p className="text-gray-400 text-sm">Processed</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {candidates.length > 0 ? Math.round(candidates.reduce((acc, c) => acc + (c.overall_score || 0), 0) / candidates.length) : 0}%
                </h3>
                <p className="text-gray-400 text-sm">Avg Score</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {new Date(batch.created_at).toLocaleDateString()}
                </h3>
                <p className="text-gray-400 text-sm">Created</p>
              </div>
            </div>
          </motion.div>

          {/* Candidates List */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Candidate Rankings</h2>
                </div>
                <div className="text-sm text-gray-400">
                  {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No candidates processed yet</h3>
                <p className="text-gray-400">Candidates are still being analyzed</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    className="p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => openCandidateModal(candidate)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getScoreBg(candidate.overall_score || 0)}`}>
                            <span className={`font-bold ${getScoreColor(candidate.overall_score || 0)}`}>
                              {candidate.overall_score || 0}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {candidate.name || 'Unnamed Candidate'}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            {candidate.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{candidate.email}</span>
                              </div>
                            )}
                            {candidate.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-white font-medium">
                              {candidate.skills_count || 0} Skills
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-400 text-sm">
                              {candidate.experience_years || 0}+ Years
                            </span>
                          </div>
                        </div>
                        
                        <motion.button
                          className="p-2 text-purple-400 hover:text-purple-300 bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openCandidateModal(candidate);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {showCandidateModal && selectedCandidate && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCandidateModal(false)}
          >
            <motion.div 
              className="bg-black/90 border border-white/20 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${getScoreBg(selectedCandidate.overall_score || 0)}`}>
                    <span className={`text-2xl font-bold ${getScoreColor(selectedCandidate.overall_score || 0)}`}>
                      {selectedCandidate.overall_score || 0}%
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedCandidate.name || 'Unnamed Candidate'}
                    </h2>
                    <p className="text-gray-400">Candidate Analysis Report</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCandidateModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-400" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{selectedCandidate.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{selectedCandidate.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{selectedCandidate.location || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-400" />
                    Skills ({selectedCandidate.skills_count || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills ? (
                      selectedCandidate.skills.split(',').map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                        >
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No skills extracted</span>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-green-400" />
                    Experience
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedCandidate.experience || 'Experience details not available'}
                  </p>
                </div>

                {/* Education */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-indigo-400" />
                    Education
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedCandidate.education || 'Education details not available'}
                  </p>
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  AI Analysis Summary
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedCandidate.analysis_summary || 'Analysis summary not available'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BatchDetail;
