-- Interview Coordinator Database Schema (HR-02)
-- Table for storing interview schedules and coordination data

CREATE TABLE IF NOT EXISTS interviews (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  candidate_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'technical',
  scheduled_time TIMESTAMP NOT NULL,
  duration INTEGER DEFAULT 60, -- minutes
  location VARCHAR(255) DEFAULT 'Video Call',
  meeting_link TEXT,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled
  panel_data TEXT, -- JSON array of panel members
  questions_data TEXT, -- JSON object with generated questions
  reminders_data TEXT, -- JSON array of reminder schedules
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES cv_candidates(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_time ON interviews(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Table for interview panel members
CREATE TABLE IF NOT EXISTS interview_panel (
  id VARCHAR(36) PRIMARY KEY,
  interview_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  department VARCHAR(100),
  is_lead BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

-- Index for panel members
CREATE INDEX IF NOT EXISTS idx_interview_panel_interview_id ON interview_panel(interview_id);

-- Table for interview reminders and notifications
CREATE TABLE IF NOT EXISTS interview_reminders (
  id VARCHAR(36) PRIMARY KEY,
  interview_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 24h_before, 2h_before, 15m_before
  recipient_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  send_at TIMESTAMP NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

-- Index for reminders
CREATE INDEX IF NOT EXISTS idx_interview_reminders_interview_id ON interview_reminders(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_reminders_send_at ON interview_reminders(send_at);
CREATE INDEX IF NOT EXISTS idx_interview_reminders_sent ON interview_reminders(sent);

-- Table for interview feedback and evaluation
CREATE TABLE IF NOT EXISTS interview_feedback (
  id VARCHAR(36) PRIMARY KEY,
  interview_id VARCHAR(36) NOT NULL,
  evaluator_email VARCHAR(255) NOT NULL,
  evaluator_name VARCHAR(255),
  technical_score INTEGER, -- 1-10
  communication_score INTEGER, -- 1-10
  cultural_fit_score INTEGER, -- 1-10
  overall_recommendation VARCHAR(50), -- strong_hire, hire, consider, pass
  strengths TEXT,
  concerns TEXT,
  detailed_feedback TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

-- Index for feedback
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON interview_feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_evaluator ON interview_feedback(evaluator_email);
