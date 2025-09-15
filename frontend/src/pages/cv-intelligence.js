import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Header from '../components/Header';
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
  TrendingUp
} from 'lucide-react';

const CVIntelligence = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({ cvFiles: [], jdFile: null });
  const [batchName, setBatchName] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/cv-intelligence/batches', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBatches(data.data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'cv') {
      setSelectedFiles(prev => ({ ...prev, cvFiles: files }));
    } else {
      setSelectedFiles(prev => ({ ...prev, jdFile: files[0] }));
    }
  };

  const handleUpload = async () => {
    if (!batchName.trim() || selectedFiles.cvFiles.length === 0 || !selectedFiles.jdFile) {
      alert('Please provide batch name, CV files, and job description file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('batchName', batchName);
    
    selectedFiles.cvFiles.forEach(file => {
      formData.append('cvFiles', file);
    });
    
    formData.append('jdFile', selectedFiles.jdFile);

    try {
      const response = await fetch('/api/cv-intelligence/batches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setBatches(prev => [data.data.batch, ...prev]);
        setShowUploadForm(false);
        setBatchName('');
        setSelectedFiles({ cvFiles: [], jdFile: null });
        alert('CV batch processed successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteBatch = async (batchId) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;

    try {
      const response = await fetch(`/api/cv-intelligence/batches/${batchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setBatches(prev => prev.filter(batch => batch.id !== batchId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>CV Intelligence - Enterprise AI Hub</title>
          <meta name="description" content="AI-powered CV analysis and candidate ranking" />
        </Head>

        <Header />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8 sm:px-8 sm:py-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">CV Intelligence</h1>
                    <p className="mt-2 text-blue-100 text-lg">
                      AI-powered resume analysis and candidate ranking
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
                      <FileText className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">CV Batches</h2>
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>New Batch</span>
              </button>
            </div>
          </div>

          {/* Upload Form Modal */}
          {showUploadForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New CV Batch</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Name
                    </label>
                    <input
                      type="text"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Senior Developers - Q1 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CV Files (PDF, DOC, DOCX)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileSelect(e, 'cv')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {selectedFiles.cvFiles.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedFiles.cvFiles.length} CV files selected
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description File
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileSelect(e, 'jd')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {selectedFiles.jdFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Job description: {selectedFiles.jdFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <Clock className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Process CVs</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Batches List */}
          <div className="px-4 py-6 sm:px-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Clock className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg text-gray-600">Loading batches...</span>
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No CV batches yet</h3>
                <p className="text-gray-600 mb-6">Create your first batch to start analyzing CVs</p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Create First Batch
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => {
                  const StatusIcon = getStatusIcon(batch.status);
                  return (
                    <div
                      key={batch.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {batch.name}
                            </h3>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(batch.status)}`}>
                              <StatusIcon className="w-4 h-4 mr-1" />
                              {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">CVs Processed:</span>
                            <span className="font-medium">{batch.cv_count || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Candidates Found:</span>
                            <span className="font-medium">{batch.candidate_count || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-medium">
                              {new Date(batch.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {batch.status === 'completed' && (
                            <>
                              <button
                                onClick={() => window.open(`/cv-intelligence/batch/${batch.id}`, '_blank')}
                                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => window.open(`/api/cv-intelligence/batches/${batch.id}/export?format=csv`, '_blank')}
                                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                              >
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteBatch(batch.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default CVIntelligence;
