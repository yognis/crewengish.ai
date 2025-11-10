import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { env } from '@/lib/env';
import { getSafeUser } from '@/lib/getSafeUser';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { selectExamQuestions } from '@/lib/question-bank';
import {
  CATEGORY_SYSTEM_PROMPTS,
  getCategoryDisplayName,
  type SessionCategory,
} from '@/shared/exam-config';

interface StartExamPayload {
  sessionId: string;
  sessionNumber: number;
  sessionCategory: SessionCategory;
  totalQuestions: number;
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

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
Session ${sessionNumber}: ${getCategoryDisplayName(sessionCategory)}.
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

function parseGeneratedQuestion(
  raw: string
): { question_text: string; question_context: string | null } | null {
  try {
    const parsed = JSON.parse(raw) as {
      question_text?: unknown;
      question_context?: unknown;
    };

    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    if (typeof parsed.question_text !== 'string' || !parsed.question_text.trim()) {
      return null;
    }

    const questionText = parsed.question_text.trim();
    const questionContext =
      typeof parsed.question_context === 'string' && parsed.question_context.trim().length > 0
        ? parsed.question_context.trim()
        : null;

    return {
      question_text: questionText,
      question_context: questionContext,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { user } = await getSafeUser(supabase);

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

    const bankQuestions = await selectExamQuestions(sessionCategory, totalQuestions);

    let questionSource: 'bank' | 'dynamic' = 'dynamic';
    let rawQuestionText: string | undefined;
    let rawQuestionContext: string | null | undefined;

    if (bankQuestions && bankQuestions.length > 0) {
      const bankQuestion = bankQuestions[0];
      questionSource = 'bank';
      rawQuestionText = bankQuestion.question_text;

      const contextParts: string[] = [];
      if (bankQuestion.question_text_turkish) {
        contextParts.push(`TR: ${bankQuestion.question_text_turkish}`);
      }
      if (bankQuestion.expected_keywords?.length) {
        contextParts.push(`Keywords: ${bankQuestion.expected_keywords.join(', ')}`);
      }
      if (bankQuestion.evaluation_focus && Object.keys(bankQuestion.evaluation_focus).length > 0) {
        const focusSummary = Object.entries(bankQuestion.evaluation_focus)
          .map(([key, weight]) =>
            typeof weight === 'number' ? `${key}:${weight}` : key
          )
          .join(', ');
        if (focusSummary) {
          contextParts.push(`Focus: ${focusSummary}`);
        }
      }
      rawQuestionContext = contextParts.length > 0 ? contextParts.join(' | ') : null;
    } else {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: CATEGORY_SYSTEM_PROMPTS[sessionCategory] },
          {
            role: 'user',
            content: buildFirstQuestionPrompt({
              sessionCategory,
              sessionNumber,
              totalQuestions,
            }),
          },
          {
            role: 'user',
            content:
              'Return ONLY valid JSON matching {"question_text": string, "question_context": string | null}. No markdown.',
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const rawContent = completion.choices[0].message.content ?? '{}';
      const parsedQuestion = parseGeneratedQuestion(rawContent);

      if (parsedQuestion) {
        rawQuestionText = parsedQuestion.question_text;
        rawQuestionContext = parsedQuestion.question_context;
      } else {
        console.warn(
          `[exam/start] Failed to parse generated question JSON for ${sessionCategory}; using default prompt. Raw: ${rawContent}`
        );
        rawQuestionText =
          'Can you introduce yourself and tell us about your daily duties as a cabin crew member?';
        rawQuestionContext = null;
      }
    }

    const sanitizedText = sanitizeQuestionText(rawQuestionText);
    const sanitizedContext = sanitizeQuestionContext(rawQuestionContext);

    const source: 'bank' | 'dynamic' = questionSource;
    const bankQuestionId =
      source === 'bank' && bankQuestions?.[0] ? bankQuestions[0].id : null;

    console.log(
      `[exam/start] Using ${questionSource === 'bank' ? 'question bank' : 'dynamic'} question for ${sessionCategory}`
    );

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('exam_questions')
      .insert({
        session_id: sessionId,
        question_number: 1,
        question_text: sanitizedText,
        question_context: sanitizedContext,
        source,
        bank_question_id: bankQuestionId,
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

    console.log(
      `[exam/start] Question 1 stored via ${source}${
        bankQuestionId ? ` (bank_id=${bankQuestionId})` : ''
      }`
    );

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

