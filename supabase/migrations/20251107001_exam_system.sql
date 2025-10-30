-- Migration: Dynamic English Exam System
-- Creates exam_sessions and exam_questions tables plus policies, indexes, and helper queries.

-- 1. Exam session status enum -------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'exam_session_status'
  ) THEN
    CREATE TYPE public.exam_session_status AS ENUM (
      'pending',
      'in_progress',
      'completed',
      'exited'
    );
  END IF;
END
$$;

-- 2. Exam sessions table ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.exam_session_status NOT NULL DEFAULT 'pending',
  total_questions INT NOT NULL DEFAULT 20 CHECK (total_questions BETWEEN 1 AND 50),
  current_question_number INT NOT NULL DEFAULT 0 CHECK (current_question_number >= 0),
  overall_score NUMERIC(5,2),
  credits_charged INT NOT NULL DEFAULT 1 CHECK (credits_charged >= 0),
  credits_refunded INT NOT NULL DEFAULT 0 CHECK (credits_refunded >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key TEXT UNIQUE
);

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.set_exam_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_exam_session_updated_at ON public.exam_sessions;
CREATE TRIGGER trg_set_exam_session_updated_at
  BEFORE UPDATE ON public.exam_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_exam_session_updated_at();

-- 3. Exam questions table -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  question_number INT NOT NULL CHECK (question_number >= 1),
  question_text TEXT NOT NULL,
  question_context TEXT,
  audio_url TEXT,
  transcription TEXT,
  scores JSONB,
  overall_score NUMERIC(5,2),
  feedback TEXT,
  strengths TEXT[],
  improvements TEXT[],
  submitted_at TIMESTAMPTZ,
  scored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Row-Level Security -------------------------------------------------------
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own exam sessions" ON public.exam_sessions;
CREATE POLICY "Users manage own exam sessions"
  ON public.exam_sessions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see questions in their sessions" ON public.exam_questions;
CREATE POLICY "Users see questions in their sessions"
  ON public.exam_questions
  USING (
    EXISTS (
      SELECT 1
      FROM public.exam_sessions s
      WHERE s.id = session_id
        AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.exam_sessions s
      WHERE s.id = session_id
        AND s.user_id = auth.uid()
    )
  );

-- 5. Indexes ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_status
  ON public.exam_sessions (user_id, status);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_created_at
  ON public.exam_sessions (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_exam_questions_session_number
  ON public.exam_questions (session_id, question_number);

-- 6. Sample queries -----------------------------------------------------------
-- Start a session and fetch the first unanswered question
-- SELECT *
-- FROM public.exam_sessions
-- WHERE user_id = auth.uid()
-- ORDER BY created_at DESC
-- LIMIT 1;

-- Get detailed progress for a session
-- SELECT q.question_number,
--        q.overall_score,
--        q.transcription,
--        q.feedback
-- FROM public.exam_questions q
-- WHERE q.session_id = :session_id
-- ORDER BY q.question_number ASC;

-- Calculate average score for completion
-- SELECT AVG(q.overall_score) AS avg_score
-- FROM public.exam_questions q
-- WHERE q.session_id = :session_id
--   AND q.overall_score IS NOT NULL;
