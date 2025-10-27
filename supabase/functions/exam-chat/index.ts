// exam-chat Edge Function - OpenAI GPT-4 Version
// exam-chat Edge Function - OpenAI GPT-4 Version
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import OpenAI from 'https://esm.sh/openai@4.28.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Environment variable validation
interface EdgeFunctionEnv {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  OPENAI_API_KEY: string
  APP_BASE_URL: string
}

function validateEnvironment(): EdgeFunctionEnv {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'APP_BASE_URL',
  ]

  const missing: string[] = []

  for (const varName of requiredVars) {
    const value = Deno.env.get(varName)
    if (!value || value.trim() === '') {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    const errorMessage =
      `Missing required environment variables: ${missing.join(', ')}\n\n` +
      `Please add them in Supabase Dashboard:\n` +
      `Project Settings -> Edge Functions -> Secrets`

    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const openaiKey = Deno.env.get('OPENAI_API_KEY')!
  const appBaseUrl = Deno.env.get('APP_BASE_URL')!

  let parsedAppBaseUrl: URL
  try {
    parsedAppBaseUrl = new URL(appBaseUrl)
  } catch {
    const errorMessage = `Invalid APP_BASE_URL: ${appBaseUrl}. Provide a fully qualified URL (e.g. https://your-app.vercel.app).`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  if (['localhost', '127.0.0.1'].includes(parsedAppBaseUrl.hostname)) {
    const errorMessage =
      `APP_BASE_URL points to ${parsedAppBaseUrl.hostname}, which is not reachable from Supabase Edge Functions.\n` +
      `Set APP_BASE_URL to your deployed web app URL (e.g. https://your-app.vercel.app) in Project Settings -> Edge Functions -> Secrets.`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  console.log('[env] Validation passed')
  console.log('[env] SUPABASE_URL:', supabaseUrl)
  console.log('[env] OPENAI_API_KEY:', 'set')
  console.log('[env] SUPABASE_SERVICE_ROLE_KEY:', 'set')
  console.log('[env] APP_BASE_URL:', parsedAppBaseUrl.origin)

  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
    OPENAI_API_KEY: openaiKey,
    APP_BASE_URL: parsedAppBaseUrl.origin,
  }
}

let cachedEnv: EdgeFunctionEnv | null = null

interface StartExamRequest {
  action: 'START_EXAM'
  userId: string
  idempotencyKey?: string
}

interface SubmitAnswerRequest {
  action: 'SUBMIT_ANSWER'
  sessionId: string
  questionNumber: number
  audioUrl: string
}

interface ExitExamRequest {
  action: 'EXIT_EXAM'
  sessionId: string
}

type RequestBody = StartExamRequest | SubmitAnswerRequest | ExitExamRequest

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let env: EdgeFunctionEnv
  try {
    env = cachedEnv ?? validateEnvironment()
    cachedEnv = env
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Environment validation failed:', message)
    return new Response(
      JSON.stringify({
        error: 'Server Configuration Error',
        message: 'Missing required environment variables',
        details: message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  try {
    const supabaseClient = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    )

    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })

    const body: RequestBody = await req.json()
    const { action } = body

    // START_EXAM Action
    if (action === 'START_EXAM') {
      const { userId, idempotencyKey } = body as StartExamRequest

      // Check idempotency
      if (idempotencyKey) {
        const { data: existing } = await supabaseClient
          .from('exam_sessions')
          .select('id, status')
          .eq('idempotency_key', idempotencyKey)
          .single()

        if (existing) {
          return new Response(
            JSON.stringify({ sessionId: existing.id, message: 'Session already exists' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // Check user profile
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profile) {
        return new Response(
          JSON.stringify({ error: 'Profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check credits
      if (profile.credits < 1) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Rate limit check (5 exams per hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { count } = await supabaseClient
        .from('exam_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo)

      if (count && count >= 5) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Max 5 exams per hour.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Deduct credit
      const { error: deductError } = await supabaseClient
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('id', userId)
        .gte('credits', 1)

      if (deductError) {
        console.error('Credit deduction failed:', deductError)
        return new Response(
          JSON.stringify({ error: 'Credit deduction failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create exam session
      const { data: session, error: sessionError } = await supabaseClient
        .from('exam_sessions')
        .insert({
          user_id: userId,
          status: 'in_progress',
          total_questions: 5,
          current_question_number: 0,
          credits_charged: 1,
          idempotency_key: idempotencyKey,
        })
        .select()
        .single()

      if (sessionError || !session) {
        console.error('Session creation failed:', sessionError)
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate first question with GPT-4
      const systemPrompt = `You are an expert English language examiner for Turkish Airlines employees. Generate realistic aviation/corporate English speaking test questions.

User Profile:
- Role: ${profile.role || 'Aviation professional'}
- Experience: ${profile.experience_level || 'Intermediate'}
- Department: ${profile.department || 'Flight operations'}

Generate a question that:
1. Tests English speaking ability
2. Is relevant to aviation/corporate context
3. Is appropriate for the user's role
4. Can be answered in 60-120 seconds

Return ONLY a JSON object with this structure:
{
  "question_text": "Your question here",
  "question_context": "Additional context or scenario (optional)",
  "difficulty": "easy|medium|hard"
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the first question for this exam.' }
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      let questionData
      try {
        const content = completion.choices[0].message.content || '{}'
        questionData = JSON.parse(content)
      } catch (e) {
        questionData = {
          question_text: 'Describe your typical day at work and the main responsibilities of your role.',
          question_context: 'This is a general warm-up question to assess your English fluency.',
          difficulty: 'easy'
        }
      }

      // Save first question
      const { error: questionError } = await supabaseClient
        .from('exam_questions')
        .insert({
          session_id: session.id,
          question_number: 1,
          question_text: questionData.question_text,
          question_context: questionData.question_context || null,
        })

      if (questionError) {
        console.error('Question creation failed:', questionError)
      }

      return new Response(
        JSON.stringify({
          sessionId: session.id,
          question: {
            number: 1,
            text: questionData.question_text,
            context: questionData.question_context,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SUBMIT_ANSWER Action
    if (action === 'SUBMIT_ANSWER') {
      const { sessionId, questionNumber, audioUrl } = body as SubmitAnswerRequest

      // Get session
      const { data: session } = await supabaseClient
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get question
      const { data: question } = await supabaseClient
        .from('exam_questions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_number', questionNumber)
        .single()

      if (!question) {
        return new Response(
          JSON.stringify({ error: 'Question not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Transcribe audio with Whisper
      const appBaseUrl = env.APP_BASE_URL
      
      let transcript = ''
      try {
        // Download audio from Supabase Storage
        const audioResponse = await fetch(audioUrl)
        const audioBlob = await audioResponse.blob()
        
        // Call Whisper API
        const formData = new FormData()
        formData.append('file', audioBlob, 'audio.webm')
        
        const transcribeUrl = `${appBaseUrl}/api/transcribe`
        console.log('[transcription] requesting', transcribeUrl)

        const transcribeResponse = await fetch(transcribeUrl, {
          method: 'POST',
          body: formData,
        })

        if (!transcribeResponse.ok) {
          throw new Error(`Transcription request failed with status ${transcribeResponse.status}`)
        }

        const transcribeData = await transcribeResponse.json()
        transcript = transcribeData.transcript || transcribeData.text || ''
      } catch (e) {
        console.error('Transcription failed:', e)
        transcript = '[Transcription failed]'
      }

      // Score answer with GPT-4
      const scoringPrompt = `You are an expert English language evaluator for Turkish Airlines employees. Evaluate this speaking test response.

Question: ${question.question_text}
${question.question_context ? `Context: ${question.question_context}` : ''}

User's Response (transcribed): ${transcript}

Evaluate on these 5 criteria (0-100 each):
1. Fluency & Coherence - Natural flow, logical organization
2. Grammar Accuracy - Correct grammar, tense usage
3. Vocabulary Range - Aviation/corporate terminology, variety
4. Pronunciation Clarity - Intelligibility (inferred from transcription quality)
5. Response Relevance - Directly addresses the question

Return ONLY a JSON object:
{
  "overall_score": 85,
  "scores": {
    "fluency": 82,
    "grammar": 88,
    "vocabulary": 90,
    "pronunciation": 80,
    "relevance": 87
  },
  "feedback": "Overall constructive feedback paragraph",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "improvements": ["Area to improve 1", "Area to improve 2"]
}`

      const scoringCompletion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert English language evaluator.' },
          { role: 'user', content: scoringPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
      })

      let scores
      try {
        const content = scoringCompletion.choices[0].message.content || '{}'
        scores = JSON.parse(content)
      } catch (e) {
        scores = {
          overall_score: 70,
          scores: { fluency: 70, grammar: 70, vocabulary: 70, pronunciation: 70, relevance: 70 },
          feedback: 'Unable to evaluate. Please try again.',
          strengths: ['Clear attempt to answer'],
          improvements: ['Practice more speaking']
        }
      }

      // Update question with scores
      await supabaseClient
        .from('exam_questions')
        .update({
          transcription: transcript,
          scores: scores.scores,
          overall_score: scores.overall_score,
          feedback: scores.feedback,
          strengths: scores.strengths,
          improvements: scores.improvements,
          submitted_at: new Date().toISOString(),
          scored_at: new Date().toISOString(),
        })
        .eq('id', question.id)

      // Check if exam is complete
      const isLastQuestion = questionNumber >= session.total_questions

      if (isLastQuestion) {
        // Calculate average score
        const { data: allQuestions } = await supabaseClient
          .from('exam_questions')
          .select('overall_score')
          .eq('session_id', sessionId)

        const avgScore = allQuestions && allQuestions.length > 0
          ? allQuestions.reduce((sum, q) => sum + (q.overall_score || 0), 0) / allQuestions.length
          : 0

        // Mark session as completed
        await supabaseClient
          .from('exam_sessions')
          .update({
            status: 'completed',
            overall_score: avgScore,
            current_question_number: questionNumber,
            completed_at: new Date().toISOString(),
          })
          .eq('id', sessionId)

        return new Response(
          JSON.stringify({
            transcript,
            scoring: {
              overall: scores.overall_score,
              details: scores.scores,
              feedback: scores.feedback,
              strengths: scores.strengths,
              improvements: scores.improvements,
            },
            completed: true,
            sessionAverageScore: avgScore,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate next question
      const nextQuestionNumber = questionNumber + 1

      // Get previous questions for context
      const { data: previousQuestions } = await supabaseClient
        .from('exam_questions')
        .select('question_text')
        .eq('session_id', sessionId)
        .order('question_number', { ascending: true })

      const previousTopics = previousQuestions?.map(q => q.question_text).join('\n') || ''

      const nextQuestionPrompt = `Generate the next question (Question ${nextQuestionNumber}/5).

Previous questions:
${previousTopics}

User's last performance: ${scores.overall_score}/100

Generate a NEW question that:
1. Tests a DIFFERENT aspect/topic than previous questions
2. Adjusts difficulty based on performance (${scores.overall_score >= 80 ? 'increase difficulty' : 'maintain or simplify'})
3. Is relevant to aviation/corporate English
4. Avoids repeating previous topics

Return ONLY JSON:
{
  "question_text": "Your question",
  "question_context": "Context (optional)",
  "difficulty": "easy|medium|hard"
}`

      const followUpSystemPrompt = `You are an expert English language examiner for Turkish Airlines employees. Generate realistic aviation/corporate English speaking test questions that adapt to the candidate's performance.`

      const nextQuestionCompletion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: followUpSystemPrompt },
          { role: 'user', content: nextQuestionPrompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      })

      let nextQuestionData
      try {
        const content = nextQuestionCompletion.choices[0].message.content || '{}'
        nextQuestionData = JSON.parse(content)
      } catch (e) {
        nextQuestionData = {
          question_text: 'Describe a challenging situation you faced at work and how you resolved it.',
          question_context: 'Focus on problem-solving and communication.',
          difficulty: 'medium'
        }
      }

      // Save next question
      await supabaseClient
        .from('exam_questions')
        .insert({
          session_id: sessionId,
          question_number: nextQuestionNumber,
          question_text: nextQuestionData.question_text,
          question_context: nextQuestionData.question_context || null,
        })

      // Update session progress
      await supabaseClient
        .from('exam_sessions')
        .update({ current_question_number: questionNumber })
        .eq('id', sessionId)

      return new Response(
        JSON.stringify({
          transcript,
          scoring: {
            overall: scores.overall_score,
            details: scores.scores,
            feedback: scores.feedback,
            strengths: scores.strengths,
            improvements: scores.improvements,
          },
          completed: false,
          nextQuestion: {
            number: nextQuestionNumber,
            questionNumber: nextQuestionNumber,
            id: nextQuestionData.id ?? null,
            text: nextQuestionData.question_text,
            questionText: nextQuestionData.question_text,
            context: nextQuestionData.question_context,
            questionContext: nextQuestionData.question_context,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // EXIT_EXAM Action
    if (action === 'EXIT_EXAM') {
      const { sessionId } = body as ExitExamRequest

      const { data: session } = await supabaseClient
        .from('exam_sessions')
        .select('*, exam_questions(*)')
        .eq('id', sessionId)
        .single()

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Count answered questions
      const answeredCount = session.exam_questions?.filter((q: any) => q.submitted_at).length || 0

      let refundAmount = 0
      if (answeredCount === 0) {
        refundAmount = 1 // Full refund if no questions answered
      }

      // Refund credits if applicable
      if (refundAmount > 0) {
        await supabaseClient.rpc('add_credits', {
          user_id: session.user_id,
          amount: refundAmount,
        })

        await supabaseClient
          .from('exam_sessions')
          .update({ credits_refunded: refundAmount })
          .eq('id', sessionId)
      }

      // Mark session as exited
      await supabaseClient
        .from('exam_sessions')
        .update({
          status: 'exited',
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId)

      return new Response(
        JSON.stringify({
          message: 'Exam exited successfully',
          answeredQuestions: answeredCount,
          refundedCredits: refundAmount,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
