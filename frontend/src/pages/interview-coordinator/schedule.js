import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import emailService from '../../services/emailService';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft,
  Save,
  AlertCircle,
  Mail,
  Eye,
  Send
} from 'lucide-react';

export default function ScheduleInterview() {
  const { user, getAuthHeaders } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const [showCalendarConnection, setShowCalendarConnection] = useState(false);
  const [connectedCalendars, setConnectedCalendars] = useState({});
  const [emailContent, setEmailContent] = useState({
    subject: '',
    body: ''
  });
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    candidateId: '',
    candidateName: '',
    candidateEmail: '',
    scheduledTime: '',
    duration: 60,
    location: 'Video Call',
    meetingLink: '',
    meetingPlatform: '',
    type: 'technical',
    panelMembers: [{ name: '', email: '', role: '' }],
    notes: '',
    calendlyLink: 'https://calendly.com/your-link',
    googleFormLink: 'https://forms.google.com/your-form'
  });

  // Handle pre-filled candidate data from CV Intelligence
  useEffect(() => {
    const { candidate } = router.query;
    if (candidate) {
      try {
        const data = JSON.parse(decodeURIComponent(candidate));
        setCandidateData(data);
        setFormData(prev => ({
          ...prev,
          candidateId: data.candidateId,
          candidateName: data.candidateName,
          candidateEmail: data.candidateEmail,
          title: `${data.jobTitle} - Interview with ${data.candidateName}`,
          notes: `Candidate Score: ${data.score}%\nShortlisted from CV Intelligence batch.`
        }));
      } catch (error) {
        console.error('Error parsing candidate data:', error);
      }
    }
  }, [router.query]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePanelMemberChange = (index, field, value) => {
    const newPanelMembers = [...formData.panelMembers];
    newPanelMembers[index][field] = value;
    setFormData(prev => ({
      ...prev,
      panelMembers: newPanelMembers
    }));
  };

  const addPanelMember = () => {
    setFormData(prev => ({
      ...prev,
      panelMembers: [...prev.panelMembers, { name: '', email: '', role: '' }]
    }));
  };

  const removePanelMember = (index) => {
    if (formData.panelMembers.length > 1) {
      const newPanelMembers = formData.panelMembers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        panelMembers: newPanelMembers
      }));
    }
  };


  const handlePreviewEmail = () => {
    // Generate initial email content
    const generatedContent = generateEmailContent();
    setEmailContent({
      subject: generatedContent.subject,
      body: generatedContent.body
    });
    setIsEditingEmail(false);
    setShowEmailPreview(true);
  };

  const generateEmailContent = () => {
    const meetingPlatformText = {
      zoom: 'Zoom',
      teams: 'Microsoft Teams',
      meet: 'Google Meet',
      custom: 'Video Call'
    };

    const platformName = meetingPlatformText[formData.meetingPlatform] || 'Video Call';
    const meetingInfo = formData.meetingPlatform && formData.meetingPlatform !== 'custom' 
      ? `Meeting link will be provided closer to the interview date via ${platformName}.`
      : formData.meetingLink 
        ? `Meeting Link: ${formData.meetingLink}`
        : 'Meeting details will be provided separately.';

    return {
      subject: `🎉 Interview Invitation - ${formData.title}`,
      body: `Dear ${formData.candidateName},

We are pleased to inform you that you have been shortlisted for an interview! 🎉

Based on your impressive CV and qualifications, we would like to invite you to proceed to the next stage of our selection process.

📅 **Interview Details:**
• Position: ${formData.title}
• Date & Time: ${formData.scheduledTime ? new Date(formData.scheduledTime).toLocaleString() : 'TBD'}
• Duration: ${formData.duration} minutes
• Type: ${formData.type}
• Location: ${formData.location}

💻 **Meeting Information:**
${meetingInfo}

📋 **Next Steps:**
1. Please confirm your availability by replying to this email
2. Prepare for a ${formData.type} interview
3. Have your resume and any relevant documents ready

${formData.notes ? `📝 **Additional Notes:**
${formData.notes}

` : ''}We look forward to speaking with you and learning more about your experience and qualifications.

If you have any questions or need to reschedule, please don't hesitate to reach out.

Best regards,
The Hiring Team`
    };
  };

  const handleSendInvitation = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, create calendar event
      const calendars = calendarService.getConnectedCalendars();
      let calendarEventCreated = false;
      
      if (formData.scheduledTime) {
        const startTime = new Date(formData.scheduledTime).toISOString();
        const endTime = new Date(new Date(formData.scheduledTime).getTime() + (formData.duration * 60000)).toISOString();
        
        const eventDetails = {
          title: formData.title,
          description: `Interview with ${formData.candidateName}\n\nType: ${formData.type}\nLocation: ${formData.location}\n\nMeeting Link: ${formData.meetingLink || 'TBD'}`,
          startTime: startTime,
          endTime: endTime,
          attendees: [formData.candidateEmail]
        };

        // Try to create event in connected calendars
        if (calendars.google?.connected) {
          try {
            await calendarService.createGoogleEvent(eventDetails);
            calendarEventCreated = true;
            toast.success('Calendar event created in Google Calendar');
          } catch (calError) {
            console.error('Failed to create Google Calendar event:', calError);
          }
        }
        
        if (calendars.outlook?.connected && !calendarEventCreated) {
          try {
            await calendarService.createOutlookEvent(eventDetails);
            calendarEventCreated = true;
            toast.success('Calendar event created in Outlook Calendar');
          } catch (calError) {
            console.error('Failed to create Outlook Calendar event:', calError);
          }
        }
      }

      // Then, schedule the interview in the backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview-coordinator/schedule`,
        {
          ...formData,
          emailSubject: emailContent.subject,
          emailBody: emailContent.body,
          sendEmail: true,
          calendarEventCreated: calendarEventCreated
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess(true);
        if (calendarEventCreated) {
          toast.success('Interview scheduled and added to calendar!');
        }
        setTimeout(() => {
          router.push('/interview-coordinator');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setError('Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if any calendar is connected
    const calendars = calendarService.getConnectedCalendars();
    if (!calendarService.hasConnectedCalendar()) {
      // Show calendar connection modal
      setShowCalendarConnection(true);
      return;
    }
    
    handlePreviewEmail();
  };

  const handleCalendarConnected = (provider, userInfo) => {
    setConnectedCalendars(calendarService.getConnectedCalendars());
    toast.success(`${provider === 'google' ? 'Google' : 'Outlook'} Calendar connected successfully!`);
    setShowCalendarConnection(false);
    // After connecting calendar, proceed to email preview
    handlePreviewEmail();
  };

  // Load connected calendars on component mount
  useEffect(() => {
    setConnectedCalendars(calendarService.getConnectedCalendars());
  }, []);

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Interview Scheduled!</h2>
          <p className="text-gray-600 mb-4">The interview has been successfully scheduled and invitations will be sent.</p>
          <p className="text-sm text-gray-500">Redirecting to interviews list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/interview-coordinator')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Schedule Interview</h1>
                  <p className="text-sm text-gray-500">Create a new interview appointment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Senior Developer Interview"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="cultural">Cultural Fit</option>
                  <option value="final">Final Round</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidate Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Candidate Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Name *
                </label>
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Email *
                </label>
                <input
                  type="email"
                  name="candidateEmail"
                  value={formData.candidateEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Schedule Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="15"
                  max="240"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Video Call, Office, etc."
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Platform
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, meetingPlatform: 'zoom', meetingLink: 'https://zoom.us/j/'})}
                  className={`p-3 border-2 rounded-lg transition-colors flex flex-col items-center space-y-2 ${
                    formData.meetingPlatform === 'zoom' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Z</span>
                  </div>
                  <span className="text-sm font-medium">Zoom</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({...formData, meetingPlatform: 'teams', meetingLink: 'https://teams.microsoft.com/'})}
                  className={`p-3 border-2 rounded-lg transition-colors flex flex-col items-center space-y-2 ${
                    formData.meetingPlatform === 'teams' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="text-sm font-medium">Teams</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({...formData, meetingPlatform: 'meet', meetingLink: 'https://meet.google.com/'})}
                  className={`p-3 border-2 rounded-lg transition-colors flex flex-col items-center space-y-2 ${
                    formData.meetingPlatform === 'meet' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="text-sm font-medium">Meet</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({...formData, meetingPlatform: 'custom', meetingLink: ''})}
                  className={`p-3 border-2 rounded-lg transition-colors flex flex-col items-center space-y-2 ${
                    formData.meetingPlatform === 'custom' 
                      ? 'border-gray-500 bg-gray-50 text-gray-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                  <span className="text-sm font-medium">Custom</span>
                </button>
              </div>
              
              {formData.meetingPlatform === 'custom' && (
                <div className="mt-3">
                  <input
                    type="url"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter custom meeting link..."
                  />
                </div>
              )}
              
              {formData.meetingPlatform && formData.meetingPlatform !== 'custom' && (
                <div className="mt-2 text-sm text-gray-600">
                  Meeting link will be auto-generated when scheduled
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Any additional information or special instructions..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/interview-coordinator')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Schedule Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                <button
                  onClick={() => setShowEmailPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">To: {formData.candidateEmail}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Subject:</span>
                  {isEditingEmail ? (
                    <input
                      type="text"
                      value={emailContent.subject}
                      onChange={(e) => setEmailContent({...emailContent, subject: e.target.value})}
                      className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{emailContent.subject}</span>
                  )}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                {isEditingEmail ? (
                  <textarea
                    value={emailContent.body}
                    onChange={(e) => setEmailContent({...emailContent, body: e.target.value})}
                    className="w-full h-64 text-sm border-none resize-none focus:outline-none font-sans"
                    placeholder="Email content..."
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {emailContent.body}
                  </pre>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowEmailPreview(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit Details
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditingEmail(!isEditingEmail)}
                  className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {isEditingEmail ? 'Preview' : 'Edit Content'}
                </button>
                <button
                onClick={handleSendInvitation}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Connection Modal */}
      {showCalendarConnection && (
        <CalendarConnection
          onCalendarConnected={handleCalendarConnected}
          onClose={() => setShowCalendarConnection(false)}
        />
      )}
    </div>
  );
}
