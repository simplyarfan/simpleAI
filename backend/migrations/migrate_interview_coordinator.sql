-- Interview Coordinator Database Migration
-- Run this to update your database schema

-- Step 1: Backup existing data (optional, uncomment if needed)
-- CREATE TABLE interviews_backup AS SELECT * FROM interviews;

-- Step 2: Drop old tables
DROP TABLE IF EXISTS interview_feedback;
DROP TABLE IF EXISTS interview_panel;
DROP TABLE IF EXISTS interview_reminders;
DROP TABLE IF EXISTS interviews;

-- Step 3: Create new interviews table
CREATE TABLE interviews (
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

-- Step 4: Create indexes for performance
CREATE INDEX idx_interviews_scheduled_by ON interviews(scheduled_by);
CREATE INDEX idx_interviews_candidate_email ON interviews(candidate_email);
CREATE INDEX idx_interviews_scheduled_time ON interviews(scheduled_time);
CREATE INDEX idx_interviews_status ON interviews(status);

-- Step 5: Create reminders table
CREATE TABLE interview_reminders (
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

-- Step 6: Create reminder indexes
CREATE INDEX idx_interview_reminders_interview_id ON interview_reminders(interview_id);
CREATE INDEX idx_interview_reminders_send_at ON interview_reminders(send_at);
CREATE INDEX idx_interview_reminders_sent ON interview_reminders(sent);

-- Step 7: Add Outlook OAuth columns to users table (if not already present)
-- Note: These may already exist, so we use IF NOT EXISTS
ALTER TABLE users ADD COLUMN IF NOT EXISTS outlook_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS outlook_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS outlook_token_expires_at TIMESTAMP;

-- Step 8: Verify tables were created
SELECT 'Interviews table created' AS status;
SELECT COUNT(*) AS interview_count FROM interviews;
SELECT 'Interview reminders table created' AS status;
SELECT COUNT(*) AS reminder_count FROM interview_reminders;

-- Migration complete!
