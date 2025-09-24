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
  Star
} from 'lucide-react';

const CleanCVIntelligence = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({ cvFiles: [], jdFile: null });
  const [batchName, setBatchName] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

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
      const response = await cvAPI.getBatches();
      if (response.success) {
        setBatches(response.data || []);
      } else {
        toast.error('Failed to fetch batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Error loading CV batches');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event, type) => {
    const files = Array.from(event.target.files);
    if (type === 'cv') {
      setSelectedFiles(prev => ({ ...prev, cvFiles: files }));
    } else {
      setSelectedFiles(prev => ({ ...prev, jdFile: files[0] }));
    }
  };

  const handleCreateBatch = async () => {
    if (!batchName.trim()) {
      toast.error('Please enter a batch name');
      return;
    }
    if (selectedFiles.cvFiles.length === 0) {
      toast.error('Please select CV files');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('batchName', batchName);
      
      selectedFiles.cvFiles.forEach((file, index) => {
        formData.append('cvFiles', file);
      });
      
      if (selectedFiles.jdFile) {
        formData.append('jdFile', selectedFiles.jdFile);
      }

      const response = await cvAPI.createBatch(formData);
      if (response.success) {
        toast.success('Batch created successfully');
        setShowUploadForm(false);
        setBatchName('');
        setSelectedFiles({ cvFiles: [], jdFile: null });
        fetchBatches();
      } else {
        toast.error('Failed to create batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Error creating batch');
    } finally {
      setUploading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <Head>
        <title>CV Intelligence - SimpleAI</title>
        <meta name="description" content="AI-powered CV analysis and candidate ranking" />
      </Head>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" style={{ left: '10%', top: '20%' }} />
        <div className="absolute w-64 h-64 bg-pink-500/20 rounded-full blur-2xl" style={{ right: '10%', bottom: '20%' }} />
        <div className="absolute w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20"
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
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-5 h-5 text-white" />
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
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {batches.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No CV batches yet</h3>
              <p className="text-gray-400 mb-6">Upload your first batch of CVs to get started with AI analysis</p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Batch</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">CV Analysis Batches</h2>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Batch</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                  <div key={batch.id} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-white truncate">{batch.name}</h3>
                      <button
                        onClick={() => router.push(`/cv-intelligence/batch/${batch.id}`)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Candidates:</span>
                        <span className="text-white">{batch.candidates?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-white">{batch.status || 'pending'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">{new Date(batch.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Create New Batch</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
                  placeholder="Enter batch name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CV Files (Required)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileSelect(e, 'cv')}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-white/10 file:text-white"
                />
                {selectedFiles.cvFiles.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
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
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileSelect(e, 'jd')}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-white/10 file:text-white"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBatch}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanCVIntelligence;
