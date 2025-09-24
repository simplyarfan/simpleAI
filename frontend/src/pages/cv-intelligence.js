import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { cvAPI } from '../utils/api';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [currentBatchId, setCurrentBatchId] = useState(null);

  // Utility functions
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📄';
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

  // Rest of the existing CV Intelligence functionality...
  // (This would include all the upload, processing, and batch management logic)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
        <title>CV Intelligence - AI-Powered Candidate Ranking | SimpleAI</title>
        <meta name="description" content="Intelligent CV analysis and candidate ranking system" />
      </Head>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      {/* Header with back button */}
      <div className="relative z-10 p-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/20 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">CV Intelligence</h1>
          <p className="text-gray-300 text-lg">AI-powered resume analysis and candidate ranking</p>
        </div>

        {/* Main content area */}
        <div className="max-w-7xl mx-auto">
          {batches.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No CV batches yet</h3>
                <p className="text-gray-400">Upload your first batch of CVs to get started with AI analysis</p>
              </div>
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Create First Batch
              </button>
            </div>
          ) : (
            <div>
              {/* Existing batches display */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">CV Analysis Batches</h2>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  New Batch
                </button>
              </div>

              {/* Batches grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                  <div key={batch.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white truncate">{batch.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/cv-intelligence/batch/${batch.id}`)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Candidates:</span>
                        <span className="text-white">{batch.candidates?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          batch.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          batch.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {batch.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVIntelligence;
