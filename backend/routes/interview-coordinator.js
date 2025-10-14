/**
 * INTERVIEW COORDINATOR ROUTES (HR-02)
 * Multi-stage interview workflow with availability request and scheduling
 */

const express = require('express');
const database = require('../models/database');
const auth = require('../middleware/auth');
const authenticateToken = auth.authenticateToken;
const { generalLimiter } = require('../middleware/rateLimiting');

// Load Interview Coordinator Service
let InterviewCoordinatorService = null;
try {
  const InterviewCoordinatorServiceClass = require('../services/interviewCoordinatorService');
  InterviewCoordinatorService = new InterviewCoordinatorServiceClass();
  console.log('✅ Interview Coordinator Service loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Interview Coordinator Service:', error.message);
}

// Load Outlook Email Service
let OutlookEmailService = null;
try {
  const OutlookEmailServiceClass = require('../services/outlookEmailService');
  OutlookEmailService = new OutlookEmailServiceClass();
  console.log('✅ Outlook Email Service loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Outlook Email Service:', error.message);
}

const router = express.Router();

/**
 * GET /interviews - Get all interviews for the user
 */
router.get('/interviews', authenticateToken, generalLimiter, async (req, res) => {
  try {
    console.log('📋 Getting interviews for user:', req.user.id);
    await database.connect();
    
    // Try to query interviews directly (table should already exist from initializeTables)
    const interviews = await database.all(`
      SELECT * FROM interviews 
      WHERE scheduled_by = $1 
      ORDER BY created_at DESC
    `, [req.user.id]);

    console.log('📋 Found interviews:', interviews?.length || 0);

    res.json({
      success: true,
      data: interviews || [],
      message: 'Interviews retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get interviews error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve interviews',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /interview/:id - Get single interview details
 */
router.get('/interview/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await database.connect();

    const interview = await database.get(`
      SELECT * FROM interviews 
      WHERE id = $1 AND scheduled_by = $2
    `, [id, req.user.id]);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.json({
      success: true,
      data: interview,
      message: 'Interview retrieved successfully'
    });

  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve interview',
      error: error.message
    });
  }
});

/**
 * POST /request-availability - Stage 1: Send availability request email
 */
router.post('/request-availability', authenticateToken, generalLimiter, async (req, res) => {
  try {
    console.log('📧 Sending availability request for user:', req.user.id);
    
    const {
      candidateId,
      candidateName,
      candidateEmail,
      position,
      googleFormLink,
      emailSubject,
      emailContent,
      ccEmails,
      bccEmails
    } = req.body;

    // Validation
    if (!candidateName || !candidateEmail || !position) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: candidateName, candidateEmail, position'
      });
    }

    if (!OutlookEmailService) {
      return res.status(503).json({
        success: false,
        message: 'Email service not available. Please connect your Outlook account.'
      });
    }

    await database.connect();
    console.log('✅ Database connected');

    // Get user's Outlook tokens from database FIRST
    const user = await database.get(`
      SELECT outlook_access_token, outlook_email 
      FROM users 
      WHERE id = $1
    `, [req.user.id]);

    if (!user || !user.outlook_access_token) {
      console.log('⚠️ No Outlook token found');
      return res.status(400).json({
        success: false,
        message: 'Please connect your Outlook account first to send emails'
      });
    }

    // Generate interview ID
    const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Generate candidate ID if not provided (using email as unique identifier)
    const generatedCandidateId = candidateId || `candidate_${candidateEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    
    console.log('📝 Preparing to send email and create interview:', {
      interviewId,
      candidateId: generatedCandidateId,
      candidateName,
      candidateEmail,
      position,
      userId: req.user.id
    });

    // Send email FIRST using Microsoft Graph API
    try {

      // Send email via Microsoft Graph API
      const axios = require('axios');
      const emailBody = emailContent || `Dear ${candidateName},

We are pleased to inform you that we have shortlisted you for an interview for the ${position} position.

${googleFormLink ? `Please fill out this form: ${googleFormLink}` : ''}

Please let us know your availability.

Best regards`;

      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        {
          message: {
            subject: emailSubject || `Interview Opportunity - ${position}`,
            body: {
              contentType: 'Text',
              content: emailBody
            },
            toRecipients: [
              { emailAddress: { address: candidateEmail } }
            ],
            ccRecipients: ccEmails?.map(email => ({ emailAddress: { address: email } })) || [],
            bccRecipients: bccEmails?.map(email => ({ emailAddress: { address: email } })) || []
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${user.outlook_access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Email sent successfully via Outlook');

      // NOW create the interview record AFTER email is sent
      await database.run(`
        INSERT INTO interviews (
          id, candidate_id, candidate_name, candidate_email, job_title,
          status, google_form_link, scheduled_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        interviewId,
        generatedCandidateId,
        candidateName,
        candidateEmail,
        position,
        'awaiting_response',
        googleFormLink || null,
        req.user.id
      ]);
      
      console.log('✅ Interview record created after successful email');

      res.json({
        success: true,
        data: { interviewId, status: 'awaiting_response' },
        message: 'Availability request sent successfully!'
      });

    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.response?.data || emailError.message);
      
      // Don't create interview if email fails
      return res.status(500).json({
        success: false,
        message: 'Failed to send email. Interview not created.',
        error: emailError.response?.data?.error?.message || emailError.message
      });
    }

  } catch (error) {
    console.error('❌ Request availability error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      userId: req.user?.id,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to send availability request',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        code: error.code
      } : undefined
    });
  }
});

