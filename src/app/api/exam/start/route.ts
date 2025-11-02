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

interface StartExamPayload {
  sessionId: string;
  sessionNumber: number;
  sessionCategory: SessionCategory;
  totalQuestions: number;
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const CATEGORY_SYSTEM_PROMPTS: Record<SessionCategory, string> = {
  introduction: `You are an English speaking examiner for Turkish Airlines cabin crew candidates.
Session 1 focuses on personal background, daily routines, motivation, and basic workplace communication (Level A2-B1).
Keep the tone professional yet warm. Questions must be relevant to aviation context.`,
  aviation: `You are an English speaking examiner for Turkish Airlines cabin crew candidates.
Session 2 focuses on aviation procedures, safety, teamwork, and professional responsibilities (Level B1-B2).
Ask scenario-based or duty-related questions.`,
  situational: `You are an English speaking examiner for Turkish Airlines cabin crew candidates.
Session 3 focuses on situational awareness, problem solving, and decision making under pressure (Level B2).
Create realistic cabin scenarios requiring judgement.`,
  cultural: `You are an English speaking examiner for Turkish Airlines cabin crew candidates.
Session 4 focuses on intercultural communication, destination awareness, and premium service for diverse passengers (Level B2-C1).`,
  professional: `You are an English speaking examiner for Turkish Airlines cabin crew candidates.
Session 5 focuses on leadership, long-term professional development, adaptability, and corporate professionalism (Level C1-C2).`,
};

const CATEGORY_DISPLAY_NAMES: Record<SessionCategory, string> = {
  introduction: 'Personal & Introduction',
  aviation: 'Aviation & Professional Duties',
  situational: 'Situational & Problem Solving',
  cultural: 'Cultural & International Communication',
  professional: 'Career & Professional Development',
};

function buildFirstQuestionPrompt({
  sessionCategory,
  sessionNumber,
  totalQuestions,
}: {
  sessionCategory: SessionCategory;
  sessionNumber: number;
  totalQuestions: number;
}): string {
  return `We are conducting the Turkish Airlines speaking exam.
Session ${sessionNumber}: ${CATEGORY_DISPLAY_NAMES[sessionCategory]}.
This is question 1 of ${totalQuestions}.

Produce JSON with the following shape:
{
  "question_text": "The question the examiner will ask",
  "question_context": "Optional scenario, otherwise null",
  "focus": "What skill/competency this question evaluates"
}

Make the question professional, aviation-oriented, and suitable for cabin crew candidates.`;
}

function sanitizeQuestionText(input?: string | null): string {
  const value = input?.trim();
  if (!value) {
    return 'Can you introduce yourself and tell us about your daily duties as a cabin crew member?';
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

    const body = (await request.json()) as StartExamPayload;
    const { sessionId, sessionCategory, sessionNumber, totalQuestions } = body;

    if (!sessionId || !sessionCategory || !sessionNumber || !totalQuestions) {
      return NextResponse.json({ error: 'Eksik sınav başlatma verisi.' }, { status: 400 });
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('exam_sessions')
      .select('id, user_id, status, current_question_number')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sınav oturumu bulunamadı.' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Bu oturuma erişim izniniz yok.' }, { status: 403 });
    }

    // If question already exists (retry scenario), return it immediately.
    const { data: existingQuestion } = await supabaseAdmin
      .from('exam_questions')
      .select('id, question_number, question_text, question_context')
      .eq('session_id', sessionId)
      .eq('question_number', 1)
      .maybeSingle();

    if (existingQuestion) {
      if ((session.current_question_number ?? 1) !== existingQuestion.question_number) {
        await supabaseAdmin
          .from('exam_sessions')
          .update({ current_question_number: existingQuestion.question_number })
          .eq('id', sessionId);
      }

      return NextResponse.json({
        session: {
          id: sessionId,
          currentQuestionNumber: existingQuestion.question_number,
        },
        question: {
          id: existingQuestion.id,
          questionNumber: existingQuestion.question_number,
          questionText: existingQuestion.question_text,
          questionContext: existingQuestion.question_context,
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CATEGORY_SYSTEM_PROMPTS[sessionCategory] },
        { role: 'user', content: buildFirstQuestionPrompt({ sessionCategory, sessionNumber, totalQuestions }) },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    let firstQuestion: {
      question_text: string;
      question_context?: string | null;
    };

    try {
      firstQuestion = JSON.parse(
        completion.choices[0].message.content ?? '{}',
      ) as { question_text: string; question_context?: string | null };
    } catch (parseError) {
      console.error('[exam/start] Failed to parse first question JSON:', parseError);
      return NextResponse.json({ error: 'İlk soru oluşturulamadı.' }, { status: 500 });
    }

    const sanitizedText = sanitizeQuestionText(firstQuestion.question_text);
    const sanitizedContext = sanitizeQuestionContext(firstQuestion.question_context);

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('exam_questions')
      .insert({
        session_id: sessionId,
        question_number: 1,
        question_text: sanitizedText,
        question_context: sanitizedContext,
      })
      .select('id, question_number, question_text, question_context')
      .maybeSingle();

    if (insertError || !inserted) {
      console.error('[exam/start] Failed to insert first question:', insertError?.message);
      return NextResponse.json({ error: 'İlk soru kaydedilemedi.' }, { status: 500 });
    }

    await supabaseAdmin
      .from('exam_sessions')
      .update({ current_question_number: 1 })
      .eq('id', sessionId);

    return NextResponse.json({
      session: {
        id: sessionId,
        currentQuestionNumber: 1,
      },
      question: {
        id: inserted.id,
        questionNumber: inserted.question_number,
        questionText: inserted.question_text,
        questionContext: inserted.question_context,
      },
    });
  } catch (error) {
    console.error('[exam/start] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Sınav başlatılırken bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 },
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;

