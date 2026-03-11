-- Intervio Full System: Add scoring + plan columns to interview_sessions
-- Migration: 20260311_intervio_scoring_system.sql

-- Add interview_plan column (JSONB) to store structured plan generated at session start
ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS interview_plan JSONB DEFAULT NULL;

-- Add cv_match_score (from application matching, carries into session)
ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS cv_match_score INTEGER DEFAULT NULL;

-- Add final_score (0–100, weighted composite from Intervio spec formula)
ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS final_score INTEGER DEFAULT NULL;

-- Add hire_probability (0–100, computed from final_score via Intervio spec formula)
ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS hire_probability INTEGER DEFAULT NULL;

-- Add score_breakdown (JSONB: {cv_match, technical, communication, confidence, behavioral})
ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT NULL;

-- Add feedback_summary (AI-generated plain text summary at interview end)
ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS feedback_summary TEXT DEFAULT NULL;

-- Also add question_type column to interview_turns if not present
ALTER TABLE interview_turns
    ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'follow_up';

-- Add analysis JSONB to interview_turns to store per-turn scoring
ALTER TABLE interview_turns
    ADD COLUMN IF NOT EXISTS analysis JSONB DEFAULT NULL;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_interview_sessions_final_score ON interview_sessions(final_score);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_status ON interview_sessions(user_id, status);