/**
 * POST /schedule-interview - Stage 2: Schedule interview with specific time
 */
router.post('/schedule-interview', authenticateToken, generalLimiter, async (req, res) => {
  try {
    console.log('📅 Scheduling interview for user:', req.user.id);
    
    const {
      interviewId,
      interviewType,
      scheduledTime,
      duration,
      platform,
      notes
    } = req.body;
    
    if (!interviewId || !scheduledTime || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: interviewId, scheduledTime, platform'
      });
    }

    // Auto-generate meeting link based on platform
    let meetingLink = '';
    const meetingId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    switch(platform) {
      case 'Google Meet':
        meetingLink = `https://meet.google.com/${meetingId}`;
        break;
      case 'Microsoft Teams':
        meetingLink = `https://teams.microsoft.com/l/meetup-join/${meetingId}`;
        break;
      case 'Zoom':
        meetingLink = `https://zoom.us/j/${meetingId}`;
        break;
      default:
        meetingLink = 'To be provided';
    }
    
    console.log('🔗 Auto-generated meeting link:', meetingLink);

    await database.connect();

    // Verify interview exists and belongs to user
    const interview = await database.get(`
      SELECT * FROM interviews 
      WHERE id = $1 AND scheduled_by = $2
    `, [interviewId, req.user.id]);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Update interview with schedule details
    await database.run(`
      UPDATE interviews 
      SET interview_type = $1,
          scheduled_time = $2,
          duration = $3,
          platform = $4,
          meeting_link = $5,
          notes = $6,
          status = 'scheduled',
          scheduled_at = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `, [
      interviewType || 'technical',
      scheduledTime,
      duration || 60,
      platform || 'Video Call',
      meetingLink || '',
      notes || '',
      new Date(),
      interviewId
    ]);

    // Generate ICS calendar file
    let icsContent = null;
    if (InterviewCoordinatorService) {
      icsContent = InterviewCoordinatorService.generateICSInvite({
        id: interviewId,
        candidateName: interview.candidate_name,
        candidateEmail: interview.candidate_email,
        position: interview.position,
        interviewType: interviewType || 'technical',
        scheduledTime,
        duration: duration || 60,
        platform,
        meetingLink: meetingLink || ''
      });
    }

    // Send confirmation email with calendar invite
    let emailSent = false;
    if (OutlookEmailService) {
      try {
        await OutlookEmailService.sendInterviewConfirmation(
          req.user.id,
          interview.candidate_email,
          {
            candidateName: interview.candidate_name,
            position: interview.position,
            interviewType: interviewType || 'technical',
            scheduledTime,
            duration: duration || 60,
            platform,
            meetingLink: meetingLink || '',
            customSubject: emailSubject,
            customContent: emailContent,
            ccEmails: ccEmails || [],
            bccEmails: bccEmails || []
          },
          icsContent
        );
        emailSent = true;
        console.log('✅ Interview confirmation email sent successfully');
      } catch (error) {
        console.error('❌ Failed to send email:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        interviewId,
        emailSent,
        icsGenerated: !!icsContent,
        status: 'scheduled',
        message: emailSent 
          ? 'Interview scheduled and confirmation sent' 
          : 'Interview scheduled but email failed'
      },
      message: 'Interview scheduled successfully'
    });

  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
});

/**
 * PUT /interview/:id/status - Update interview status (scheduled/completed/selected/rejected)
 */
router.put('/interview/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, outcome, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['awaiting_response', 'scheduled', 'completed', 'cancelled'];
    const validOutcomes = ['selected', 'rejected', null];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (outcome && !validOutcomes.includes(outcome)) {
      return res.status(400).json({
        success: false,
        message: `Invalid outcome. Must be one of: selected, rejected, or null`
      });
    }

    await database.connect();

    // Verify ownership
    const interview = await database.get(`
      SELECT * FROM interviews WHERE id = $1 AND scheduled_by = $2
    `, [id, req.user.id]);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Update status
    await database.run(`
      UPDATE interviews 
      SET status = $1,
          outcome = $2,
          notes = COALESCE($3, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [status, outcome || null, notes || null, id]);

    res.json({
      success: true,
      message: 'Interview status updated successfully'
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview status',
      error: error.message
    });
  }
});

/**
 * GET /calendar/:id/ics - Download ICS calendar file
 */
router.get('/calendar/:id/ics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // google, outlook, or apple
    
    await database.connect();
    
    const interview = await database.get(`
      SELECT * FROM interviews
      WHERE id = $1 AND scheduled_by = $2
    `, [id, req.user.id]);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (!interview.scheduled_time) {
      return res.status(400).json({
        success: false,
        message: 'Interview does not have a scheduled time'
      });
    }

    if (!InterviewCoordinatorService) {
      throw new Error('Interview Coordinator Service not available');
    }

    const icsContent = InterviewCoordinatorService.generateICSInvite({
      id: interview.id,
      candidateName: interview.candidate_name,
      candidateEmail: interview.candidate_email,
      position: interview.position,
      interviewType: interview.interview_type,
      scheduledTime: interview.scheduled_time,
      duration: interview.duration,
      platform: interview.platform,
      meetingLink: interview.meeting_link
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="interview-${interview.candidate_name.replace(/\s+/g, '-')}.ics"`);
    res.send(icsContent);

  } catch (error) {
    console.error('Generate ICS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate calendar file',
      error: error.message
    });
  }
});

