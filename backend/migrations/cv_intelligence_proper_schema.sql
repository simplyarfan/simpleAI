-- CV Intelligence (HR-01) Proper Schema for Neon Postgres
-- Based on the system design: Pydantic JSON schema + spaCy + pgvector

-- Enable pgvector extension for semantic similarity
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing tables to recreate with proper schema
DROP TABLE IF EXISTS cv_candidates CASCADE;
DROP TABLE IF EXISTS cv_batches CASCADE;

-- Raw resumes storage table
CREATE TABLE resumes_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage signed URL
  file_size INTEGER,
  file_type VARCHAR(50),
  upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  raw_text TEXT, -- Extracted text from PDF/Docx
  processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Structured resume entities with Pydantic JSON schema
CREATE TABLE resume_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- name, email, phone, date, skill, company, etc.
  entity_value TEXT NOT NULL,
  confidence_score FLOAT DEFAULT 0.0,
  start_offset INTEGER, -- Character offset for evidence binding
  end_offset INTEGER,   -- Character offset for evidence binding
  spacy_label VARCHAR(50), -- spaCy NER label
  context_window TEXT, -- ±30 chars around entity for skill credit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes_raw(id) ON DELETE CASCADE
);

-- Job descriptions and requirements
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements_json JSONB NOT NULL, -- Structured requirements with must-haves
  embedding VECTOR(1536), -- OpenAI embeddings for semantic similarity
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CV analysis batches
CREATE TABLE cv_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  job_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
  total_resumes INTEGER DEFAULT 0,
  processed_resumes INTEGER DEFAULT 0,
  processing_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Metrics and events for tracking
CREATE TABLE metrics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  resume_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- extraction, scoring, verification
  event_data JSONB NOT NULL,
  field_validity_rate FLOAT,
  evidence_coverage FLOAT,
  disagreement_rate FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES cv_batches(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes_raw(id) ON DELETE CASCADE
);

-- Final candidate profiles with strict JSON schema
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  resume_id UUID NOT NULL,
  
  -- Personal Information (extracted and verified)
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(255),
  linkedin_url TEXT,
  
  -- Professional Profile (Pydantic validated)
  profile_json JSONB NOT NULL, -- Strict schema: jobs, dates, skills, education, certs
  
  -- Scoring Components
  must_have_score FLOAT DEFAULT 0.0, -- Boolean rules gate
  semantic_score FLOAT DEFAULT 0.0,  -- pgvector similarity
  recency_score FLOAT DEFAULT 0.0,   -- Time-weighted experience
  impact_score FLOAT DEFAULT 0.0,    -- Action verbs bonus
  overall_score FLOAT DEFAULT 0.0,   -- Combined weighted score
  
  -- Evidence and Verification
  evidence_offsets JSONB, -- Character positions for highlight-on-click
  verification_data JSONB, -- Second pass verification results
  
  -- Metadata
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (batch_id) REFERENCES cv_batches(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes_raw(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_resumes_raw_user_id ON resumes_raw(user_id);
CREATE INDEX idx_resumes_raw_status ON resumes_raw(processing_status);

CREATE INDEX idx_resume_entities_resume_id ON resume_entities(resume_id);
CREATE INDEX idx_resume_entities_type ON resume_entities(entity_type);
CREATE INDEX idx_resume_entities_offsets ON resume_entities(start_offset, end_offset);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_embedding ON jobs USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_cv_batches_user_id ON cv_batches(user_id);
CREATE INDEX idx_cv_batches_job_id ON cv_batches(job_id);
CREATE INDEX idx_cv_batches_status ON cv_batches(status);

CREATE INDEX idx_candidates_batch_id ON candidates(batch_id);
CREATE INDEX idx_candidates_overall_score ON candidates(overall_score DESC);
CREATE INDEX idx_candidates_must_have_score ON candidates(must_have_score DESC);

CREATE INDEX idx_metrics_events_batch_id ON metrics_events(batch_id);
CREATE INDEX idx_metrics_events_type ON metrics_events(event_type);

-- Views for analytics and reporting
CREATE VIEW candidate_rankings AS
SELECT 
  c.*,
  ROW_NUMBER() OVER (PARTITION BY c.batch_id ORDER BY c.overall_score DESC) as rank,
  j.title as job_title,
  b.name as batch_name
FROM candidates c
JOIN cv_batches b ON c.batch_id = b.id
JOIN jobs j ON b.job_id = j.id;

-- Function to calculate semantic similarity
CREATE OR REPLACE FUNCTION calculate_semantic_similarity(
  resume_embedding VECTOR(1536),
  job_embedding VECTOR(1536)
) RETURNS FLOAT AS $$
BEGIN
  RETURN 1 - (resume_embedding <=> job_embedding);
END;
$$ LANGUAGE plpgsql;
