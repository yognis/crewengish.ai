import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

type SessionCategory =
  | 'introduction'
  | 'aviation'
  | 'situational'
  | 'cultural'
  | 'professional';

interface ProcessExamPayload {
  sessionId: string;
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionContext?: string | null;
  audioUrl: string;
  transcript: string;
  duration?: number;
}

interface ScoringResult {
  overall_score: number;
  scores: Record<string, number>;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface NextQuestionResult {
  question_text: string;
  question_context?: string | null;
  focus?: string;
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const CATEGORY_SYSTEM_PROMPTS: Record<SessionCategory, string> = {
  introduction: `You are an English speaking examiner for Turkish Airlines cabin crew candidates.
This is SESSION 1: PERSONAL & INTRODUCTION (Level A2-B1).
Focus on personal background, daily routines, motivation, and basic workplace communication.
Keep questions warm, professional, and relevant to aviation context.`,
  aviation: `You are an English speaking examiner for Turkish Airlines cabin crew candidates.
This is SESSION 2: AVIATION & PROFESSIONAL DUTIES (Level B1-B2).
Focus on operational procedures, safety, SOP adherence, and teamwork onboard.`,
  situational: `You are an English speaking examiner for Turkish Airlines cabin crew candidates.
This is SESSION 3: SITUATIONAL & PROBLEM-SOLVING (Level B2).
Create realistic scenarios involving conflict resolution, difficult passengers, and decision-making under pressure.`,
  cultural: `You are an English speaking examiner for Turkish Airlines cabin crew candidates.
This is SESSION 4: CULTURAL & INTERNATIONAL COMMUNICATION (Level B2-C1).
Focus on intercultural awareness, destination knowledge, and delivering premium service to diverse passengers.`,
  professional: `You are an English speaking examiner for Turkish Airlines cabin crew candidates.
This is SESSION 5: CAREER & PROFESSIONAL DEVELOPMENT (Level C1-C2).
Focus on leadership, long-term career goals, continuous improvement, and corporate professionalism.`,
};

const CATEGORY_DISPLAY_NAMES: Record<SessionCategory, string> = {
  introduction: 'Personal & Introduction',
  aviation: 'Aviation & Professional Duties',
  situational: 'Situational & Problem Solving',
  cultural: 'Cultural & International Communication',
  professional: 'Career & Professional Development',
};

function truncate(input: string, limit = 1800): string {
  if (!input) return '';
  if (input.length <= limit) return input;
  return `${input.slice(0, limit)}…`;
}

function buildScoringPrompt({
  questionText,
  transcript,
  duration,
}: {
  questionText: string;
  transcript: string;
  duration?: number;
}): string {
  return `You are an expert English language evaluator for Turkish Airlines speaking exams.

QUESTION:
"""
${questionText.trim()}
"""

CANDIDATE TRANSCRIPT (${duration ? `${Math.round(duration)} seconds` : 'duration unknown'}):
"""
${truncate(transcript)}
"""

Evaluate the response on FIVE criteria (0-100 each):
1. fluency - Flow, pacing, coherence
2. grammar - Accuracy of structures and tenses
3. vocabulary - Range and aviation terminology
4. pronunciation - Clarity and intelligibility
5. relevance - How directly the answer addresses the question

Provide JSON in the following shape:
{
  "overall_score": number,
  "scores": {
    "fluency": number,
    "grammar": number,
    "vocabulary": number,
    "pronunciation": number,
    "relevance": number
  },
  "feedback": "Constructive summary in Turkish (2 sentences)",
  "strengths": ["Short bullet strengths"],
  "improvements": ["Short bullet improvements"]
}

Scores must be realistic (0-100). Overall score should reflect the weighted impression.`;
}

function buildNextQuestionPrompt({
  sessionCategory,
  sessionNumber,
  totalQuestions,
  questionNumber,
  questionText,
  transcript,
}: {
  sessionCategory: SessionCategory;
  sessionNumber: number;
  totalQuestions: number;
  questionNumber: number;
  questionText: string;
  transcript: string;
}): string {
  const nextNumber = Math.min(questionNumber + 1, totalQuestions);
  return `We are conducting the Turkish Airlines speaking exam.
Session ${sessionNumber}: ${CATEGORY_DISPLAY_NAMES[sessionCategory]}.

The last question (${questionNumber}) was:
"""
${questionText.trim()}
"""

Candidate's response transcript:
"""
${truncate(transcript)}
"""

Now create the NEXT question (${nextNumber}/${totalQuestions}) in JSON format:
{
  "question_text": "...",
  "question_context": "...", // optional, null if no scenario
  "focus": "What skill/competency this question evaluates"
}

Keep the question professional, relevant to cabin crew work, and aligned with the session category.
Do NOT reference previous questions explicitly.`;
}

function sanitizeQuestionText(input?: string | null): string {
  const value = input?.trim();
  if (!value) {
    return 'Describe a challenging situation you faced at work and how you resolved it.';
  }
  return value.replace(/\s+/g, ' ').slice(0, 700);
}

function sanitizeQuestionContext(input?: string | null): string | null {
  const value = input?.trim();
  if (!value) return null;
  return value.replace(/\s+/g, ' ').slice(0, 700);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ProcessExamPayload;

    const {
      sessionId,
      questionId,
      questionNumber,
      questionText,
      questionContext,
      audioUrl,
      transcript,
      duration,
    } = body;

    if (!sessionId || !questionId || !audioUrl || !transcript || !Number.isFinite(questionNumber)) {
      return NextResponse.json({ error: 'Eksik sınav yanıt verisi.' }, { status: 400 });
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('exam_sessions')
      .select('id, user_id, session_number, session_category, total_questions, status')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sınav oturumu bulunamadı.' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Bu oturuma erişim izniniz yok.' }, { status: 403 });
    }