/**
 * DELETE /interview/:id - Delete/cancel interview
 */
router.delete('/interview/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await database.connect();

    // Verify ownership
    const interview = await database.get(`
      SELECT * FROM interviews WHERE id = $1 AND scheduled_by = $2
    `, [id, req.user.id]);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Delete interview
    await database.run('DELETE FROM interviews WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Interview cancelled successfully'
    });

  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel interview',
      error: error.message
    });
  }
});

/**
 * GET /email-template/availability - Get default availability request template
 */
router.get('/email-template/availability', authenticateToken, async (req, res) => {
  try {
    const { candidateName, position } = req.query;
    
    const template = {
      subject: `Interview Opportunity - ${position}`,
      content: `Dear ${candidateName},

We are pleased to inform you that we would like to invite you for an interview for the ${position} position at our company.

Before we proceed with scheduling, we would like to understand your availability. Please fill out the following form with your available time slots:

[Google Forms Link will be inserted here]

Additionally, please let us know your preferred interview times by replying to this email.

We look forward to speaking with you soon.

Best regards,
[Your Company Name]`
    };

    res.json({
      success: true,
      data: template,
      message: 'Email template retrieved successfully'
    });

  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email template',
      error: error.message
    });
  }
});

/**
 * GET /email-template/confirmation - Get default confirmation email template
 */
router.get('/email-template/confirmation', authenticateToken, async (req, res) => {
  try {
    const { candidateName, position, scheduledTime, duration, platform } = req.query;
    
    const template = {
      subject: `Interview Scheduled - ${position}`,
      content: `Dear ${candidateName},

Your interview for the ${position} position has been confirmed.

Interview Details:
• Date & Time: ${scheduledTime}
• Duration: ${duration} minutes
• Platform: ${platform}
• Meeting Link: [Will be inserted]

Please add this interview to your calendar using the attached calendar file or the buttons below.

If you need to reschedule, please let us know as soon as possible.

We look forward to meeting you!

Best regards,
[Your Company Name]`
    };

    res.json({
      success: true,
      data: template,
      message: 'Email template retrieved successfully'
    });

  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email template',
      error: error.message
    });
  }
});

/**
 * GET /interview/:id/calendar - Generate and download .ics calendar file
 */
router.get('/interview/:id/calendar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await database.connect();

    const interview = await database.get(`
      SELECT * FROM interviews 
      WHERE id = $1 AND scheduled_by = $2
    `, [id, req.user.id]);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Generate .ics file content
    const startDate = new Date(interview.scheduled_time);
    const endDate = new Date(startDate.getTime() + (interview.duration || 60) * 60000);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Interview Coordinator//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${interview.id}@interviewcoordinator.com`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${interview.interview_type || 'Interview'} - ${interview.candidate_name}`,
      `DESCRIPTION:Interview for ${interview.job_title}\\n\\nCandidate: ${interview.candidate_name}\\nEmail: ${interview.candidate_email}\\n\\nMeeting Link: ${interview.meeting_link || 'TBD'}\\n\\nNotes: ${interview.notes || 'None'}`,
      `LOCATION:${interview.meeting_link || interview.location || 'Online'}`,
      `ORGANIZER:mailto:${req.user.email || 'noreply@example.com'}`,
      `ATTENDEE:mailto:${interview.candidate_email}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Interview Reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="interview-${interview.candidate_name.replace(/\s+/g, '-')}.ics"`);
    res.send(icsContent);

  } catch (error) {
    console.error('Calendar generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate calendar file',
      error: error.message
    });
  }
});

/**
 * DELETE /interview/:id - Delete an interview
 */
router.delete('/interview/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Delete request for interview:', id, 'by user:', req.user?.id);
    
    await database.connect();
    console.log('✅ Database connected for delete');

    // Verify the interview belongs to the user
    const interview = await database.get(`
      SELECT * FROM interviews 
      WHERE id = $1 AND scheduled_by = $2
    `, [id, req.user.id]);

    console.log('📋 Interview found:', !!interview);

    if (!interview) {
      console.log('❌ Interview not found or permission denied');
      return res.status(404).json({
        success: false,
        message: 'Interview not found or you do not have permission to delete it'
      });
    }

    // Delete the interview
    console.log('🗑️ Deleting interview...');
    await database.run(`
      DELETE FROM interviews WHERE id = $1
    `, [id]);

    console.log('✅ Interview deleted successfully');

    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete interview error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      userId: req.user?.id,
      interviewId: req.params.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete interview',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
