import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import calendarService from '../services/calendarService';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Settings
} from 'lucide-react';

export default function InterviewCoordinator() {
  const { user, getAuthHeaders } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCalendarWarning, setShowCalendarWarning] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchInterviews();
  }, [user]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-coordinator/interviews`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data && response.data.success) {
        setInterviews(response.data.data || []);
      } else {
        setError(response.data?.message || 'Failed to fetch interviews');
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      if (error.response?.status === 404) {
        setError('Interview service not found. Please contact support.');
      } else if (error.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Network connection failed. Please check your internet connection.');
      } else {
        setError(`Failed to load interviews: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'rescheduled':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
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

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleScheduleInterview = () => {
    // Check if any calendar is connected
    if (!calendarService.hasConnectedCalendar()) {
      setShowCalendarWarning(true);
      return;
    }
    router.push('/interview-coordinator/schedule');
  };

  const handleGoToSettings = () => {
    router.push('/profile?tab=calendar');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/hr-dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
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
              <Plus className="w-4 h-4 mr-2" />
              Schedule Interview
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Interviews List */}
        {filteredInterviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
            <p className="text-gray-500 mb-6">
              {interviews.length === 0 
                ? "You haven't scheduled any interviews yet." 
                : "No interviews match your current filters."
              }
            </p>
            <button
              onClick={handleScheduleInterview}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Your First Interview
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewInterview(interview.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(interview.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {interview.job_title || interview.title || 'Interview'}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {interview.candidate_name || 'Candidate'}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {interview.scheduled_time ? new Date(interview.scheduled_time).toLocaleString() : 'Pending candidate response'}
                          </span>
                          {interview.meeting_link && (
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Meeting scheduled
                            </span>
                          )}
                        </div>
                        {interview.candidate_email && (
                          <div className="mt-1 text-sm text-gray-500">
                            📧 {interview.candidate_email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                          {interview.status || 'invitation_sent'}
                        </span>
                        <div className="mt-1 text-xs text-gray-500">
                          {interview.created_at ? `Sent ${new Date(interview.created_at).toLocaleDateString()}` : ''}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        {interview.calendly_link && (
                          <a
                            href={interview.calendly_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            📅 Calendly
                          </a>
                        )}
                        {interview.google_form_link && (
                          <a
                            href={interview.google_form_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            📋 Form
                          </a>
                        )}
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Connection Warning Modal */}
      {showCalendarWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Connect Your Calendar</h3>
                  <p className="text-sm text-gray-500">Required for scheduling interviews</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <p className="text-gray-700 font-medium">Calendar connection required</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  To schedule interviews and automatically create calendar events, you need to connect your Google Calendar or Outlook Calendar first.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Automatic calendar event creation</li>
                  <li>• Interview invitations sent from your email</li>
                  <li>• Meeting links (Google Meet/Teams) integration</li>
                  <li>• Seamless candidate scheduling</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowCalendarWarning(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGoToSettings}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Go to Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
