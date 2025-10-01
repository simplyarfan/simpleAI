/**
 * INTERVIEW COORDINATOR ROUTES (HR-02)
 * Handles interview scheduling, management, and coordination
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
    
    // Create interviews table if it doesn't exist
    await database.run(`
      CREATE TABLE IF NOT EXISTS interviews (
        id VARCHAR(255) PRIMARY KEY,
        candidate_id VARCHAR(255) NOT NULL,
        candidate_name VARCHAR(255) NOT NULL,
        candidate_email VARCHAR(255) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        interview_type VARCHAR(50) DEFAULT 'technical',
        status VARCHAR(50) DEFAULT 'scheduled',
        scheduled_time TIMESTAMP,
        duration INTEGER DEFAULT 60,
        location VARCHAR(255) DEFAULT 'Video Call',
        meeting_link TEXT,
        calendly_link TEXT,
        google_form_link TEXT,
        panel_members TEXT,
        generated_questions TEXT,
        notes TEXT,
        scheduled_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const interviews = await database.all(`
      SELECT * FROM interviews 
      WHERE scheduled_by = ? 
      ORDER BY created_at DESC
    `, [req.user.id]);

    console.log('📋 Found interviews:', interviews?.length || 0);

    res.json({
      success: true,
      data: interviews || [],
      message: 'Interviews retrieved successfully'
    });

  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve interviews',
      error: error.message
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

    // Parse JSON fields
    if (interview.panel_members) {
      try {
        interview.panel_members = JSON.parse(interview.panel_members);
      } catch (e) {
        interview.panel_members = [];
      }
    }

    if (interview.generated_questions) {
      try {
        interview.generated_questions = JSON.parse(interview.generated_questions);
      } catch (e) {
        interview.generated_questions = null;
      }
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
 * POST /schedule - Schedule a new interview
 */
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    console.log('📅 Scheduling interview for user:', req.user.id);
    
    const {
      candidateId,
      candidateName,
      candidateEmail,
      jobTitle,
      interviewType,
      scheduledTime,
      duration,
      location,
      meetingLink,
      calendlyLink,
      googleFormLink,
      panelMembers,
      notes,
      sendEmail,
      jobDescription,
      candidateData
    } = req.body;

    // Validation
    if (!candidateName || !candidateEmail || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: candidateName, candidateEmail, jobTitle'
      });
    }

    await database.connect();

    // Generate interview ID
    const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Generate interview questions using AI
    let generatedQuestions = null;
    if (InterviewCoordinatorService) {
      try {
        generatedQuestions = await InterviewCoordinatorService.generateInterviewQuestions(
          jobDescription || `Position: ${jobTitle}`,
          candidateData || { name: candidateName },
          interviewType || 'technical'
        );
      } catch (error) {
        console.error('Question generation failed:', error.message);
      }
    }

    // Prepare panel members data
    const panelMembersData = panelMembers || [];
    const panelEmails = panelMembersData.map(p => p.email).filter(Boolean);

    // Insert interview record
    await database.run(`
      INSERT INTO interviews (
        id, candidate_id, candidate_name, candidate_email, job_title,
        interview_type, status, scheduled_time, duration, location,
        meeting_link, calendly_link, google_form_link, panel_members,
        generated_questions, notes, scheduled_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      interviewId,
      candidateId || interviewId,
      candidateName,
      candidateEmail,
      jobTitle,
      interviewType || 'technical',
      sendEmail ? 'invitation_sent' : 'draft',
      scheduledTime || null,
      duration || 60,
      location || 'Video Call',
      meetingLink || null,
      calendlyLink || null,
      googleFormLink || null,
      JSON.stringify(panelMembersData),
      generatedQuestions ? JSON.stringify(generatedQuestions) : null,
      notes || '',
      req.user.id
    ]);

    // Generate ICS invite
    let icsContent = null;
    if (scheduledTime && InterviewCoordinatorService) {
      icsContent = InterviewCoordinatorService.generateICSInvite({
        id: interviewId,
        candidateName,
        candidateEmail,
        jobTitle,
        interviewType: interviewType || 'technical',
        scheduledTime,
        duration: duration || 60,
        location: location || 'Video Call',
        meetingLink: meetingLink || '',
        panelMembers: panelMembersData,
        calendlyLink,
        googleFormLink
      });
    }

    // Send email invitation if requested
    let emailSent = false;
    if (sendEmail && scheduledTime && OutlookEmailService) {
      try {
        await OutlookEmailService.sendInterviewInvitation(
          req.user.id,
          candidateEmail,
          {
            candidateName,
            jobTitle,
            interviewType: interviewType || 'technical',
            scheduledTime,
            duration: duration || 60,
            location: location || 'Video Call',
            meetingLink: meetingLink || '',
            panelMembers: panelMembersData,
            panelEmails,
            calendlyLink,
            googleFormLink
          },
          icsContent
        );
        emailSent = true;
        console.log('✅ Interview invitation email sent successfully');
      } catch (error) {
        console.error('❌ Failed to send email:', error.message);
      }
    }

    // Generate reminders if scheduled
    if (scheduledTime && InterviewCoordinatorService) {
      try {
        const reminders = InterviewCoordinatorService.generateReminders(
          interviewId,
          scheduledTime,
          candidateEmail,
          panelEmails
        );

        // Create reminders table if needed
        await database.run(`
          CREATE TABLE IF NOT EXISTS interview_reminders (
            id VARCHAR(255) PRIMARY KEY,
            interview_id VARCHAR(255) NOT NULL,
            reminder_type VARCHAR(50) NOT NULL,
            recipient_email VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            send_at TIMESTAMP NOT NULL,
            sent BOOLEAN DEFAULT FALSE,
            sent_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
          )
        `);

        // Insert reminders
        for (const reminder of reminders) {
          await database.run(`
            INSERT INTO interview_reminders 
            (id, interview_id, reminder_type, recipient_email, message, send_at, sent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            reminder.id,
            reminder.interview_id,
            reminder.reminder_type,
            reminder.recipient_email,
            reminder.message,
            reminder.send_at,
            false
          ]);
        }

        console.log(`✅ Created ${reminders.length} reminders`);
      } catch (error) {
        console.error('❌ Failed to create reminders:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        interviewId,
        emailSent,
        hasQuestions: !!generatedQuestions,
        message: sendEmail 
          ? (emailSent ? 'Interview scheduled and invitation sent' : 'Interview scheduled but email failed')
          : 'Interview draft saved'
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
 * PUT /interview/:id - Update interview
 */
router.put('/interview/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, scheduledTime, duration, location, meetingLink } = req.body;

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

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (scheduledTime !== undefined) {
      updates.push('scheduled_time = ?');
      values.push(scheduledTime);
    }
    if (duration !== undefined) {
      updates.push('duration = ?');
      values.push(duration);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (meetingLink !== undefined) {
      updates.push('meeting_link = ?');
      values.push(meetingLink);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await database.run(`
      UPDATE interviews 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values);

    res.json({
      success: true,
      message: 'Interview updated successfully'
    });

  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview',
      error: error.message
    });
  }
});

/**
 * DELETE /interview/:id - Delete interview
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

    // Delete interview (reminders will cascade delete)
    await database.run('DELETE FROM interviews WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });

  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete interview',
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

    // Parse panel members
    let panelMembers = [];
    if (interview.panel_members) {
      try {
        panelMembers = JSON.parse(interview.panel_members);
      } catch (e) {
        panelMembers = [];
      }
    }

    const icsContent = InterviewCoordinatorService.generateICSInvite({
      id: interview.id,
      candidateName: interview.candidate_name,
      candidateEmail: interview.candidate_email,
      jobTitle: interview.job_title,
      interviewType: interview.interview_type,
      scheduledTime: interview.scheduled_time,
      duration: interview.duration,
      location: interview.location,
      meetingLink: interview.meeting_link,
      panelMembers,
      calendlyLink: interview.calendly_link,
      googleFormLink: interview.google_form_link
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="interview-${id}.ics"`);
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
 * POST /interview/:id/send-reminder - Manually send a reminder
 */
router.post('/interview/:id/send-reminder', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reminderType } = req.body;

    if (!OutlookEmailService) {
      return res.status(503).json({
        success: false,
        message: 'Email service not available'
      });
    }

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

    // Parse panel members
    let panelMembers = [];
    if (interview.panel_members) {
      try {
        panelMembers = JSON.parse(interview.panel_members);
      } catch (e) {
        panelMembers = [];
      }
    }

    // Send reminder to candidate
    await OutlookEmailService.sendInterviewReminder(
      req.user.id,
      interview.candidate_email,
      {
        candidateName: interview.candidate_name,
        jobTitle: interview.job_title,
        interviewType: interview.interview_type,
        scheduledTime: interview.scheduled_time,
        duration: interview.duration,
        location: interview.location,
        meetingLink: interview.meeting_link
      },
      reminderType || '2h_before'
    );

    res.json({
      success: true,
      message: 'Reminder sent successfully'
    });

  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reminder',
      error: error.message
    });
  }
});

module.exports = router;
