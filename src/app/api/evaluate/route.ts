import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';
import { env } from '@/lib/env';
import { checkRateLimit } from '@/lib/rate-limit';
import { EXAM_CONSTANTS } from '@/constants/exam';
import { getSafeUser } from '@/lib/getSafeUser';
import { SCORING_PROMPT } from '@/shared/scoring-config';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

interface EvaluationRequest {
  question: string;
  transcript: string;
  duration: number;
}

interface EvaluationResult {
  overallScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  contentScore: number;
  feedback: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { user } = await getSafeUser(supabase);

    const forwardedFor = request.headers
      .get('x-forwarded-for')
      ?.split(',')[0]
      ?.trim();
    const ipAddress =
      forwardedFor ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-client-ip') ||
      request.ip;
    const identifier = user?.id || ipAddress || 'anonymous';

    const rateCheck = checkRateLimit(`evaluate:${identifier}`);
    const rateLimitHeaders = {
      'X-RateLimit-Limit': EXAM_CONSTANTS.RATE_LIMIT_REQUESTS.toString(),
      'X-RateLimit-Remaining': rateCheck.remaining.toString(),
      'X-RateLimit-Reset': rateCheck.resetTime.toString(),
    };

    if (!rateCheck.success) {
      const resetIn = Math.max(
        0,
        Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          error: 'Çok fazla istek. Lütfen bekleyin.',
          details: `${resetIn} saniye sonra tekrar deneyin.`,
          resetIn,
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      );
    }

    const body: EvaluationRequest = await request.json();
    const { question, transcript, duration } = body;

    if (!question || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const evaluationPrompt = `QUESTION:
${question}

RESPONSE TRANSCRIPT:
${transcript}

RESPONSE DURATION: ${duration} seconds

EVALUATION CONTEXT:
- Consider aviation professionalism, clarity, and relevance.
- Caller is a Turkish Airlines employee; highlight strengths and areas to improve.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SCORING_PROMPT,
        },
        {
          role: 'user',
          content: evaluationPrompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const evaluation = JSON.parse(
      completion.choices[0].message.content || '{}'
    );

    const scores = evaluation?.scores ?? {};
    const fluencyScore = Number(scores.fluency ?? 0);
    const pronunciationScore = Number(scores.pronunciation ?? 0);
    const grammarScore = Number(scores.grammar ?? 0);
    const vocabularyScore = Number(scores.vocabulary ?? 0);
    const contentScore = Number(scores.content ?? 0);

    const scoreValues = [
      fluencyScore,
      pronunciationScore,
      grammarScore,
      vocabularyScore,
      contentScore,
    ].filter((value) => Number.isFinite(value)) as number[];

    const overallScore = Math.round(
      scoreValues.reduce((sum, value) => sum + value, 0) /
        Math.max(scoreValues.length, 1)
    );

    const result: EvaluationResult = {
      overallScore,
      fluencyScore,
      grammarScore,
      vocabularyScore,
      pronunciationScore,
      contentScore,
      feedback: evaluation.feedback ?? '',
    };

    return NextResponse.json(result, { headers: rateLimitHeaders });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Evaluation failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
