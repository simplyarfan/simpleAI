import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/shared/Header';
import { cvIntelligenceAPI } from '../utils/cvIntelligenceAPI';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  Users,
  BarChart3,
  Download,
  Eye,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  ArrowLeft,
  X,
  Target,
  Award,
  Brain,
  Zap,
  Send
} from 'lucide-react';

const CVIntelligence = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState({ cvFiles: [], jdFile: null });
  const [batchName, setBatchName] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Name, 2: Files, 3: Processing
  const [currentBatchId, setCurrentBatchId] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await cvIntelligenceAPI.getBatches();
      setBatches(response.data.data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    
    if (type === 'cv') {
      if (files.length > 10) {
        toast.error('Maximum 10 CV files allowed');
        return;
      }
      setSelectedFiles(prev => ({ ...prev, cvFiles: files }));
    } else {
      setSelectedFiles(prev => ({ ...prev, jdFile: files[0] }));
    }
  };

  const removeFile = (index, type) => {
    if (type === 'cv') {
      setSelectedFiles(prev => ({
        ...prev,
        cvFiles: prev.cvFiles.filter((_, i) => i !== index)
      }));
    } else {
      setSelectedFiles(prev => ({ ...prev, jdFile: null }));
    }
  };

  const validateAndProceed = () => {
    if (currentStep === 1) {
      if (!batchName.trim()) {
        toast.error('Please enter a batch name');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const validation = cvIntelligenceAPI.validateFiles(selectedFiles.jdFile, selectedFiles.cvFiles);
      if (!validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }
      handleUpload();
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      setCurrentStep(3);
      setUploadProgress(0);

      // Step 1: Create batch
      toast.loading('Creating batch...', { id: 'upload' });
      const batchResponse = await cvIntelligenceAPI.createBatch(batchName);
      const batchId = batchResponse.data.data.batchId;
      setCurrentBatchId(batchId);

      // Step 2: Process files
      toast.loading('Processing files...', { id: 'upload' });
      const processResponse = await cvIntelligenceAPI.processFiles(
        batchId,
        selectedFiles.jdFile,
        selectedFiles.cvFiles,
        (progress) => setUploadProgress(progress)
      );

      if (processResponse.data.success) {
        toast.success('CV analysis completed successfully!', { id: 'upload' });
        
        // Reset form
        setShowUploadForm(false);
        setBatchName('');
        setSelectedFiles({ cvFiles: [], jdFile: null });
        setCurrentStep(1);
        setCurrentBatchId(null);
        
        // Refresh batches
        fetchBatches();
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed', { id: 'upload' });
      setCurrentStep(2); // Go back to file selection
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const viewBatch = (batchId) => {
    router.push(`/cv-intelligence/batch/${batchId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white">Loading CV Intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <Head>
        <title>CV Intelligence - AI-Powered Candidate Ranking | simpleAI</title>
        <meta name="description" content="Intelligent CV analysis and candidate ranking system" />
      </Head>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">CV Intelligence</h1>
                <p className="text-gray-300">AI-powered candidate ranking and analysis</p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Batch
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Total Batches</dt>
                  <dd className="text-lg font-medium text-white">{batches.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Candidates Analyzed</dt>
                  <dd className="text-lg font-medium text-white">
                    {batches.reduce((total, batch) => total + (batch.candidate_count || 0), 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-white">
                    {batches.filter(b => b.status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">Success Rate</dt>
                  <dd className="text-lg font-medium text-white">
                    {batches.length > 0 ? Math.round((batches.filter(b => b.status === 'completed').length / batches.length) * 100) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Batches List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Batches</h2>
          </div>

          {batches.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No batches yet</h3>
              <p className="text-gray-300 mb-6">Create your first CV analysis batch to get started</p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Batch
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Batch Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Candidates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{batch.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                          {getStatusIcon(batch.status)}
                          <span className="ml-1 capitalize">{batch.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {batch.candidate_count || 0} candidates
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => viewBatch(batch.id)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="View batch details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {currentStep === 1 && 'Create New Batch'}
                {currentStep === 2 && 'Upload Files'}
                {currentStep === 3 && 'Processing...'}
              </h3>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setCurrentStep(1);
                  setBatchName('');
                  setSelectedFiles({ cvFiles: [], jdFile: null });
                }}
                className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Batch Name */}
            {currentStep === 1 && (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g., Senior AI Developer - XYZ Company"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Choose a descriptive name for this hiring batch
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={validateAndProceed}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Next: Upload Files
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: File Upload */}
            {currentStep === 2 && (
              <div>
                {/* Job Description Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    Job Description (1 file)
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={(e) => handleFileSelect(e, 'jd')}
                      className="hidden"
                      id="jd-upload"
                    />
                    <label htmlFor="jd-upload" className="cursor-pointer">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-white mb-2">Upload Job Description</p>
                      <p className="text-xs text-gray-400">PDF, TXT, DOC, or DOCX (max 10MB)</p>
                    </label>
                  </div>
                  
                  {selectedFiles.jdFile && (
                    <div className="mt-3 p-3 bg-white/10 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2">{cvIntelligenceAPI.getFileIcon(selectedFiles.jdFile.type)}</span>
                        <span className="text-sm text-white">{selectedFiles.jdFile.name}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          ({cvIntelligenceAPI.formatFileSize(selectedFiles.jdFile.size)})
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(0, 'jd')}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* CV Files Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    CV Files (1-10 files)
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      multiple
                      onChange={(e) => handleFileSelect(e, 'cv')}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-white mb-2">Upload CV Files</p>
                      <p className="text-xs text-gray-400">PDF, TXT, DOC, or DOCX (max 10MB each, up to 10 files)</p>
                    </label>
                  </div>
                  
                  {selectedFiles.cvFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedFiles.cvFiles.map((file, index) => (
                        <div key={index} className="p-3 bg-white/10 rounded-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">{cvIntelligenceAPI.getFileIcon(file.type)}</span>
                            <span className="text-sm text-white">{file.name}</span>
                            <span className="text-xs text-gray-400 ml-2">
                              ({cvIntelligenceAPI.formatFileSize(file.size)})
                            </span>
                          </div>
                          <button
                            onClick={() => removeFile(index, 'cv')}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 text-gray-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={validateAndProceed}
                    disabled={!selectedFiles.jdFile || selectedFiles.cvFiles.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Process Files
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Processing */}
            {currentStep === 3 && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Processing Your Files</h4>
                  <p className="text-gray-300">AI is analyzing CVs and matching against job requirements...</p>
                </div>

                {uploadProgress > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                    Extracting text from documents...
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                    Analyzing candidate profiles...
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                    Matching against job requirements...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CVIntelligence;