    if (session.status === 'completed' || session.status === 'exited') {
      return NextResponse.json({ error: 'Bu oturum tamamlanmış durumda.' }, { status: 400 });
    }

    const sessionCategory = (session.session_category ?? 'introduction') as SessionCategory;
    const sessionNumber = session.session_number ?? 1;
    const totalQuestions = session.total_questions ?? 5;
    const isLastQuestion = questionNumber >= totalQuestions;

    const scoringPrompt = buildScoringPrompt({ questionText, transcript, duration });
    const nextQuestionPrompt = !isLastQuestion
      ? buildNextQuestionPrompt({
          sessionCategory,
          sessionNumber,
          totalQuestions,
          questionNumber,
          questionText,
          transcript,
        })
      : null;

    const scoringPromise = openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert aviation English examiner. Always reply with valid JSON. Do not add commentary outside of JSON.',
        },
        { role: 'user', content: scoringPrompt },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const nextQuestionPromise = nextQuestionPrompt
      ? openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: CATEGORY_SYSTEM_PROMPTS[sessionCategory] },
            { role: 'user', content: nextQuestionPrompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        })
      : Promise.resolve(null);

    const [scoringCompletion, nextQuestionCompletion] = await Promise.all([
      scoringPromise,
      nextQuestionPromise,
    ]);

    let scoring: ScoringResult | null = null;
    try {
      scoring = JSON.parse(scoringCompletion.choices[0].message.content ?? '{}') as ScoringResult;
    } catch (parseError) {
      console.error('[exam/process] Failed to parse scoring JSON:', parseError);
      return NextResponse.json({ error: 'Yanıt değerlendirmesi yapılamadı.' }, { status: 500 });
    }

    let nextQuestion: NextQuestionResult | null = null;
    if (nextQuestionCompletion) {
      try {
        nextQuestion = JSON.parse(
          nextQuestionCompletion.choices[0].message.content ?? '{}',
        ) as NextQuestionResult;
      } catch (parseError) {
        console.error('[exam/process] Failed to parse next question JSON:', parseError);
      }
    }

    const { error: updateQuestionError } = await supabaseAdmin
      .from('exam_questions')
      .update({
        audio_url: audioUrl,
        transcription: transcript,
        scores: scoring?.scores ?? null,
        overall_score: scoring?.overall_score ?? null,
        feedback: scoring?.feedback ?? null,
        strengths: scoring?.strengths ?? [],
        improvements: scoring?.improvements ?? [],
        submitted_at: new Date().toISOString(),
        scored_at: new Date().toISOString(),
      })
      .eq('id', questionId);

    if (updateQuestionError) {
      console.error('[exam/process] Failed to update question:', updateQuestionError.message);
      return NextResponse.json({ error: 'Yanıt kaydedilemedi.' }, { status: 500 });
    }

    let nextQuestionRecord: {
      id: string;
      question_number: number;
      question_text: string;
      question_context: string | null;
    } | null = null;

    if (!isLastQuestion && nextQuestion) {
      const sanitizedText = sanitizeQuestionText(nextQuestion.question_text);
      const sanitizedContext = sanitizeQuestionContext(nextQuestion.question_context);

      const { data: upserted, error: upsertError } = await supabaseAdmin
        .from('exam_questions')
        .upsert(
          {
            session_id: sessionId,
            question_number: questionNumber + 1,
            question_text: sanitizedText,
            question_context: sanitizedContext,
          },
          { onConflict: 'session_id,question_number' },
        )
        .select('id, question_number, question_text, question_context')
        .maybeSingle();

      if (upsertError) {
        console.error('[exam/process] Failed to upsert next question:', upsertError.message);
      } else if (upserted) {
        nextQuestionRecord = upserted;
      } else {
        console.warn('[exam/process] Next question upsert returned no row');
      }
    }

    if (isLastQuestion) {
      const { data: questionScores, error: fetchScoresError } = await supabaseAdmin
        .from('exam_questions')
        .select('overall_score')
        .eq('session_id', sessionId);

      let averageScore = scoring?.overall_score ?? null;
      if (!fetchScoresError && questionScores) {
        const values = questionScores
          .map((row) => (typeof row.overall_score === 'number' ? row.overall_score : Number(row.overall_score)))
          .filter((value): value is number => Number.isFinite(value));
        if (values.length > 0) {
          const total = values.reduce((acc, curr) => acc + curr, 0);
          averageScore = Math.round(total / values.length);
        }
      }

      const { error: updateSessionError } = await supabaseAdmin
        .from('exam_sessions')
        .update({
          status: 'completed',
          overall_score: averageScore,
          current_question_number: questionNumber,
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (updateSessionError) {
        console.error('[exam/process] Failed to finalize session:', updateSessionError.message);
      }
    } else {
      const { error: sessionProgressError } = await supabaseAdmin
        .from('exam_sessions')
        .update({ current_question_number: questionNumber + 1 })
        .eq('id', sessionId);

      if (sessionProgressError) {
        console.error('[exam/process] Failed to bump session progress:', sessionProgressError.message);
      }
    }

    return NextResponse.json({
      transcript,
      audioUrl,
      scoring: scoring
        ? {
            overall: scoring.overall_score,
            scores: scoring.scores,
            feedback: scoring.feedback,
            strengths: scoring.strengths ?? [],
            improvements: scoring.improvements ?? [],
          }
        : null,
      completed: isLastQuestion,
      nextQuestion: nextQuestionRecord
        ? {
            id: nextQuestionRecord.id,
            questionNumber: nextQuestionRecord.question_number,
            questionText: nextQuestionRecord.question_text,
            questionContext: nextQuestionRecord.question_context,
          }
        : null,
    });
  } catch (error) {
    console.error('[exam/process] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Yanıt işlenirken bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 },
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;

