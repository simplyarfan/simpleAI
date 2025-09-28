/**
 * INTERVIEW COORDINATOR ROUTES (HR-02)
 * API endpoints for interview scheduling and coordination
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
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

// GET /api/interview-coordinator/interviews - Get all interviews
router.get('/interviews', authenticateToken, async (req, res) => {
  try {
    await database.connect();
    
    const interviews = await database.all(`
      SELECT * FROM interviews 
      WHERE user_id = $1 
      ORDER BY scheduled_time DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: interviews,
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

// POST /api/interview-coordinator/schedule - Schedule new interview
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const {
      candidate_id,
      job_description,
      interview_details,
      panel_members
    } = req.body;

    if (!candidate_id || !interview_details) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: candidate_id, interview_details'
      });
    }

    await database.connect();

    // Get candidate data
    const candidate = await database.get(`
      SELECT * FROM cv_candidates WHERE id = $1
    `, [candidate_id]);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Prepare candidate data for interview coordinator
    const candidateData = {
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      experience_years: candidate.experience_match,
      education: candidate.education_match,
      skills: candidate.analysis_data ? 
        JSON.parse(candidate.analysis_data).matched_skills || [] : []
    };

    // Use Interview Coordinator Service
    if (!InterviewCoordinatorService) {
      throw new Error('Interview Coordinator Service not available');
    }

    const coordination = await InterviewCoordinatorService.coordinateInterview(
      candidateData,
      job_description || 'Job description not provided',
      {
        ...interview_details,
        panel: panel_members || []
      }
    );

    if (!coordination.success) {
      throw new Error(coordination.error || 'Interview coordination failed');
    }

    // Store interview in database
    const interviewId = uuidv4();
    await database.run(`
      INSERT INTO interviews (
        id, user_id, candidate_id, title, type, scheduled_time, 
        duration, location, meeting_link, status, panel_data, 
        questions_data, reminders_data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
    `, [
      interviewId,
      req.user.id,
      candidate_id,
      coordination.schedule.interview.title,
      coordination.schedule.interview.type,
      coordination.schedule.interview.scheduled_time,
      coordination.schedule.interview.duration,
      coordination.schedule.interview.location,
      coordination.schedule.interview.meeting_link || '',
      'scheduled',
      JSON.stringify(coordination.schedule.panel),
      JSON.stringify(coordination.questions),
      JSON.stringify(coordination.reminders)
    ]);

    res.json({
      success: true,
      data: {
        interview_id: interviewId,
        schedule: coordination.schedule,
        questions: coordination.questions,
        ics_invite: coordination.ics_invite,
        conflict_check: coordination.conflict_check
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

// GET /api/interview-coordinator/interview/:id - Get interview details
router.get('/interview/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await database.connect();
    
    const interview = await database.get(`
      SELECT i.*, c.name as candidate_name, c.email as candidate_email, c.phone as candidate_phone
      FROM interviews i
      LEFT JOIN cv_candidates c ON i.candidate_id = c.id
      WHERE i.id = $1 AND i.user_id = $2
    `, [id, req.user.id]);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Parse JSON data
    const interviewData = {
      ...interview,
      panel_data: interview.panel_data ? JSON.parse(interview.panel_data) : [],
      questions_data: interview.questions_data ? JSON.parse(interview.questions_data) : {},
      reminders_data: interview.reminders_data ? JSON.parse(interview.reminders_data) : []
    };

    res.json({
      success: true,
      data: interviewData,
      message: 'Interview details retrieved successfully'
    });

  } catch (error) {
    console.error('Get interview details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve interview details',
      error: error.message
    });
  }
});

// POST /api/interview-coordinator/questions/generate - Generate interview questions
router.post('/questions/generate', authenticateToken, async (req, res) => {
  try {
    const { candidate_id, job_description, interview_type } = req.body;

    if (!candidate_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: candidate_id'
      });
    }

    await database.connect();

    // Get candidate data
    const candidate = await database.get(`
      SELECT * FROM cv_candidates WHERE id = $1
    `, [candidate_id]);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Prepare candidate data
    const candidateData = {
      name: candidate.name,
      experience_years: candidate.experience_match,
      skills: candidate.analysis_data ? 
        JSON.parse(candidate.analysis_data).matched_skills || [] : [],
      education: candidate.education_match,
      current_role: 'Not specified'
    };

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
      SELECT * FROM interviews WHERE id = $1 AND user_id = $2
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
      SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
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
      SELECT i.*, c.name as candidate_name, c.email as candidate_email
      FROM interviews i
      LEFT JOIN cv_candidates c ON i.candidate_id = c.id
      WHERE i.id = $1 AND i.user_id = $2
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
