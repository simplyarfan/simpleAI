import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import * as Icons from 'lucide-react';
import axios from 'axios';
import emailService from '../services/emailService';
import toast from 'react-hot-toast';

const InterviewCoordinator = () => {
  const { user, logout, getAuthHeaders } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCalendarWarning, setShowCalendarWarning] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = getAuthHeaders();
      if (!headers?.Authorization) {
        toast.error('Please log in again');
        router.push('/auth/login');
        return;
      }
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-coordinator/interviews`,
        { headers }
      );
      
      if (response.data?.success) {
        setInterviews(response.data.data || []);
      } else {
        setError('Failed to load interviews');
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        router.push('/auth/login');
      } else {
        setError('Failed to load interviews. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchInterviews();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Icons.CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <Icons.XCircle className="w-5 h-5 text-red-500" />;
      case 'rescheduled':
        return <Icons.AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Icons.Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredInterviews = Array.isArray(interviews) ? interviews.filter(interview => {
    const matchesSearch = interview.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const handleScheduleInterview = () => {
    if (!emailService.hasConnectedEmail()) {
      setShowCalendarWarning(true);
      return;
    }
    router.push('/interview-coordinator/schedule');
  };

  const handleGoToSettings = () => {
    router.push('/profile?tab=email');
  };

  const handleViewInterview = (interviewId) => {
    router.push(`/interview-coordinator/${interviewId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Interview Coordinator - Enterprise AI Platform</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icons.ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Icons.Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Interview Coordinator</h1>
                    <p className="text-sm text-gray-500">Schedule and manage interview processes</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleScheduleInterview}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Icons.Plus className="w-4 h-4 mr-2" />
                Schedule Interview
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search interviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <Icons.AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Interviews List */}
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-12">
              <Icons.Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
              <p className="text-gray-500 mb-6">You haven't scheduled any interviews yet.</p>
              <button
                onClick={handleScheduleInterview}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Icons.Plus className="w-4 h-4 mr-2" />
                Schedule Your First Interview
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInterviews.map((interview) => (
                <div key={interview.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{interview.title || 'Interview'}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                          {getStatusIcon(interview.status)}
                          <span className="ml-1 capitalize">{interview.status}</span>
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <Icons.Users className="w-4 h-4 inline mr-1" />
                          Candidate: {interview.candidate_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Icons.Mail className="w-4 h-4 inline mr-1" />
                          {interview.candidate_email}
                        </p>
                        {interview.scheduled_time && (
                          <p className="text-sm text-gray-600">
                            <Icons.Clock className="w-4 h-4 inline mr-1" />
                            {new Date(interview.scheduled_time).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewInterview(interview.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Icons.Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Warning Modal */}
        {showCalendarWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <Icons.AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Email Connection Required</h3>
              </div>
              <p className="text-gray-600 mb-6">
                To schedule interviews and send invitations, you need to connect your email account first.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCalendarWarning(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoToSettings}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Connect Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InterviewCoordinator;
