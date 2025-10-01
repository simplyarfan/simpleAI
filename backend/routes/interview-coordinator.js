/**
 * INTERVIEW COORDINATOR ROUTES (HR-02)
 * Multi-stage interview workflow with availability request and scheduling
 */

const express = require('express');
const database = require('../models/database');
const auth = require('../middleware/auth');
const authenticateToken = auth.authenticateToken;

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
router.get('/interviews', authenticateToken, async (req, res) => {
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
      WHERE id = ? AND scheduled_by = ?
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
router.post('/request-availability', authenticateToken, async (req, res) => {
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

    // Generate interview ID
    const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    console.log('📝 Preparing to insert interview:', {
      interviewId,
      candidateName,
      candidateEmail,
      position,
      userId: req.user.id
    });

    // Insert interview record with "awaiting_response" status
    await database.run(`
      INSERT INTO interviews (
        id, candidate_id, candidate_name, candidate_email, position,
        status, google_form_link, availability_request_sent_at, scheduled_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      interviewId,
      candidateId || null,
      candidateName,
      candidateEmail,
      position,
      'awaiting_response',
      googleFormLink || null,
      new Date().toISOString(),
      req.user.id
    ]);
    
    console.log('✅ Interview record inserted successfully');

    // For now, skip email sending and just create the record
    // TODO: Implement proper email integration later
    console.log('📧 Email sending temporarily disabled - record created successfully');

    res.json({
      success: true,
      data: {
        interviewId,
        status: 'awaiting_response',
        message: 'Availability request created successfully (email sending temporarily disabled)'
      },
      message: 'Availability request created successfully'
    });

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
 * POST /schedule-interview - Stage 2: Schedule interview after candidate responds
 */
router.post('/schedule-interview', authenticateToken, async (req, res) => {
  try {
    console.log('📅 Scheduling interview for user:', req.user.id);
    
    const {
      interviewId,
      interviewType,
      scheduledTime,
      duration,
      platform,
      meetingLink,
      notes,
      emailSubject,
      emailContent,
      ccEmails,
      bccEmails
    } = req.body;

    // Validation
    if (!interviewId || !scheduledTime || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: interviewId, scheduledTime, platform'
      });
    }

    await database.connect();

    // Verify interview exists and belongs to user
    const interview = await database.get(`
      SELECT * FROM interviews 
      WHERE id = ? AND scheduled_by = ?
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
      SET interview_type = ?,
          scheduled_time = ?,
          duration = ?,
          platform = ?,
          meeting_link = ?,
          notes = ?,
          status = 'scheduled',
          scheduled_at = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      interviewType || 'technical',
      scheduledTime,
      duration || 60,
      platform,
      meetingLink || null,
      notes || null,
      new Date().toISOString(),
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
      SELECT * FROM interviews WHERE id = ? AND scheduled_by = ?
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
      SET status = ?,
          outcome = ?,
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
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
      WHERE id = ? AND scheduled_by = ?
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
      SELECT * FROM interviews WHERE id = ? AND scheduled_by = ?
    `, [id, req.user.id]);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Delete interview
    await database.run('DELETE FROM interviews WHERE id = ?', [id]);

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

module.exports = router;
