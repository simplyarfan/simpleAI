import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import * as Icons from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const InterviewCoordinator = () => {
  const { user, logout, getAuthHeaders } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Form states
  const [availabilityForm, setAvailabilityForm] = useState({
    candidateName: '',
    candidateEmail: '',
    position: '',
    googleFormLink: '',
    emailSubject: '',
    emailContent: '',
    ccEmails: '',
    bccEmails: ''
  });

  // Load default email template when modal opens
  const loadDefaultEmailTemplate = (candidateName, position) => {
    const defaultSubject = `Interview Opportunity - ${position}`;
    const defaultContent = `Dear ${candidateName},

We are pleased to inform you that we have shortlisted you for an interview for the ${position} position at our company.

We need some details prior to the interview, which you can fill in the following Google Form: [Google Form Link will be inserted here]

Additionally, please mention what time would you be available for a meeting?

We look forward to hearing from you soon.

Best regards,
[Your Company Name]`;

    setAvailabilityForm(prev => ({
      ...prev,
      emailSubject: defaultSubject,
      emailContent: defaultContent
    }));
  };

  const [scheduleForm, setScheduleForm] = useState({
    interviewType: 'technical',
    scheduledTime: '',
    duration: 60,
    platform: 'Teams',
    meetingLink: '',
    notes: '',
    emailSubject: '',
    emailContent: '',
    ccEmails: '',
    bccEmails: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchInterviews();
    
    // Handle pre-filled data from CV Intelligence
    if (router.query.action === 'request-availability') {
      const { candidateName, candidateEmail, position } = router.query;
      if (candidateName && candidateEmail && position) {
        setAvailabilityForm(prev => ({
          ...prev,
          candidateName: candidateName,
          candidateEmail: candidateEmail,
          position: position
        }));
        // Load template with the pre-filled data
        loadDefaultEmailTemplate(candidateName, position);
        // Open the modal
        setShowAvailabilityModal(true);
      }
    }
  }, [user, router.query]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      if (!headers) {
        console.log('No auth headers available, skipping fetch');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-coordinator/interviews`,
        { headers }
      );
      
      if (response.data?.success) {
        setInterviews(response.data.data || []);
      } else {
        console.error('API response not successful:', response.data);
        setInterviews([]);
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load interviews');
      }
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAvailability = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      const payload = {
        ...availabilityForm,
        ccEmails: availabilityForm.ccEmails.split(',').map(e => e.trim()).filter(Boolean),
        bccEmails: availabilityForm.bccEmails.split(',').map(e => e.trim()).filter(Boolean)
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-coordinator/request-availability`,
        payload,
        { headers }
      );

      if (response.data?.success) {
        toast.success(response.data.message || 'Availability request created successfully!');
        setShowAvailabilityModal(false);
        setAvailabilityForm({
          candidateName: '',
          candidateEmail: '',
          position: '',
          googleFormLink: '',
          emailSubject: '',
          emailContent: '',
          ccEmails: '',
          bccEmails: ''
        });
        fetchInterviews();
      } else {
        toast.error(response.data?.message || 'Failed to create availability request');
      }
    } catch (error) {
      console.error('Availability request error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send availability request';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      const payload = {
        ...scheduleForm,
        interviewId: selectedInterview.id,
        ccEmails: scheduleForm.ccEmails.split(',').map(e => e.trim()).filter(Boolean),
        bccEmails: scheduleForm.bccEmails.split(',').map(e => e.trim()).filter(Boolean)
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-coordinator/schedule-interview`,
        payload,
        { headers }
      );

      if (response.data?.success) {
        toast.success('Interview scheduled successfully!');
        setShowScheduleModal(false);
        setSelectedInterview(null);
        fetchInterviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const updateInterviewStatus = async (interviewId, status, outcome = null) => {
    try {
      const headers = getAuthHeaders();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-coordinator/interview/${interviewId}/status`,
        { status, outcome },
        { headers }
      );
      
      toast.success('Status updated successfully!');
      fetchInterviews();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const downloadCalendar = async (interviewId, candidateName) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-coordinator/calendar/${interviewId}/ics`,
        { headers, responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-${candidateName.replace(/\s+/g, '-')}.ics`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download calendar file');
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status, outcome) => {
    const statusConfig = {
      awaiting_response: { color: 'bg-yellow-100 text-yellow-800', text: 'Awaiting Response' },
      scheduled: { color: 'bg-blue-100 text-blue-800', text: 'Scheduled' },
      completed: { color: 'bg-green-100 text-green-800', text: outcome === 'selected' ? 'Selected' : outcome === 'rejected' ? 'Rejected' : 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!user) return null;

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
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Icons.Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Interview Coordinator</h1>
                  <p className="text-sm text-gray-500">Multi-stage interview workflow</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                >
                  <Icons.Plus className="w-4 h-4 mr-2" />
                  Request Availability
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icons.User className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search candidates or positions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="awaiting_response">Awaiting Response</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Interviews List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading interviews...</p>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-12">
              <Icons.Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
              <p className="text-gray-600 mb-4">Start by requesting availability from candidates</p>
              <button
                onClick={() => setShowAvailabilityModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Request Availability
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInterviews.map((interview) => (
                      <tr key={interview.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{interview.candidate_name}</div>
                            <div className="text-sm text-gray-500">{interview.candidate_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interview.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(interview.status, interview.outcome)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {interview.scheduled_time ? new Date(interview.scheduled_time).toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {interview.status === 'awaiting_response' && (
                            <button
                              onClick={() => {
                                setSelectedInterview(interview);
                                setShowScheduleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Schedule
                            </button>
                          )}
                          {interview.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => downloadCalendar(interview.id, interview.candidate_name)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Download ICS
                              </button>
                              <button
                                onClick={() => updateInterviewStatus(interview.id, 'completed')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Mark Complete
                              </button>
                            </>
                          )}
                          {interview.status === 'completed' && !interview.outcome && (
                            <>
                              <button
                                onClick={() => updateInterviewStatus(interview.id, 'completed', 'selected')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Select
                              </button>
                              <button
                                onClick={() => updateInterviewStatus(interview.id, 'completed', 'rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Availability Request Modal */}
        {showAvailabilityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Request Availability</h3>
                  <button onClick={() => setShowAvailabilityModal(false)}>
                    <Icons.X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Candidate Name *</label>
                    <input
                      type="text"
                      value={availabilityForm.candidateName}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setAvailabilityForm({...availabilityForm, candidateName: newName});
                        // Auto-update email template when name changes
                        if (newName && availabilityForm.position) {
                          loadDefaultEmailTemplate(newName, availabilityForm.position);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={availabilityForm.candidateEmail}
                      onChange={(e) => setAvailabilityForm({...availabilityForm, candidateEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                  <input
                    type="text"
                    value={availabilityForm.position}
                    onChange={(e) => {
                      const newPosition = e.target.value;
                      setAvailabilityForm({...availabilityForm, position: newPosition});
                      // Auto-update email template when position changes
                      if (availabilityForm.candidateName && newPosition) {
                        loadDefaultEmailTemplate(availabilityForm.candidateName, newPosition);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Form Link (Optional)</label>
                  <input
                    type="url"
                    value={availabilityForm.googleFormLink}
                    onChange={(e) => setAvailabilityForm({...availabilityForm, googleFormLink: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Will be inserted into email template"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                  <input
                    type="text"
                    value={availabilityForm.emailSubject}
                    onChange={(e) => setAvailabilityForm({...availabilityForm, emailSubject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Interview Opportunity - [Position]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                  <textarea
                    value={availabilityForm.emailContent}
                    onChange={(e) => setAvailabilityForm({...availabilityForm, emailContent: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Custom email content (optional - will use default template if empty)"
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestAvailability}
                  disabled={loading || !availabilityForm.candidateName || !availabilityForm.candidateEmail || !availabilityForm.position}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Interview Modal */}
        {showScheduleModal && selectedInterview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Schedule Interview - {selectedInterview.candidate_name}
                  </h3>
                  <button onClick={() => setShowScheduleModal(false)}>
                    <Icons.X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                    <select
                      value={scheduleForm.interviewType}
                      onChange={(e) => setScheduleForm({...scheduleForm, interviewType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="screening">Screening</option>
                      <option value="final">Final</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <select
                      value={scheduleForm.duration}
                      onChange={(e) => setScheduleForm({...scheduleForm, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
                    <select
                      value={scheduleForm.platform}
                      onChange={(e) => setScheduleForm({...scheduleForm, platform: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Teams">Microsoft Teams</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Meet">Google Meet</option>
                      <option value="In-Person">In-Person</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link</label>
                    <input
                      type="url"
                      value={scheduleForm.meetingLink}
                      onChange={(e) => setScheduleForm({...scheduleForm, meetingLink: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleInterview}
                  disabled={loading || !scheduleForm.scheduledTime || !scheduleForm.platform}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Scheduling...' : 'Schedule Interview'}
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
