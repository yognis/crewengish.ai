-- =====================================================
-- Cleanup Script for Stuck In-Progress Exam Sessions
-- =====================================================
-- This script fixes sessions that are stuck as 'in_progress'
-- due to the old back button bug (before the fix was applied)
--
-- IMPORTANT: Run this in your Supabase SQL Editor
-- =====================================================

-- STEP 1: View all stuck sessions first (SAFE - just viewing)
-- This helps you understand what will be affected
SELECT
  id,
  user_id,
  status,
  current_question_number,
  total_questions,
  created_at,
  updated_at,
  -- Calculate how long the session has been stuck
  EXTRACT(EPOCH FROM (NOW() - updated_at))/3600 AS hours_since_last_update
FROM exam_sessions
WHERE status = 'in_progress'
ORDER BY created_at DESC;

-- =====================================================
-- STEP 2: Mark all stuck sessions as 'exited' (DESTRUCTIVE)
-- ⚠️ Only run this AFTER reviewing the results from STEP 1
-- =====================================================

-- Uncomment the lines below to execute the cleanup:
/*
UPDATE exam_sessions
SET
  status = 'exited',
  updated_at = NOW()
WHERE status = 'in_progress';
*/

-- =====================================================
-- STEP 3: Verify the cleanup worked (SAFE - just viewing)
-- Run this after STEP 2 to confirm no sessions are stuck
-- =====================================================

/*
SELECT
  status,
  COUNT(*) as count
FROM exam_sessions
GROUP BY status
ORDER BY status;
*/

-- =====================================================
-- OPTIONAL: More Targeted Cleanup
-- Only clean up sessions older than 1 hour
-- =====================================================

/*
UPDATE exam_sessions
SET
  status = 'exited',
  updated_at = NOW()
WHERE
  status = 'in_progress'
  AND updated_at < NOW() - INTERVAL '1 hour';
*/

-- =====================================================
-- OPTIONAL: Delete old sessions instead of marking as exited
-- ⚠️ This permanently removes the data
-- =====================================================

/*
DELETE FROM exam_sessions
WHERE
  status = 'in_progress'
  AND updated_at < NOW() - INTERVAL '24 hours';
*/
