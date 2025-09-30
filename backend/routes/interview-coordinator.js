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

const router = express.Router();

// GET /interviews - Get all interviews for the user
router.get('/interviews', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Getting interviews for user:', req.user.id);
    await database.connect();
    
    // Create interviews table if it doesn't exist
    await database.run(`
      CREATE TABLE IF NOT EXISTS interviews (
        id VARCHAR(255) PRIMARY KEY,
        candidate_id VARCHAR(255) NOT NULL,
        candidate_name VARCHAR(255),
        candidate_email VARCHAR(255),
        job_title VARCHAR(255),
        interview_type VARCHAR(50) DEFAULT 'technical',
        status VARCHAR(50) DEFAULT 'invitation_sent',
        calendly_link TEXT,
        google_form_link TEXT,
        scheduled_time TIMESTAMP,
        meeting_link TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        scheduled_by INTEGER
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

// POST /schedule - Schedule a new interview
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    console.log('📅 Scheduling interview for user:', req.user.id);
    console.log('📅 Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      title,
      candidateId,
      candidateName,
      candidateEmail,
      scheduledTime,
      duration,
      location,
      meetingLink,
      type,
      panelMembers,
      notes,
      calendlyLink,
      googleFormLink,
      emailSubject,
      emailBody,
      sendEmail
    } = req.body;

    await database.connect();

    // Create interviews table if it doesn't exist
    await database.run(`
      CREATE TABLE IF NOT EXISTS interviews (
        id VARCHAR(255) PRIMARY KEY,
        candidate_id VARCHAR(255) NOT NULL,
        candidate_name VARCHAR(255),
        candidate_email VARCHAR(255),
        job_title VARCHAR(255),
        interview_type VARCHAR(50) DEFAULT 'technical',
        status VARCHAR(50) DEFAULT 'invitation_sent',
        calendly_link TEXT,
        google_form_link TEXT,
        scheduled_time TIMESTAMP,
        meeting_link TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        scheduled_by INTEGER
      )
    `);

    // Generate interview ID
    const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Insert interview record
    await database.run(`
      INSERT INTO interviews (
        id, candidate_id, candidate_name, candidate_email, job_title,
        interview_type, status, calendly_link, google_form_link, 
        scheduled_time, meeting_link, notes, scheduled_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      interviewId,
      candidateId || interviewId,
      candidateName,
      candidateEmail,
      title,
      type || 'technical',
      sendEmail ? 'invitation_sent' : 'draft',
      calendlyLink,
      googleFormLink,
      scheduledTime || null,
      meetingLink || null,
      notes || '',
      req.user.id
    ]);

    // TODO: Send email if sendEmail is true
    // This would integrate with your email service (SendGrid, etc.)
    if (sendEmail && emailSubject && emailBody) {
      console.log('📧 Email would be sent:', {
        to: candidateEmail,
        subject: emailSubject,
        body: emailBody
      });
    }

    res.json({
      success: true,
      data: {
        interviewId: interviewId,
        message: sendEmail ? 'Interview scheduled and invitation sent' : 'Interview draft saved'
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

// GET /api/interview-coordinator/interview/:id/questions - Generate interview questions
router.get('/interview/:id/questions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { job_description, candidateData, interview_type } = req.query;

    if (!InterviewCoordinatorService) {
      throw new Error('Interview Coordinator Service not available');
    }

    const questions = await InterviewCoordinatorService.generateInterviewQuestions(
      job_description || 'Job description not provided',
      candidateData,
      interview_type || 'technical'
    );

    res.json({
      success: true,
      data: questions,
      message: 'Interview questions generated successfully'
    });

  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate interview questions',
      error: error.message
    });
  }
});

// PUT /api/interview-coordinator/interview/:id/status - Update interview status
router.put('/interview/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: status'
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

    // Update interview status
    await database.run(`
      UPDATE interviews 
      SET status = ?, notes = ?
      WHERE id = ?
    `, [status, notes || '', id]);

    res.json({
      success: true,
      message: 'Interview status updated successfully'
    });

  } catch (error) {
    console.error('Update interview status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview status',
      error: error.message
    });
  }
});

// GET /api/interview-coordinator/calendar/:id/ics - Download ICS calendar file
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

    if (!InterviewCoordinatorService) {
      throw new Error('Interview Coordinator Service not available');
    }

    // Prepare schedule data for ICS generation
    const schedule = {
      id: interview.id,
      candidate: {
        name: interview.candidate_name,
        email: interview.candidate_email
      },
      interview: {
        title: interview.title,
        scheduled_time: interview.scheduled_time,
        duration: interview.duration,
        location: interview.location,
        meeting_link: interview.meeting_link
      },
      panel: interview.panel_data ? JSON.parse(interview.panel_data) : []
    };

    const icsContent = InterviewCoordinatorService.generateICSInvite(schedule);

    res.setHeader('Content-Type', 'text/calendar');
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

module.exports = router;
