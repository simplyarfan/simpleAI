import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { cvAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Users,
  Eye,
  Plus,
  ArrowLeft,
  LogOut,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Sparkles,
  Zap,
  Star,
  X
} from 'lucide-react';

const CleanCVIntelligence = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({ cvFiles: [], jdFile: null });
  const [batchName, setBatchName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      console.log('🧠 Fetching CV batches...');
      
      const response = await cvAPI.getBatches();
      console.log('📋 CV Batches API response:', response);
      
      if (response && response.data) {
        // Handle different response structures
        const batchData = response.data.data || response.data.batches || response.data || [];
        console.log('🧠 Setting batches:', batchData);
        setBatches(Array.isArray(batchData) ? batchData : []);
      } else {
        console.log('⚠️ No batch data in response, setting empty array');
        setBatches([]);
      }
    } catch (error) {
      console.error('❌ Error fetching batches:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setBatches([]);
      toast.error(`Failed to load CV batches: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!batchName.trim()) {
      toast.error('Please enter a batch name');
      return;
    }

    setUploading(true);
    
    try {
      console.log('🎯 Creating batch with name:', batchName);
      
      // Simple batch creation - just create the batch for now
      const createResponse = await cvAPI.createBatch({ name: batchName });
      console.log('✅ Batch creation response:', createResponse);
      
      if (createResponse.data && createResponse.data.success) {
        toast.success('Batch created successfully!');
        setShowUploadModal(false);
        setBatchName('');
        setSelectedFiles({ cvFiles: [], jdFile: null });
        fetchBatches();
      } else {
        throw new Error(createResponse.data?.message || 'Failed to create batch');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error(`Failed to create batch: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCVFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => ({ ...prev, cvFiles: files }));
  };

  const handleJDFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFiles(prev => ({ ...prev, jdFile: file }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-sm">Loading CV Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Head>
        <title>CV Intelligence - SimpleAI</title>
        <meta name="description" content="AI-powered CV analysis and candidate ranking" />
      </Head>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ left: '10%', top: '20%' }} />
        <div className="absolute w-64 h-64 bg-pink-500/3 rounded-full blur-2xl" style={{ right: '10%', bottom: '20%' }} />
      </div>

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
                onClick={() => router.push('/')}
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
                    CV Intelligence
                  </h1>
                  <p className="text-sm text-gray-400">AI-powered resume analysis and candidate ranking</p>
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
        <div className="max-w-6xl mx-auto">
          {batches.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">No CV batches yet</h3>
              <p className="text-gray-400 mb-8 text-lg">Upload your first batch of CVs to get started with AI analysis</p>
              <motion.button
                onClick={() => setShowUploadModal(true)}
                className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl transition-all duration-300 inline-flex items-center"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5 mr-2 text-purple-400" />
                Create New Batch
              </motion.button>
            </motion.div>
          ) : (
            <div>
              <motion.div 
                className="flex justify-between items-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">CV Analysis Batches</h2>
                  <p className="text-gray-400">Manage and analyze your CV batches with AI intelligence</p>
                </div>
                <motion.button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4 mr-2 text-purple-400" />
                  Create New Batch
                </motion.button>
              </motion.div>

              <div className="grid gap-6">
                {batches.map((batch, index) => (
                  <motion.div
                    key={batch.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
                          <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{batch.name}</h3>
                          <p className="text-gray-400">
                            Created {new Date(batch.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <motion.button
                          onClick={() => router.push(`/cv-intelligence/batch/${batch.id}`)}
                          className="p-3 text-purple-400 hover:text-purple-300 bg-white/10 border border-white/20 hover:bg-white/20 rounded-xl transition-all duration-300"
                          title="View Details"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-300">Candidates</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{batch.candidate_count || 0}</p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-300">Processed</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{batch.processed_count || 0}</p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-yellow-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-300">Status</span>
                        </div>
                        <p className="text-lg font-bold text-white capitalize">{batch.status || 'pending'}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-black/90 border border-white/20 rounded-2xl p-8 w-full max-w-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Create New Batch</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter batch name..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CV Files (PDF only) - Optional for now
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleCVFilesChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                />
                {selectedFiles.cvFiles.length > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    {selectedFiles.cvFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Description (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleJDFileChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Create Batch
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CleanCVIntelligence;
