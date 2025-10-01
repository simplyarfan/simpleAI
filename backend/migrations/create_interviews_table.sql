-- Interview Coordinator Database Schema (PostgreSQL/Neon)
-- Table for storing interview schedules and coordination data

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
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_by ON interviews(scheduled_by);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_email ON interviews(candidate_email);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_time ON interviews(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Table for interview reminders
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
);

CREATE INDEX IF NOT EXISTS idx_interview_reminders_interview_id ON interview_reminders(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_reminders_send_at ON interview_reminders(send_at);
CREATE INDEX IF NOT EXISTS idx_interview_reminders_sent ON interview_reminders(sent);
