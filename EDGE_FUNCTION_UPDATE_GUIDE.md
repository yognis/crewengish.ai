# Edge Function Update Guide - 5-Session System

## Overview

This document provides step-by-step instructions to update the `supabase/functions/exam-chat/index.ts` edge function to support the new 5-session system with category-specific prompts.

## Changes Required

### 1. Add Category Prompts and Helper Function

Add this code **after line 83** (after `let cachedEnv: EdgeFunctionEnv | null = null`):

```typescript
// Category-specific system prompts for the 5-session system
const CATEGORY_SYSTEM_PROMPTS: Record<string, string> = {
  introduction: `You are an English language examiner conducting a speaking test for Turkish Airlines employees.

This is SESSION 1: INTRODUCTION & PERSONAL (Easy level - A2/B1).

Focus: Personal background, daily routine, hobbies, hometown, career choice.
Generate 5 questions total for this session.
Keep questions simple and personal. Avoid complex aviation terminology.`,

  aviation: `You are an English language examiner conducting a speaking test for Turkish Airlines employees.

This is SESSION 2: AVIATION & PROFESSIONAL (Medium level - B1/B2).

Focus: Job responsibilities, safety procedures, passenger interactions, teamwork, emergency protocols.
Generate 5 questions total for this session.
Questions should be relevant to aviation and customer service.`,

  situational: `You are an English language examiner conducting a speaking test for Turkish Airlines employees.

This is SESSION 3: SITUATIONAL & PROBLEM-SOLVING (Medium level - B2).

Focus: Handling challenges, decision-making, conflict resolution, stress management.
Generate 5 questions total for this session.
Ask about specific scenarios and how they would respond.`,

  cultural: `You are an English language examiner conducting a speaking test for Turkish Airlines employees.

This is SESSION 4: CULTURAL & INTERNATIONAL (Medium-Hard level - B2/C1).

Focus: Cross-cultural communication, international destinations, language barriers, cultural adaptation.
Generate 5 questions total for this session.
Questions should test cultural awareness and adaptability.`,

  professional: `You are an English language examiner conducting a speaking test for Turkish Airlines employees.

This is SESSION 5: CAREER & PROFESSIONAL DEVELOPMENT (Hard level - C1/C2).

Focus: Career goals, leadership, industry knowledge, continuous learning, future trends.
Generate 5 questions total for this session.
Questions should be sophisticated and test higher-level communication.`,
}

function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    introduction: 'Introduction & Personal',
    aviation: 'Aviation & Professional',
    situational: 'Situational & Problem-Solving',
    cultural: 'Cultural & International',
    professional: 'Career & Development',
  }
  return names[category] || category
}
```

### 2. Update StartExamRequest Interface

Replace the `StartExamRequest` interface (around line 85-90) with:

```typescript
interface StartExamRequest {
  action: 'START_EXAM'
  userId: string
  totalQuestions?: number
  idempotencyKey?: string
  sessionCategory?: string // 'introduction' | 'aviation' | 'situational' | 'cultural' | 'professional'
  sessionNumber?: number // 1-5
}
```

### 3. Update START_EXAM Action

**Change 1:** Update the destructuring (around line 150-154):

```typescript
const {
  userId,
  idempotencyKey,
  totalQuestions,
  sessionCategory = 'introduction',
  sessionNumber = 1,
} = body as StartExamRequest

// Default to 5 questions per session for new system
const normalizedTotalQuestions = Number.isFinite(totalQuestions) && totalQuestions > 0
  ? Math.min(Math.floor(totalQuestions), 50)
  : 5
```

**Change 2:** Update session creation (around line 229-240):

```typescript
// Create exam session with category info
const { data: session, error: sessionError } = await supabaseClient
  .from('exam_sessions')
  .insert({
    user_id: userId,
    status: 'in_progress',
    total_questions: normalizedTotalQuestions,
    current_question_number: 0,
    credits_charged: 1,
    idempotency_key: idempotencyKey,
    session_category: sessionCategory,
    session_number: sessionNumber,
    category_display_name: getCategoryDisplayName(sessionCategory),
  })
  .select()
  .single()
```

**Change 3:** Update question generation prompt (around line 250-269):

```typescript
// Generate first question with GPT-4 using category-specific prompt
const categoryPrompt = CATEGORY_SYSTEM_PROMPTS[sessionCategory] || CATEGORY_SYSTEM_PROMPTS.introduction

const systemPrompt = `${categoryPrompt}

User Profile:
- Role: ${profile.role || 'Aviation professional'}
- Experience: ${profile.experience_level || 'Intermediate'}
- Department: ${profile.department || 'Flight operations'}

Generate Question 1 of 5 for this session.

Return ONLY a JSON object with this structure:
{
  "question_text": "Your question here",
  "question_context": "Additional context or scenario (optional)",
  "difficulty": "easy|medium|hard"
}`
```

### 4. Update SUBMIT_ANSWER - Next Question Generation

Find the section that generates the next question (around line 499-528) and replace:

```typescript
const previousTopics = previousQuestions?.map(q => q.question_text).join('\n') || ''

// Get session category for context-aware question generation
const sessionCategory = session.session_category || 'introduction'
const categoryPrompt = CATEGORY_SYSTEM_PROMPTS[sessionCategory] || CATEGORY_SYSTEM_PROMPTS.introduction

const nextQuestionPrompt = `Generate the next question (Question ${nextQuestionNumber}/${session.total_questions}).

Previous questions:
${previousTopics}

User's last performance: ${scores.overall_score}/100

Generate a NEW question that:
1. Tests a DIFFERENT aspect/topic than previous questions
2. Maintains the session category focus: ${getCategoryDisplayName(sessionCategory)}
3. Adjusts difficulty based on performance (${scores.overall_score >= 80 ? 'increase difficulty slightly' : 'maintain appropriate level'})
4. Avoids repeating previous topics

Return ONLY JSON:
{
  "question_text": "Your question",
  "question_context": "Context (optional)",
  "difficulty": "easy|medium|hard"
}`

const followUpSystemPrompt = categoryPrompt
```

## Testing Checklist

After making these changes:

1. ✅ Deploy the edge function to Supabase
2. ✅ Test starting Session 1 (should work with default category)
3. ✅ Test starting Session 2 (should require Session 1 completion)
4. ✅ Verify questions match the session category
5. ✅ Verify session completes after 5 questions (not 20)
6. ✅ Check database for session_category, session_number, category_display_name fields

## File Location

The edge function file is located at:
```
supabase/functions/exam-chat/index.ts
```

## Deployment

After making changes, deploy using:
```bash
supabase functions deploy exam-chat
```

Or use the Supabase Dashboard to deploy.

