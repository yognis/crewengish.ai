-- THY English Speaking Test Simulator Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT CHECK (department IN ('pilot', 'cabin_crew', 'ground_staff', 'other')) NOT NULL,
  credits INTEGER DEFAULT 0 CHECK (credits >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test sessions table
CREATE TABLE test_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  test_type TEXT CHECK (test_type IN ('full_test', 'quick_practice', 'custom')) NOT NULL,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
  overall_score DECIMAL(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  fluency_score DECIMAL(5,2) CHECK (fluency_score >= 0 AND fluency_score <= 100),
  grammar_score DECIMAL(5,2) CHECK (grammar_score >= 0 AND grammar_score <= 100),
  vocabulary_score DECIMAL(5,2) CHECK (vocabulary_score >= 0 AND vocabulary_score <= 100),
  pronunciation_score DECIMAL(5,2) CHECK (pronunciation_score >= 0 AND pronunciation_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Test responses table
CREATE TABLE test_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  transcript TEXT NOT NULL,
  score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100) NOT NULL,
  feedback TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions table
CREATE TABLE credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam sessions table (for new exam flow with edge functions)
CREATE TABLE exam_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'exited')) DEFAULT 'pending',
  current_question_number INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 5,
  overall_score DECIMAL(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  fluency_score DECIMAL(5,2) CHECK (fluency_score >= 0 AND fluency_score <= 100),
  grammar_score DECIMAL(5,2) CHECK (grammar_score >= 0 AND grammar_score <= 100),
  vocabulary_score DECIMAL(5,2) CHECK (vocabulary_score >= 0 AND vocabulary_score <= 100),
  pronunciation_score DECIMAL(5,2) CHECK (pronunciation_score >= 0 AND pronunciation_score <= 100),
  relevance_score DECIMAL(5,2) CHECK (relevance_score >= 0 AND relevance_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Exam responses table (answers for each question in exam flow)
CREATE TABLE exam_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE NOT NULL,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  fluency_score DECIMAL(5,2) CHECK (fluency_score >= 0 AND fluency_score <= 100),
  grammar_score DECIMAL(5,2) CHECK (grammar_score >= 0 AND grammar_score <= 100),
  vocabulary_score DECIMAL(5,2) CHECK (vocabulary_score >= 0 AND vocabulary_score <= 100),
  pronunciation_score DECIMAL(5,2) CHECK (pronunciation_score >= 0 AND pronunciation_score <= 100),
  relevance_score DECIMAL(5,2) CHECK (relevance_score >= 0 AND relevance_score <= 100),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_test_sessions_user_id ON test_sessions(user_id);
CREATE INDEX idx_test_sessions_created_at ON test_sessions(created_at DESC);
CREATE INDEX idx_test_responses_session_id ON test_responses(session_id);
CREATE INDEX idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_status ON exam_sessions(status);
CREATE INDEX idx_exam_sessions_created_at ON exam_sessions(created_at DESC);
CREATE INDEX idx_exam_responses_session_id ON exam_responses(session_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Test sessions policies
CREATE POLICY "Users can view their own test sessions"
  ON test_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test sessions"
  ON test_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test sessions"
  ON test_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Test responses policies
CREATE POLICY "Users can view their own test responses"
  ON test_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM test_sessions
      WHERE test_sessions.id = test_responses.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own test responses"
  ON test_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_sessions
      WHERE test_sessions.id = test_responses.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

-- Exam sessions policies
CREATE POLICY "Users can view their own exam sessions"
  ON exam_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exam sessions"
  ON exam_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam sessions"
  ON exam_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Exam responses policies
CREATE POLICY "Users can view their own exam responses"
  ON exam_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exam_sessions
      WHERE exam_sessions.id = exam_responses.session_id
      AND exam_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own exam responses"
  ON exam_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_sessions
      WHERE exam_sessions.id = exam_responses.session_id
      AND exam_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own exam responses"
  ON exam_responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exam_sessions
      WHERE exam_sessions.id = exam_responses.session_id
      AND exam_sessions.user_id = auth.uid()
    )
  );

-- Credit transactions policies
CREATE POLICY "Users can view their own credit transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (true);

-- Functions

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, department, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'other'),
    3 -- Welcome bonus: 3 free credits
  );
  
  -- Record welcome bonus
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 3, 'bonus', 'Welcome bonus');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to deduct credits (called from application)
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits with row lock
  SELECT credits INTO current_credits
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Check if user has enough credits
  IF current_credits < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE profiles
  SET credits = credits - p_amount
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'usage', p_description);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('test-recordings', 'test-recordings', false);

-- Storage policies
CREATE POLICY "Users can upload their own recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'test-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'test-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );







