-- Migration: Add Google Calendar integration support
-- Date: 2025-10-30
-- Description: Add google_event_id to interviews table and Google OAuth tokens to users table

-- Add Google Calendar event ID to interviews table
ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Add Google OAuth tokens to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS google_email TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_interviews_google_event_id ON interviews(google_event_id);
CREATE INDEX IF NOT EXISTS idx_users_google_email ON users(google_email);
