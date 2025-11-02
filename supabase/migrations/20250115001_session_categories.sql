-- Migration: Add Session Categories and 5-Question Session Support
-- This migration adds support for 5 separate exam sessions with categories

-- 1. Add new columns to exam_sessions table
ALTER TABLE public.exam_sessions
ADD COLUMN IF NOT EXISTS session_category TEXT CHECK (session_category IN ('introduction', 'aviation', 'situational', 'cultural', 'professional')),
ADD COLUMN IF NOT EXISTS session_number INTEGER CHECK (session_number BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS category_display_name TEXT;

-- 2. Update default total_questions from 20 to 5
ALTER TABLE public.exam_sessions
ALTER COLUMN total_questions SET DEFAULT 5;

-- 3. Update the check constraint to allow 5 questions minimum
ALTER TABLE public.exam_sessions
DROP CONSTRAINT IF EXISTS exam_sessions_total_questions_check;

ALTER TABLE public.exam_sessions
ADD CONSTRAINT exam_sessions_total_questions_check CHECK (total_questions BETWEEN 1 AND 50);

-- 4. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_exam_sessions_category ON public.exam_sessions(session_category);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_category ON public.exam_sessions(user_id, session_category);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_session_number ON public.exam_sessions(session_number);

-- 5. Add comment for documentation
COMMENT ON COLUMN public.exam_sessions.session_category IS 'Category of the exam session: introduction, aviation, situational, cultural, or professional';
COMMENT ON COLUMN public.exam_sessions.session_number IS 'Session number from 1 to 5, indicating the order of sessions';
COMMENT ON COLUMN public.exam_sessions.category_display_name IS 'Human-readable display name for the session category';

